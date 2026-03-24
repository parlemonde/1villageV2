import { Avatar } from '@frontend/components/Avatar';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import AddReactionIcon from '@frontend/svg/addReaction.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import { deleteReaction } from '@server-actions/reactions/delete-reaction';
import { postReaction } from '@server-actions/reactions/post-reaction';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import React, { useState, useContext } from 'react';
import useSWR from 'swr';

import styles from './classrooms-reactions.module.css';

type ReactionCounter = {
    reactionValue: string;
    reactionCount: number;
    classrooms: Classroom[];
    users: User[];
};

type ReactionRaw = {
    value: string;
    label: string;
    emoji: string;
};

// type ReactionEmoji = ReactionRaw['emoji'] | undefined;
type ReactionValue = ReactionRaw['value'] | undefined;

type ClassroomReaction = {
    classroom: Classroom;
    reaction: ReactionValue;
};

const useReactionEmoji = () => {
    const t = useExtracted('ClassroomsReactions');

    return [
        { value: 'wow', label: t('wow'), emoji: '😮' },
        { value: 'like', label: t('like'), emoji: '👍' },
        { value: 'love', label: t('love'), emoji: '❤️' },
    ] as const;
};

interface ClassroomsReactionsProps {
    activity: Partial<Activity>;
}

export const ClassroomsReactions: React.FC<ClassroomsReactionsProps> = ({ activity }) => {
    const t = useExtracted('ClassroomsReactions');
    const REACTION_EMOJIS = useReactionEmoji();
    const { classroom } = useContext(UserContext);

    const { data: nbClassroomsPerReactions = [], mutate } = useSWR<ReactionCounter[]>(
        activity
            ? `/api/reactions${serializeToQueryUrl({
                  activityId: activity.id,
              })}`
            : null,
        jsonFetcher,
    );

    let currentClassroomReaction: ReactionRaw | null;
    let allClassroomsReactions: ClassroomReaction[] | null;
    let totalReactions: number;

    if (!classroom) {
        currentClassroomReaction = null;
        allClassroomsReactions = null;
        totalReactions = 0;
    } else {
        currentClassroomReaction = getCurrentClassroomReaction(classroom);
        allClassroomsReactions = getAllClassroomReaction();
        totalReactions = allClassroomsReactions?.length ?? 0;
    }

    const [currentReaction, setCurrentReaction] = useState<ReactionRaw | null>(currentClassroomReaction);
    const [nbReactions, setNbReactions] = useState<number>(totalReactions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAllReactionsModalOpen, setIsAllReactionsModalOpen] = useState(false);

    function getCountForReaction(value: string) {
        const column = nbClassroomsPerReactions?.find((col) => col.reactionValue === value);
        return column?.reactionCount || 0;
    }

    function getCurrentClassroomReaction(curClassroom: Classroom) {
        const curReaction = nbClassroomsPerReactions?.find((col) => col.classrooms?.find((c) => c.id === curClassroom.id));
        return REACTION_EMOJIS.find((item) => item.value === curReaction?.reactionValue) ?? null;
    }

    function getAllClassroomReaction() {
        const allreactions = nbClassroomsPerReactions?.reduce((acc: ClassroomReaction[], item) => {
            const result = item.classrooms?.map((c) => Object.assign({}, { classroom: c, reaction: item.reactionValue })) ?? [];
            return [...acc, ...result];
        }, []);
        return allreactions || null;
    }

    function getEmojiFromValue(value?: ReactionValue) {
        const reaction = REACTION_EMOJIS.find((item) => item.value === value) ?? null;
        return reaction?.emoji;
    }

    function onReactionButtonClick(e: React.MouseEvent<HTMLElement>) {
        const buttonEl = e.currentTarget as HTMLButtonElement;
        const reacted = REACTION_EMOJIS.find((reaction) => reaction.value === buttonEl.value) || null;
        setCurrentReaction(reacted);
    }

    async function onReactionSubmit(selectedReaction: ReactionRaw | null) {
        if (!classroom || !activity.id || !selectedReaction?.value) return;

        const previousData = nbClassroomsPerReactions;
        const isToggleOff = currentClassroomReaction?.value === selectedReaction.value;

        // Helper to update reactions data optimistically
        const updateReactionsOptimistically = (data: ReactionCounter[], newReaction: string | null, removingReaction: boolean) => {
            return data
                .map((counter) => {
                    if (removingReaction && counter.reactionValue === currentClassroomReaction?.value) {
                        // Removing current reaction
                        return {
                            ...counter,
                            reactionCount: Math.max(0, counter.reactionCount - 1),
                            classrooms: counter.classrooms.filter((c) => c.id !== classroom.id),
                        };
                    } else if (!removingReaction && counter.reactionValue === newReaction) {
                        // Adding new reaction
                        return {
                            ...counter,
                            reactionCount: counter.reactionCount + 1,
                            classrooms: [...counter.classrooms, classroom],
                        };
                    }
                    return counter;
                })
                .filter((counter) => counter.reactionCount > 0);
        };

        // Optimistic update: immediately show the change in the UI
        if (isToggleOff) {
            // Removing reaction
            const optimisticData = updateReactionsOptimistically(previousData, null, true);
            await mutate(optimisticData, false);
            setCurrentReaction(null);
            setNbReactions((prev) => (prev > 0 ? prev - 1 : 0));

            // Server request in background
            const result = await deleteReaction(activity.id, classroom.id);

            // Revalidate if there was an error
            if (result?.error) {
                mutate();
            }
        } else {
            // Adding/updating reaction
            const optimisticData = updateReactionsOptimistically(
                previousData.map((counter) =>
                    counter.reactionValue === currentClassroomReaction?.value
                        ? {
                              ...counter,
                              reactionCount: Math.max(0, counter.reactionCount - 1),
                              classrooms: counter.classrooms.filter((c) => c.id !== classroom.id),
                          }
                        : counter,
                ),
                selectedReaction.value,
                false,
            ).filter((counter) => counter.reactionCount > 0);

            await mutate(optimisticData, false);
            setCurrentReaction(selectedReaction);
            if (!currentClassroomReaction) {
                setNbReactions((prev) => prev + 1);
            }

            // Server request in background
            const result = await postReaction({
                activityId: activity.id,
                classroomId: classroom.id,
                reaction: selectedReaction.value,
            });

            // Revalidate if there was an error
            if (result?.error) {
                mutate();
            }
        }

        setIsModalOpen(false);
    }

    return (
        <div className={styles.reactionsContainer}>
            <Button
                title={t('Réagir')}
                onClick={() => setIsModalOpen(true)}
                label={<AddReactionIcon className={styles.addReactionIcon} />}
                color="grey"
                size="sm"
                variant="contained"
                className={styles.addReactionButton}
            ></Button>
            <div className={styles.reactionsListWrapper}>
                {/* render all activities reactions for activityId grouped by reaction type */}
                {REACTION_EMOJIS.map((reaction, index) => (
                    <Button
                        key={index}
                        title={reaction.label}
                        value={reaction.value}
                        onClick={() => onReactionSubmit(reaction)}
                        label={reaction.emoji}
                        rightIcon={<span className={styles.counterBadge}>{getCountForReaction(reaction.value)}</span>}
                        size="sm"
                        variant="contained"
                        className={classNames(styles.reactionButton, { [styles.active]: currentReaction?.value === reaction.value })}
                        style={{ position: 'relative', zIndex: REACTION_EMOJIS.length - index, right: 8 * index + 'px' }}
                    />
                ))}
            </div>
            <Button
                onClick={() => setIsAllReactionsModalOpen(true)}
                label={t('{count, plural, =0 {aucune réaction} other {Voir les réactions (#)}}', { count: nbReactions })}
                size="sm"
                variant="borderless"
                color="primary"
                style={{ position: 'relative', left: (REACTION_EMOJIS.length - 1) * -8 + 'px' }}
            ></Button>

            {isAllReactionsModalOpen && (
                <Modal
                    title={t('La Réaction de vos Pélicopains')}
                    isOpen={isAllReactionsModalOpen}
                    onClose={() => setIsAllReactionsModalOpen(false)}
                    width="sm"
                    contentClassName={styles.allReactionModal}
                >
                    {allClassroomsReactions?.map((cr) => (
                        <div key={cr.classroom.id} className={styles.line}>
                            <span className={styles.left}>
                                <Avatar classroom={cr.classroom} isPelico={false} size="sm" />
                                <strong>{cr.classroom.name}</strong>
                            </span>
                            <span>{getEmojiFromValue(cr.reaction)}</span>
                        </div>
                    )) || t('Pas encore de réactions')}
                </Modal>
            )}

            {isModalOpen && (
                <Modal
                    title={t('La Réaction de votre classe')}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={() => onReactionSubmit(currentReaction)}
                    isConfirmDisabled={() => currentReaction === null}
                    width="sm"
                    contentClassName={styles.setReactionModal}
                >
                    {REACTION_EMOJIS.map((reaction, index) => (
                        <div key={index} className={styles.reactionButtonWrapper}>
                            <span>{reaction.label}</span>
                            <Button
                                title={reaction.label}
                                value={reaction.value}
                                onClick={(e) => onReactionButtonClick(e)}
                                label={reaction.emoji}
                                size="sm"
                                variant="contained"
                                className={classNames(styles.reactionButton, { [styles.active]: currentReaction?.value === reaction.value })}
                            />
                        </div>
                    ))}
                </Modal>
            )}
        </div>
    );
};
