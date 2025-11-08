mod download_object;
mod get_object_size;
mod upload_directory;

use std::path::{Path, PathBuf};
use aws_sdk_s3::Client as S3Client;
use anyhow::{Result, Context as AnyhowContext};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tokio::fs;
use crate::transcode;

const SUPPORTED_VIDEO_EXTENSIONS: &[&str] = &[
    "mp4", "avi", "mov", "mkv", "wmv", "flv", "webm", "m4v", "3gp", "ogv"
];
const MAX_FILE_SIZE_BYTES: i64 = 4 * 1024 * 1024 * 1024; // 4GB

fn get_hls_s3_prefix(original_key: &str) -> String {
    let path = Path::new(original_key);
    let parent = path.parent()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_default();
    if parent.is_empty() {
        "hls".to_string()
    } else {
        format!("{}/hls", parent)
    }
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct S3Event {
    pub key: String,
    pub bucket: String,
}

/// Handles an S3 video file conversion request.
pub async fn handle_s3_event(s3_client: &S3Client, event: S3Event) -> Result<(), anyhow::Error> {
    let bucket_name = event.bucket;
    let object_key = event.key;
    
    // [1] URL decode the object key
    let decoded_key = url::form_urlencoded::parse(object_key.as_bytes())
        .map(|(key, val)| if key.is_empty() { val } else { key })
        .collect::<String>();
    
    tracing::info!("Processing file: s3://{}/{}", bucket_name, decoded_key);

    // [2] Check if the file is a video
    let original_extension = Path::new(&decoded_key)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("mp4");
    if !SUPPORTED_VIDEO_EXTENSIONS.contains(&original_extension.to_lowercase().as_str()) {
        return Err(anyhow::anyhow!(
            "Video file extension ({}) is not supported", original_extension
        ));
    }

    // [3] Validate file size before downloading (using S3 metadata)
    let object_size = get_object_size::get_object_size(s3_client, &bucket_name, &decoded_key).await
        .context("Failed to get object size")?;
    if object_size > MAX_FILE_SIZE_BYTES {
        let size_gb = object_size as f64 / (1024.0 * 1024.0 * 1024.0);
        return Err(anyhow::anyhow!(
            "Video file size ({:.2} GB) exceeds maximum allowed size (4 GB)",
            size_gb
        ));
    }

    // [4] Generate unique working directory
    let work_id = Uuid::new_v4().to_string();
    let work_dir = PathBuf::from("/tmp").join(&work_id);
    fs::create_dir_all(&work_dir).await
        .context("Failed to create working directory")?;

    // [5] Download video file (preserve extension for ffmpeg)
    let input_file = work_dir.join(format!("input_video.{}", original_extension));
    download_object::download_object(s3_client, &bucket_name, &decoded_key, &input_file).await
        .context("Failed to download video from S3")?;

    // [6] Transcode video to HLS
    let output_dir = work_dir.join("hls");
    fs::create_dir_all(&output_dir).await
        .context("Failed to create HLS output directory")?;
    transcode::transcode_video_to_hls(&input_file, &output_dir).await
        .context("Failed to transcode video to HLS")?;

    // [7] Upload HLS files back to S3
    let hls_s3_prefix = get_hls_s3_prefix(&decoded_key);
    upload_directory::upload_directory_to_s3(s3_client, &bucket_name, &hls_s3_prefix, &output_dir).await
        .context("Failed to upload directory to S3")?;

    // [8] Cleanup temporary files
    if let Err(e) = fs::remove_dir_all(&work_dir).await {
        tracing::warn!("Failed to cleanup working directory {}: {}", work_dir.display(), e);
    }

    tracing::info!("Successfully processed video: {}", decoded_key);

    Ok(())
}
