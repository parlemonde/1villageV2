'use client';

import { sendToast } from '@frontend/components/Toasts/toast-events';
import { Button } from '@frontend/components/ui/Button';
import { Modal } from '@frontend/components/ui/Modal';
import PelicoVacances from '@frontend/svg/pelico/pelico-vacances.svg';
import { logout } from '@server-actions/authentication/logout';
import { requestVillageAssignment } from '@server-actions/users/request-village-assignment';
import { useExtracted } from 'next-intl';
import { useRef } from 'react';

export const UnassignedVillageModal = () => {
    const t = useExtracted('UnassignedVillageModal');
    const tCommon = useExtracted('common');
    const alreadyAsked = useRef(false);

    const onAskVillage = async () => {
        if (alreadyAsked.current) return;
        alreadyAsked.current = true;
        await requestVillageAssignment();
        sendToast({ message: t("Votre demande d'assignation à un village a bien été envoyée à un administrateur !"), type: 'success' });
    };

    return (
        <Modal
            isOpen={true}
            onClose={() => logout()}
            hasCloseButton={false}
            hasTopSeparator={false}
            hasFooter={true}
            cancelLabel={tCommon('Se déconnecter')}
            cancelIsUpperCase={false}
            hasCancelButton={true}
            onCancel={() => logout()}
            width="md"
            hasVisibleOverflow={true}
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
                    <h2>{t("Mince, votre classe n'est pas dans un village !")}</h2>
                    <Button
                        label={t('Demander à être assigné à un village')}
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
