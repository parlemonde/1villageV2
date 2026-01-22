'use client';

import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Modal } from '@frontend/components/ui/Modal';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { debounce } from '@frontend/lib/debounce';
import { getChallengeFormRoute } from '@frontend/lib/get-challenge-form-route';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import type { ActivityType } from '@server/database/schemas/activity-types';
import { publishActivity } from '@server-actions/activities/publish-activity';
import { saveDraft } from '@server-actions/activities/save-draft';
import { updateActivity } from '@server-actions/activities/update-activity';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { UserContext } from './userContext';
import { VillageContext } from './villageContext';

export const ActivityContext = createContext<{
    activity: Partial<Activity> | undefined;
    setActivity: (activity: Partial<Activity>) => void;
    onCreateActivity: (activityType: ActivityType, isPelico?: boolean, initialData?: Activity['data']) => void;
    onUpdateActivity: () => Promise<void>;
    onPublishActivity: () => Promise<void>;
    getOrCreateDraft: () => Promise<number | null>;
}>({
    activity: undefined,
    setActivity: () => {},
    onCreateActivity: () => {},
    onUpdateActivity: () => Promise.resolve(),
    onPublishActivity: () => Promise.resolve(),
    getOrCreateDraft: () => Promise.resolve(null),
});

let onCancelPreviousPromise: () => void = () => {};
const onSaveDraft = async (activity: Partial<Activity>, getSavedId: (id: number) => void, setDraftStep: (step: number) => void) => {
    onCancelPreviousPromise(); // Cancel previous promise
    let cancelled = false;
    onCancelPreviousPromise = () => {
        cancelled = true;
    };
    try {
        setDraftStep(1); // Display circular progress
        const now = Date.now();
        const newId = await saveDraft(activity);
        getSavedId(newId);
        // Wait for minimum 1s to show a pending state
        const minDuration = 1000 - (Date.now() - now);
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
    const router = useRouter();
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
    const setActivity = useCallback(
        (newActivity: Partial<Activity>) => {
            const updatedActivity = {
                ...newActivity,
                id: localActivityRef?.current?.id || newActivity?.id,
            };
            setLocalActivity(updatedActivity);
            if (newActivity.type && newActivity.phase !== undefined && (newActivity.publishDate === null || newActivity.publishDate === undefined)) {
                onSaveDraftDebounced(
                    { ...updatedActivity, draftUrl: pathname },
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
        (activityType: ActivityType, isPelico?: boolean, initialData?: Activity['data']) => {
            setLocalActivity({
                type: activityType,
                phase: village?.activePhase,
                villageId: village?.id,
                classroomId: classroom?.id,
                isPelico,
                data: initialData,
            } as Partial<Activity>);
            jsonFetcher<Activity>(`/api/activities/draft${serializeToQueryUrl({ type: activityType })}`)
                .then(setDraftActivity)
                .catch(() => {
                    setDraftActivity(undefined);
                });
        },
        [setLocalActivity, village, classroom],
    );

    const getOrCreateDraft = useCallback(async (): Promise<number | null> => {
        if (localActivity?.id) {
            return localActivity.id;
        }
        if (localActivity && localActivity.type && localActivity.phase !== undefined) {
            try {
                const draftId = await saveDraft({ ...localActivity, draftUrl: pathname });
                localActivityRef.current = { ...localActivity, id: draftId };
                setLocalActivity(localActivityRef.current);
                return draftId;
            } catch {
                return null;
            }
        } else {
            return null;
        }
    }, [localActivity, setLocalActivity, pathname]);

    const onUpdateActivity = useCallback(async () => {
        if (!localActivity || !localActivity.id || localActivity.publishDate === null || localActivity.publishDate === undefined) {
            return;
        }
        await updateActivity(localActivity);
    }, [localActivity]);

    const onPublishActivity = useCallback(async () => {
        if (!village || !localActivity) {
            return;
        }
        await publishActivity({ ...localActivity, classroomId: classroom?.id ?? null, villageId: village.id, phase: village.activePhase });
    }, [village, localActivity, classroom]);

    const contextValue = useMemo(
        () => ({
            activity: localActivity,
            setActivity,
            onCreateActivity,
            onUpdateActivity,
            onPublishActivity,
            getOrCreateDraft,
        }),
        [localActivity, setActivity, onCreateActivity, onUpdateActivity, onPublishActivity, getOrCreateDraft],
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
                    if (draftActivity.type === 'defi' && draftActivity?.data?.theme) {
                        const route = getChallengeFormRoute(draftActivity.data.theme);
                        router.push(route);
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
