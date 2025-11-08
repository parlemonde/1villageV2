use aws_sdk_s3::Client as S3Client;
use anyhow::{Result, Context as AnyhowContext};
use lambda_runtime::tracing;

// Gets the size of an object in S3.
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

// pub async fn validate_s3_object_size(
//     s3_client: &S3Client,
//     bucket: &str,
//     key: &str,
// ) -> Result<()> {
//     const MAX_FILE_SIZE_BYTES: i64 = 4 * 1024 * 1024 * 1024; // 4GB

//     tracing::info!("Checking S3 object size for: s3://{}/{}", bucket, key);

//     let head_response = s3_client
//         .head_object()
//         .bucket(bucket)
//         .key(key)
//         .send()
//         .await
//         .context("Failed to get S3 object metadata")?;

//     let file_size = head_response.content_length()
//         .ok_or_else(|| anyhow::anyhow!("S3 object has no content length"))?;

//     let size_mb = file_size as f64 / (1024.0 * 1024.0);
//     tracing::info!("S3 object size: {} bytes ({:.2} MB)", file_size, size_mb);

//     if file_size > MAX_FILE_SIZE_BYTES {
//         let size_gb = file_size as f64 / (1024.0 * 1024.0 * 1024.0);
//         return Err(anyhow::anyhow!(
//             "Video file size ({:.2} GB) exceeds maximum allowed size (4 GB)",
//             size_gb
//         ));
//     }

//     tracing::info!("File size validation passed");
//     Ok(())
// }

