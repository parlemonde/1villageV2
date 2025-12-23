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

const generateCountries = (item: MediaLibraryItem) => {
    return (
        <>
            {item.villageCountries.map((c) => {
                return (
                    <div className={styles.country} key={c}>
                        <CountryFlag country={c} size="small" />
                        &nbsp;
                        {COUNTRIES[c]}
                    </div>
                );
            })}
        </>
    );
};

export function MediaCard({ item, ...props }: MediaCardProps) {
    const hostUrl = getEnvVariable('HOST_URL');
    const mediaUri = 'originalFilePath' in item.mediaMetadata ? (item.mediaMetadata.originalFilePath as string) : item.mediaUrl;
    const downloadLink = `${hostUrl}/${mediaUri}`;

    return (
        <div className={classNames(styles.card, { [styles[`width-${props.width}`]]: props.width })}>
            <div className={styles['card-body']}>
                {item.mediaUrl && (
                    <div className={styles['card-image-container']}>
                        <Image
                            fill
                            unoptimized={item.mediaType === 'video'}
                            className={styles['card-image']}
                            src={item.mediaType === 'video' ? '/static/images/video-placeholder.png' : '/' + item.mediaUrl}
                            alt={props.alt ?? ''}
                        />
                    </div>
                )}
                <div className={styles['card-content']}>
                    <div className={styles['card-title']}>{item.isPelico ? 'Pélico' : item.classroomAlias}</div>
                    <div className={styles['card-description']}>
                        <>
                            {item.villageName}
                            <br />
                            <div className={styles.countries}>{generateCountries(item)}</div>
                            {ACTIVITY_NAMES[item.activityType]}
                        </>
                    </div>
                </div>
            </div>
            <DownloadIcon className={styles['download-icon']} onClick={() => downloadFile(downloadLink)} />
        </div>
    );
}
