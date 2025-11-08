use lambda_runtime::{tracing, Error, LambdaEvent};
use aws_config::BehaviorVersion;
use aws_sdk_s3::{Client as S3Client};
use anyhow::{Result};
use serde::{Deserialize, Serialize};

use crate::s3;
use crate::local;

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(untagged)]
pub enum Event {
    S3(s3::S3Event),
    Local(local::LocalEvent),
}

pub(crate) async fn function_handler(event: LambdaEvent<Event>) -> Result<(), Error> {
    match event.payload {
        Event::S3(s3_event) => {
            let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
            let s3_client = S3Client::new(&config);
            if let Err(e) = s3::handle_s3_event(&s3_client, s3_event).await {
                tracing::error!("Failed to process S3 record: {}", e);
                return Err(Error::from(e.to_string()));
            }
        }
        Event::Local(local_event) => {
            if let Err(e) = local::handle_local_event(local_event).await {
                tracing::error!("Failed to process local record: {}", e);
                return Err(Error::from(e.to_string()));
            }
        }
    }
    Ok(())
}

