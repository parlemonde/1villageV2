'use client';

import styles from '@app/(1village)/mon-compte/page.module.css';
import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { Field } from '@frontend/components/ui/Form/Field';
import { updateAdminPublicationSubscription, updateCommentActivitySubscription } from '@server-actions/settings/update-subscriptions';
import { useExtracted } from 'next-intl';
import { useState, useTransition } from 'react';

interface PreferencesFormProps {
    adminPublicationSubscribed: boolean;
    commentActivitySubscribed: boolean;
    userId: string;
}

export const PreferencesForm = ({
    adminPublicationSubscribed: initialAdminPublication,
    commentActivitySubscribed: initialCommentActivity,
}: PreferencesFormProps) => {
    const [adminPublicationSubscribed, setAdminPublicationSubscribed] = useState(initialAdminPublication);
    const [commentActivitySubscribed, setCommentActivitySubscribed] = useState(initialCommentActivity);
    const [isPending, startTransition] = useTransition();
    const t = useExtracted('app.(1village).mon-compte.preferences');

    const hasChanges = adminPublicationSubscribed !== initialAdminPublication || commentActivitySubscribed !== initialCommentActivity;

    const handleSave = async () => {
        startTransition(async () => {
            try {
                const results = await Promise.all([
                    adminPublicationSubscribed !== initialAdminPublication
                        ? updateAdminPublicationSubscription(adminPublicationSubscribed)
                        : Promise.resolve({ error: null }),
                    commentActivitySubscribed !== initialCommentActivity
                        ? updateCommentActivitySubscription(commentActivitySubscribed)
                        : Promise.resolve({ error: null }),
                ]);

                const hasError = results.some((r) => r.error);
                if (hasError) {
                    sendToast({
                        type: 'error',
                        message: t('Une erreur est survenue lors de la mise à jour de vos préférences.'),
                    });
                } else {
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
            <div className={styles.settingRow}>
                <Field
                    // className={styles.itemsPerPageLabel}
                    label={t('Publications Pelico 1')}
                    helperText={t('Recevoir un email pour chaque nouvelle publication Pelico (admin)')}
                    helperTextStyle={{ color: 'blue' }}
                    input={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Checkbox
                                name="admin-publication"
                                label={t('Publications Pelico 2')}
                                isChecked={adminPublicationSubscribed}
                                onChange={(checked) => setAdminPublicationSubscribed(checked === true)}
                                isDisabled={isPending}
                            />
                        </div>
                    }
                    marginBottom="lg"
                />
            </div>

            <div className={styles.settingRow}>
                <Field
                    // className={styles.itemsPerPageLabel}
                    label={t('Commentaires sur vos activités 1')}
                    helperText={t('Recevoir un email pour chaque nouveau commentaire sur une activité de votre classe')}
                    helperTextStyle={{ color: 'blue' }}
                    input={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Checkbox
                                name="comment-activity"
                                label={t('Commentaires sur vos activités 2')}
                                isChecked={commentActivitySubscribed}
                                onChange={(checked) => setCommentActivitySubscribed(checked === true)}
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
