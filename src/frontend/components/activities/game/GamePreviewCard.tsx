'use client';

import { IconButton } from '@frontend/components/ui/Button';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { Pencil1Icon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useExtracted } from 'next-intl';

import styles from './game-preview-card.module.css';

interface GamePreviewCardProps {
    label?: string;
    imageUrl?: string;
    options: { label: string; value: string }[];
    href: string;
}

export const GamePreviewCard = ({ label, imageUrl, options, href }: GamePreviewCardProps) => {
    const t = useExtracted('GamePreviewCard');

    return (
        <div className={styles.card}>
            <div className={styles.description}>
                {imageUrl && (
                    <div className={styles.imageContainer}>
                        <Image className={styles.image} src={imageUrl} alt={t("Dessin de l'expression")} width={250} height={150} />
                    </div>
                )}
                <p>{label}</p>
            </div>
            <RadioGroup readonly options={options} value={'true'} />
            <IconButton as="a" href={href} icon={Pencil1Icon} variant="outlined" color="primary" />
        </div>
    );
};
