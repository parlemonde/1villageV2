'use client';

import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import PelicoVacances from '@frontend/svg/pelico/pelico-vacances.svg';
import { logout } from '@server-actions/authentication/logout';
import { useRef } from 'react';

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
            title=""
            hasCloseButton={false}
            hasFooter={true}
            cancelLabel="Se déconnecter"
            hasCancelButton={true}
            onCancel={() => logout()}
            width="sm"
        >
            <div style={{ position: 'relative', padding: '1rem', textAlign: 'center' }}>
                <PelicoVacances style={{ height: '6rem', width: '6rem', position: 'absolute', top: '-0.5rem', left: '-2rem' }} />
                <h2>{"Mince, votre classe n'est pas dans un village !"}</h2>
                <Button label="Demander à être assigné à un village" variant="contained" color="primary" size="sm" onClick={onAskVillage} />
            </div>
        </Modal>
    );
};
