'use client';

import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { Modal } from '@frontend/components/ui/Modal';
import { useLocalStorage } from '@frontend/hooks/useLocalStorage';
import { debounce } from '@frontend/lib/debounce';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Activity, ActivityType } from '@server/database/schemas/activities';
import { publishActivity } from '@server-actions/activities/publish-activity';
import { saveDraft } from '@server-actions/activities/save-draft';
import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { UserContext } from './userContext';
import { VillageContext } from './villageContext';

export const ActivityContext = createContext<{
    activity: Partial<Activity> | undefined;
    setActivity: (activity: Partial<Activity>) => void;
    onCreateActivity: (activityType: ActivityType) => void;
    onPublishActivity: () => Promise<void>;
}>({
    activity: undefined,
    setActivity: () => {},
    onCreateActivity: () => {},
    onPublishActivity: () => Promise.resolve(),
});

let draftTimeout: number | undefined;
const onSaveDraftDebounced = debounce((activity: Partial<Activity>, getSavedId: (id: number) => void, setDraftStep: (step: number) => void) => {
    if (activity.publishDate !== undefined && activity.publishDate !== null) {
        return;
    }
    setDraftStep(1);
    saveDraft(activity)
        .then((id) => {
            if (id !== undefined) {
                getSavedId(id);
            }
        })
        .catch()
        .finally(() => {
            setDraftStep(2);
            if (draftTimeout) {
                clearTimeout(draftTimeout);
            }
            draftTimeout = window.setTimeout(() => {
                setDraftStep(0);
            }, 2000);
        });
}, 2000);

export const ActivityProvider = ({ children }: { children: React.ReactNode }) => {
    const { village } = useContext(VillageContext);
    const { classroom } = useContext(UserContext);
    const [draftActivity, setDraftActivity] = useState<Activity | undefined>(undefined);
    const [draftStep, setDraftStep] = useState<number>(0); // 0 -> idle, 1 -> saving draft, 2 -> draft saved.
    const pathname = usePathname();

    const [localActivity, setLocalActivity] = useLocalStorage<Partial<Activity> | undefined>('activity', undefined);

    // Auto save draft after an update (using a debounced function)
    const onUpdateActivity = useCallback(
        (newActivity: Partial<Activity>) => {
            setLocalActivity(newActivity);
            if (newActivity.type && newActivity.phase !== undefined) {
                onSaveDraftDebounced(
                    { ...newActivity, draftUrl: pathname },
                    (id) => {
                        setLocalActivity({ ...newActivity, id });
                    },
                    setDraftStep,
                );
            }
        },
        [setLocalActivity, pathname],
    );

    const onCreateActivity = useCallback(
        (activityType: ActivityType) => {
            setLocalActivity({ type: activityType, phase: village?.activePhase, villageId: village?.id, classroomId: classroom?.id });
            jsonFetcher<Activity>(`/api/activities/draft?type=${activityType}`)
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
