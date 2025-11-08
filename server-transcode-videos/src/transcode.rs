use lambda_runtime::{tracing};
use anyhow::{Result, Context as AnyhowContext};
use std::path::{Path};
use std::process::Command;

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
