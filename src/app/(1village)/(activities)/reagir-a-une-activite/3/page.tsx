'use client';

import { isReactionFormValid, isReactionStep1Valid, isReactionStep2Valid } from '@app/(1village)/(activities)/reagir-a-une-activite/validators';
import { sendToast } from '@frontend/components/Toasts';
import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { ContentViewer } from '@frontend/components/content/ContentViewer';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';
import useSWR from 'swr';

import styles from './page.module.css';

export default function ReagirAUneActiviteStep3() {
    const t = useExtracted('app.(1village).(activities).reagir-a-une-activite.3');
    const tCommon = useExtracted('common');

    const { activity, onUpdateActivity, onPublishActivity } = useContext(ActivityContext);
    const { usersMap, classroomsMap } = useContext(VillageContext);

    const router = useRouter();

    const activityData = activity?.type === 'reaction' ? activity.data : undefined;
    const { data: activityBeingReacted } = useSWR<Activity>(
        activityData ? `/api/activities${serializeToQueryUrl({ activityId: activityData.activityId })}` : null,
        jsonFetcher,
    );

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || activity.type !== 'reaction') {
        return null;
    }

    const onSubmit = () => {
        setIsSubmitting(true);
        try {
            if (activity.publishDate) {
                onUpdateActivity();
            } else {
                onPublishActivity();
            }
            router.push('/reagir-a-une-activite/success');
        } catch {
            sendToast({
                type: 'error',
                message: t('Une erreur est survenue lors de la publication de votre réaction'),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!activity || activity.type !== 'reaction') {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Activité'), href: '/reagir-a-une-activite/1', status: isReactionStep1Valid(activity) ? 'success' : 'warning' },
                    { label: t('Réaction'), href: '/reagir-a-une-activite/2', status: isReactionStep2Valid(activity) ? 'success' : 'warning' },
                    { label: t('Pré-visualiser'), href: '/reagir-a-une-activite/3' },
                ]}
                activeStep={2}
                marginBottom="xl"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre réaction et publiez-la')}
            </Title>
            <p>
                {t(
                    'Voici la pré-visualisation de votre réaction. Vous pouvez la modifier, et quand vous êtes prêts : publiez-la dans votre village-monde !',
                )}
            </p>
            <ActivityStepPreview
                stepName={t('En réaction à cette')}
                href={'/reagir-a-une-activite/1'}
                status={isReactionStep1Valid(activity) ? 'success' : 'warning'}
            >
                {activityBeingReacted && (
                    <div className={styles.marginTopLg}>
                        <ActivityCard
                            activity={activityBeingReacted}
                            user={usersMap[activityBeingReacted.userId]}
                            classroom={activityBeingReacted.classroomId ? classroomsMap[activityBeingReacted.classroomId] : undefined}
                        />
                    </div>
                )}
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Contenu de votre réaction')}
                href={'/reagir-a-une-activite/2'}
                status={isReactionStep2Valid(activity) ? 'success' : 'warning'}
            >
                <ContentViewer content={activity.data?.content} />
            </ActivityStepPreview>
            <div className={styles.buttons}>
                <Button color="primary" as="a" href="/reagir-a-une-activite/2" label={tCommon('Étape precedente')} leftIcon={<ChevronLeftIcon />} />
                <Button color="primary" label={tCommon('Publier')} variant="contained" disabled={!isReactionFormValid(activity)} onClick={onSubmit} />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
