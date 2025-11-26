'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { SectionContainer } from '@frontend/components/ui/SectionContainer';
import { UserContext } from '@frontend/contexts/userContext';
import { checkIfSSOUser } from '@server-actions/users/is-sso-user';
import { useContext, useEffect, useState } from 'react';

import { UpdateEmailModal } from './(update-email)/UpdateEmailModal';
import { UpdateNameModal } from './(update-name)/UpdateNameModal';
import { UpdatePasswordModal } from './(update-password)/UpdatePasswordModal';
import styles from './page.module.css';

export default function MyAccount() {
    const { user } = useContext(UserContext);
    const [isSSOUser, setIsSSOUser] = useState(false);

    // Modal state
    const [updateNameModalOpen, setUpdateNameModalOpen] = useState(false);
    const [updateEmailModalOpen, setUpdateEmailModalOpen] = useState(false);
    const [updatePasswordModalOpen, setUpdatePasswordModalOpen] = useState(false);

    useEffect(() => {
        checkIfSSOUser().then(setIsSSOUser);
    }, []);

    return (
        <>
            <PageContainer title="Paramètres du compte">
                <SectionContainer title="Identifiants de connexion">
                    <div className={styles.settingRow}>
                        <div className={styles.settingLabel}>
                            <span className={styles.settingLabelText}>Mon nom</span>
                            <span className={styles.settingValue}>{user.name}</span>
                        </div>
                        <Button
                            label="Modifier mon nom"
                            color="secondary"
                            variant="outlined"
                            size="sm"
                            isUpperCase={false}
                            onClick={() => setUpdateNameModalOpen(true)}
                        />
                    </div>

                    {!isSSOUser && (
                        <div className={styles.settingRow}>
                            <div className={styles.settingLabel}>
                                <span className={styles.settingLabelText}>Mon e-mail</span>
                                <span className={styles.settingValue}>{user.email}</span>
                            </div>
                            <Button
                                label="Modifier mon e-mail"
                                color="secondary"
                                variant="outlined"
                                size="sm"
                                isUpperCase={false}
                                onClick={() => setUpdateEmailModalOpen(true)}
                            />
                        </div>
                    )}

                    {!isSSOUser && (
                        <div className={styles.buttonContainer}>
                            <Button
                                label="Modifier mon mot de passe"
                                color="secondary"
                                variant="contained"
                                size="sm"
                                isUpperCase={false}
                                onClick={() => setUpdatePasswordModalOpen(true)}
                            />
                        </div>
                    )}
                </SectionContainer>

                <SectionContainer title="Données et confidentialité">
                    <div className={styles.buttonContainer}>
                        <Button label="Supprimer mon compte" color="error" variant="contained" size="sm" isUpperCase={false} />
                    </div>
                </SectionContainer>
            </PageContainer>

            <UpdateNameModal isOpen={updateNameModalOpen} onClose={() => setUpdateNameModalOpen(false)} initialValue={user.name} />

            <UpdateEmailModal isOpen={updateEmailModalOpen} onClose={() => setUpdateEmailModalOpen(false)} initialValue={user.email} />

            <UpdatePasswordModal isOpen={updatePasswordModalOpen} onClose={() => setUpdatePasswordModalOpen(false)} />
        </>
    );
}
