use std::path::Path;
use std::process::Command;
use anyhow::{Result, Context};
use serde::Deserialize;

#[derive(Clone, Debug)]
pub struct VideoData {
    pub duration_seconds: f64,
    pub width: u32,
    pub height: u32,
    pub has_audio: bool,
}

#[derive(Deserialize)]
struct FfprobeOutput {
    format: FfprobeFormat,
    streams: Vec<FfprobeStream>,
}

#[derive(Deserialize)]
struct FfprobeFormat {
    duration: Option<String>,
}

#[derive(Deserialize)]
struct FfprobeStream {
    codec_type: Option<String>,
    width: Option<u32>,
    height: Option<u32>,
}

/// Gets the duration, dimensions, and audio info of a video file using a single ffprobe call.
pub fn get_video_data(input_file: &Path) -> Result<VideoData> {
    tracing::info!("Getting video data for: {}", input_file.display());
    
    let output = Command::new("ffprobe")
        .args([
            "-v", "error",
            "-show_entries", "format=duration:stream=codec_type,width,height",
            "-of", "json",
            input_file.to_str().context("Invalid input file path")?,
        ])
        .output()
        .context("Failed to execute ffprobe")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        tracing::error!("ffprobe failed: {}", stderr);
        return Err(anyhow::anyhow!("ffprobe failed: {}", stderr));
    }

    let output_str = String::from_utf8(output.stdout)
        .context("Invalid UTF-8 in ffprobe output")?;
    
    let probe_data: FfprobeOutput = serde_json::from_str(&output_str)
        .context("Failed to parse ffprobe JSON output")?;

    // Extract duration
    let duration_seconds = probe_data.format.duration
        .as_ref()
        .and_then(|d| d.parse::<f64>().ok())
        .unwrap_or(0.0);

    // Find video stream for dimensions
    let video_stream = probe_data.streams.iter()
        .find(|s| s.codec_type.as_deref() == Some("video"));
    
    let (width, height) = match video_stream {
        Some(stream) => (
            stream.width.unwrap_or(0),
            stream.height.unwrap_or(0)
        ),
        None => (0, 0),
    };

    // Check if there's an audio stream
    let has_audio = probe_data.streams.iter()
        .any(|s| s.codec_type.as_deref() == Some("audio"));

    tracing::info!(
        "Video data: duration={:.2}s ({:.2}min), dimensions={}x{}, audio={}",
        duration_seconds,
        duration_seconds / 60.0,
        width,
        height,
        has_audio
    );

    Ok(VideoData {
        duration_seconds,
        width,
        height,
        has_audio,
    })
}
