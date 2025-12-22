'use client';

import type { MediaLibraryResponse } from '@app/api/media-library/route';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Pagination } from '@frontend/components/ui/Pagination/Pagination';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { redirect, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';

import { MediaFilters } from './MediaFilters';
import { MediasGrid } from './MediasGrid';
import styles from './page.module.css';

const ITEMS_PER_PAGE = 12;

export default function AdminMediasPage() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('p');
    const currentPage = pageParam ? Number(pageParam) : 1;

    const [isPelico, setIsPelico] = useState(false);
    const [activity, setActivity] = useState('');
    const [country, setCountry] = useState('');
    const [village, setVillage] = useState('');
    const [classroom, setClassroom] = useState('');

    const { data: mediaLibraryResponse } = useSWR<MediaLibraryResponse>(
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
            />
            <MediasGrid items={mediaLibraryResponse?.items ?? []} />

            <div className={styles.paginationContainer}>
                <Pagination
                    totalItems={mediaLibraryResponse?.totalItems ?? 0}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={(page) => redirect(`/admin/medias${serializeToQueryUrl({ p: page })}`)}
                />
            </div>
        </PageContainer>
    );
}
