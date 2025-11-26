'use client';

import { Field } from '@frontend/components/ui/Form';
import { Input } from '@frontend/components/ui/Form/Input';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { useContext, useState } from 'react';

import { useUpdateName } from './useUpdateName';
import styles from '../page.module.css';

interface UpdateNameModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
}

export const UpdateNameModal = ({ isOpen, onClose, initialValue }: UpdateNameModalProps) => {
    const { setUser } = useContext(UserContext);
    const { isUpdating, error, handleUpdate } = useUpdateName((result) => {
        setUser(result);
    });
    const [value, setValue] = useState(initialValue);

    const trimmedName = value.trim();
    const isNameEmpty = trimmedName.length === 0;
    const isNameInvalid = isNameEmpty && value.length > 0;

    const handleClose = () => {
        setValue(initialValue);
        onClose();
    };

    const handleConfirm = async () => {
        await handleUpdate(value);
        setValue(initialValue);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Modifier mon nom"
            confirmLabel="Enregistrer"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            isConfirmDisabled={isNameEmpty}
        >
            <div className={styles.modalContent}>
                <Field
                    name="name"
                    label="Nouveau nom"
                    input={
                        <Input
                            id="name"
                            color="secondary"
                            isFullWidth
                            hasError={!!error || isNameInvalid}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Entrez votre nouveau nom"
                            autoFocus
                        />
                    }
                />
                {isNameInvalid && <p className={styles.errorMessage}>Le nom ne peut pas être vide</p>}
                {error && <p className={styles.modalError}>{error}</p>}
            </div>
        </Modal>
    );
};
