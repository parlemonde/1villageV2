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

const REACTION_EMOJIS = [
    { value: 'wow', emoji: '😮' },
    { value: 'like', emoji: '👍' },
    { value: 'love', emoji: '❤️' },
] as const;

type ReactionEmoji = (typeof REACTION_EMOJIS)[number]['value'];
interface ClassroomsReactionsProps {
    activity: Partial<Activity>;
    isDisabled: boolean;
}

export const ClassroomsReactions: React.FC<ClassroomsReactionsProps> = ({ activity, isDisabled = false }) => {
    const t = useExtracted('ClassroomsReactions');
    const [currentReaction, setCurrentReaction] = useState<ReactionEmoji | null>(null);
    const [nbReactions, setNbReactions] = useState(3);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [isAllReactionsModalOpen, setIsAllReactionsModalOpen] = useState(false);

    return (
        <div className={styles.reactionsContainer}>
            <span style={{ fontSize: '10px', color: 'green', backgroundColor: 'lightgreen' }}>
                {activity.id} / {activity.type} / {currentReaction}
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
                        title={reaction.value}
                        onClick={() => setCurrentReaction(reaction.value)}
                        label={reaction.emoji}
                        size="sm"
                        variant="contained"
                        disabled={isDisabled}
                        className={classNames(styles.reactionButton, { [styles.active]: currentReaction === reaction.value })}
                        style={{ zIndex: REACTION_EMOJIS.length - index, right: 8 * index + 'px' }}
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
                    className={styles.reactionsNumber}
                    style={{ left: REACTION_EMOJIS.length * -8 + 'px' }}
                ></Button>
            )}

            {isModalOpen && (
                <Modal
                    title={t('Réactions des Pélicopains')}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    hasCancelButton={false}
                    width="sm"
                >
                    {t('Liste des réactions possibles')}
                    <Button
                        label={t('ma réaction')}
                        onClick={() => {
                            setCurrentReaction('wow');
                            setNbReactions((prev) => prev + 1);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};
