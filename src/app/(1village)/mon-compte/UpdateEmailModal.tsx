'use client';

import { Field } from '@frontend/components/ui/Form';
import { Input } from '@frontend/components/ui/Form/Input';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { authClient } from '@frontend/lib/auth-client';
import { useContext, useState } from 'react';

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

interface UpdateEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
}

export const UpdateEmailModal = ({ isOpen, onClose, initialValue }: UpdateEmailModalProps) => {
    const { user, setUser } = useContext(UserContext);
    const [value, setValue] = useState(initialValue);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null);

    const trimmedEmail = value.trim();
    const isEmailEmpty = trimmedEmail.length === 0;
    const isEmailInvalid = trimmedEmail.length > 0 && !isValidEmail(value);

    const handleClose = () => {
        setValue(initialValue);
        onClose();
    };

    const handleConfirm = async () => {
        if (isEmailEmpty || isEmailInvalid) {
            return;
        }
        setUpdateErrorMessage(null);
        setIsUpdating(true);
        const { data, error } = await authClient.changeEmail({
            newEmail: trimmedEmail,
        });
        if (error || !data.status) {
            setUpdateErrorMessage("Echec de la mise à jour de l'email");
            setIsUpdating(false);
        } else {
            setUser({ ...user, email: trimmedEmail });
            setIsUpdating(false);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier mon e-mail"
            confirmLabel="Modifier"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            width="md"
            isConfirmDisabled={isEmailEmpty || isEmailInvalid}
        >
            <Field
                name="email"
                label="Nouvel e-mail"
                input={
                    <Input
                        id="email"
                        type="email"
                        color="secondary"
                        isFullWidth
                        hasError={!!updateErrorMessage || isEmailInvalid}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Entrez votre nouvel e-mail"
                        autoFocus
                    />
                }
                helperText={
                    updateErrorMessage ||
                    (isEmailEmpty ? "L'email ne peut pas être vide" : isEmailInvalid ? 'Veuillez entrer une adresse email valide' : undefined)
                }
                helperTextStyle={{ color: 'var(--error-color)' }}
            />
        </Modal>
    );
};
