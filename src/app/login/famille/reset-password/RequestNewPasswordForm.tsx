'use client';

import { Button } from '@frontend/components/ui/Button';
import { Field, Input } from '@frontend/components/ui/Form';
import { Link } from '@frontend/components/ui/Link';
import { Title } from '@frontend/components/ui/Title';
import PelicoSouriant from '@frontend/svg/pelico/pelico-souriant.svg';
import { isValidEmail } from '@lib/email-validation';
import { requestNewPassword } from '@server-actions/authentication/request-new-password';
import { useExtracted } from 'next-intl';
import { useActionState, useState } from 'react';

import styles from './request-new-password-form.module.css';

type RequestNewPasswordFormProps = {
    error?: string;
};

export const RequestNewPasswordForm = ({ error }: RequestNewPasswordFormProps) => {
    const t = useExtracted('app.login.famille.reset-password');
    const handleSubmit = async (formData: FormData) => {
        setIsRequestSent(true);
        dispatchAction(formData);
    };
    const [email, setEmail] = useState('');
    const [message, dispatchAction, isPending] = useActionState(requestNewPassword, error || '');
    const [isRequestSent, setIsRequestSent] = useState(false);

    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit" marginY="md">
                {t('Réinitialisation du mot de passe')}
            </Title>
            {isRequestSent ? (
                <div className={styles.resetForm}>
                    <PelicoSouriant width="260" height="241" style={{ margin: '0 auto' }} />
                    <p style={{ color: 'var(--success-color)', textAlign: 'center' }}>
                        {t('Si cette adresse e-mail est enregistrée, nous y avons envoyé les instructions afin de réinitialiser votre mot de passe.')}
                    </p>
                </div>
            ) : (
                <form action={handleSubmit} className={styles.resetForm}>
                    <Title variant="h3">{t("Veuillez renseigner l'email lié à votre compte.")}</Title>
                    <Field
                        name="email"
                        label="Email"
                        input={
                            <Input
                                id="email"
                                name="email"
                                value={email}
                                isFullWidth
                                required
                                onChange={(e) => setEmail(e.target.value.trim())}
                                hasError={email.length > 0 && !isValidEmail(email)}
                                placeholder={t('Entrez votre adresse email')}
                            />
                        }
                    />
                    <Button label={t('Envoyer')} type="submit" color="primary" disabled={isPending || !isValidEmail(email)} />
                    {isPending && (
                        <p style={{ color: 'var(--success-color)', textAlign: 'center' }}>
                            {t('Votre demande de nouveau mot de passe a été envoyée')}
                        </p>
                    )}
                    {message && <p style={{ color: 'var(--error-color)', textAlign: 'center' }}>{message}</p>}
                </form>
            )}
            <span style={{ fontSize: '14px', marginTop: '16px' }}>
                <Link href="/login/famille" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                    {t('Retourner à la connexion')}
                </Link>
            </span>
        </div>
    );
};
