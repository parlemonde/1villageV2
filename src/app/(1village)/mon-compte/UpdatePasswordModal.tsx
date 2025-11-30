'use client';

import { IconButton } from '@frontend/components/ui/Button';
import { Field } from '@frontend/components/ui/Form';
import { Input } from '@frontend/components/ui/Form/Input';
import { Modal } from '@frontend/components/ui/Modal';
import { authClient } from '@frontend/lib/auth-client';
import { EyeNoneIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

const isValidPassword = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9!@#$%^&*]/.test(password);
};

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpdatePasswordModal = ({ isOpen, onClose }: UpdatePasswordModalProps) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = useState<string>('');

    const isNewPasswordInvalid = newPassword.length > 0 && !isValidPassword(newPassword);
    const isConfirmPasswordInvalid = confirmPassword.length > 0 && newPassword !== confirmPassword;

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    const handleConfirm = async () => {
        if (currentPassword.length === 0 || newPassword.length === 0 || isNewPasswordInvalid || isConfirmPasswordInvalid) {
            return;
        }
        setUpdateErrorMessage('');
        setIsUpdating(true);
        const { error } = await authClient.changePassword({
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        });
        if (error) {
            setUpdateErrorMessage('Echec de la mise à jour du mot de passe');
            setIsUpdating(false);
        } else {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsUpdating(false);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier mon mot de passe"
            confirmLabel="Modifier"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            width="md"
            isConfirmDisabled={currentPassword.length === 0 || newPassword.length === 0 || isNewPasswordInvalid || isConfirmPasswordInvalid}
        >
            {updateErrorMessage && <p style={{ color: 'var(--error-color)', marginBottom: 4, textAlign: 'center' }}>{updateErrorMessage}</p>}
            <Field
                name="currentPassword"
                label="Mot de passe actuel"
                marginBottom="md"
                input={
                    <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        color="secondary"
                        isFullWidth
                        hasError={false}
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value);
                        }}
                        placeholder="Entrez votre mot de passe actuel"
                        autoFocus
                        iconAdornment={
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                    setShowCurrentPassword(!showCurrentPassword);
                                }}
                                variant="borderless"
                                icon={showCurrentPassword ? EyeNoneIcon : EyeOpenIcon}
                                iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                            ></IconButton>
                        }
                        iconAdornmentProps={{ position: 'right' }}
                    />
                }
            />
            <Field
                name="newPassword"
                label="Nouveau mot de passe"
                marginBottom="xs"
                helperText="Minimum 8 caractères : majuscules, minuscules et chiffres/symboles."
                helperTextStyle={{ color: isNewPasswordInvalid ? 'var(--error-color)' : 'var(--secondary-600)' }}
                input={
                    <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        color="secondary"
                        isFullWidth
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Entrez votre nouveau mot de passe"
                        iconAdornment={
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => {
                                    setShowNewPassword(!showNewPassword);
                                }}
                                variant="borderless"
                                icon={showNewPassword ? EyeNoneIcon : EyeOpenIcon}
                                iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                            ></IconButton>
                        }
                        iconAdornmentProps={{ position: 'right' }}
                    />
                }
            />
            <Field
                name="confirmPassword"
                label="Confirmer le mot de passe"
                marginBottom="md"
                helperText={isConfirmPasswordInvalid ? 'Les mots de passe ne correspondent pas' : undefined}
                helperTextStyle={{ color: isConfirmPasswordInvalid ? 'var(--error-color)' : 'var(--secondary-600)' }}
                input={
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        color="secondary"
                        isFullWidth
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez votre nouveau mot de passe"
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
        </Modal>
    );
};
