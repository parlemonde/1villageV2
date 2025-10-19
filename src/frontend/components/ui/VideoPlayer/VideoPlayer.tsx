'use client';
import { AspectRatio } from 'radix-ui';
import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'videojs-hls-quality-selector'; // Should be loaded after video.js
import 'videojs-youtube'; // Should be loaded after video.js
import type Player from 'video.js/dist/types/player';

interface Source {
    src: string;
    type?: string;
}

interface ExtendedPlayer extends Player {
    hlsQualitySelector: (options: { displayCurrentQuality: boolean }) => void;
}
const isExtendedPlayer = (player: Player | null): player is ExtendedPlayer => {
    return player !== null && 'hlsQualitySelector' in player;
};

const isHlsMediaUrl = (src: string) => {
    return src.startsWith('/media/videos/') && src.endsWith('.m3u8');
};
const isYoutubeUrl = (src: string) => {
    return src.startsWith('https://www.youtube.com/');
};

interface VideoPlayerProps {
    src?: string;
}
export const VideoPlayer = ({ src = '' }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!videoRef.current || !src) {
            return () => {};
        }

        const source: Source = isYoutubeUrl(src)
            ? {
                  src: src,
                  type: 'video/youtube',
              }
            : {
                  src: src,
              };
        const videoElement = document.createElement('video-js');
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoRef.current.appendChild(videoElement);
        const player = videojs(videoElement, {
            controls: true,
            playsInline: true,
            sources: [source],
        });
        if (isExtendedPlayer(player) && isHlsMediaUrl(src)) {
            player.hlsQualitySelector({
                displayCurrentQuality: true,
            });
        }
        return () => {
            if (!player.isDisposed()) {
                player.dispose();
            }
        };
    }, [src]);

    return (
        <AspectRatio.Root ratio={16 / 9}>
            <div data-vjs-player ref={videoRef} style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>
        </AspectRatio.Root>
    );
};

export default VideoPlayer;
