'use client';

import { HtmlEditor } from '@frontend/components/html/HtmlEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

import styles from './page.module.css';

export default function FamillesStep3() {
    const t = useExtracted('app.(1village).familles.3');
    const tCommon = useExtracted('common');

    const [content, setContent] = useState<unknown>();
    const [textValue, setTextValue] = useState(
        `
    <p>Bonjour, 
    </br>
    </br>
    Notre classe participe au projet 1Village, de l’association Par Le Monde, agréée par le ministère de l’éducation nationale français. 
    1Village est un projet de correspondances avec d’autres classes du monde, accessible de façon sécurisée sur un site internet.</p>
    
    <p>Si vous souhaitez accéder à ce site et observer les échanges en famille, il vous faut suivre cette démarche :</p>
    
    <ol>
    <li>Créer un compte sur https://1v.parlemonde.org/inscription, en renseignant une adresse email et un mot de passe.</li>
    <li>Confirmez votre adresse mail en cliquant sur le lien envoyé</li>
    <li>Connectez-vous sur https://1v.parlemonde.org/inscription et rattachez votre compte à l’identifiant unique <strong>%identifiant</strong></li>
    </ol>
    
    <p>Jusqu’à 5 personnes de votre famille peuvent créer un compte et le rattacher à l’identifiant unique de votre enfant.
    </br>
    </br>
    Bonne journée</p>
    `,
    );

    const print = () => {
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
                activeStep={3}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2">{t('Communiquez les identifiants aux familles')}</Title>
            <p>{t('Voici un modèle de texte de présentation à partager aux familles. Vous pouvez le modifier et le traduire librement !')}</p>
            <br />
            <p>
                {t.rich(
                    'Attention à ne pas changer ou supprimer le "code enfant" <strong>%code</strong> qui se crée automatiquement pour chaque enfant.',
                    {
                        strong: (chunks) => <strong>{chunks}</strong>,
                    },
                )}
            </p>
            <HtmlEditor content={content} onChange={setContent} />
            <div className={styles.printButtonContainer}>
                <Button label={t('Imprimer')} color="secondary" variant="contained" onClick={print} />
            </div>
            <div className={styles.buttonsContainer}>
                <Button as="a" href="/familles/1" color="primary" label={tCommon('Étape précédente')} rightIcon={<ChevronLeftIcon />} />
                <Button as="a" href="/familles/3" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
