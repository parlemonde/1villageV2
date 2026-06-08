'use client';

import styles from '@app/(1village)/mon-compte/page.module.css';
import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Field } from '@frontend/components/ui/Form/Field';
import { Title } from '@frontend/components/ui/Title';
import { updateSubscription } from '@server-actions/settings/update-subscriptions';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

interface PreferencesFormProps {
    adminPublicationSubscribed: boolean;
    commentActivitySubscribed: boolean;
}

export const PreferencesForm = ({
    adminPublicationSubscribed: initialAdminPublication,
    commentActivitySubscribed: initialCommentActivity,
}: PreferencesFormProps) => {
    const [adminPublicationSubscribed, setAdminPublicationSubscribed] = useState<boolean>(initialAdminPublication);
    const [commentActivitySubscribed, setCommentActivitySubscribed] = useState<boolean>(initialCommentActivity);
    const [currentAdminPublication, setCurrentAdminPublication] = useState<boolean>(initialAdminPublication);
    const [currentCommentActivity, setCurrentCommentActivity] = useState<boolean>(initialCommentActivity);
    const [isPending, setIsPending] = useState<boolean>(false);
    const t = useExtracted('app.(1village).mon-compte.preferences');

    const hasChanges = adminPublicationSubscribed !== currentAdminPublication || commentActivitySubscribed !== currentCommentActivity;

    // Rollback optimistic UI on error
    const rollbackChanges = async () => {
        setCurrentAdminPublication(adminPublicationSubscribed);
        setCurrentCommentActivity(commentActivitySubscribed);
        sendToast({
            type: 'error',
            message: t('Une erreur est survenue lors de la mise à jour de vos préférences.'),
        });
    };

    const handleSave = async () => {
        setIsPending(true);
        try {
            const updates: Record<string, boolean> = {};

            if (hasChanges) {
                if (adminPublicationSubscribed !== currentAdminPublication) {
                    updates.adminPublicationSubscribed = currentAdminPublication;
                }
                if (commentActivitySubscribed !== currentCommentActivity) {
                    updates.commentActivitySubscribed = currentCommentActivity;
                }
            }

            const { error } = await updateSubscription(updates);

            if (error) {
                await rollbackChanges();
                return;
            }

            setAdminPublicationSubscribed(currentAdminPublication);
            setCommentActivitySubscribed(currentCommentActivity);

            sendToast({
                type: 'success',
                message: t('Vos préférences ont été mises à jour avec succès.'),
            });
        } catch {
            await rollbackChanges();
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <Title marginY="md" variant="h2">
                {t('Préférences de notifications')}
            </Title>
            <p style={{ marginBottom: '24px', color: 'var(--font-detail-color)' }}>
                {t('Choisissez les notifications par email que vous souhaitez recevoir.')}
            </p>
            <div className={styles.settingRow}>
                <Field
                    helperText={t('Recevoir un email pour chaque nouvelle publication Pelico')}
                    helperTextStyle={{ textAlign: 'left' }}
                    input={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Checkbox
                                name="admin-publication"
                                label={t('Publications de Pelico')}
                                isChecked={currentAdminPublication}
                                onChange={(checked) => setCurrentAdminPublication(checked === true)}
                                isDisabled={isPending}
                            />
                        </div>
                    }
                    marginBottom="lg"
                />
            </div>

            <div className={styles.settingRow}>
                <Field
                    helperText={t('Recevoir un email pour chaque nouveau commentaire sur une activité de votre classe')}
                    helperTextStyle={{ textAlign: 'left' }}
                    input={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Checkbox
                                name="comment-activity"
                                label={t('Commentaire sous une de nos publications')}
                                isChecked={currentCommentActivity}
                                onChange={(checked) => setCurrentCommentActivity(checked === true)}
                                isDisabled={isPending}
                            />
                        </div>
                    }
                    marginBottom="lg"
                />
            </div>

            <div className={styles.buttonContainer}>
                <Button
                    label={t('Enregistrer les préférences')}
                    color="secondary"
                    variant="contained"
                    isUpperCase={false}
                    onClick={handleSave}
                    disabled={!hasChanges || isPending}
                    marginTop="lg"
                />
            </div>
        </div>
    );
};
