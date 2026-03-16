import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
// import { EyeOpenIcon } from '@radix-ui/react-icons';
import { EyeOpenIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import classNames from 'clsx';
// import { usePathname } from 'next/navigation';
import { useExtracted } from 'next-intl';
import React, { useState } from 'react';

import styles from './classrooms-reactions.module.css';

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
    const [currentReaction, setCurrentReaction] = useState<ReactionEmoji | null>(null);
    const [nbReactions, setNbReactions] = useState(3);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [isAllReactionsModalOpen, setIsAllReactionsModalOpen] = useState(false);
    const REACTION_EMOJIS = useReactionEmoji();

    function onReactionButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        const reacted = REACTION_EMOJIS.find((reaction) => reaction.value === e.currentTarget?.value) || null;
        setCurrentReaction(reacted);
        setNbReactions((prev) => prev + 1);
    }

    function onReactionSubmit() {
        // call server action with currentReaction, activity.id and classroom.id
        setIsModalOpen(false);
        console.warn('onReactionSubmit....', activity.id, currentReaction);
    }

    return (
        <div className={styles.reactionsContainer}>
            <span style={{ fontSize: '10px', color: 'green', backgroundColor: 'lightgreen' }}>
                {activity.id} / {activity.type} / {currentReaction?.label}
            </span>
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
                {/* read new table in activity-reactions to get all activities reactions for activityId
                grouped by reaction type
                map to render <ReactionIcon>s according to grouped reaction type (and count ?) */}
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
                        size="sm"
                        variant="contained"
                        disabled={isDisabled}
                        className={classNames(styles.reactionButton, { [styles.active]: currentReaction?.value === reaction.value })}
                        style={{ position: 'relative', zIndex: REACTION_EMOJIS.length - index, right: 8 * index + 'px' }}
                    />
                ))}
            </div>
            {isDisabled ? null : (
                <Button
                    onClick={() => setIsModalOpen(true)}
                    label={t('{count, plural, =0 {aucune réaction} other {Voir les réactions (#)}}', { count: nbReactions })}
                    size="sm"
                    variant="borderless"
                    color="primary"
                    style={{ position: 'relative', left: REACTION_EMOJIS.length * -8 + 'px' }}
                ></Button>
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
