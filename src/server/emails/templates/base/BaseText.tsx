import { getExtracted } from 'next-intl/server';

export const BaseText = async ({ children }: React.PropsWithChildren): Promise<string> => {
    const t = await getExtracted('common');
    const content = `
1Village - ${t('Association Par Le Monde')}
--------------------------------------

${t('Bonjour')},

${children}

${t('Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.')}

--------------------------------------

© ${new Date().getFullYear()} 1Village. ${t('Tous droits réservés')}.

--------------------------------------
`;

    return content;
};
