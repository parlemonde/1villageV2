'use client';

import { useDefaultReports } from '@app/(1village)/(activities)/creer-un-reportage/page';
import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { VillageContext } from '@frontend/contexts/villageContext';
import PelicoSearch from '@frontend/svg/pelico/pelico-search.svg';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { Activity } from '@server/database/schemas/activities';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';
import useSWR from 'swr';

const CUSTOM_REPORT_VALUE = '__CUSTOM_REPORT__';

export default function CreerUnReportageStep1() {
    const t = useExtracted('app.(1village).(activities).creer-un-reportage.1');
    const tCommon = useExtracted('common');

    const { activity, setActivity } = useContext(ActivityContext);
    const { village, usersMap, classroomsMap } = useContext(VillageContext);

    const reports = useDefaultReports();

    const { data: allActivities = [] } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({ villageId: village.id, countries: village.countries, isPelico: true, type: ['reportage'] })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    if (!activity || activity.type !== 'reportage') {
        return null;
    }

    const defaultReport = activity.data?.defaultReport;
    const useCustomReport = !defaultReport;
    const report = useCustomReport ? activity.data?.customReport : defaultReport;
    const activities = allActivities.filter((a) => a.type === 'reportage' && a.data?.defaultReport === activity.data?.defaultReport);

    const selectOptions = reports.map((report) => ({ label: report.name, value: report.name }));
    if (defaultReport && !selectOptions.some((option) => option.value === defaultReport)) {
        selectOptions.push({ label: defaultReport, value: defaultReport });
    }
    selectOptions.push({ label: t('Autre thème'), value: CUSTOM_REPORT_VALUE });

    return (
        <PageContainer>
            <BackButton href="/creer-un-reportage" label="Retour" />
            <Steps
                steps={[
                    { label: t('Reportage'), href: '/creer-un-reportage/1' },
                    { label: t('Créer le reportage'), href: '/creer-un-reportage/2' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-un-reportage/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Reportage choisi :
            </Title>
            <Select
                options={selectOptions}
                value={activity.data?.defaultReport || CUSTOM_REPORT_VALUE}
                onChange={(value) => {
                    if (value == CUSTOM_REPORT_VALUE) {
                        setActivity({ type: 'reportage', ...activity, data: { ...activity.data, defaultReport: undefined, customReport: '' } });
                    } else {
                        setActivity({ type: 'reportage', ...activity, data: { ...activity.data, defaultReport: value } });
                    }
                }}
            />
            <Title variant="h2" marginTop="lg" marginBottom="md">
                {useCustomReport ? t('Présenter un autre type de reportage') : t('Indices des pélicopains sur ce thème')} :
            </Title>
            {useCustomReport ? (
                <>
                    <p>{t('Indiquez quel autre type de reportage vous souhaitez présenter')} :</p>
                    <Input
                        placeholder={t('Nos monuments')}
                        isFullWidth
                        marginY="md"
                        value={activity.data?.customReport || ''}
                        onChange={(e) => {
                            setActivity({ type: 'reportage', ...activity, data: { ...activity.data, customReport: e.target.value } });
                        }}
                    />
                </>
            ) : (
                <>
                    {activities.map((activity) => (
                        <ActivityCard
                            key={activity.id}
                            activity={activity}
                            user={usersMap[activity.userId]}
                            classroom={activity.classroomId ? classroomsMap[activity.classroomId] : undefined}
                        />
                    ))}
                    {activities.length === 0 && (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                marginBottom: '32px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed var(--grey-300)',
                                padding: '32px',
                                borderRadius: '4px',
                            }}
                        >
                            <PelicoSearch style={{ width: '100px', height: 'auto' }} />
                            <p>
                                {t('Aucun reportage trouvé pour le thème')} <strong>{report}</strong>
                            </p>
                        </div>
                    )}
                </>
            )}
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-un-reportage/2" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
