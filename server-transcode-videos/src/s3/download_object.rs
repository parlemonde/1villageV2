use aws_sdk_s3::Client as S3Client;
use anyhow::{Result, Context as AnyhowContext};
use std::path::Path;
use tokio::fs;
use tokio::io::AsyncWriteExt;
use lambda_runtime::tracing;

/// Downloads an object from S3 to a local file.
pub async fn download_object(
    s3_client: &S3Client,
    bucket: &str,
    key: &str,
    local_path: &Path,
) -> Result<()> {
    tracing::info!("Downloading s3://{}/{} to {}", bucket, key, local_path.display());

    let mut file = fs::File::create(local_path).await
        .context("Failed to create local file")?;
    
    let mut response = s3_client
        .get_object()
        .bucket(bucket)
        .key(key)
        .send()
        .await
        .context("Failed to get object from S3")?;

    while let Some(bytes) = response.body.try_next().await.context("Failed to read S3 object body")? {
        file.write_all(&bytes).await.context("Failed to write to local file")?;
    }

    tracing::info!("Successfully downloaded file: {}", local_path.display());
    Ok(())
}
