'use client';

import type { MediaLibraryResponse } from '@app/api/media-library/route';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Pagination } from '@frontend/components/ui/Pagination/Pagination';
import { downloadFile } from '@frontend/lib/download-file';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import useSWR from 'swr';

import { MediaFilters } from './MediaFilters';
import { MediasGrid } from './MediasGrid';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 12;

export default function AdminMediasPage() {
    const [currentPage, setCurrentPage] = useState(1);

    const [isPelico, setIsPelico] = useState(false);
    const [activity, setActivity] = useState('');
    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [classroom, setClassroom] = useState('');

    const resetFilters = () => {
        setIsPelico(false);
        setActivity('');
        setCountry('');
        setVillage('');
        setClassroom('');
    };

    const downloadAll = async () => {
        const url = `/api/media-library/archive${serializeToQueryUrl({
            currentPage: currentPage,
            itemsPerPage: ITEMS_PER_PAGE,
            activityType: activity,
            countryCode: country,
            villageId: village,
            classroomId: classroom,
            isPelico: isPelico,
        })}`;

        const archiveName = `mediatheque_${new Date().toLocaleDateString()}.zip`;
        downloadFile(url, archiveName);
    };

    const { data: mediaLibraryResponse, isLoading } = useSWR<MediaLibraryResponse>(
        `/api/media-library${serializeToQueryUrl({
            page: currentPage,
            itemsPerPage: ITEMS_PER_PAGE,
            activityType: activity,
            countryCode: country,
            villageId: village,
            classroomId: classroom,
            isPelico: isPelico,
        })}`,
        jsonFetcher,
    );

    return (
        <PageContainer title="Médiathèque">
            <div className={styles.downloadButtonContainer}>
                <Button
                    color="primary"
                    label={
                        <>
                            <DownloadIcon /> Télécharger
                        </>
                    }
                    onClick={downloadAll}
                />
            </div>
            <MediaFilters
                isPelico={isPelico}
                activity={activity}
                country={country}
                village={village}
                classroom={classroom}
                setIsPelico={setIsPelico}
                setActivity={setActivity}
                setCountry={setCountry}
                setVillage={setVillage}
                setClassroom={setClassroom}
                resetFilters={resetFilters}
            />
            <MediasGrid items={mediaLibraryResponse?.items ?? []} isLoading={isLoading} resetFilters={resetFilters} />

            <div className={styles.paginationContainer}>
                <Pagination
                    totalItems={mediaLibraryResponse?.totalItems ?? 0}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>
        </PageContainer>
    );
}
