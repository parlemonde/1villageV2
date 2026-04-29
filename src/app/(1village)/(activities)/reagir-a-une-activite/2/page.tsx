'use client';
import { isReactionStep1Valid, isReactionStep2Valid } from '@app/(1village)/(activities)/reagir-a-une-activite/validators';
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

export default function ReagirAUneActiviteStep2() {
    const t = useExtracted('app.(1village).(activities).reagir-a-une-activite.2');
    const tCommon = useExtracted('common');
    const { activity, setActivity } = useContext(ActivityContext);
    const router = useRouter();

    const { getOrCreateDraft } = useContext(ActivityContext);

    if (!activity || activity.type !== 'reaction') {
        return null;
    }

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Activité'), href: '/reagir-a-une-activite/1', status: isReactionStep1Valid(activity) ? 'success' : 'warning' },
                    { label: t('Réaction'), href: '/reagir-a-une-activite/2' },
                    { label: t('Pré-visualiser'), href: '/reagir-a-une-activite/3' },
                ]}
                activeStep={2}
                marginBottom="xl"
            />
            <Title variant="h2" marginBottom="md">
                {t("Réagissez à l'activité sélectionnée")}
            </Title>
            <ContentEditor
                getActivityId={getOrCreateDraft}
                content={activity?.data?.content}
                setContent={(content) => setActivity({ ...activity, data: { ...activity.data, content } })}
            />
            <div className={styles.buttons}>
                <Button color="primary" as="a" href="/reagir-a-une-activite/1" label={tCommon('Étape precedente')} leftIcon={<ChevronLeftIcon />} />
                <Button
                    color="primary"
                    label={tCommon('Étape suivante')}
                    onClick={() => router.push('/reagir-a-une-activite/3')}
                    rightIcon={<ChevronRightIcon />}
                    disabled={!isReactionStep2Valid(activity)}
                />
            </div>
        </PageContainer>
    );
}
