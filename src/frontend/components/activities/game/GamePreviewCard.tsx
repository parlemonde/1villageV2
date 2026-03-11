'use client';

import type { RadioOption } from '@frontend/components/ui/Form/RadioGroup';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { VideoPlayer } from '@frontend/components/ui/VideoPlayer';
import Image from 'next/image';

import styles from './game-preview-card.module.css';

interface GamePreviewCardProps {
    label?: string;
    imageUrl?: string;
    videoUrl?: string;
    options: RadioOption[];
}

export const GamePreviewCard = ({ label, imageUrl, videoUrl, options }: GamePreviewCardProps) => {
    if (!label && !imageUrl && options.length === 0) return null;
    return (
        <div className={styles.card}>
            <div className={styles.description}>
                {imageUrl && <Image className={styles.image} src={imageUrl} alt={label ?? ''} width={250} height={150} />}
                {videoUrl && (
                    <div className={styles.videoContainer}>
                        <VideoPlayer src={videoUrl} />
                    </div>
                )}
                <p>{label}</p>
            </div>
            <RadioGroup readonly options={options} value="true" />
        </div>
    );
};
