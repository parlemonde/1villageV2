'use client';

import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { Modal } from '@frontend/components/ui/Modal';
import { Title } from '@frontend/components/ui/Title';
import { setToLocalStorage } from '@frontend/hooks/useLocalStorage/local-storage';
import PelicoSearch from '@frontend/svg/pelico/pelico-search.svg';
import type { Activity } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import { deleteActivity } from '@server-actions/activities/delete-activity';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SectionContainer } from '@frontend/components/ui/SectionContainer/SectionContainer';

interface MyActivitiesProps {
    activities: Activity[];
    user: User;
    classroom?: Classroom;
}
export const MyActivities = ({ activities, user, classroom }: MyActivitiesProps) => {
    const router = useRouter();
    const [activityIdToDelete, setActivityIdToDelete] = React.useState<number | null>(null);
    const [isDeletingActivity, setIsDeletingActivity] = React.useState(false);
    const activityToDelete = activities.find((activity) => activity.id === activityIdToDelete);
    const draftActivities = activities.filter((activity) => activity.publishDate === null);
    const publishedActivities = activities.filter((activity) => activity.publishDate !== null);

    return (
        <>
            <SectionContainer title="Brouillons">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {draftActivities.map((activity) => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            user={user}
                            classroom={classroom}
                            onEdit={() => {
                                setToLocalStorage('activity', activity);
                                router.push(activity.draftUrl || '/contenu-libre/3');
                            }}
                            onDelete={() => {
                                setActivityIdToDelete(activity.id);
                            }}
                        />
                    ))}
                    {draftActivities.length === 0 && <EmptyState message="Vous n'avez pas de brouillons." />}
                </div>
            </SectionContainer>

            <SectionContainer title="Activités publiées">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {publishedActivities.map((activity) => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            user={user}
                            classroom={classroom}
                            onEdit={() => {
                                setToLocalStorage('activity', activity);
                                router.push('/contenu-libre/3');
                            }}
                            onDelete={() => {
                                setActivityIdToDelete(activity.id);
                            }}
                        />
                    ))}
                    {publishedActivities.length === 0 && <EmptyState message="Vous n'avez pas d'activités publiées." />}
                </div>
            </SectionContainer>

            <Modal
                isOpen={activityIdToDelete !== null}
                onClose={() => setActivityIdToDelete(null)}
                title="Supprimer l'activité"
                confirmLabel="Supprimer"
                confirmLevel="error"
                isLoading={isDeletingActivity}
                onConfirm={() => {
                    if (!activityIdToDelete) {
                        return;
                    }
                    setIsDeletingActivity(true);
                    deleteActivity(activityIdToDelete)
                        .catch(() => {
                            // todo, display an error message
                        })
                        .finally(() => {
                            setIsDeletingActivity(false);
                            setActivityIdToDelete(null);
                        });
                }}
                width="lg"
            >
                {activityToDelete && (
                    <>
                        <p style={{ paddingBottom: '8px' }}>Voulez-vous vraiment supprimer cette activité ?</p>
                        <ActivityCard activity={activityToDelete} user={user} classroom={classroom} shouldDisableButtons />
                    </>
                )}
            </Modal>
        </>
    );
};

const EmptyState = ({ message }: { message: string }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed var(--grey-300)',
                padding: '32px',
                borderRadius: '4px',
            }}
        >
            <PelicoSearch style={{ width: '100px', height: 'auto' }} />
            <p>{message}</p>
        </div>
    );
};
