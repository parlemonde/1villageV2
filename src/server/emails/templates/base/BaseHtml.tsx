/* eslint-disable @next/next/no-img-element */
import styles from '@server/emails/templates/emailStyles';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { getExtracted } from 'next-intl/server';

export const BaseHtml = async ({ children }: React.PropsWithChildren) => {
    const t = await getExtracted('common');

    const appUrl = getEnvVariable('HOST_URL');
    return (
        <div style={{ fontFamily: 'Roboto' }}>
            <div style={{ padding: '16px 8px', backgroundColor: styles.textOrangeBackground }}>
                <img
                    src={getEnvVariable('HOST_URL') + '/static/images/plm-logo.png'}
                    width={90}
                    height={66}
                    style={{ display: 'block' }}
                    alt={t('Association Par le Monde')}
                />
                <h2 style={{ textAlign: 'center', margin: '0' }}>{t('Bonjour')}</h2>
            </div>
            <div style={{ padding: '16px' }}>{children}</div>
            <div style={{ padding: '16px', textAlign: 'right' }}>
                <p style={{ fontSize: '12px', fontStyle: 'italic', color: styles.grey500 }}>
                    {t('Vous recevez cette notification e-mail envoyée automatiquement dans le cadre du projet 1Village.')}
                </p>
            </div>
            <div style={{ padding: '16px', backgroundColor: styles.textOrangeBackground }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '48px' }}>
                    <a href={appUrl} target="_blank" style={{ ...styles.button, backgroundColor: styles.secondaryColor, color: styles.fontColor }}>
                        {t('Rejoindre 1Village')}
                    </a>
                    <a href="https://parlemonde.org/faire-un-don/" target="_blank" style={{ ...styles.button, backgroundColor: styles.primaryColor }}>
                        {t('Faire un don')}
                    </a>
                </div>
            </div>
        </div>
    );
};
