'use client';

import { isEcologicalChallenge } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/helpers';
import { ECOLOGICAL_CHALLENGE_VALIDATORS } from '@app/(1village)/(activities)/lancer-un-defi/ecologique/validators';
import { ContentEditor } from '@frontend/components/content/ContentEditor';
import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function LancerUnDefiEcologiqueStep2() {
    const t = useExtracted('app.(1village).(activities).lancer-un-defi.ecologique.2');
    const tCommon = useExtracted('common');

    const router = useRouter();

    const { activity, getOrCreateDraft, setActivity } = useContext(ActivityContext);

    if (!activity || !isEcologicalChallenge(activity)) {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre geste pour la planète'),
                        href: '/lancer-un-defi/ecologique/1',
                        status: ECOLOGICAL_CHALLENGE_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    { label: t("Description de l'action"), href: '/lancer-un-defi/ecologique/2' },
                    { label: t('Le défi'), href: '/lancer-un-defi/ecologique/3' },
                    { label: tCommon('Pré-visualiser'), href: '/lancer-un-defi/ecologique/4' },
                ]}
                activeStep={2}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t("Expliquez aux pélicopains votre action et pourquoi vous l'avez choisie.")}
            </Title>
            <ContentEditor
                content={activity?.data?.content}
                getActivityId={getOrCreateDraft}
                setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
            />
            <div className={styles.buttons}>
                <Button as="a" href="/lancer-un-defi/ecologique/1" color="primary" label={tCommon('Étape suivante')} leftIcon={<ChevronLeftIcon />} />
                <Button onClick={() => router.push('/lancer-un-defi/ecologique/3')} color="primary" label={tCommon('Étape suivante')} />
            </div>
        </PageContainer>
    );
}
