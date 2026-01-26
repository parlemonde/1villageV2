'use client';

import { DEFAULT_HINTS } from '@app/(1village)/(activities)/creer-un-indice/page';
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
import { useContext } from 'react';
import useSWR from 'swr';

const CUSTOM_HINT_VALUE = '__CUSTOM_HINT__';

export default function CreerUnIndiceStep1() {
    const { activity, setActivity } = useContext(ActivityContext);
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const { data: allActivities = [] } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  countries: village.countries,
                  isPelico: true,
                  type: ['indice'],
              })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    if (!activity || activity.type !== 'indice') {
        return null;
    }

    const defaultHint = activity.data?.defaultHint;
    const useCustomHint = !defaultHint;
    // For display purposes, we need a string label
    const hintLabel = useCustomHint ? 'Indice personnalisé' : defaultHint;
    const activities = allActivities.filter((a) => a.type === 'indice' && a.data?.defaultHint === activity.data?.defaultHint);

    const selectOptions = DEFAULT_HINTS.map((hint) => ({ label: hint.name, value: hint.name }));
    if (defaultHint && !selectOptions.some((option) => option.value === defaultHint)) {
        selectOptions.push({ label: defaultHint, value: defaultHint });
    }
    selectOptions.push({ label: 'Autre thème', value: CUSTOM_HINT_VALUE });

    return (
        <PageContainer>
            <BackButton href="/creer-un-indice" label="Retour" />
            <Steps
                steps={[
                    { label: hintLabel || 'Indice', href: '/creer-un-indice/1' },
                    { label: "Créer l'indice", href: '/creer-un-indice/2' },
                    { label: 'Pré-visualiser', href: '/creer-un-indice/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Indice choisi :{' '}
            </Title>
            <Select
                options={selectOptions}
                value={activity.data?.defaultHint || CUSTOM_HINT_VALUE}
                onChange={(newValue) => {
                    if (newValue === CUSTOM_HINT_VALUE) {
                        setActivity({
                            data: {
                                content: activity.data?.content ?? [],
                                defaultHint: '',
                                customHint: '',
                            },
                        });
                    } else {
                        setActivity({
                            data: {
                                content: activity.data?.content ?? [],
                                defaultHint: newValue,
                                customHint: activity.data?.customHint ?? '',
                            },
                        });
                    }
                }}
            />
            <Title variant="h2" marginTop="lg" marginBottom="md">
                {useCustomHint ? "Présenter un autre type d'indice :" : <>Indices des pélicopains sur ce thème :</>}
            </Title>
            {useCustomHint ? (
                <>
                    <p>Indiquez quel autre type d&apos;indice vous souhaitez présenter :</p>
                    <Input
                        placeholder="Nos monuments"
                        isFullWidth
                        marginY="md"
                        value={activity.data?.customHint || ''}
                        onChange={(e) => {
                            setActivity({
                                data: {
                                    content: activity.data?.content ?? [],
                                    defaultHint: activity.data?.defaultHint ?? '',
                                    customHint: e.target.value,
                                },
                            });
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
                                Aucun indice trouvé pour le thème <strong>{hintLabel}</strong>.
                            </p>
                        </div>
                    )}
                </>
            )}
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-un-indice/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
}
