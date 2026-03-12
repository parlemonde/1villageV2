'use client';

import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import PelicoVacances from '@frontend/svg/pelico/pelico-vacances.svg';
import { logout } from '@server-actions/authentication/logout';
import { useRef } from 'react';

import styles from './unassigned-village-modal.module.css';

export const UnassignedVillageModal = () => {
    const alreadyAsked = useRef(false);

    const onAskVillage = () => {
        sendToast({ message: "Votre demande d'assignation à un village a bien été envoyée à un administrateur !", type: 'success' });
        alreadyAsked.current = true;
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => logout()}
            hasCloseButton={false}
            hasTopSeparator={false}
            hasFooter={true}
            cancelLabel="Se déconnecter"
            cancelIsUpperCase={false}
            hasCancelButton={true}
            onCancel={() => logout()}
            width="md"
            className={styles.modal}
        >
            {/* position: relative sur ce div pour que Pelico soit positionné par rapport à lui.
                Le padding-left laisse de la place au contenu centré sans être masqué par Pelico.
                left: -4rem place Pelico en dehors du modal sur la gauche (dépasse le bord gauche). */}
            <div style={{ position: 'relative' }}>
                <PelicoVacances
                    style={{
                        height: '6rem',
                        width: '6rem',
                        position: 'absolute',
                        top: '-0.5rem',
                        left: '-4rem',
                    }}
                />
                <div style={{ width: '100%', padding: '1rem', textAlign: 'center' }}>
                    <h2>{"Mince, votre classe n'est pas dans un village !"}</h2>
                    <Button
                        label="Demander à être assigné à un village"
                        variant="contained"
                        color="primary"
                        size="md"
                        isUpperCase={false}
                        style={{ margin: '1rem' }}
                        onClick={onAskVillage}
                    />
                </div>
            </div>
        </Modal>
    );
};
