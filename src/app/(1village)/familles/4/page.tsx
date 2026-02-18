'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { useExtracted } from 'next-intl';

export default function FamillesStep4() {
    const t = useExtracted('app.(1village).familles.4');

    const downloadAll = () => {
        // TODO
    };

    const download = () => {
        // TODO
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1' },
                    { label: t('Ajout enfants'), href: '/familles/2' },
                    { label: t('Communication'), href: '/familles/3' },
                    { label: t('Gestion'), href: '/familles/4' },
                ]}
                activeStep={4}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2">{t('Gérez les accès aux familles')}</Title>
            <p>
                {t(
                    'Pour chaque enfant de votre classe, vous pouvez voir le nombre de compte famille crée ainsi que télécharger individuellement le texte de présentation (si une famille a perdu le sien par exemple).',
                )}
            </p>
            <Button onClick={downloadAll} label={t('Télécharger X présentations')} color="primary" marginTop="md" />
            <table>
                <thead>
                    <tr>
                        <th scope="col">{t("Prénom et nom de l'enfant")}</th>
                        <th scope="col">{t('Accès familles')}</th>
                        <th scope="col">{t('Code enfant')}</th>
                        <th scope="col">{t('Actions')}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>
                            <Button label={t('Télécharger la présentation')} color="primary" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </PageContainer>
    );
}
