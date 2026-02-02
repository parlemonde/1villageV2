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
import { useContext, useState } from 'react';
import useSWR from 'swr';

import styles from './VillageSelector.module.css';

export const VillageSelector = () => {
    const { village } = useContext(VillageContext);
    const [isModalOpen, setIsModalOpen] = useState(village === undefined);
    const [villageId, setVillageId] = useState(village?.id);

    const { data, isLoading } = useSWR<Village[], Error>('/api/villages', jsonFetcher);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--secondary-color)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                }}
            >
                <span className={styles.villageName}>{village?.name ?? 'Aucun village'}</span>
                <Button
                    size="sm"
                    isUpperCase={false}
                    color="secondary"
                    onClick={() => setIsModalOpen(true)}
                    label="Changer de village"
                    className={styles.changeButton}
                />
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (village !== undefined) {
                        setIsModalOpen(false);
                    }
                }}
                title="Sélectionner un village"
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
                                    placeholder="Sélectionner un village"
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
                                label="Choisir"
                                onClick={async () => {
                                    if (!villageId) {
                                        return;
                                    }
                                    try {
                                        await setVillage(villageId);
                                    } catch {
                                        // TODO: handle error
                                    }
                                    setIsModalOpen(false);
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
                                        OU
                                    </Title>
                                </div>
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <Button as="a" href="/admin" color="secondary" variant="contained" label="Aller à l'interface Admin" />
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </>
    );
};
