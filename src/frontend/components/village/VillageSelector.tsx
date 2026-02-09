'use client';

import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Field } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { Modal } from '@frontend/components/ui/Modal';
import { Title } from '@frontend/components/ui/Title';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Village } from '@server/database/schemas/villages';
import { setVillage } from '@server-actions/villages/set-village';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import styles from './VillageSelector.module.css';

export const VillageSelector = () => {
    const { village } = useContext(VillageContext);
    const [isModalOpen, setIsModalOpen] = useState(village === undefined);
    const [villageId, setVillageId] = useState(village?.id);
    const tCommon = useExtracted('common');

    const { data, isLoading } = useSWR<Village[], Error>('/api/villages', jsonFetcher);

    const setCookieVillageId = async (villageId: number | undefined) => {
        if (!villageId) {
            return;
        }
        try {
            await setVillage(villageId);
        } catch (err) {
            console.error(err);
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <div className={styles.villageNameContainer}>
                <span className={styles.villageNameLabel}>{village?.name ?? tCommon('Aucun village')}</span>
                <Button
                    size="sm"
                    isUpperCase={false}
                    variant="contained"
                    color="secondary"
                    className={styles.villageNameButton}
                    onClick={() => setIsModalOpen(true)}
                    label={tCommon('Changer de village')}
                />
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (village !== undefined) {
                        setIsModalOpen(false);
                    }
                }}
                title={tCommon('Sélectionner un village')}
                hasCloseButton={village !== undefined}
                hasFooter={false}
                isConfirmDisabled={!villageId || isLoading}
            >
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '16px' }}>
                        <CircularProgress />
                    </div>
                ) : (
                    <>
                        <Field
                            name="village"
                            label="Village"
                            input={
                                <Select
                                    isFullWidth
                                    color="secondary"
                                    value={villageId ? `${villageId}` : undefined}
                                    onChange={(value) => setVillageId(Number(value))}
                                    placeholder={tCommon('Sélectionner un village')}
                                    options={(data || []).map((village) => ({
                                        label: village.name,
                                        value: `${village.id}`,
                                    }))}
                                />
                            }
                        />
                        <div style={{ width: '100%', textAlign: 'right', marginTop: '16px' }}>
                            <Button
                                color="secondary"
                                variant={village === undefined ? 'outlined' : 'contained'}
                                label={tCommon('Choisir')}
                                onClick={async () => {
                                    await setCookieVillageId(villageId);
                                }}
                                disabled={!villageId || isLoading}
                            />
                        </div>
                        {village === undefined && (
                            <>
                                <div style={{ width: '100%', borderTop: '1px solid #e0e0e0', margin: '32px 0 10px 0', textAlign: 'center' }}>
                                    <Title
                                        variant="h3"
                                        color="inherit"
                                        paddingX="md"
                                        style={{ display: 'inline', position: 'relative', top: '-15px', backgroundColor: 'white' }}
                                    >
                                        {tCommon('OU')}
                                    </Title>
                                </div>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Button as="a" href="/admin" color="secondary" variant="contained" label={tCommon("Aller à l'interface Admin")} />
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
};
