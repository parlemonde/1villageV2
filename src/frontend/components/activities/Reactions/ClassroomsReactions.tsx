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
import React, { useState, useContext, useMemo, useCallback } from 'react';
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

    const [_disabledReactions] = useState<boolean>(!(classroom || isPelico));
    const [isChangeReactionModalOpen, setIsChangeReactionModalOpen] = useState(false);
    const [isAllReactionsModalOpen, setIsAllReactionsModalOpen] = useState(false);
    const [selectedReactionInModal, setSelectedReactionInModal] = useState<ReactionRaw | null>(null);

    // Memoize reaction lookup maps for O(1) access instead of O(n)
    const reactionMap = useMemo(() => {
        const map = new Map<string, ReactionCounter>();
        nbPeoplePerReactions?.forEach((r) => {
            map.set(r.reactionValue, r);
        });
        return map;
    }, [nbPeoplePerReactions]);

    // Calculate derived state directly from SWR data (no local state needed)
    const getAllPeopleReactions = useCallback((data: ReactionCounter[]): PeopleReaction[] | null => {
        if (!data || data.length === 0) return null;

        return data.reduce((acc: PeopleReaction[], item) => {
            const classroomsReactions =
                item.classrooms?.map((c) => ({
                    classroom: c,
                    reaction: item.reactionValue as ReactionValue,
                })) ?? [];
            const pelicoReaction =
                item.users?.map((u) => ({
                    user: u,
                    reaction: item.reactionValue as ReactionValue,
                })) ?? [];
            return [...acc, ...classroomsReactions, ...pelicoReaction];
        }, []);
    }, []);

    const getCurrentPelicoReaction = useCallback(
        (curUser: User, reactions: Map<string, ReactionCounter>) => {
            for (const [reactionValue, counter] of reactions) {
                if (counter.users?.some((u) => u.id === curUser.id)) {
                    return REACTION_EMOJIS.find((item) => item.value === reactionValue) ?? null;
                }
            }
            return null;
        },
        [REACTION_EMOJIS],
    );

    const getCurrentClassroomReaction = useCallback(
        (curClassroom: Classroom, reactions: Map<string, ReactionCounter>) => {
            for (const [reactionValue, counter] of reactions) {
                if (counter.classrooms?.some((c) => c.id === curClassroom.id)) {
                    return REACTION_EMOJIS.find((item) => item.value === reactionValue) ?? null;
                }
            }
            return null;
        },
        [REACTION_EMOJIS],
    );

    // Derived state from SWR data (not component state)
    const currentReaction = classroom
        ? getCurrentClassroomReaction(classroom, reactionMap)
        : isPelico
          ? getCurrentPelicoReaction(user, reactionMap)
          : null;

    const allPeopleReactions = getAllPeopleReactions(nbPeoplePerReactions);
    const nbTotalReactions = allPeopleReactions?.length ?? 0;

    // Memoized helper functions to avoid recreation on every render
    const getCountForReaction = useCallback(
        (value: string) => {
            return reactionMap.get(value)?.reactionCount || 0;
        },
        [reactionMap],
    );

    const getEmojiFromValue = useCallback(
        (value?: ReactionValue) => {
            return REACTION_EMOJIS.find((item) => item.value === value)?.emoji ?? undefined;
        },
        [REACTION_EMOJIS],
    );

    const onReactionButtonClick = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            const buttonEl = e.currentTarget as HTMLButtonElement;
            const reacted = REACTION_EMOJIS.find((reaction) => reaction.value === buttonEl.value) || null;
            setSelectedReactionInModal(reacted);
        },
        [REACTION_EMOJIS],
    );

    const updateReactionsOptimistically = useCallback(
        (data: ReactionCounter[], newReaction: ReactionRaw | null, currentStoredReaction: ReactionRaw | null): ReactionCounter[] => {
            const shouldRemoveReaction = currentStoredReaction !== null;
            const shouldInsertReaction = currentStoredReaction && currentStoredReaction.value !== newReaction?.value;
            const arrName = isPelico ? 'users' : 'classrooms';

            const usersFilterFunc = (u: User) => u.id !== user.id;
            const classroomsFilterFunc = (c: Classroom) => c.id !== classroom?.id;

            const deleteFunc = (counter: ReactionCounter) => {
                const newValue = [...(counter[arrName] || [])].filter((item) =>
                    isPelico ? usersFilterFunc(item as User) : classroomsFilterFunc(item as Classroom),
                );
                return {
                    ...counter,
                    reactionCount: Math.max(0, counter.reactionCount - 1),
                    [arrName]: newValue,
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

            let newData =
                data?.map((counter) => {
                    if (shouldRemoveReaction && counter.reactionValue === currentStoredReaction?.value) {
                        return deleteFunc(counter);
                    }
                    if (shouldInsertReaction && counter.reactionValue === newReaction?.value) {
                        return insertFunc(counter);
                    }
                    return counter;
                }) || [];

            if (newReaction && !newData?.find((counter) => counter?.reactionValue === newReaction?.value)) {
                newData = [
                    ...newData,
                    insertFunc({
                        reactionValue: newReaction.value,
                        reactionCount: 0,
                        [arrName]: [],
                    }),
                ];
            }

            return newData.filter((counter) => counter && counter.reactionCount > 0);
        },
        [isPelico, user, classroom],
    );

    const onReactionSubmit = useCallback(
        async (selectedReaction: ReactionRaw | null) => {
            if ((!isPelico && !classroom) || !activity.id || !selectedReaction?.value) return;

            const _isToggleOff = currentReaction?.value === selectedReaction.value;
            const optimisticData = updateReactionsOptimistically(nbPeoplePerReactions, selectedReaction, currentReaction);

            // Optimistic update: immediately show the change in the UI
            await mutate(optimisticData, { revalidate: false });

            let result;
            if (_isToggleOff) {
                result = await deleteReaction(activity.id, classroom?.id, user.id);
            } else {
                result = await postReaction({
                    activityId: activity.id,
                    classroomId: classroom?.id,
                    userId: user.id,
                    reaction: selectedReaction.value,
                });
            }

            // Revalidate if there was an error
            if (result?.error) {
                mutate();
            }
            setIsChangeReactionModalOpen(false);
        },
        [isPelico, classroom, activity.id, currentReaction, updateReactionsOptimistically, nbPeoplePerReactions, user.id, mutate],
    );

    return (
        <div className={styles.reactionsContainer}>
            <Button
                title={t('Réagir')}
                onClick={() => {
                    setSelectedReactionInModal(currentReaction);
                    setIsChangeReactionModalOpen(true);
                }}
                label={<AddReactionIcon className={styles.addReactionIcon} />}
                color="primary"
                size="sm"
                variant="contained"
                disabled={_disabledReactions}
                className={styles.addReactionButton}
            />
            <div className={styles.reactionsListWrapper}>
                {/* render all activities reactions for activityId grouped by reaction type */}
                {REACTION_EMOJIS.map((reaction) => {
                    const badgeValue = getCountForReaction(reaction.value);
                    const index = REACTION_EMOJIS.indexOf(reaction);
                    return (
                        <Button
                            key={reaction.value}
                            title={reaction.label}
                            value={reaction.value}
                            onClick={() => onReactionSubmit(reaction)}
                            label={reaction.emoji}
                            rightIcon={badgeValue ? <span className={styles.counterBadge}>{badgeValue}</span> : null}
                            color="primary"
                            size="sm"
                            variant="contained"
                            disabled={_disabledReactions}
                            className={classNames(styles.reactionButton, {
                                [styles.active]: currentReaction?.value === reaction.value,
                            })}
                            style={{
                                position: 'relative',
                                zIndex: REACTION_EMOJIS.length - index,
                                right: `${8 * index}px`,
                            }}
                        />
                    );
                })}
            </div>
            <Button
                onClick={() => setIsAllReactionsModalOpen(true)}
                label={t('{count, plural, =0 {aucune réaction} other {Voir les réactions (#)}}', {
                    count: nbTotalReactions,
                })}
                size="sm"
                variant="borderless"
                color="primary"
                disabled={nbTotalReactions === 0}
                style={{ position: 'relative', left: `${(REACTION_EMOJIS.length - 1) * -8}px` }}
            />

            {isAllReactionsModalOpen && (
                <Modal
                    title={t('La Réaction de vos Pélicopains')}
                    isOpen={isAllReactionsModalOpen}
                    onClose={() => setIsAllReactionsModalOpen(false)}
                    width="sm"
                    contentClassName={styles.allReactionModal}
                >
                    {(allPeopleReactions?.length ?? 0) > 0 ? (
                        allPeopleReactions?.map((pr) => {
                            if ('user' in pr) {
                                return (
                                    <div
                                        key={pr.user.id}
                                        className={classNames(styles.line, {
                                            [styles.active]: currentReaction?.value === pr.reaction,
                                        })}
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
                                    className={classNames(styles.line, {
                                        [styles.active]: currentReaction?.value === pr.reaction,
                                    })}
                                >
                                    <span className={styles.left}>
                                        <Avatar classroom={pr.classroom} isPelico={false} size="sm" />
                                        <strong>{pr.classroom.name}</strong>
                                    </span>
                                    <span>{getEmojiFromValue(pr.reaction)}</span>
                                </div>
                            );
                        })
                    ) : (
                        <p>{t('Pas encore de réactions')}</p>
                    )}
                </Modal>
            )}

            {isChangeReactionModalOpen && (
                <Modal
                    title={t('La Réaction de votre classe')}
                    isOpen={isChangeReactionModalOpen}
                    onClose={() => {
                        setSelectedReactionInModal(null);
                        setIsChangeReactionModalOpen(false);
                    }}
                    onCancel={() => {
                        setSelectedReactionInModal(null);
                        setIsChangeReactionModalOpen(false);
                    }}
                    onConfirm={() => onReactionSubmit(selectedReactionInModal)}
                    isConfirmDisabled={() => selectedReactionInModal === null}
                    width="sm"
                    contentClassName={styles.setReactionModal}
                >
                    {REACTION_EMOJIS.map((reaction) => (
                        <div key={reaction.value} className={styles.reactionButtonWrapper}>
                            <span>{reaction.label}</span>
                            <Button
                                title={reaction.label}
                                value={reaction.value}
                                onClick={(e) => onReactionButtonClick(e)}
                                label={reaction.emoji}
                                size="sm"
                                variant="contained"
                                className={classNames(styles.reactionButton, {
                                    [styles.active]: selectedReactionInModal?.value === reaction.value,
                                })}
                            />
                        </div>
                    ))}
                </Modal>
            )}
        </div>
    );
};
