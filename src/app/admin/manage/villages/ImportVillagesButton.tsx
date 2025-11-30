'use client';

import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { DownloadIcon } from '@radix-ui/react-icons';
import { importVillages } from '@server-actions/villages/import-villages';
import { useState } from 'react';
import { useSWRConfig } from 'swr';

export function ImportVillagesButton() {
    const [isImporting, setIsImporting] = useState(false);
    const { mutate } = useSWRConfig();

    const onImportVillages = async () => {
        setIsImporting(true);
        await importVillages();
        await Promise.all([mutate('/api/villages'), mutate('/api/statistics')]);
        setIsImporting(false);
    };

    return (
        <>
            <Button variant="contained" color="primary" leftIcon={<DownloadIcon />} label="Importer les villages-mondes" onClick={onImportVillages} />
            <Loader isLoading={isImporting} />
        </>
    );
}
