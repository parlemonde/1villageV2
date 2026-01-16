'use client';

import { isCulinaryChallenge } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/helpers';
import { CULINARY_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/culinaire/validators';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiCulinaireStep2() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, getOrCreateDraft, setActivity } = useContext(ActivityContext);

    if (!activity || !isCulinaryChallenge(activity)) {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre  plat'),
                        href: '/lancer-un-defi/culinaire/1',
                        status: CULINARY_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t('La recette'), href: '/lancer-un-defi/culinaire/2' },
                    { label: t('Le défi'), href: '/lancer-un-defi/culinaire/3' },
                    { label: t('Pré-visualiser'), href: '/lancer-un-defi/culinaire/4' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Écrivez la recette')}
            </Title>
            <p>{t('Pensez à présenter les ingrédients, les étapes et à donner vos astuces de chef.')}</p>
            <ContentEditor
                content={activity.data?.content}
                setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content, theme: 'culinaire' } })}
                activityId={activity.id}
                getActivityId={getOrCreateDraft}
            />
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/lancer-un-defi/culinaire/1"
                    color="primary"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                ></Button>
                <Button
                    disabled={!CULINARY_CHALLENGE_VALIDATORS.isStep2Valid(activity)}
                    onClick={() => router.push('/lancer-un-defi/culinaire/3')}
                    color="primary"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                ></Button>
            </div>
        </PageContainer>
    );
}
