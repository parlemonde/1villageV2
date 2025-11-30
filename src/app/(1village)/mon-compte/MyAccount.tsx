'use client';

import { Button } from '@frontend/components/ui/Button';
import { Title } from '@frontend/components/ui/Title';
import { UserContext } from '@frontend/contexts/userContext';
import { useContext, useState } from 'react';

import { UpdateEmailModal } from './UpdateEmailModal';
import { UpdateNameModal } from './UpdateNameModal';
import { UpdatePasswordModal } from './UpdatePasswordModal';
import styles from './page.module.css';

interface MyAccountProps {
    isSSOUser: boolean;
}
export const MyAccount = ({ isSSOUser }: MyAccountProps) => {
    const { user } = useContext(UserContext);

    const [isUpdateNameModalOpen, setIsUpdateNameModalOpen] = useState(false);
    const [isUpdateEmailModalOpen, setIsUpdateEmailModalOpen] = useState(false);
    const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] = useState(false);

    return (
        <>
            <div className={styles.settingRow}>
                <div className={styles.settingLabel}>
                    <span className={styles.settingLabelText}>Mon nom</span>
                    <span className={styles.settingValue}>{user.name}</span>
                </div>
                <Button
                    label="Modifier mon nom"
                    color="secondary"
                    variant="outlined"
                    isUpperCase={false}
                    className={styles.button}
                    onClick={() => setIsUpdateNameModalOpen(true)}
                />
            </div>
            <div className={styles.settingRow}>
                <div className={styles.settingLabel}>
                    <span className={styles.settingLabelText}>Mon e-mail</span>
                    <span className={styles.settingValue}>{user.email}</span>
                </div>
                {!isSSOUser && (
                    <Button
                        label="Modifier mon e-mail"
                        color="secondary"
                        variant="outlined"
                        isUpperCase={false}
                        className={styles.button}
                        onClick={() => setIsUpdateEmailModalOpen(true)}
                    />
                )}
            </div>
            {!isSSOUser && (
                <div className={styles.buttonContainer}>
                    <Button
                        marginTop="lg"
                        label="Modifier mon mot de passe"
                        color="secondary"
                        variant="outlined"
                        isUpperCase={false}
                        className={styles.button}
                        onClick={() => setIsUpdatePasswordModalOpen(true)}
                    />
                </div>
            )}
            <UpdateNameModal isOpen={isUpdateNameModalOpen} onClose={() => setIsUpdateNameModalOpen(false)} initialValue={user.name} />
            <UpdateEmailModal isOpen={isUpdateEmailModalOpen} onClose={() => setIsUpdateEmailModalOpen(false)} initialValue={user.email} />
            <UpdatePasswordModal isOpen={isUpdatePasswordModalOpen} onClose={() => setIsUpdatePasswordModalOpen(false)} />

            <Title marginTop="xl" marginBottom="md" variant="h2">
                Données et confidentialité
            </Title>
            <Button label="Supprimer mon compte" color="error" variant="contained" className={styles.button} isUpperCase={false} />
        </>
    );
};
