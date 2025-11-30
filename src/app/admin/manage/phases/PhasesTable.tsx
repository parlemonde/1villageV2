'use client';

import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Loader } from '@frontend/components/ui/Loader';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Village } from '@server/database/schemas/villages';
import { updatePhases } from '@server-actions/villages/update-phases';
import React from 'react';
import useSWR from 'swr';

import styles from './phases-table.module.css';

export const PhasesTable = () => {
    const { data: villages, mutate } = useSWR<Village[]>('/api/villages', jsonFetcher);
    const [isSaving, setIsSaving] = React.useState(false);
    const [villagesActivePhase, setVillagesActivePhase] = React.useState<Partial<Record<string, number>>>({});

    const isAllPhase2Checked = (villages || []).every((village) => village.activePhase >= 2 || (villagesActivePhase[village.id] || 0) >= 2);
    const isAllPhase3Checked = (villages || []).every((village) => village.activePhase >= 3 || (villagesActivePhase[village.id] || 0) >= 3);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button
                    label="Enregistrer"
                    color="primary"
                    variant="contained"
                    disabled={Object.keys(villagesActivePhase).length === 0}
                    onClick={async () => {
                        setIsSaving(true);
                        await updatePhases(villagesActivePhase);
                        await mutate();
                        setVillagesActivePhase({});
                        setIsSaving(false);
                    }}
                />
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.headerCell}>Village-monde</th>
                        <th className={styles.headerCell}>Phase 1</th>
                        <th className={styles.headerCell}>
                            <div className={styles.headerContent}>
                                <Checkbox
                                    name={`phase-2-all`}
                                    isChecked={isAllPhase2Checked}
                                    onChange={() => {
                                        const newVillagesActivePhase = { ...villagesActivePhase };
                                        if (isAllPhase2Checked) {
                                            // Unselect all villages
                                            for (const village of villages || []) {
                                                if ((newVillagesActivePhase[village.id] || 0) >= 2) {
                                                    delete newVillagesActivePhase[village.id];
                                                }
                                            }
                                        } else {
                                            // Select all villages
                                            for (const village of villages || []) {
                                                if (village.activePhase < 2 && (newVillagesActivePhase[village.id] || 0) < 2) {
                                                    newVillagesActivePhase[village.id] = 2;
                                                }
                                            }
                                        }
                                        setVillagesActivePhase(newVillagesActivePhase);
                                    }}
                                />
                                Phase 2
                            </div>
                        </th>
                        <th className={styles.headerCell}>
                            <div className={styles.headerContent}>
                                <Checkbox
                                    name={`phase-3-all`}
                                    isChecked={isAllPhase3Checked}
                                    onChange={() => {
                                        const newVillagesActivePhase = { ...villagesActivePhase };
                                        if (isAllPhase3Checked) {
                                            // Unselect all villages
                                            for (const village of villages || []) {
                                                if ((newVillagesActivePhase[village.id] || 0) >= 3) {
                                                    delete newVillagesActivePhase[village.id];
                                                }
                                            }
                                        } else {
                                            // Select all villages
                                            for (const village of villages || []) {
                                                if (village.activePhase < 3 && (newVillagesActivePhase[village.id] || 0) < 3) {
                                                    newVillagesActivePhase[village.id] = 3;
                                                }
                                            }
                                        }
                                        setVillagesActivePhase(newVillagesActivePhase);
                                    }}
                                />
                                Phase 3
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {(villages || []).map((village) => (
                        <tr className={styles.row} key={village.id}>
                            <td className={styles.cell}>{village.name}</td>
                            <td className={styles.cell}>
                                <Checkbox name={`phase-1-${village.id}`} isChecked isDisabled />
                            </td>
                            <td className={styles.cell}>
                                <Checkbox
                                    name={`phase-2-${village.id}`}
                                    isDisabled={village.activePhase >= 2}
                                    isChecked={village.activePhase >= 2 || (villagesActivePhase[village.id] || 0) >= 2}
                                    onChange={() => {
                                        if (village.activePhase >= 2) {
                                            return;
                                        }
                                        if ((villagesActivePhase[village.id] || 0) >= 2) {
                                            const newVillagesActivePhase = { ...villagesActivePhase };
                                            delete newVillagesActivePhase[village.id];
                                            setVillagesActivePhase(newVillagesActivePhase);
                                        } else {
                                            setVillagesActivePhase({
                                                ...villagesActivePhase,
                                                [village.id]: village.activePhase >= 2 ? village.activePhase - 2 : 2,
                                            });
                                        }
                                    }}
                                />
                            </td>
                            <td className={styles.cell}>
                                <Checkbox
                                    name={`phase-3-${village.id}`}
                                    isDisabled={village.activePhase >= 3}
                                    isChecked={village.activePhase >= 3 || (villagesActivePhase[village.id] || 0) >= 3}
                                    onChange={() => {
                                        if (village.activePhase >= 3) {
                                            return;
                                        }
                                        if ((villagesActivePhase[village.id] || 0) >= 3) {
                                            const newVillagesActivePhase = { ...villagesActivePhase };
                                            delete newVillagesActivePhase[village.id];
                                            setVillagesActivePhase(newVillagesActivePhase);
                                        } else {
                                            setVillagesActivePhase({
                                                ...villagesActivePhase,
                                                [village.id]: village.activePhase >= 3 ? village.activePhase - 3 : 3,
                                            });
                                        }
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Loader isLoading={isSaving} />
        </>
    );
};
