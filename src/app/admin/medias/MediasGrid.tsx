'use client';

import type { MediaLibraryItem } from '@app/api/media-library/route';
import { MediaCard } from '@frontend/components/MediaCard/MediaCard';
import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import PelicoSearch from '@frontend/svg/pelico/pelico-search.svg';

import styles from './media-grid.module.css';

interface MediaGridProps {
    items: MediaLibraryItem[];
    isLoading: boolean;
    resetFilters: () => void;
}

export function MediasGrid({ items, isLoading, resetFilters }: MediaGridProps) {
    if (items.length === 0 && !isLoading) {
        return (
            <div className={styles.empty}>
                <div className={styles.pelicoSearch}>
                    <p className={styles.text}>Oups ! Aucun contenu ne correspond à ta recherche</p>
                    <PelicoSearch />
                </div>
                <Button className={styles.button} color="primary" label="Réinitialiser les filtres" onClick={resetFilters} />
            </div>
        );
    }

    return (
        <>
            {isLoading && (
                <div className={styles.loader}>
                    <CircularProgress />
                </div>
            )}
            <div className={styles.grid}>
                {items?.map((item) => (
                    <MediaCard key={item.mediaId} width="xs" item={item} />
                ))}
            </div>
        </>
    );
}
