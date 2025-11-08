mod s3;
mod local;
mod video_utils;
mod transcode;
mod event_handler;

use lambda_runtime::{run, service_fn, tracing, Error};
use event_handler::function_handler;

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();
    run(service_fn(function_handler)).await
}
