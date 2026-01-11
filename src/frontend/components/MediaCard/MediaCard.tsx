'use client';

import type { MediaLibraryItem } from '@app/api/media-library/route';
import { downloadFile } from '@lib/download-file';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { DownloadIcon } from '@radix-ui/react-icons';
import { getEnvVariable } from '@server/lib/get-env-variable';
import classNames from 'clsx';
import Image from 'next/image';
import React from 'react';

import styles from './media-card.module.css';
import { CountryFlag } from '../CountryFlag';
import { ACTIVITY_NAMES } from '../activities/activities-constants';
import type { MarginProps, PaddingProps } from '../ui/css-styles';

export type MediaCardProps = {
    item: MediaLibraryItem;
    alt?: string;
    as?: 'a' | 'button' | 'div';
    width?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
} & PaddingProps &
    MarginProps;

export function MediaCard({ item, ...props }: MediaCardProps) {
    const hostUrl = getEnvVariable('HOST_URL');
    const mediaUri = item.mediaMetadata && 'originalFilePath' in item.mediaMetadata ? (item.mediaMetadata.originalFilePath as string) : item.mediaUrl;
    const downloadLink = `${hostUrl}/${mediaUri}`;

    const fileExtension = mediaUri.split('.').pop();
    const fileName = `${item.activityType}_${item.villageName.replace(/ /g, '_')}_${item.activityId}.${fileExtension}`;

    return (
        <div className={classNames(styles.card, { [styles[`width-${props.width}`]]: props.width })}>
            <div className={styles['card-body']}>
                {item.mediaUrl && (
                    <div className={styles['card-image-container']}>
                        <Image
                            fill
                            unoptimized={mediaUri.startsWith('https')}
                            className={styles['card-image']}
                            src={item.mediaType === 'video' ? '/static/images/video-placeholder.png' : '/' + item.mediaUrl}
                            alt={props.alt ?? ''}
                        />
                    </div>
                )}
                <div className={styles['card-content']}>
                    <div className={styles['card-title']}>{item.isPelico ? 'Pélico' : item.classroomAlias}</div>
                    <div className={styles['card-description']}>
                        {item.villageName}
                        <br />
                        {item.classroomCountry && (
                            <>
                                <div className={styles.country}>
                                    <CountryFlag country={item.classroomCountry} size="small" />
                                    &nbsp;
                                    {COUNTRIES[item.classroomCountry]}
                                </div>
                                {ACTIVITY_NAMES[item.activityType]}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <DownloadIcon className={styles['download-icon']} onClick={() => downloadFile(downloadLink, fileName)} />
        </div>
    );
}
