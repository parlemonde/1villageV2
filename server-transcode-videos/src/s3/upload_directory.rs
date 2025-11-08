use std::path::{Path, PathBuf};
use aws_sdk_s3::{Client as S3Client, primitives::ByteStream};
use anyhow::{Result, Context as AnyhowContext};
use tokio::fs;
use futures::stream::{FuturesUnordered, StreamExt};
use lambda_runtime::tracing;

const UPLOAD_BATCH_SIZE: usize = 10; // Upload 10 files at a time

#[derive(Clone)]
struct FileToUpload {
    local_path: PathBuf,
    s3_key: String,
    content_type: &'static str,
}

/// Uploads a directory to S3 using parallel batch uploads with streaming.
pub async fn upload_directory_to_s3(
    s3_client: &S3Client,
    bucket: &str,
    s3_prefix: &str,
    local_dir: &Path,
) -> Result<()> {
    tracing::info!("Uploading directory {} to s3://{}/{}", 
        local_dir.display(), bucket, s3_prefix);

    // [1] Collect all files to upload
    let files_to_upload = collect_files_to_upload(local_dir, s3_prefix).await?;
    let total_files = files_to_upload.len();
    tracing::info!("Found {} files to upload", total_files);

    if files_to_upload.is_empty() {
        tracing::warn!("No files found to upload");
        return Ok(());
    }

    // [2] Upload files in parallel batches
    let mut uploaded_count = 0;
    for batch in files_to_upload.chunks(UPLOAD_BATCH_SIZE) {
        let mut upload_tasks = FuturesUnordered::new();
        
        for file in batch {
            let client = s3_client.clone();
            let bucket = bucket.to_string();
            let file = file.clone();
            
            upload_tasks.push(tokio::spawn(async move {
                upload_file_to_s3(&client, &bucket, file).await
            }));
        }

        // Wait for all tasks in this batch to complete
        while let Some(result) = upload_tasks.next().await {
            match result {
                Ok(Ok(())) => uploaded_count += 1,
                Ok(Err(e)) => {
                    tracing::error!("Upload failed: {}", e);
                    return Err(e);
                }
                Err(e) => {
                    tracing::error!("Task panicked: {}", e);
                    return Err(anyhow::anyhow!("Upload task panicked: {}", e));
                }
            }
        }

        tracing::info!("Uploaded {}/{} files", uploaded_count, total_files);
    }

    tracing::info!("Successfully uploaded all {} files", uploaded_count);
    Ok(())
}

/// Collects all files in a directory that need to be uploaded.
async fn collect_files_to_upload(
    local_dir: &Path,
    s3_prefix: &str,
) -> Result<Vec<FileToUpload>> {
    let mut files_to_upload = Vec::new();
    let mut dirs_to_process = vec![(local_dir.to_path_buf(), PathBuf::from(s3_prefix))];

    while let Some((local_path, s3_path)) = dirs_to_process.pop() {
        let mut entries = fs::read_dir(&local_path).await
            .context(format!("Failed to read directory: {}", local_path.display()))?;

        while let Some(entry) = entries.next_entry().await? {
            let entry_path = entry.path();
            
            if entry_path.is_file() {
                let file_name = entry_path.file_name()
                    .and_then(|name| name.to_str())
                    .context("Invalid file name")?;
                
                // Determine content type
                let content_type = if file_name.ends_with(".m3u8") {
                    "application/vnd.apple.mpegurl"
                } else if file_name.ends_with(".ts") {
                    "video/mp2t"
                } else {
                    continue; // Skip non-HLS files
                };

                let s3_key = format!("{}/{}", s3_path.display(), file_name);
                
                files_to_upload.push(FileToUpload {
                    local_path: entry_path,
                    s3_key,
                    content_type,
                });
            } else if entry_path.is_dir() {
                let dir_name = entry_path.file_name()
                    .context("Invalid directory name")?;
                let new_s3_path = s3_path.join(dir_name);
                dirs_to_process.push((entry_path, new_s3_path));
            }
        }
    }

    Ok(files_to_upload)
}

/// Uploads a single file to S3 using streaming (no full file load into memory).
async fn upload_file_to_s3(
    s3_client: &S3Client,
    bucket: &str,
    file: FileToUpload,
) -> Result<()> {
    // Use ByteStream::from_path for streaming upload (doesn't load entire file)
    let body = ByteStream::from_path(&file.local_path).await
        .context(format!("Failed to create stream from file: {}", file.local_path.display()))?;
    
    s3_client
        .put_object()
        .bucket(bucket)
        .key(&file.s3_key)
        .content_type(file.content_type)
        .body(body)
        .send()
        .await
        .context(format!("Failed to upload {} to S3", file.s3_key))?;

    Ok(())
}
