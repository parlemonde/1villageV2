use lambda_runtime::{tracing, Error, LambdaEvent};
use aws_config::BehaviorVersion;
use aws_sdk_s3::{Client as S3Client, primitives::ByteStream};
use anyhow::{Result, Context as AnyhowContext};
use std::path::{Path, PathBuf};
use std::process::Command;
use tokio::fs;
use uuid::Uuid;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalEvent {
    pub file_path: String,
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct S3Event {
    pub key: String,
    pub bucket: String,
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(untagged)]
pub enum Event {
    S3(S3Event),
    Local(LocalEvent),
}

const SUPPORTED_VIDEO_EXTENSIONS: &[&str] = &[
    "mp4", "avi", "mov", "mkv", "wmv", "flv", "webm", "m4v", "3gp", "ogv"
];

pub(crate) async fn function_handler(event: LambdaEvent<Event>) -> Result<(), Error> {
    match event.payload {
        Event::S3(s3_event) => {
            let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
            let s3_client = S3Client::new(&config);
            if let Err(e) = process_s3_record(&s3_client, s3_event).await {
                tracing::error!("Failed to process S3 record: {}", e);
                return Err(Error::from(e.to_string()));
            }
        }
        Event::Local(local_event) => {
            if let Err(e) = process_local_record(local_event).await {
                tracing::error!("Failed to process local record: {}", e);
                return Err(Error::from(e.to_string()));
            }
        }
    }
    Ok(())
}

async fn process_local_record(event: LocalEvent) -> Result<()> {
    let parent_folder = Path::new(&event.file_path)
        .parent()
        .unwrap_or(Path::new(""));
    
    let work_dir = PathBuf::from("../files").join(parent_folder);
    fs::create_dir_all(&work_dir).await
        .context("Failed to create working directory")?;

    let input_file = work_dir.join(Path::new(&event.file_path).file_name().context("Missing file name")?);

    let output_dir = work_dir.join("hls");
    fs::create_dir_all(&output_dir).await
        .context("Failed to create HLS output directory")?;

    transcode_to_hls(&input_file, &output_dir).await
        .context("Failed to transcode video to HLS")?;

    tracing::info!("Successfully processed video: {}", input_file.display());
    Ok(())
}

async fn process_s3_record(
    s3_client: &S3Client,
    event: S3Event,
) -> Result<()> {
    let bucket_name = event.bucket;
    let object_key = event.key;
    
    // URL decode the object key
    let decoded_key = url::form_urlencoded::parse(object_key.as_bytes())
        .map(|(key, val)| if key.is_empty() { val } else { key })
        .collect::<String>();
    
    tracing::info!("Processing file: s3://{}/{}", bucket_name, decoded_key);

    // Extract file extension once
    let original_extension = Path::new(&decoded_key)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("mp4");

    // Check if the file is a video
    if !SUPPORTED_VIDEO_EXTENSIONS.contains(&original_extension.to_lowercase().as_str()) {
        tracing::info!("Skipping non-video file: {}", decoded_key);
        return Ok(());
    }

    // Generate unique working directory
    let work_id = Uuid::new_v4().to_string();
    let work_dir = PathBuf::from("/tmp").join(&work_id);
    fs::create_dir_all(&work_dir).await
        .context("Failed to create working directory")?;

    // Download the video file (preserve extension for ffmpeg)
    let input_file = work_dir.join(format!("input_video.{}", original_extension));
    download_s3_object(s3_client, &bucket_name, &decoded_key, &input_file).await
        .context("Failed to download video from S3")?;

    // Transcode to HLS
    let output_dir = work_dir.join("hls");
    fs::create_dir_all(&output_dir).await
        .context("Failed to create HLS output directory")?;
    
    transcode_to_hls(&input_file, &output_dir).await
        .context("Failed to transcode video to HLS")?;

    // Upload HLS files back to S3
    let hls_s3_prefix = get_hls_s3_prefix(&decoded_key);
    upload_hls_to_s3(s3_client, &bucket_name, &hls_s3_prefix, &output_dir).await
        .context("Failed to upload HLS files to S3")?;

    // Cleanup temporary files
    if let Err(e) = fs::remove_dir_all(&work_dir).await {
        tracing::warn!("Failed to cleanup working directory {}: {}", work_dir.display(), e);
    }

    tracing::info!("Successfully processed video: {}", decoded_key);
    Ok(())
}

async fn download_s3_object(
    s3_client: &S3Client,
    bucket: &str,
    key: &str,
    local_path: &Path,
) -> Result<()> {
    tracing::info!("Downloading s3://{}/{} to {}", bucket, key, local_path.display());
    
    let response = s3_client
        .get_object()
        .bucket(bucket)
        .key(key)
        .send()
        .await
        .context("Failed to get object from S3")?;

    let data = response.body.collect().await
        .context("Failed to read S3 object body")?;
    
    fs::write(local_path, data.into_bytes()).await
        .context("Failed to write file to local filesystem")?;

    tracing::info!("Successfully downloaded {} bytes", 
        fs::metadata(local_path).await?.len());
    Ok(())
}

fn get_video_dimensions(input_file: &Path) -> Result<(u32, u32)> {
    tracing::info!("Getting video dimensions for: {}", input_file.display());
    let output_result = Command::new("ffprobe")
        .args([
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=p=0",
            input_file.to_str().context("Invalid input file path")?,
        ])
        .output();

    if let Err(e) = output_result {
        tracing::error!("ffprobe failed: {}", e);
        return Err(anyhow::anyhow!("ffprobe failed: {}", e));
    }

    let output = output_result?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        tracing::error!("ffprobe failed: {}", stderr);
        return Err(anyhow::anyhow!("ffprobe failed: {}", stderr));
    }

    let output_str = String::from_utf8(output.stdout)
        .context("Invalid UTF-8 in ffprobe output")?;
    
    let dimensions: Vec<&str> = output_str.trim().split(',').collect();
    if dimensions.len() != 2 {
        return Err(anyhow::anyhow!("Unexpected ffprobe output format: {}", output_str));
    }

    let width = dimensions[0].parse::<u32>()
        .context("Failed to parse width")?;
    let height = dimensions[1].parse::<u32>()
        .context("Failed to parse height")?;

    Ok((width, height))
}

fn has_audio_stream(input_file: &Path) -> Result<bool> {
    tracing::info!("Checking for audio stream in: {}", input_file.display());
    let output = Command::new("ffprobe")
        .args([
            "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=codec_type",
            "-of", "csv=p=0",
            input_file.to_str().context("Invalid input file path")?,
        ])
        .output()
        .context("Failed to execute ffprobe")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        tracing::warn!("ffprobe audio check failed: {}", stderr);
        return Ok(false);
    }

    let output_str = String::from_utf8(output.stdout)
        .context("Invalid UTF-8 in ffprobe output")?;
    
    let has_audio = !output_str.trim().is_empty();
    tracing::info!("Audio stream present: {}", has_audio);
    Ok(has_audio)
}

async fn transcode_to_hls(input_file: &Path, output_dir: &Path) -> Result<()> {
    tracing::info!("Starting HLS transcoding: {} -> {}", 
        input_file.display(), output_dir.display());

    // Get video dimensions to determine aspect ratio
    let (width, height) = get_video_dimensions(input_file)
        .context("Failed to get video dimensions")?;
    
    let aspect_ratio = width as f64 / height as f64;
    let target_aspect_ratio = 16.0 / 9.0; // 1.777...
    
    // Use scale_y_filter if aspect ratio is wider than 16:9, otherwise use scale_x_filter
    let use_scale_y = aspect_ratio > target_aspect_ratio;
    
    tracing::info!("Video dimensions: {}x{}, aspect ratio: {:.3}, using {} filter", 
        width, height, aspect_ratio, if use_scale_y { "scale_y" } else { "scale_x" });

    // Check if video has audio
    let has_audio = has_audio_stream(input_file)
        .context("Failed to check for audio stream")?;
    
    tracing::info!("Processing video with audio: {}", has_audio);

    let scale_filter = if use_scale_y {
        "[0:v]split=3[v1][v2][v3];[v1]scale=w=1920:h=-2[v1out];[v2]scale=w=1280:h=-2[v2out];[v3]scale=w=854:h=-2[v3out]"
    } else {
        "[0:v]split=3[v1][v2][v3];[v1]scale=w=-2:h=1080[v1out];[v2]scale=w=-2:h=720[v2out];[v3]scale=w=-2:h=480[v3out]"
    };


    let segment_filename_path = output_dir.join("stream_%v/data%04d.ts");
    let stream_playlist_path = output_dir.join("stream_%v/playlist.m3u8");
    
    // Build variant stream map based on audio presence
    let var_stream_map = if has_audio {
        "v:0,a:0 v:1,a:1 v:2,a:2"
    } else {
        "v:0 v:1 v:2"
    };

    let mut ffmpeg_args: Vec<&str> = vec![
        "-i",
        input_file.to_str().unwrap(),
        "-preset",
        "veryfast",
        "-tune",
        "fastdecode",
        "-movflags",
        "faststart",
        "-filter_complex",
        scale_filter,
        "-map",
        "[v1out]",
        "-c:v:2", "libx264", "-b:v:2", "1400k", "-maxrate:v:2", "1498k", "-bufsize:v:2", "2100k",
        "-map",
        "[v2out]",
        "-c:v:1", "libx264", "-b:v:1", "2800k", "-maxrate:v:1", "2996k", "-bufsize:v:1", "4200k",
        "-map",
        "[v3out]",
        "-c:v:0", "libx264", "-b:v:0", "5000k", "-maxrate:v:0", "5350k", "-bufsize:v:0", "7500k",
    ];
    
    // Add audio mapping only if audio is present
    if has_audio {
        ffmpeg_args.extend_from_slice(&[
            "-map",
            "a:0", "-c:a:2", "aac", "-b:a:2", "96k", "-ac", "2",
            "-map",
            "a:0", "-c:a:1", "aac", "-b:a:1", "128k", "-ac", "2",
            "-map",
            "a:0", "-c:a:0", "aac", "-b:a:0", "192k", "-ac", "2",
        ]);
    }
    
    // Add HLS parameters
    ffmpeg_args.extend_from_slice(&[
        "-f",
        "hls",
        "-hls_time",
        "6.4",
        "-hls_playlist_type",
        "vod",
        "-hls_list_size",
        "0",
        "-hls_segment_filename",
        segment_filename_path.to_str().unwrap(),
        "-hls_flags",
        "independent_segments",
        "-master_pl_name",
        "master.m3u8",
        "-var_stream_map",
        var_stream_map,
        "-y",
        stream_playlist_path.to_str().unwrap(),
    ]);

    let output = Command::new("ffmpeg")
        .args(&ffmpeg_args)
        .output()
        .context("Failed to execute ffmpeg command")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        tracing::error!("FFmpeg failed. Stdout: {}, Stderr: {}", stdout, stderr);
        return Err(anyhow::anyhow!("FFmpeg transcoding failed: {}", stderr));
    }
 
    tracing::info!("HLS transcoding completed successfully for all resolutions");
    Ok(())
}

async fn upload_hls_to_s3(
    s3_client: &S3Client,
    bucket: &str,
    s3_prefix: &str,
    local_dir: &Path,
) -> Result<()> {
    tracing::info!("Uploading HLS files from {} to s3://{}/{}", 
        local_dir.display(), bucket, s3_prefix);

    let mut entries = fs::read_dir(local_dir).await
        .context("Failed to read HLS output directory")?;

    let mut upload_count = 0;
    while let Some(entry) = entries.next_entry().await? {
        let file_path = entry.path();
        if file_path.is_file() {
            let file_name = file_path.file_name()
                .and_then(|name| name.to_str())
                .context("Invalid file name")?;
             
            let s3_key = format!("{}/{}", s3_prefix, file_name);
            
            // Determine content type
            let content_type = if file_name.ends_with(".m3u8") {
                "application/vnd.apple.mpegurl"
            } else if file_name.ends_with(".ts") {
                "video/mp2t"
            } else {
                "application/octet-stream"
            };

            // Read file and upload
            let file_content = fs::read(&file_path).await
                .context("Failed to read HLS file")?;
            
            s3_client
                .put_object()
                .bucket(bucket)
                .key(&s3_key)
                .content_type(content_type)
                .body(ByteStream::from(file_content))
                .send()
                .await
                .context(format!("Failed to upload {} to S3", s3_key))?;

            tracing::info!("Uploaded: s3://{}/{}", bucket, s3_key);
            upload_count += 1;
        }
    }

    tracing::info!("Successfully uploaded {} HLS files", upload_count);
    Ok(())
}

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
