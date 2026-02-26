'use client';

import { Button } from '@frontend/components/ui/Button';
import { IconButton } from '@frontend/components/ui/Button/IconButton';
import { Field, Input } from '@frontend/components/ui/Form';
import { Checkbox } from '@frontend/components/ui/Form/Checkbox';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { register } from '@server-actions/authentication/register';
import { useExtracted } from 'next-intl';
import { useActionState, useState } from 'react';

import { TermsModal } from './TermsModal';

export const RegisterForm = () => {
    const t = useExtracted('app.login.famille.inscription');
    const [message, formAction] = useActionState(register, '');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const [newsletterAccepted, setNewsletterAccepted] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const openModal = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(true);
    };

    return (
        <form
            action={formAction}
            style={{
                width: '450px',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: '16px',
                padding: '24px 0',
            }}
        >
            {message && <p style={{ color: 'var(--error-color)', textAlign: 'center' }}>{message}</p>}
            <Field
                name="email"
                label={t('Email')}
                input={<Input id="email" name="email" isFullWidth required placeholder={t('Entrez votre adresse email')} />}
            />
            <Field
                name="firstName"
                label={t('Prénom')}
                input={<Input id="firstName" name="firstName" isFullWidth required placeholder={t('Entrez votre prénom')} />}
            />
            <Field
                name="lastName"
                label={t('Nom')}
                input={<Input id="lastName" name="lastName" isFullWidth required placeholder={t('Entrez votre nom de famille')} />}
            />
            <div>
                <Field
                    name="password"
                    label={t('Mot de passe')}
                    marginBottom="none"
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
                <p style={{ fontWeight: 'light', fontSize: '14px', fontStyle: 'italic' }}>
                    {t('12 caractères minimum, une majuscule, une minuscule, un caractère spécial et un chiffre')}
                </p>
            </div>
            <Field
                name="confirmPassword"
                label={t('Confirmation du mot de passe')}
                input={
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        isFullWidth
                        required
                        placeholder={t('Confirmez votre mot de passe')}
                        iconAdornment={
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                    setShowConfirmPassword(!showConfirmPassword);
                                }}
                                variant="borderless"
                                icon={showConfirmPassword ? EyeNoneIcon : EyeOpenIcon}
                                iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                            ></IconButton>
                        }
                        iconAdornmentProps={{ position: 'right' }}
                    />
                }
            />
            <Checkbox
                name="acceptNewsletter"
                label={t('Accepter de recevoir des nouvelles du projet 1Village')}
                isChecked={newsletterAccepted}
                onChange={() => setNewsletterAccepted(!newsletterAccepted)}
            />
            <Checkbox
                name="acceptTerms"
                label={t.rich("Accepter les <span>conditions générales d'utilisation</span>", {
                    span: (chunks) => (
                        <span>
                            &nbsp;
                            <span style={{ textDecoration: 'underline' }} onClick={(e) => openModal(e)}>
                                {chunks}
                            </span>
                        </span>
                    ),
                })}
                isChecked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <Button label={t("S'inscrire")} type="submit" color="primary" />
            <TermsModal isOpen={isOpen} setIsOpen={setIsOpen} />
        </form>
    );
};
