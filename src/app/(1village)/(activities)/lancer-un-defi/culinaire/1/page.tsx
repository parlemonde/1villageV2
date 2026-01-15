'use client';

import { Field, Input } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { PlusIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiStep1() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.culinaire.1');
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    const [isOpen, setIsOpen] = useState(false);

    if (!activity || activity.type !== 'defi' || activity.data?.theme !== 'culinaire') {
        return null;
    }

    return (
        <>
            <PageContainer title="Culinaire">
                <Steps
                    steps={[
                        { label: 'Votre  plat', href: '/lancer-un-defi/culinaire/1' },
                        { label: 'La recette', href: '/lancer-un-defi/culinaire/2' },
                        { label: 'Le défi', href: '/lancer-un-defi/culinaire/3' },
                        { label: 'Pré-visualiser', href: '/lancer-un-defi/culinaire/4' },
                    ]}
                    activeStep={1}
                    marginTop="xl"
                    marginBottom="md"
                />
                <Title variant="h2" marginBottom="md">
                    Quel est le plat que vous avez choisi ?
                </Title>
                <div className={styles.imageUploadForm}>
                    <div className={styles.imagePreview}>
                        {activity.data.dish?.imageUrl ? (
                            <Image
                                className={styles.image}
                                src={activity.data.dish.imageUrl}
                                unoptimized={activity.data.dish?.imageUrl.startsWith('https')}
                                alt="Placeholder"
                                width={150}
                                height={150}
                                onClick={() => setIsOpen(true)}
                            />
                        ) : (
                            <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
                        )}
                        <p>{t('Image de votre affiche ou décoration')}</p>
                    </div>
                    <div className={styles.imageDescription}>
                        <Field
                            label={t('Quel est le nom du plat ?')}
                            input={<Input type="text" value={activity.data.dish?.name} onChange={(e) => ''} />}
                        />
                    </div>
                </div>
            </PageContainer>
            <UploadImageModal getActivityId={getOrCreateDraft} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
