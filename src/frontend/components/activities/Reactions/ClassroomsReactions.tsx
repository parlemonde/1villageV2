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
    classrooms?: Classroom[];
    users?: User[];
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

type UserReaction = {
    user: User;
    reaction: ReactionValue;
};

type PeopleReaction = ClassroomReaction | UserReaction;

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
    const { user, classroom } = useContext(UserContext);
    const isPelico = user.role === 'admin' || user.role === 'mediator';

    const { data: nbPeoplePerReactions = [], mutate } = useSWR<ReactionCounter[]>(
        activity
            ? `/api/reactions${serializeToQueryUrl({
                  activityId: activity.id,
              })}`
            : null,
        jsonFetcher,
    );

    let currentStoredReaction: ReactionRaw | null = null;
    let allReactions: PeopleReaction[] | null;
    let totalReactions: number;
    let enabledReactions: boolean;

    // Pelico does not have any classroom
    if (classroom || isPelico) {
        if (isPelico) {
            currentStoredReaction = getCurrentPelicoReaction(user);
        }
        if (classroom) {
            currentStoredReaction = getCurrentClassroomReaction(classroom);
        }
        allReactions = getAllPeopleReactions(nbPeoplePerReactions);
        totalReactions = allReactions?.length ?? 0;
        enabledReactions = true;
    } else {
        allReactions = null;
        totalReactions = 0;
        enabledReactions = false;
    }

    const [disabledReactions] = useState<boolean>(!enabledReactions);
    const [currentReaction, setCurrentReaction] = useState<ReactionRaw | null>(currentStoredReaction);
    const [nbTotalReactions, setNbReactions] = useState<number>(totalReactions);
    const [allPeopleReactions, setAllPeopleReactions] = useState<PeopleReaction[] | null>(allReactions);
    const [isChangeReactionModalOpen, setIsChangeReactionModalOpen] = useState(false);
    const [isAllReactionsModalOpen, setIsAllReactionsModalOpen] = useState(false);

    function getCountForReaction(value: string) {
        const column = nbPeoplePerReactions?.find((col) => col.reactionValue === value);
        return column?.reactionCount || 0;
    }

    function getCurrentPelicoReaction(curUser: User) {
        const curReaction = nbPeoplePerReactions?.find((col) => col.users?.find((u) => u.id === curUser.id));
        return REACTION_EMOJIS.find((item) => item.value === curReaction?.reactionValue) ?? null;
    }

    function getCurrentClassroomReaction(curClassroom: Classroom) {
        const curReaction = nbPeoplePerReactions?.find((col) => col.classrooms?.find((c) => c.id === curClassroom.id));
        return REACTION_EMOJIS.find((item) => item.value === curReaction?.reactionValue) ?? null;
    }

    function getAllPeopleReactions(data: ReactionCounter[]) {
        const allreactions = data?.reduce((acc: PeopleReaction[], item) => {
            const classroomsReactions = item.classrooms?.map((c) => Object.assign({}, { classroom: c, reaction: item.reactionValue })) ?? [];
            const pelicoReaction = item.users?.map((u) => Object.assign({}, { user: u, reaction: item.reactionValue })) ?? [];
            return [...acc, ...classroomsReactions, ...pelicoReaction];
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
        if ((!isPelico && !classroom) || !activity.id || !selectedReaction?.value) return;

        const previousData = nbPeoplePerReactions;
        const isToggleOff = currentStoredReaction?.value === selectedReaction.value;
        const shouldRemoveReaction = currentStoredReaction !== null;
        const shouldInsertReaction = currentStoredReaction && currentStoredReaction.value !== selectedReaction.value;
        const arrName = isPelico ? 'users' : 'classrooms';
        const usersFilterFunc = (u: User) => {
            return u.id !== user.id;
        };
        const classroomsFilterFunc = (c: Classroom) => {
            return c.id !== classroom?.id;
        };
        const deleteFunc = (counter: ReactionCounter) => {
            const newValue = [...(counter[arrName] || [])].filter((item) => {
                const result = isPelico ? usersFilterFunc(item as User) : classroomsFilterFunc(item as Classroom);
                return result;
            });
            return {
                ...counter,
                reactionCount: Math.max(0, counter.reactionCount - 1),
                ...newValue,
            };
        };
        const insertFunc = (counter: ReactionCounter) => {
            const newValue = [...(counter[arrName] || []), isPelico ? user : classroom];
            return {
                ...counter,
                reactionCount: counter.reactionCount + 1,
                [arrName]: newValue,
            };
        };

        // Helper to update reactions data optimistically
        const updateReactionsOptimistically = (data: ReactionCounter[], newReaction: ReactionRaw | null) => {
            let newData =
                data?.map((counter) => {
                    if (shouldRemoveReaction && counter.reactionValue === currentStoredReaction?.value) {
                        return deleteFunc(counter);
                    } else if (shouldInsertReaction && counter.reactionValue === newReaction?.value) {
                        return insertFunc(counter);
                    } else {
                        return counter;
                    }
                }) || [];
            if (newReaction && !newData?.find((counter) => counter?.reactionValue === newReaction?.value)) {
                newData = [
                    ...(newData || []),
                    insertFunc({
                        reactionValue: newReaction.value,
                        reactionCount: 0,
                    }),
                ];
            }
            return newData.filter((counter) => counter && counter.reactionCount > 0);
        };

        // Optimistic update: immediately show the change in the UI
        let result;
        const optimisticData = updateReactionsOptimistically(previousData, selectedReaction);
        await mutate(optimisticData, { revalidate: false });

        if (isToggleOff) {
            setCurrentReaction(null);
            setNbReactions((prev) => (prev > 0 ? prev - 1 : 0));
            result = await deleteReaction(activity.id, classroom?.id, user.id);
        } else {
            setCurrentReaction(selectedReaction);
            if (!currentStoredReaction) {
                setNbReactions((prev) => prev + 1);
            }
            result = await postReaction({
                activityId: activity.id,
                classroomId: classroom?.id,
                userId: user.id,
                reaction: selectedReaction.value,
            });
        }
        setAllPeopleReactions(getAllPeopleReactions(optimisticData));
        // Revalidate if there was an error
        if (result?.error) {
            mutate();
        }
        setIsChangeReactionModalOpen(false);
    }

    return (
        <div className={styles.reactionsContainer}>
            <Button
                title={t('Réagir')}
                onClick={() => setIsChangeReactionModalOpen(true)}
                label={<AddReactionIcon className={styles.addReactionIcon} />}
                color="primary"
                size="sm"
                variant="contained"
                disabled={disabledReactions}
                className={styles.addReactionButton}
            ></Button>
            <div className={styles.reactionsListWrapper}>
                {/* render all activities reactions for activityId grouped by reaction type */}
                {REACTION_EMOJIS.map((reaction, index) => {
                    const badgeValue = getCountForReaction(reaction.value);
                    return (
                        <Button
                            key={index}
                            title={reaction.label}
                            value={reaction.value}
                            onClick={() => onReactionSubmit(reaction)}
                            label={reaction.emoji}
                            rightIcon={badgeValue ? <span className={styles.counterBadge}>{badgeValue}</span> : null}
                            color="primary"
                            size="sm"
                            variant="contained"
                            disabled={disabledReactions}
                            className={classNames(styles.reactionButton, { [styles.active]: currentReaction?.value === reaction.value })}
                            style={{ position: 'relative', zIndex: REACTION_EMOJIS.length - index, right: 8 * index + 'px' }}
                        />
                    );
                })}
            </div>
            <Button
                onClick={() => setIsAllReactionsModalOpen(true)}
                label={t('{count, plural, =0 {aucune réaction} other {Voir les réactions (#)}}', { count: nbTotalReactions })}
                size="sm"
                variant="borderless"
                color="primary"
                disabled={nbTotalReactions === 0}
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
                    {allPeopleReactions?.map((pr) => {
                        if (pr && 'user' in pr) {
                            return (
                                <div
                                    key={pr.user.id}
                                    className={classNames(styles.line, { [styles.active]: currentReaction?.value === pr.reaction })}
                                >
                                    <span className={styles.left}>
                                        <Avatar user={pr.user} isPelico={true} size="sm" />
                                        <strong>{pr.user.name}</strong>
                                    </span>
                                    <span>{getEmojiFromValue(pr.reaction)}</span>
                                </div>
                            );
                        }
                        return (
                            <div
                                key={pr.classroom.id}
                                className={classNames(styles.line, { [styles.active]: currentReaction?.value === pr.reaction })}
                            >
                                <span className={styles.left}>
                                    <Avatar classroom={pr.classroom} isPelico={false} size="sm" />
                                    <strong>{pr.classroom.name}</strong>
                                </span>
                                <span>{getEmojiFromValue(pr.reaction)}</span>
                            </div>
                        );
                    }) || t('Pas encore de réactions')}
                </Modal>
            )}

            {isChangeReactionModalOpen && (
                <Modal
                    title={t('La Réaction de votre classe')}
                    isOpen={isChangeReactionModalOpen}
                    onClose={() => setIsChangeReactionModalOpen(false)}
                    onCancel={() => {
                        setCurrentReaction(currentStoredReaction);
                        setIsChangeReactionModalOpen(false);
                    }}
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
