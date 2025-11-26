'use client';

import { Field } from '@frontend/components/ui/Form';
import { Input } from '@frontend/components/ui/Form/Input';
import { Modal } from '@frontend/components/ui/Modal';
import { useState } from 'react';

import { useUpdatePassword } from './useUpdatePassword';
import styles from '../page.module.css';
import { getPasswordStrength } from '../validation';

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UpdatePasswordModal = ({ isOpen, onClose }: UpdatePasswordModalProps) => {
    const { isUpdating, error, handleUpdate } = useUpdatePassword();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const passwordStrength = getPasswordStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
    const isFormValid = currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch;

    const isNewPasswordInvalid = newPassword.length > 0 && passwordStrength.level !== 'strong';
    const isConfirmPasswordInvalid = !passwordsMatch && confirmPassword.length > 0;

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    const handleConfirm = async () => {
        await handleUpdate(currentPassword, newPassword, confirmPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier mon mot de passe"
            confirmLabel="Enregistrer"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            isConfirmDisabled={!isFormValid}
        >
            <div className={styles.modalContent}>
                <div className={styles.formFieldLarge}>
                    <Field
                        name="currentPassword"
                        label="Mot de passe actuel"
                        input={
                            <Input
                                id="currentPassword"
                                type="password"
                                color="secondary"
                                isFullWidth
                                hasError={!!error}
                                value={currentPassword}
                                onChange={(e) => {
                                    setCurrentPassword(e.target.value);
                                }}
                                placeholder="Entrez votre mot de passe actuel"
                                autoFocus
                            />
                        }
                    />
                </div>

                <div className={styles.formFieldLarge}>
                    <Field
                        name="newPassword"
                        label="Nouveau mot de passe"
                        input={
                            <Input
                                id="newPassword"
                                type="password"
                                color="secondary"
                                isFullWidth
                                hasError={!!error || isNewPasswordInvalid}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min. 8 caractères"
                            />
                        }
                    />
                    {isNewPasswordInvalid && (
                        <p className={styles.errorMessage}>
                            Mot de passe trop faible. Il doit contenir au moins 8 charactères avec des lettres minuscules, majuscules et des chiffres.
                        </p>
                    )}
                    {newPassword.length > 0 && !isNewPasswordInvalid && <p className={styles.successMessage}>✓ Mot de passe solide</p>}
                </div>

                <div className={styles.formFieldSmall}>
                    <Field
                        name="confirmPassword"
                        label="Confirmer le mot de passe"
                        input={
                            <Input
                                id="confirmPassword"
                                type="password"
                                color="secondary"
                                isFullWidth
                                hasError={isConfirmPasswordInvalid}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmez votre nouveau mot de passe"
                            />
                        }
                    />
                </div>
                {isConfirmPasswordInvalid && <p className={styles.errorMessage}>Les mots de passe ne correspondent pas</p>}
                {passwordsMatch && newPassword.length > 0 && <p className={styles.successMessage}>✓ Les mots de passe correspondent</p>}

                {error && <p className={styles.modalError}>{error}</p>}
            </div>
        </Modal>
    );
};
