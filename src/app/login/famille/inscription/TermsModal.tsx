'use client';

import { Modal } from '@frontend/components/ui/Modal';
import { Title } from '@frontend/components/ui/Title';
import { getEnvVariable } from '@server/lib/get-env-variable';
import Link from 'next/link';
import { useExtracted } from 'next-intl';

interface TermsModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}
export const TermsModal = ({ isOpen, setIsOpen }: TermsModalProps) => {
    const t = useExtracted('app.login.famille.inscription');

    const appUrl = getEnvVariable('HOST_URL');
    return (
        <Modal hasCancelButton={false} width="lg" isOpen={isOpen} onClose={() => setIsOpen(false)} title={t("Conditions générales d'utilisation")}>
            <Title variant="h3" marginBottom="md">
                {t('1. Respect de certaines dispositions sur la plateforme 1Village')}
            </Title>
            <p>
                {t(
                    `En tant que membre de la famille d'un enfant participant à 1Village et en tant qu'utilisateur de la plateforme {appUrl}, je m'engage à adopter un comportement respectueux et bienveillant qui convient à la législation applicable, notamment sur les discours et contenus à caractère raciste, injurieux, diffamant, ou pornographique.`,
                    {
                        appUrl,
                    },
                )}
            </p>
            <br />
            <strong>{t("Je m'engage notamment à respecter la législation relative au droit à l'image,")}</strong>
            <p>
                {t(
                    "en particulier, je m'engage à ne pas télécharger et partager aucune des photos ou vidéos enfants pour lesquelles je ne possède pas d'autorisation valide et signée d'un parent ou du tuteur légal.",
                )}
            </p>
            <br />
            <p>
                {t(
                    `Je comprends et j'accepte que l'association Par le Monde ne peut être considérée comme responsable des contenus illégaux qui pourraient être mis en ligne sur la plateforme {appUrl}.`,
                    {
                        appUrl,
                    },
                )}
            </p>
            <Title variant="h3" marginY="md">
                {t.rich('2. Acceptation des mentions légales du site <link>https://www.parlemonde.org</link>', {
                    link: (chunks) => (
                        <Link target="_blank" href="https://www.parlemonde.org">
                            {chunks}
                        </Link>
                    ),
                })}
            </Title>
            <p>
                {t.rich(
                    "Je prends connaissance et j'accepte les mentions légales telles que précisées à l'adresse suivante : <link>https://www.parlemonde.org/politique-de-confidentialite</link>.",
                    {
                        link: (chunks) => (
                            <Link target="_blank" href="https://www.parlemonde.org/politique-de-confidentialite">
                                {chunks}
                            </Link>
                        ),
                    },
                )}
            </p>
        </Modal>
    );
};
