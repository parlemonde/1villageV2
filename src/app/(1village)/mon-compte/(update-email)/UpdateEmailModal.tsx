'use client';

import { Field } from '@frontend/components/ui/Form';
import { Input } from '@frontend/components/ui/Form/Input';
import { Modal } from '@frontend/components/ui/Modal';
import { UserContext } from '@frontend/contexts/userContext';
import { useContext, useState } from 'react';

import { useUpdateEmail } from './useUpdateEmail';
import styles from '../page.module.css';
import { isValidEmail } from '../validation';

interface UpdateEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialValue: string;
}

export const UpdateEmailModal = ({ isOpen, onClose, initialValue }: UpdateEmailModalProps) => {
    const { setUser } = useContext(UserContext);
    const { isUpdating, error, handleUpdate } = useUpdateEmail((result) => {
        setUser(result);
    });
    const [value, setValue] = useState(initialValue);

    const trimmedEmail = value.trim();
    const isEmailEmpty = trimmedEmail.length === 0;
    const isEmailInvalid = trimmedEmail.length > 0 && !isValidEmail(value);

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
            title="Modifier mon e-mail"
            confirmLabel="Enregistrer"
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            isConfirmDisabled={isEmailEmpty || !isValidEmail(value)}
        >
            <div className={styles.modalContent}>
                <Field
                    name="email"
                    label="Nouvel e-mail"
                    input={
                        <Input
                            id="email"
                            type="email"
                            color="secondary"
                            isFullWidth
                            hasError={!!error || isEmailInvalid}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Entrez votre nouvel e-mail"
                            autoFocus
                        />
                    }
                />
                {isEmailEmpty && value.length > 0 && <p className={styles.errorMessage}>L&apos;email ne peut pas être vide</p>}
                {isEmailInvalid && <p className={styles.errorMessage}>Veuillez entrer une adresse email valide</p>}
                {!isEmailEmpty && isValidEmail(value) && <p className={styles.successMessage}>✓ Email valide</p>}
                {error && <p className={styles.modalError}>{error}</p>}
            </div>
        </Modal>
    );
};
