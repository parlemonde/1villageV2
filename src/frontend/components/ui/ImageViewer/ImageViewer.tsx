'use client';

import { Modal } from '@frontend/components/ui/Modal';
import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import classNames from 'clsx';
import Image from 'next/image';
import { useState } from 'react';

import styles from './image-viewer.module.css';

interface ImageViewerProps extends MarginProps {
    imageUrl: string;
    width?: string;
    height?: string;
    alt?: string;
    aspectRatio?: string;
    objectFit?: 'contain' | 'cover';
    unoptimized?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const ImageViewer = ({
    imageUrl,
    width,
    height,
    alt,
    aspectRatio,
    objectFit,
    unoptimized,
    className,
    style,
    ...marginProps
}: ImageViewerProps) => {
    const [isFullScreen, setIsFullScreen] = useState(false);

    return (
        <>
            <div style={{ width: `min(${width}, 100%)`, height, aspectRatio, position: 'relative', ...getMarginAndPaddingStyle(marginProps) }}>
                <Image
                    className={classNames(styles.image, className, {
                        [styles.contain]: objectFit === 'contain',
                        [styles.cover]: objectFit === 'cover',
                    })}
                    style={{ ...style, width: `min(${width}, 100%)`, height }}
                    src={imageUrl}
                    sizes={width}
                    height={0}
                    width={0}
                    alt={alt ?? ''}
                    unoptimized={unoptimized}
                    onClick={() => setIsFullScreen(true)}
                />
            </div>

            <Modal isOpen={isFullScreen} onClose={() => setIsFullScreen(false)} title={alt ?? ''} hasCancelButton={false} width="xl">
                <div style={{ position: 'relative', margin: 'auto', height: '75vh', width: '100%' }}>
                    <Image className={styles.contain} src={imageUrl} sizes={'1200px'} fill alt={alt ?? ''} unoptimized={unoptimized} />
                </div>
            </Modal>
        </>
    );
};
