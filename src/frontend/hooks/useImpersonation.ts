import { sendToast } from '@frontend/components/Toasts';
import { authClient } from '@frontend/lib/auth-client';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

export function useImpersonation() {
    const t = useExtracted('useImpersonation');
    const [isStopping, setIsStopping] = useState(false);
    const stop = async () => {
        setIsStopping(true);
        const { error } = await authClient.admin.stopImpersonating();
        if (error) {
            sendToast({
                message: t('Une erreur est survenue lors du retour au rôle administrateur'),
                type: 'error',
            });
            setIsStopping(false);
            return;
        }
        window.location.assign('/admin/manage/users');
    };
    return { isStopping, stop };
}
