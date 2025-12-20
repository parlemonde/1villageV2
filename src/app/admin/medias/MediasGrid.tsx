'use client';

import type { MediaLibraryItem } from '@app/api/media-library/route';
import { MediaCard } from '@frontend/components/MediaCard/MediaCard';

import styles from './media-grid.module.css';

interface MediaGridProps {
    items: MediaLibraryItem[];
}

export function MediasGrid({ items }: MediaGridProps) {
    return (
        <div className={styles.grid}>
            {items?.map((item) => (
                <MediaCard key={item.mediaId} width="xs" item={item} />
            ))}
        </div>
    );
}
