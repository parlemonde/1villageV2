import { useExtracted } from 'next-intl';

export const useStatusLabels = () => {
    const t = useExtracted('common');

    const labels: Record<'active' | 'observer' | 'ghost', string> = {
        active: t('Actif'),
        observer: t('Observateur'),
        ghost: t('Fantôme'),
    };

    return labels;
};
