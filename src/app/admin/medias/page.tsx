'use client';

import type { MediaLibraryResponse } from '@app/api/media-library/route';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Pagination } from '@frontend/components/ui/Pagination/Pagination';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { redirect, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

import { MediaFilters } from './MediaFilters';
import { MediasGrid } from './MediasGrid';

const ITEMS_PER_PAGE = 1;

export default function AdminMediasPage() {
    const searchParams = useSearchParams();
    const pageParam = searchParams.get('p');
    const currentPage = pageParam ? Number(pageParam) : 1;

    const { data: mediaLibraryResponse } = useSWR<MediaLibraryResponse>(
        `/api/media-library${serializeToQueryUrl({ page: currentPage, itemsPerPage: ITEMS_PER_PAGE, types: ['image', 'video'] })}`,
        jsonFetcher,
    );
    return (
        <PageContainer title="Médiathèque">
            <MediaFilters />
            <MediasGrid items={mediaLibraryResponse?.items ?? []} />
            <Pagination
                totalItems={mediaLibraryResponse?.totalItems ?? 0}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={(page) => redirect(`/admin/medias${serializeToQueryUrl({ p: page })}`)}
            />
        </PageContainer>
    );
}
