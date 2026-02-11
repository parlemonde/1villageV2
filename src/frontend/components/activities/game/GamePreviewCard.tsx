'use client';

import { IconButton } from '@frontend/components/ui/Button';
import type { RadioOption } from '@frontend/components/ui/Form/RadioGroup';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { VideoPlayer } from '@frontend/components/ui/VideoPlayer';
import { Pencil1Icon } from '@radix-ui/react-icons';
import Image from 'next/image';

import styles from './game-preview-card.module.css';

interface GamePreviewCardProps {
    label?: string;
    imageUrl?: string;
    videoUrl?: string;
    options: RadioOption[];
    href: string;
}

export const GamePreviewCard = ({ label, imageUrl, videoUrl, options, href }: GamePreviewCardProps) => {
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
            <IconButton as="a" href={href} icon={Pencil1Icon} variant="outlined" color="primary" />
        </div>
    );
};
