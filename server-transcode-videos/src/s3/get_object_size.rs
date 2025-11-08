use aws_sdk_s3::Client as S3Client;
use anyhow::{Result, Context as AnyhowContext};
use lambda_runtime::tracing;

/// Gets the size of an object in S3 without downloading it.
pub async fn get_object_size(
    s3_client: &S3Client,
    bucket: &str,
    key: &str,
) -> Result<i64> {
    tracing::info!("Getting object size for: s3://{}/{}", bucket, key);

    let head_response = s3_client
        .head_object()
        .bucket(bucket)
        .key(key)
        .send()
        .await
        .context("Failed to get S3 object metadata")?;

    let file_size = head_response.content_length()
        .ok_or_else(|| anyhow::anyhow!("S3 object has no content length"))?;
    let size_mb = file_size as f64 / (1024.0 * 1024.0);
    
    tracing::info!("S3 object size: {} bytes ({:.2} MB)", file_size, size_mb);
    Ok(file_size)
}
