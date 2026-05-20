'use client';

import styles from '@app/(1village)/mon-compte/page.module.css';
import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Field } from '@frontend/components/ui/Form/Field';
import { Title } from '@frontend/components/ui/Title';
import { updateSubscription } from '@server-actions/settings/update-subscriptions';
import { useExtracted } from 'next-intl';
import { useState, useTransition } from 'react';

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
    const [adminPublicationEdited, setAdminPublicationEdited] = useState<boolean>(initialAdminPublication);
    const [commentActivityEdited, setCommentActivityEdited] = useState<boolean>(initialCommentActivity);
    const [isPending, startTransition] = useTransition();
    const t = useExtracted('app.(1village).mon-compte.preferences');

    const hasChanges = adminPublicationSubscribed !== adminPublicationEdited || commentActivitySubscribed !== commentActivityEdited;

    const handleSave = async () => {
        startTransition(async () => {
            try {
                const results = await Promise.all([
                    adminPublicationSubscribed !== adminPublicationEdited
                        ? updateSubscription('adminPublication', adminPublicationEdited)
                        : Promise.resolve({ error: null }),
                    commentActivitySubscribed !== commentActivityEdited
                        ? updateSubscription('commentActivity', commentActivityEdited)
                        : Promise.resolve({ error: null }),
                ]);

                const hasError = results.some((r) => r.error);
                if (hasError) {
                    sendToast({
                        type: 'error',
                        message: t('Une erreur est survenue lors de la mise à jour de vos préférences.'),
                    });
                } else {
                    // save preferences in state when no errors
                    setAdminPublicationSubscribed(adminPublicationEdited);
                    setCommentActivitySubscribed(commentActivityEdited);
                    sendToast({
                        type: 'success',
                        message: t('Vos préférences ont été mises à jour avec succès.'),
                    });
                }
            } catch {
                sendToast({
                    type: 'error',
                    message: t('Une erreur est survenue lors de la mise à jour de vos préférences.'),
                });
            }
        });
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
                                isChecked={adminPublicationEdited}
                                onChange={(checked) => setAdminPublicationEdited(checked === true)}
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
                                isChecked={commentActivityEdited}
                                onChange={(checked) => setCommentActivityEdited(checked === true)}
                                isDisabled={isPending}
                            />
                        </div>
                    }
                    marginBottom="lg"
                />
            </div>

            <div className={styles.buttonContainer}>
                <Button
                    label="Enregistrer les préférences"
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
