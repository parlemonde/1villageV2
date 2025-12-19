'use client';

import { useState, useRef } from 'react';

import styles from './world-map.module.css';

export const useFullScreen = (onFullScreenChange: () => void) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleFullScreen = () => {
        if (!containerRef.current) {
            return;
        }
        onFullScreenChange();
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    const fullScreenButton = (
        <button title="Plein écran" onClick={toggleFullScreen} className={styles.button} style={{ marginTop: 8 }}>
            {isFullScreen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
            )}
        </button>
    );

    return { containerRef, fullScreenButton };
};
