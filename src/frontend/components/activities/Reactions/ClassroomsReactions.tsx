import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import React, { useState, useContext } from 'react';
import useSWR from 'swr';

import styles from './classrooms-reactions.module.css';

type Reaction = {
    reactionValue: string;
    reactionCount: number;
    classroomIds: number[];
};

type ReactionEmoji = {
    value: string;
    label: string;
    emoji: string;
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
    isDisabled?: boolean;
}

export const ClassroomsReactions: React.FC<ClassroomsReactionsProps> = ({ activity, isDisabled = false }) => {
    const t = useExtracted('ClassroomsReactions');
    const REACTION_EMOJIS = useReactionEmoji();
    let classroomReaction, totalReactions;
    const { classroom } = useContext(UserContext);

    const { data: nbClassroomsPerReactions = [] } = useSWR<Reaction[]>(
        activity
            ? `/api/reactions${serializeToQueryUrl({
                  activityId: activity.id,
              })}`
            : null,
        jsonFetcher,
    );

    if (!classroom) {
        isDisabled = true;
        classroomReaction = null;
        totalReactions = 0;
    } else {
        classroomReaction = getCurrentClassroomReaction(classroom);
        totalReactions = getTotalClassroomsReaction();
    }

    const [currentReaction, setCurrentReaction] = useState<ReactionEmoji | null>(classroomReaction);
    const [nbReactions, setNbReactions] = useState<number>(totalReactions);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAllReactionsModalOpen, setIsAllReactionsModalOpen] = useState(false);

    function getCountForReaction(value: string) {
        const column = nbClassroomsPerReactions?.find((col) => col.reactionValue === value);
        return column?.reactionCount || 0;
    }

    function getCurrentClassroomReaction(classroom: Classroom) {
        const column = nbClassroomsPerReactions?.find((col) => col.classroomIds.includes(classroom.id));
        return REACTION_EMOJIS.find((item) => item.value === column?.reactionValue) ?? null;
    }

    function getTotalClassroomsReaction() {
        return nbClassroomsPerReactions?.reduce((total, item) => {
            return (total += item.reactionCount);
        }, 0);
    }

    function onReactionButtonClick(e: React.MouseEvent<HTMLElement>) {
        const buttonEl = e.currentTarget as HTMLButtonElement;
        const reacted = REACTION_EMOJIS.find((reaction) => reaction.value === buttonEl.value) || null;
        setCurrentReaction(reacted);
    }

    function onReactionSubmit() {
        // call server action with currentReaction, activity.id and classroom.id
        setIsModalOpen(false);
        setNbReactions((prev) => prev + 1);
        console.warn('onReactionSubmit....', activity.id, currentReaction);
    }

    return (
        <div className={styles.reactionsContainer}>
            {isDisabled ? null : (
                <Button
                    title={t('Réagir')}
                    onClick={() => setIsModalOpen(true)}
                    label={<EyeOpenIcon className={styles.addReactionIcon} />}
                    color="grey"
                    variant="borderless"
                ></Button>
            )}
            <div className={styles.reactionsListWrapper}>
                {/* render all activities reactions for activityId grouped by reaction type */}
                {REACTION_EMOJIS.map((reaction, index) => (
                    <Button
                        key={index}
                        title={reaction.label}
                        value={reaction.value}
                        onClick={(e) => {
                            onReactionButtonClick(e);
                            onReactionSubmit();
                        }}
                        label={reaction.emoji}
                        rightIcon={<span className={styles.counterBadge}>{getCountForReaction(reaction.value)}</span>}
                        size="sm"
                        variant="contained"
                        disabled={isDisabled}
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
                style={{ position: 'relative', left: REACTION_EMOJIS.length * -8 + 'px' }}
            ></Button>

            {isAllReactionsModalOpen && (
                <Modal
                    title={t('La Réaction de vos Pélicopains')}
                    isOpen={isAllReactionsModalOpen}
                    onClose={() => setIsAllReactionsModalOpen(false)}
                    width="sm"
                    contentClassName={styles.getAllReactionModal}
                >
                    {/* TODO */}
                </Modal>
            )}

            {isModalOpen && (
                <Modal
                    title={t('La Réaction de votre classe')}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={() => onReactionSubmit()}
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
                                disabled={isDisabled}
                                className={classNames(styles.reactionButton, { [styles.active]: currentReaction?.value === reaction.value })}
                            />
                        </div>
                    ))}
                </Modal>
            )}
        </div>
    );
};
