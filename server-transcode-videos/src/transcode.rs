use lambda_runtime::{tracing};
use anyhow::{Result, Context as AnyhowContext};
use std::path::{Path};
use std::process::Stdio;
use tokio::process::Command;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::video_utils::get_video_data;

const MAX_DURATION_SECONDS: f64 = 25.0 * 60.0; // 25 minutes

/// Transcodes a video file to HLS.
pub async fn transcode_video_to_hls(input_file: &Path, output_dir: &Path) -> Result<()> {
    tracing::info!("Starting HLS transcoding: {} -> {}", 
        input_file.display(), output_dir.display());

    let video_data = get_video_data(input_file)
        .context("Failed to get video data")?;

    if video_data.duration_seconds > MAX_DURATION_SECONDS {
        let duration_minutes = video_data.duration_seconds / 60.0;
        return Err(anyhow::anyhow!(
            "Video duration ({:.2} minutes) exceeds maximum allowed duration (25 minutes)",
            duration_minutes
        ));
    }

    let aspect_ratio = video_data.width as f64 / video_data.height as f64;
    let target_aspect_ratio = 16.0 / 9.0; // 1.777...
    
    // Use scale_y_filter if aspect ratio is wider than 16:9, otherwise use scale_x_filter
    let use_scale_y = aspect_ratio > target_aspect_ratio;
    
    tracing::info!("Video dimensions: {}x{}, aspect ratio: {:.3}, using {} filter", 
        video_data.width, video_data.height, aspect_ratio, if use_scale_y { "scale_y" } else { "scale_x" });
    tracing::info!("Processing video with audio: {}", video_data.has_audio);

    let scale_filter = if use_scale_y {
        "[0:v]split=3[v1][v2][v3];[v1]scale=w=1920:h=-2[v1out];[v2]scale=w=1280:h=-2[v2out];[v3]scale=w=854:h=-2[v3out]"
    } else {
        "[0:v]split=3[v1][v2][v3];[v1]scale=w=-2:h=1080[v1out];[v2]scale=w=-2:h=720[v2out];[v3]scale=w=-2:h=480[v3out]"
    };


    let segment_filename_path = output_dir.join("stream_%v/data%04d.ts");
    let stream_playlist_path = output_dir.join("stream_%v/playlist.m3u8");
    
    // Build variant stream map based on audio presence
    let var_stream_map = if video_data.has_audio {
        "v:0,a:0 v:1,a:1 v:2,a:2"
    } else {
        "v:0 v:1 v:2"
    };

    let mut ffmpeg_args: Vec<&str> = vec![
        "-i",
        input_file.to_str().unwrap(),
        "-preset",
        "ultrafast",
        "-g",
        "48",
        "-sc_threshold",
        "0",
        "-tune",
        "zerolatency",
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
    if video_data.has_audio {
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

    // Add progress monitoring to ffmpeg args - use pipe:1 for stdout
    let progress_args = vec!["-progress", "pipe:1", "-nostats"];
    let mut full_ffmpeg_args = progress_args;
    full_ffmpeg_args.extend_from_slice(&ffmpeg_args);

    let mut child = Command::new("ffmpeg")
        .args(&full_ffmpeg_args)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())  // Discard stderr to avoid blocking
        .spawn()
        .context("Failed to spawn ffmpeg process")?;

    // Monitor progress from stdout
    let stdout = child.stdout.take()
        .ok_or_else(|| anyhow::anyhow!("Failed to capture stdout"))?;
    
    let total_duration = video_data.duration_seconds;
    let progress_task = tokio::spawn(async move {
        monitor_ffmpeg_progress(stdout, total_duration).await
    });

    // Wait for ffmpeg to complete
    let status = child.wait().await
        .context("Failed to wait for ffmpeg process")?;

    // Ensure progress monitoring completes
    let _ = progress_task.await;

    if !status.success() {
        tracing::error!("FFmpeg process failed with exit code: {:?}", status.code());
        return Err(anyhow::anyhow!("FFmpeg transcoding failed with status: {:?}", status));
    }
 
    tracing::info!("HLS transcoding completed successfully for all resolutions");
    Ok(())
}

/// Monitors ffmpeg progress and logs every ~5%
async fn monitor_ffmpeg_progress(stdout: impl tokio::io::AsyncRead + Unpin, total_duration_seconds: f64) {
    let reader = BufReader::new(stdout);
    let mut lines = reader.lines();
    
    let mut last_logged_percentage = -1;
    let log_interval = 5; // Log every 5%
    
    tracing::info!("Starting progress monitoring (total duration: {:.2}s)", total_duration_seconds);
    
    while let Ok(Some(line)) = lines.next_line().await {
        // Parse progress lines like "out_time_us=4567890123" (microseconds)
        if line.starts_with("out_time_us=") {
            if let Some(time_str) = line.strip_prefix("out_time_us=") {
                if let Ok(time_us) = time_str.parse::<i64>() {
                    if time_us <= 0 {
                        continue;
                    }
                    
                    let current_seconds = time_us as f64 / 1_000_000.0;
                    let percentage = ((current_seconds / total_duration_seconds * 100.0) as i32).min(100);
                    
                    // Log every ~5%
                    let threshold = last_logged_percentage + log_interval;
                    if percentage >= threshold && percentage <= 100 {
                        let current_time = format_duration(current_seconds);
                        let total_time = format_duration(total_duration_seconds);
                        tracing::info!(
                            "Transcoding progress: {}% ({} / {})",
                            percentage,
                            current_time,
                            total_time
                        );
                        last_logged_percentage = percentage;
                    }
                }
            }
        }
        // Also check for "progress=end" to know when encoding finishes
        else if line == "progress=end" {
            if last_logged_percentage < 100 {
                let total_time = format_duration(total_duration_seconds);
                tracing::info!(
                    "Transcoding progress: 100% ({} / {})",
                    total_time,
                    total_time
                );
            }
            break;
        }
    }
    
    tracing::debug!("Progress monitoring completed");
}

/// Formats seconds into MM:SS or HH:MM:SS
fn format_duration(seconds: f64) -> String {
    let total_seconds = seconds as i64;
    let hours = total_seconds / 3600;
    let minutes = (total_seconds % 3600) / 60;
    let secs = total_seconds % 60;
    
    if hours > 0 {
        format!("{:02}:{:02}:{:02}", hours, minutes, secs)
    } else {
        format!("{:02}:{:02}", minutes, secs)
    }
}
