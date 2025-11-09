use lambda_runtime::{tracing};
use anyhow::{Result, Context as AnyhowContext};
use std::path::{Path};
use std::process::Stdio;
use tokio::process::Command;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::video_utils::get_video_data;

const MAX_DURATION_SECONDS: f64 = 25.0 * 60.0; // 25 minutes
const MAX_WIDTH: u32 = 2560;
const STANDARD_WIDTHS: [u32; 3] = [1920, 1280, 854];

#[derive(Debug, Clone)]
struct QualityLevel {
    width: u32,
    bitrate: &'static str,
    maxrate: &'static str,
    bufsize: &'static str,
    audio_bitrate: &'static str,
}

impl QualityLevel {
    fn new(width: u32) -> Self {
        // Balanced bitrates for quality and speed
        let (bitrate, maxrate, bufsize, audio_bitrate) = match width {
            w if w >= 2000 => ("7000k", "7700k", "10500k", "192k"),  // 4K/2K range
            w if w >= 1920 => ("5000k", "5500k", "7500k", "192k"),   // Full HD
            w if w >= 1280 => ("3500k", "3850k", "5250k", "128k"),   // HD
            w if w >= 854 => ("1800k", "1980k", "2700k", "128k"),    // SD
            _ => ("1100k", "1210k", "1650k", "96k"),                 // Low res
        };
        
        Self {
            width,
            bitrate,
            maxrate,
            bufsize,
            audio_bitrate,
        }
    }
}

/// Determines which quality levels to encode based on input video width
fn determine_quality_levels(input_width: u32) -> Vec<QualityLevel> {
    let mut levels = Vec::new();
    
    // [1] Add original resolution (capped at MAX_WIDTH)
    let original_width = input_width.min(MAX_WIDTH);
    levels.push(QualityLevel::new(original_width));
    
    // [2] Add standard resolutions that are smaller than original
    for &standard_width in &STANDARD_WIDTHS {
        if standard_width < original_width && levels.len() < 3 {
            levels.push(QualityLevel::new(standard_width));
        }
    }
    
    levels
}

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

    // Determine quality levels based on input video dimensions
    let quality_levels = determine_quality_levels(video_data.width);
    let num_levels = quality_levels.len();
    
    tracing::info!(
        "Video dimensions: {}x{}, audio: {}, generating {} quality level(s): {:?}",
        video_data.width,
        video_data.height,
        video_data.has_audio,
        num_levels,
        quality_levels.iter().map(|q| q.width).collect::<Vec<_>>()
    );

    // Build scale filter based on number of quality levels
    let scale_filter = build_scale_filter(&quality_levels);


    let segment_filename_path = output_dir.join("stream_%v/data%04d.ts");
    let stream_playlist_path = output_dir.join("stream_%v/playlist.m3u8");
    
    // Build variant stream map based on number of streams and audio presence
    let var_stream_map = build_variant_stream_map(num_levels, video_data.has_audio);

    // Build ffmpeg arguments dynamically
    let mut ffmpeg_args = vec![
        "-i".to_string(),
        input_file.to_str().unwrap().to_string(),
        "-preset".to_string(),
        "veryfast".to_string(),
        "-profile:v".to_string(),
        "high".to_string(),
        "-level".to_string(),
        "4.0".to_string(),
        "-g".to_string(),
        "60".to_string(),        // Increased GOP for faster encoding (was 48)
        "-sc_threshold".to_string(),
        "0".to_string(),
        "-x264-params".to_string(),
        "ref=2:me=hex:subme=6".to_string(),  // Speed optimizations: fewer reference frames, faster motion estimation
        "-movflags".to_string(),
        "faststart".to_string(),
        "-pix_fmt".to_string(),
        "yuv420p".to_string(),
        "-filter_complex".to_string(),
        scale_filter,
    ];
    
    // Add video stream mappings and encoding settings (reversed order for HLS - highest quality first)
    for (i, level) in quality_levels.iter().enumerate().rev() {
        ffmpeg_args.extend([
            "-map".to_string(),
            format!("[v{}out]", i + 1),
            format!("-c:v:{}", num_levels - 1 - i),
            "libx264".to_string(),
            format!("-b:v:{}", num_levels - 1 - i),
            level.bitrate.to_string(),
            format!("-maxrate:v:{}", num_levels - 1 - i),
            level.maxrate.to_string(),
            format!("-bufsize:v:{}", num_levels - 1 - i),
            level.bufsize.to_string(),
        ]);
    }
    
    // Add audio mapping only if audio is present
    if video_data.has_audio {
        for (i, level) in quality_levels.iter().enumerate().rev() {
            ffmpeg_args.extend([
                "-map".to_string(),
                "a:0".to_string(),
                format!("-c:a:{}", num_levels - 1 - i),
                "aac".to_string(),
                format!("-b:a:{}", num_levels - 1 - i),
                level.audio_bitrate.to_string(),
                "-ac".to_string(),
                "2".to_string(),
            ]);
        }
    }
    
    // Add HLS parameters
    ffmpeg_args.extend([
        "-f".to_string(),
        "hls".to_string(),
        "-hls_time".to_string(),
        "6.4".to_string(),
        "-hls_playlist_type".to_string(),
        "vod".to_string(),
        "-hls_list_size".to_string(),
        "0".to_string(),
        "-hls_segment_filename".to_string(),
        segment_filename_path.to_str().unwrap().to_string(),
        "-hls_flags".to_string(),
        "independent_segments".to_string(),
        "-master_pl_name".to_string(),
        "master.m3u8".to_string(),
        "-var_stream_map".to_string(),
        var_stream_map,
        "-y".to_string(),
        stream_playlist_path.to_str().unwrap().to_string(),
    ]);

    // Add progress monitoring to ffmpeg args - use pipe:1 for stdout
    let mut full_ffmpeg_args = vec!["-progress".to_string(), "pipe:1".to_string(), "-nostats".to_string()];
    full_ffmpeg_args.extend(ffmpeg_args);

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

/// Builds the ffmpeg scale filter for the given quality levels
fn build_scale_filter(quality_levels: &[QualityLevel]) -> String {
    let num_levels = quality_levels.len();
    
    if num_levels == 1 {
        // No scaling needed, just copy the video stream
        return "[0:v]copy[v1out]".to_string();
    }
    
    // Split the input stream into N outputs
    let split_outputs: Vec<String> = (1..=num_levels)
        .map(|i| format!("[v{}]", i))
        .collect();
    let split_part = format!("[0:v]split={}{}",num_levels, split_outputs.join(""));
    
    // Scale each output to the target width
    let scale_parts: Vec<String> = quality_levels.iter()
        .enumerate()
        .map(|(i, level)| {
            format!("[v{}]scale=w={}:h=-2[v{}out]", i + 1, level.width, i + 1)
        })
        .collect();
    
    format!("{};{}", split_part, scale_parts.join(";"))
}

/// Builds the variant stream map for HLS
fn build_variant_stream_map(num_levels: usize, has_audio: bool) -> String {
    let streams: Vec<String> = (0..num_levels)
        .map(|i| {
            if has_audio {
                format!("v:{},a:{}", i, i)
            } else {
                format!("v:{}", i)
            }
        })
        .collect();
    
    streams.join(" ")
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_determine_quality_levels_4k() {
        let levels = determine_quality_levels(3840);
        assert_eq!(levels.len(), 3);
        assert_eq!(levels[0].width, 2560); // Capped at MAX_WIDTH
        assert_eq!(levels[1].width, 1920);
        assert_eq!(levels[2].width, 1280);
    }

    #[test]
    fn test_determine_quality_levels_1080p() {
        let levels = determine_quality_levels(1920);
        assert_eq!(levels.len(), 3);
        assert_eq!(levels[0].width, 1920);
        assert_eq!(levels[1].width, 1280);
        assert_eq!(levels[2].width, 854);
    }

    #[test]
    fn test_determine_quality_levels_720p() {
        let levels = determine_quality_levels(1280);
        assert_eq!(levels.len(), 2);
        assert_eq!(levels[0].width, 1280);
        assert_eq!(levels[1].width, 854);
    }

    #[test]
    fn test_determine_quality_levels_small() {
        let levels = determine_quality_levels(800);
        assert_eq!(levels.len(), 1);
        assert_eq!(levels[0].width, 800);
    }

    #[test]
    fn test_build_variant_stream_map_with_audio() {
        let map = build_variant_stream_map(3, true);
        assert_eq!(map, "v:0,a:0 v:1,a:1 v:2,a:2");
    }

    #[test]
    fn test_build_variant_stream_map_without_audio() {
        let map = build_variant_stream_map(2, false);
        assert_eq!(map, "v:0 v:1");
    }

    #[test]
    fn test_format_duration_short() {
        assert_eq!(format_duration(90.0), "01:30");
        assert_eq!(format_duration(65.5), "01:05");
    }

    #[test]
    fn test_format_duration_long() {
        assert_eq!(format_duration(3665.0), "01:01:05");
        assert_eq!(format_duration(7200.0), "02:00:00");
    }

    #[test]
    fn test_quality_level_bitrates() {
        let level_4k = QualityLevel::new(2560);
        assert_eq!(level_4k.bitrate, "7000k");
        
        let level_1080p = QualityLevel::new(1920);
        assert_eq!(level_1080p.bitrate, "5000k");
        
        let level_720p = QualityLevel::new(1280);
        assert_eq!(level_720p.bitrate, "3500k");
    }
}
