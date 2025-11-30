'use client';

import { Field } from '@frontend/components/ui/Form';
import { Input } from '@frontend/components/ui/Form/Input';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { authClient } from '@frontend/lib/auth-client';
import { useContext, useState } from 'react';

interface UpdateNameModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
}

export const UpdateNameModal = ({ isOpen, onClose, initialValue }: UpdateNameModalProps) => {
    const { user, setUser } = useContext(UserContext);
    const [value, setValue] = useState(initialValue);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null);

    const trimmedName = value.trim();
    const isNameEmpty = trimmedName.length === 0;

    const handleClose = () => {
        setValue(initialValue);
        onClose();
    };

    const handleConfirm = async () => {
        if (isNameEmpty) {
            return;
        }
        setUpdateErrorMessage(null);
        setIsUpdating(true);
        const { data, error } = await authClient.updateUser({
            name: trimmedName,
        });
        if (error || !data.status) {
            setUpdateErrorMessage('Echec de la mise à jour du nom');
            setIsUpdating(false);
        } else {
            setUser({ ...user, name: trimmedName });
            setIsUpdating(false);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier mon nom"
            confirmLabel="Modifier"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            width="md"
            isConfirmDisabled={isNameEmpty}
        >
            <Field
                name="name"
                label="Nouveau nom"
                helperText={updateErrorMessage || (isNameEmpty ? 'Le nom ne peut pas être vide' : undefined)}
                helperTextStyle={{ color: 'var(--error-color)' }}
                input={
                    <Input
                        id="name"
                        color="secondary"
                        isFullWidth
                        hasError={!!updateErrorMessage}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setUpdateErrorMessage(null);
                        }}
                        placeholder="Entrez votre nouveau nom"
                        autoFocus
                    />
                }
            />
        </Modal>
    );
};
