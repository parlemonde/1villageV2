'use client';

import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import { IconButton } from '@frontend/components/ui/Button/IconButton';
import { Field, Input } from '@frontend/components/ui/Form';
import { Title } from '@frontend/components/ui/Title';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { resetPassword } from '@server-actions/authentication/reset-password';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useActionState, useState, useEffect } from 'react';

import styles from './reset-password-form.module.css';

type ResetPasswordFormProps = {
    token: string;
};

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const t = useExtracted('app.login.famille.reset-password');
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [message, dispatchAction, isPending] = useActionState(resetPassword, '');
    const [isRequestSent, setIsRequestSent] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        dispatchAction(formData);
        setIsRequestSent(true);
    };

    useEffect(() => {
        if (isRequestSent && !isPending) {
            sendToast({
                type: message ? 'error' : 'success',
                message: message ? message : t('Votre changement de mot de passe a été pris en compte'),
            });
            if (!message) setTimeout(() => router.push('/login/famille'), 3000);
        }
    }, [isRequestSent, isPending, message, t, router]);

    return (
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <Title variant="h2" color="inherit" marginY="md">
                {t('Réinitialisation du mot de passe')}
            </Title>
            <form action={handleSubmit} className={styles.resetForm}>
                {isPending && <p style={{ color: 'var(--success-color)', textAlign: 'center' }}>{t('Veuillez patienter...')}</p>}

                <Field
                    name="password"
                    label={t('Mot de passe')}
                    input={
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            isFullWidth
                            required
                            placeholder={t('Entrez votre mot de passe')}
                            iconAdornment={
                                <IconButton
                                    aria-label={t('toggle password visibility')}
                                    title={t('toggle password visibility')}
                                    onClick={() => {
                                        setShowPassword(!showPassword);
                                    }}
                                    variant="borderless"
                                    icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                    iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                ></IconButton>
                            }
                            iconAdornmentProps={{ position: 'right' }}
                        />
                    }
                />
                <Input type="hidden" name="token" value={token} />
                <Button label={t('Changer mon mot de passe')} type="submit" color="primary" />
            </form>
        </div>
    );
};
