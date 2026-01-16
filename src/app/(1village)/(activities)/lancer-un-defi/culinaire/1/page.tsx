'use client';

import { culinaryChallengeHelpers, isCulinaryChallenge } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/helpers';
import { CULINARY_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/validators';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input, TextArea } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon, PlusIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiCulinaireStep1() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.culinaire.1');
    const tCommon = useExtracted('app.(1village).(activities).common');

    const router = useRouter();

    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    const [isOpen, setIsOpen] = useState(false);

    if (!activity || !isCulinaryChallenge(activity)) {
        return null;
    }

    const { setDish } = culinaryChallengeHelpers(activity, setActivity);

    return (
        <>
            <PageContainer>
                <BackButton href="/lancer-un-defi" label="Retour" />
                <Steps
                    steps={[
                        { label: t('Votre  plat'), href: '/lancer-un-defi/culinaire/1' },
                        { label: t('La recette'), href: '/lancer-un-defi/culinaire/2' },
                        { label: t('Le défi'), href: '/lancer-un-defi/culinaire/3' },
                        { label: t('Pré-visualiser'), href: '/lancer-un-defi/culinaire/4' },
                    ]}
                    activeStep={1}
                    marginTop="xl"
                    marginBottom="md"
                />
                <Title variant="h2" marginBottom="md">
                    {t('Quel est le plat que vous avez choisi ?')}
                </Title>
                <div className={styles.imageUploadForm}>
                    <div className={styles.imagePreview}>
                        {activity.data.dish?.imageUrl ? (
                            <Image
                                className={styles.image}
                                src={activity.data.dish.imageUrl}
                                unoptimized={activity.data.dish?.imageUrl.startsWith('https')}
                                alt="Placeholder"
                                width={200}
                                height={200}
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
                            marginBottom="md"
                            input={
                                <Input isFullWidth type="text" value={activity.data.dish?.name} onChange={(e) => setDish('name', e.target.value)} />
                            }
                        />
                        <Field
                            label={t("Quelle est l'histoire de ce plat ?")}
                            marginBottom="md"
                            input={
                                <TextArea
                                    isFullWidth
                                    value={activity.data.dish?.description}
                                    onChange={(e) => setDish('description', e.target.value)}
                                />
                            }
                        />
                        <Field
                            label={t('Pourquoi avoir choisi ce plat ?')}
                            marginBottom="md"
                            input={<TextArea isFullWidth value={activity.data.dish?.history} onChange={(e) => setDish('history', e.target.value)} />}
                        />
                    </div>
                </div>
                <div className={styles.button}>
                    <Button
                        disabled={!CULINARY_CHALLENGE_VALIDATORS.isStep1Valid(activity)}
                        onClick={() => router.push('/lancer-un-defi/culinaire/2')}
                        color="primary"
                        label={tCommon('Étape suivante')}
                        rightIcon={<ChevronRightIcon />}
                    />
                </div>
            </PageContainer>
            <UploadImageModal
                getActivityId={getOrCreateDraft}
                isOpen={isOpen}
                onNewImage={(imageUrl) => setDish('imageUrl', imageUrl)}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
