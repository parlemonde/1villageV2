'use client';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { AspectRatio } from 'radix-ui';
import React, { useEffect, useRef } from 'react';
import useSWR from 'swr';
import videojs from 'video.js';
import 'videojs-hls-quality-selector'; // Should be loaded after video.js
import 'videojs-youtube'; // Should be loaded after video.js
import type Player from 'video.js/dist/types/player';

import { CircularProgress } from '../CircularProgress';

const isHlsReady = async (src: string) =>
    fetch(
        `/api/videos/ready${serializeToQueryUrl({
            videoUrl: src.startsWith('/') ? src.slice(1) : src,
        })}`,
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then<boolean>((data) => {
            return data.isReady;
        });

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
    mimeType?: string | null;
}
export const VideoPlayer = ({ src = '', mimeType = null }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLDivElement>(null);

    const { data: isReady = false } = useSWR(isHlsMediaUrl(src) ? src : null, isHlsReady, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: (latestIsReady = false) => {
            if (latestIsReady) {
                return 0;
            }
            return 1000;
        },
    });

    useEffect(() => {
        if (!videoRef.current || !src) {
            return () => {};
        }
        if (isHlsMediaUrl(src) && !isReady) {
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
        if (mimeType && !isYoutubeUrl(src)) {
            source.type = mimeType;
        }
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
    }, [src, mimeType, isReady]);

    return (
        <AspectRatio.Root ratio={16 / 9}>
            <div data-vjs-player ref={videoRef} style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
                {!isReady && isHlsMediaUrl(src) && (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            gap: 16,
                        }}
                    >
                        <CircularProgress size={24} color="inherit" />
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>La vidéo est en cours de traitement...</span>
                    </div>
                )}
            </div>
        </AspectRatio.Root>
    );
};

export default VideoPlayer;
