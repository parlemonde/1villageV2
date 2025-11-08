use std::path::{Path, PathBuf};
use aws_sdk_s3::{Client as S3Client, primitives::ByteStream};
use anyhow::{Result, Context as AnyhowContext};
use tokio::fs;

struct Directory {
    path: PathBuf,
    entries: tokio::fs::ReadDir,
}

/// Uploads a directory to S3.
pub async fn upload_directory_to_s3(
    s3_client: &S3Client,
    bucket: &str,
    key: &str,
    local_dir: &Path,
) -> Result<()> {
    tracing::info!("Uploading directory {} to s3://{}/{}", 
        local_dir.display(), bucket, key);

    let mut entries_vec = Vec::new();
    entries_vec.push(Directory {
        path: PathBuf::from(key),
        entries: fs::read_dir(local_dir).await
        .context("Failed to read HLS output directory")?,
    });

    let mut upload_count = 0;
    while let Some(directory) = entries_vec.pop() {
        let mut entries = directory.entries;
        while let Some(entry) = entries.next_entry().await? {
            let file_path = entry.path();
            if file_path.is_file() {
                let file_name = file_path.file_name()
                    .and_then(|name| name.to_str())
                    .context("Invalid file name")?;
                
                let s3_key = format!("{}/{}", directory.path.display(), file_name);
                
                // Determine content type
                let content_type = if file_name.ends_with(".m3u8") {
                    "application/vnd.apple.mpegurl"
                } else if file_name.ends_with(".ts") {
                    "video/mp2t"
                } else {
                    continue; // Skip non-HLS files
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

                upload_count += 1;
            } else if file_path.is_dir() {
                let dir_name = file_path.file_name().context("Invalid file name")?;
                let path_buf = directory.path.join(dir_name);
                entries_vec.push(Directory {
                    path: path_buf,
                    entries: fs::read_dir(file_path).await
                    .context("Failed to read HLS output directory")?,
                });
            }
        }
    }

    tracing::info!("Successfully uploaded {} files", upload_count);
    Ok(())
}
