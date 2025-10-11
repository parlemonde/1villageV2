'use client';

import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Modal } from '@frontend/components/ui/Modal';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { debounce } from '@frontend/lib/debounce';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity, ActivityType } from '@server/database/schemas/activities';
import { publishActivity } from '@server-actions/activities/publish-activity';
import { saveDraft } from '@server-actions/activities/save-draft';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { UserContext } from './userContext';
import { VillageContext } from './villageContext';

export const ActivityContext = createContext<{
    activity: Partial<Activity> | undefined;
    setActivity: (activity: Partial<Activity>) => void;
    onCreateActivity: (activityType: ActivityType, isPelico?: boolean) => void;
    onPublishActivity: () => Promise<void>;
}>({
    activity: undefined,
    setActivity: () => {},
    onCreateActivity: () => {},
    onPublishActivity: () => Promise.resolve(),
});

let onCancelPreviousPromise: () => void = () => {};
const onSaveDraft = async (activity: Partial<Activity>, getSavedId: (id: number) => void, setDraftStep: (step: number) => void) => {
    if (activity.publishDate !== undefined && activity.publishDate !== null) {
        return;
    }
    onCancelPreviousPromise(); // Cancel previous promise
    let cancelled = false;
    onCancelPreviousPromise = () => {
        cancelled = true;
    };
    try {
        setDraftStep(1); // Display circular progress
        const now = Date.now();
        const newId = await saveDraft(activity);
        if (newId !== undefined) {
            getSavedId(newId);
        }
        // Wait for minimum 2s to show a pending state
        const minDuration = 2000 - (Date.now() - now);
        if (minDuration > 0) {
            await new Promise((resolve) => setTimeout(resolve, minDuration));
        }
        if (cancelled) {
            return;
        }
        setDraftStep(2); // Display "save done" message
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (cancelled) {
            return;
        }
        setDraftStep(0); // Reset to idle
    } catch {
        if (cancelled) {
            return;
        }
        setDraftStep(0); // Reset to idle
    }
    onCancelPreviousPromise = () => {};
};

const onSaveDraftDebounced = debounce((activity: Partial<Activity>, getSavedId: (id: number) => void, setDraftStep: (step: number) => void) => {
    onSaveDraft(activity, getSavedId, setDraftStep).catch();
}, 2000);

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
    const { village } = useContext(VillageContext);
    const { classroom } = useContext(UserContext);
    const [draftActivity, setDraftActivity] = useState<Activity | undefined>(undefined);
    const [draftStep, setDraftStep] = useState<number>(0); // 0 -> idle, 1 -> saving draft, 2 -> draft saved.
    const pathname = usePathname();

    const [localActivity, setLocalActivity] = useLocalStorage<Partial<Activity> | undefined>('activity', undefined);

    // Use a following ref for the activity to use in callbacks and effects without causing re-renders
    const localActivityRef = useRef<Partial<Activity> | undefined>(undefined);
    useEffect(() => {
        localActivityRef.current = localActivity;
    }, [localActivity]);

    // Auto save draft after an update (using a debounced function)
    const onUpdateActivity = useCallback(
        (newActivity: Partial<Activity>) => {
            setLocalActivity(newActivity);
            if (newActivity.type && newActivity.phase !== undefined) {
                onSaveDraftDebounced(
                    { ...newActivity, draftUrl: pathname },
                    (id) => {
                        if (localActivityRef.current) {
                            // Use the following ref here instead of the previous update, because by the time the update is done, the activity might be updated
                            setLocalActivity({ ...localActivityRef.current, id });
                        }
                    },
                    setDraftStep,
                );
            }
        },
        [setLocalActivity, pathname],
    );

    const onCreateActivity = useCallback(
        (activityType: ActivityType, isPelico?: boolean) => {
            setLocalActivity({ type: activityType, phase: village?.activePhase, villageId: village?.id, classroomId: classroom?.id, isPelico });
            jsonFetcher<Activity>(`/api/activities/draft${serializeToQueryUrl({ type: activityType })}`)
                .then(setDraftActivity)
                .catch(() => {
                    setDraftActivity(undefined);
                });
        },
        [setLocalActivity, village, classroom],
    );

    const onPublishActivity = useCallback(async () => {
        if (!village || !localActivity) {
            return;
        }
        await publishActivity({ ...localActivity, classroomId: classroom?.id ?? null, villageId: village.id, phase: village.activePhase });
    }, [village, localActivity, classroom]);

    const contextValue = useMemo(
        () => ({
            activity: localActivity,
            setActivity: onUpdateActivity,
            onCreateActivity,
            onPublishActivity,
        }),
        [localActivity, onUpdateActivity, onCreateActivity, onPublishActivity],
    );

    return (
        <ActivityContext.Provider value={contextValue}>
            {children}
            {draftStep > 0 && (
                <div style={{ position: 'fixed', bottom: '16px', right: '72px' }}>
                    <div
                        style={{
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            padding: '0 8px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '4px',
                            fontSize: '14px',
                        }}
                    >
                        {draftStep === 1 && <CircularProgress color="inherit" size={18} />}
                        {draftStep === 2 && <p className="text text--small">Brouillon enregistré</p>}
                    </div>
                </div>
            )}
            <Modal
                isOpen={draftActivity !== undefined}
                title="Brouillon en cours !"
                hasCloseButton={false}
                onClose={() => {
                    setDraftActivity(undefined);
                }}
                onConfirm={() => {
                    if (!draftActivity) {
                        return;
                    }
                    setLocalActivity(draftActivity);
                    setDraftActivity(undefined);
                }}
                cancelLabel="Créer une nouvelle activité"
                confirmLabel="Reprendre le brouillon"
            >
                <p>Vous avez un brouillon en cours pour cette activité, souhaitez vous le reprendre ?</p>
                <p>
                    (Continuer sans ce brouillon en créera un nouveau qui va <strong>supprimer</strong> celui déjà existant.)
                </p>
            </Modal>
        </ActivityContext.Provider>
    );
};
