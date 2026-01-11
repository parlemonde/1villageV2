'use client';

import { useActivityName } from '@frontend/components/activities/activities-constants';
import { Button } from '@frontend/components/ui/Button/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Loader } from '@frontend/components/ui/Loader';
import type { ActivityType, PhaseActivityType } from '@server/database/schemas/activity-types';
import { ACTIVITY_TYPES_ENUM } from '@server/database/schemas/activity-types';
import { setActivityPhases } from '@server-actions/activities/set-activity-phases';
import { useState } from 'react';

import styles from './activity-phases-table.module.css';

/**
 * Order the activity types by the order in the ACTIVITY_TYPES_ENUM
 */
const getOrderedActivityTypes = (activityTypes: ActivityType[]): ActivityType[] => {
    return activityTypes.sort((a, b) => {
        return ACTIVITY_TYPES_ENUM.indexOf(a) - ACTIVITY_TYPES_ENUM.indexOf(b);
    });
};

interface ActivityPhasesTableProps {
    phases: PhaseActivityType[];
}
export const ActivityPhasesTable = ({ phases }: ActivityPhasesTableProps) => {
    const initialPhase1Activities = getOrderedActivityTypes(phases.filter((phase) => phase.phase === 1).flatMap((phase) => phase.activityTypes));
    const initialPhase2Activities = getOrderedActivityTypes(phases.filter((phase) => phase.phase === 2).flatMap((phase) => phase.activityTypes));
    const initialPhase3Activities = getOrderedActivityTypes(phases.filter((phase) => phase.phase === 3).flatMap((phase) => phase.activityTypes));

    const [phase1Activities, setPhase1Activities] = useState<ActivityType[]>([...initialPhase1Activities]);
    const [phase2Activities, setPhase2Activities] = useState<ActivityType[]>([...initialPhase2Activities]);
    const [phase3Activities, setPhase3Activities] = useState<ActivityType[]>([...initialPhase3Activities]);

    const phase1ActivitiesSet = new Set(phase1Activities);
    const phase2ActivitiesSet = new Set(phase2Activities);
    const phase3ActivitiesSet = new Set(phase3Activities);

    const [isSaving, setIsSaving] = useState(false);
    const hasChanges =
        initialPhase1Activities.join(',') !== phase1Activities.join(',') ||
        initialPhase2Activities.join(',') !== phase2Activities.join(',') ||
        initialPhase3Activities.join(',') !== phase3Activities.join(',');

    const { getActivityName } = useActivityName();

    return (
        <div>
            <Loader isLoading={isSaving} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <Button
                    label="Enregistrer"
                    color="primary"
                    variant="contained"
                    disabled={!hasChanges}
                    onClick={async () => {
                        setIsSaving(true);
                        await setActivityPhases([
                            { phase: 1, activityTypes: phase1Activities },
                            { phase: 2, activityTypes: phase2Activities },
                            { phase: 3, activityTypes: phase3Activities },
                        ]);
                        setIsSaving(false);
                    }}
                />
            </div>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.headerCell}>Activité</th>
                        <th className={styles.headerCell}>Phase 1</th>
                        <th className={styles.headerCell}>Phase 2</th>
                        <th className={styles.headerCell}>Phase 3</th>
                    </tr>
                </thead>
                <tbody>
                    {ACTIVITY_TYPES_ENUM.map((activityType) => (
                        <tr className={styles.row} key={activityType}>
                            <td className={styles.cell}>{getActivityName(activityType)}</td>
                            <td className={styles.cell}>
                                <span style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Checkbox
                                        name={`phase-1-${activityType}`}
                                        isChecked={phase1ActivitiesSet.has(activityType)}
                                        onChange={() => {
                                            const newPhase1ActivitiesSet = new Set(phase1ActivitiesSet);
                                            if (newPhase1ActivitiesSet.has(activityType)) {
                                                newPhase1ActivitiesSet.delete(activityType);
                                            } else {
                                                newPhase1ActivitiesSet.add(activityType);
                                            }
                                            setPhase1Activities(getOrderedActivityTypes(Array.from(newPhase1ActivitiesSet)));
                                        }}
                                    />
                                </span>
                            </td>
                            <td className={styles.cell}>
                                <span style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Checkbox
                                        name={`phase-2-${activityType}`}
                                        isChecked={phase2ActivitiesSet.has(activityType)}
                                        onChange={() => {
                                            const newPhase2ActivitiesSet = new Set(phase2ActivitiesSet);
                                            if (newPhase2ActivitiesSet.has(activityType)) {
                                                newPhase2ActivitiesSet.delete(activityType);
                                            } else {
                                                newPhase2ActivitiesSet.add(activityType);
                                            }
                                            setPhase2Activities(getOrderedActivityTypes(Array.from(newPhase2ActivitiesSet)));
                                        }}
                                    />
                                </span>
                            </td>
                            <td className={styles.cell}>
                                <span style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Checkbox
                                        name={`phase-3-${activityType}`}
                                        isChecked={phase3ActivitiesSet.has(activityType)}
                                        onChange={() => {
                                            const newPhase3ActivitiesSet = new Set(phase3ActivitiesSet);
                                            if (newPhase3ActivitiesSet.has(activityType)) {
                                                newPhase3ActivitiesSet.delete(activityType);
                                            } else {
                                                newPhase3ActivitiesSet.add(activityType);
                                            }
                                            setPhase3Activities(getOrderedActivityTypes(Array.from(newPhase3ActivitiesSet)));
                                        }}
                                    />
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
