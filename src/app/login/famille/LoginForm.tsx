'use client';

import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/Button/IconButton';
import { Field, Input } from '@/components/ui/Form';
import { login } from '@/server-actions/authentication/login';

export const LoginForm = () => {
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
                label="Email"
                input={<Input id="email" name="email" isFullWidth required placeholder="Entrez votre adresse email" />}
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
                        placeholder="Entrez votre mot de passe"
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
            <Button label="Se connecter" type="submit" color="primary" />
        </form>
    );
};
