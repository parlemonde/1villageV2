import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import classNames from 'clsx';
import { useRef } from 'react';
import useSWR from 'swr';

import styles from './audio-mix-player.module.css';

// Polling strategy
// - First 1 minute: every second -> 60 retries
// - Second minute: every 2 seconds -> 30 retries
// - Next 3 minutes: every 6 seconds -> 30 retries
// - Next 5 minutes: every 10 seconds -> 30 retries
// - Next 10 minutes: every 20 seconds -> 30 retries
// - Next 40 minutes: every 40 seconds -> 30 retries
// - Stopped after 1 hour. Maximum 210 retries.
const getRefreshInterval = (intervalRetriesCount: number) => {
    if (intervalRetriesCount < 60) {
        return 1000;
    }
    if (intervalRetriesCount < 90) {
        return 2000;
    }
    if (intervalRetriesCount < 120) {
        return 6000;
    }
    if (intervalRetriesCount < 150) {
        return 10000;
    }
    if (intervalRetriesCount < 180) {
        return 20000;
    }
    if (intervalRetriesCount < 210) {
        return 40000;
    }
    return 0;
};

interface AudioMixPlayerProps {
    src?: string;
    style?: React.CSSProperties;
    className?: string;
}
export const AudioMixPlayer = ({ src, style, className }: AudioMixPlayerProps) => {
    const intervalRetriesCountRef = useRef(0);
    const { data, isLoading } = useSWR<{ status: 'queued' | 'processing' | 'completed' | 'not-found' }>(
        src ? `/api/audios/mix${serializeToQueryUrl({ src })}` : null,
        jsonFetcher,
        {
            refreshInterval: (latestData) => {
                if (latestData?.status === 'queued' || latestData?.status === 'processing') {
                    const refreshInterval = getRefreshInterval(intervalRetriesCountRef.current);
                    intervalRetriesCountRef.current++;
                    return refreshInterval;
                }
                return 0;
            },
        },
    );
    const status = isLoading ? 'loading' : data?.status || 'unknown';
    if (status == 'loading' || status === 'queued' || status === 'processing') {
        return (
            <span style={style} className={classNames(className, styles.audioPlayer)}>
                <CircularProgress color="primary" size={24} />
            </span>
        );
    }
    if (status === 'completed') {
        return <audio src={src} style={style} className={classNames(className, styles.audioPlayer)} controls />;
    }
    return (
        <span style={style} className={classNames(className, styles.audioPlayer)}>
            Ce mix n&apos;est pas disponible.
        </span>
    );
};
