'use client';

import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Loader } from '@frontend/components/ui/Loader';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Village } from '@server/database/schemas/villages';
import { updateCrossVisibility } from '@server-actions/villages/update-cross-visibility';
import React from 'react';
import useSWR from 'swr';

import styles from './cross-visibility-table.module.css';

export const CrossVisibilityTable = () => {
    const { data: villages, mutate, error } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const [isSaving, setIsSaving] = React.useState(false);
    const [pendingChanges, setPendingChanges] = React.useState<Partial<Record<string, boolean>>>({});

    const togglableVillages = (villages || []).filter((village) => !village.isCrossVisible);
    const isAllChecked = togglableVillages.length > 0 && togglableVillages.every((village) => pendingChanges[village.id] === true);

    if (error) {
        return <p>Une erreur est survenue lors du chargement des villages.</p>;
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button
                    label="Enregistrer"
                    color="primary"
                    variant="contained"
                    disabled={Object.keys(pendingChanges).length === 0}
                    onClick={async () => {
                        setIsSaving(true);
                        try {
                            await updateCrossVisibility(pendingChanges);
                            await mutate();
                            setPendingChanges({});
                        } catch {
                            sendToast({
                                type: 'error',
                                message: 'Une erreur est survenue lors de la sauvegarde.',
                            });
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                />
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.headerCell}>Village-monde</th>
                        <th className={styles.headerCell}>
                            <div className={styles.headerContent}>
                                <Checkbox
                                    name="cross-visibility-all"
                                    isChecked={isAllChecked}
                                    isDisabled={togglableVillages.length === 0}
                                    onChange={() => {
                                        if (isAllChecked) {
                                            setPendingChanges({});
                                        } else {
                                            const next: Partial<Record<string, boolean>> = {};
                                            for (const village of togglableVillages) {
                                                next[village.id] = true;
                                            }
                                            setPendingChanges(next);
                                        }
                                    }}
                                />
                                Pays mystère révélé
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(villages || []).map((village) => {
                        const isLocked = village.isCrossVisible;
                        const isChecked = isLocked || pendingChanges[village.id] === true;
                        return (
                            <tr className={styles.row} key={village.id}>
                                <td className={styles.cell}>{village.name}</td>
                                <td className={styles.cell}>
                                    <span style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Checkbox
                                            name={`cross-visibility-${village.id}`}
                                            isChecked={isChecked}
                                            isDisabled={isLocked}
                                            onChange={() => {
                                                if (isLocked) {
                                                    return;
                                                }
                                                const next = { ...pendingChanges };
                                                if (next[village.id] === true) {
                                                    delete next[village.id];
                                                } else {
                                                    next[village.id] = true;
                                                }
                                                setPendingChanges(next);
                                            }}
                                        />
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Loader isLoading={isSaving} />
        </>
    );
};
