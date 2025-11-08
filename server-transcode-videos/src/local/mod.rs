use std::path::{Path, PathBuf};
use anyhow::{Result, Context as AnyhowContext};
use serde::{Deserialize, Serialize};
use tokio::fs;

use crate::transcode;

const MAX_FILE_SIZE_BYTES: u64 = 4 * 1024 * 1024 * 1024; // 4GB
fn get_file_size(file_path: &Path) -> Result<u64> {
    let metadata = std::fs::metadata(file_path)
        .context("Failed to get file metadata")?;
    let size_bytes = metadata.len();
    let size_mb = size_bytes as f64 / (1024.0 * 1024.0);
    tracing::info!("File size: {} bytes ({:.2} MB)", size_bytes, size_mb);
    Ok(size_bytes)
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalEvent {
    pub file_path: String,
}

pub async fn handle_local_event(event: LocalEvent) -> Result<(), anyhow::Error> {
    // [1] Initialize working directory
    let parent_folder = Path::new(&event.file_path)
        .parent()
        .unwrap_or(Path::new(""));
    let work_dir = PathBuf::from("../files").join(parent_folder);
    fs::create_dir_all(&work_dir).await
        .context("Failed to create working directory")?;
    let input_file = work_dir.join(Path::new(&event.file_path).file_name().context("Missing file name")?);
        
    // [2] Validate video size
    let file_size = get_file_size(&input_file)?;
    if file_size > MAX_FILE_SIZE_BYTES {
        let size_gb = file_size as f64 / (1024.0 * 1024.0 * 1024.0);
        return Err(anyhow::anyhow!(
            "Video file size ({:.2} GB) exceeds maximum allowed size (4 GB)",
            size_gb
        ));
    }

    // [2] Transcode video to HLS
    let output_dir = work_dir.join("hls");
    fs::create_dir_all(&output_dir).await
        .context("Failed to create HLS output directory")?;
    transcode::transcode_video_to_hls(&input_file, &output_dir).await
        .context("Failed to transcode video to HLS")?;

    Ok(())
}
