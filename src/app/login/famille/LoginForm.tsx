'use client';

import { Button } from '@frontend/components/ui/Button';
import { IconButton } from '@frontend/components/ui/Button/IconButton';
import { Field, Input } from '@frontend/components/ui/Form';
import { isValidEmail } from '@lib/email-validation';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { login } from '@server-actions/authentication/login';
import { useExtracted } from 'next-intl';
import { useActionState, useState } from 'react';

export const LoginForm = () => {
    const t = useExtracted('app.login.famille');
    const [email, setEmail] = useState('');
    const [message, formAction] = useActionState(login, '');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form
            action={formAction}
            style={{
                width: '350px',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                alignItems: 'stretch',
                padding: '24px 0',
            }}
        >
            {message && <p style={{ color: 'var(--error-color)', textAlign: 'center' }}>{message}</p>}
            <Field
                name="email"
                label={t('Email')}
                input={
                    <Input
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value.trim())}
                        hasError={email.length > 0 && !isValidEmail(email)}
                        isFullWidth
                        required
                        placeholder={t('Entrez votre adresse email')}
                    />
                }
            />
            <Field
                name="password"
                label="Mot de passe"
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
                                aria-label="toggle password visibility"
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
            <Button label={t('Se connecter')} type="submit" color="primary" />
        </form>
    );
};
