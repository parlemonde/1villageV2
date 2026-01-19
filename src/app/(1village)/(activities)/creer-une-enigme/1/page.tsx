'use client';

import { useTranslatableThemes, useTranslatableSubthemes, type SubThemeItem } from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import { ActivityCard } from '@frontend/components/activities/ActivityCard';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Accordion } from '@frontend/components/ui/Accordion';
import { Button } from '@frontend/components/ui/Button';
import buttonStyles from '@frontend/components/ui/Button/button.module.css';
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
import classNames from 'clsx';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import useSWR from 'swr';

const CUSTOM_PUZZLE_VALUE = 'Autre thème';

export default function CreerUneEnigmeStep1() {
    const { DEFAULT_THEMES } = useTranslatableThemes();
    const DEFAULT_SUBTHEMES = useTranslatableSubthemes();
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);
    const { village, usersMap, classroomsMap } = useContext(VillageContext);
    const { data: allActivities = [] } = useSWR<Activity[]>(
        village
            ? `/api/activities${serializeToQueryUrl({
                  villageId: village.id,
                  countries: village.countries,
                  isPelico: true,
                  type: ['enigme'],
              })}`
            : null,
        jsonFetcher,
        {
            keepPreviousData: true,
        },
    );

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const defaultTheme = activity.data?.defaultTheme;
    const useCustomTheme = defaultTheme === CUSTOM_PUZZLE_VALUE;
    const themeName = activity.data?.customTheme || defaultTheme;
    const activities = allActivities.filter((a) => a.type === 'enigme' && a.data?.defaultTheme === activity.data?.defaultTheme);

    const selectOptions = DEFAULT_THEMES.map((puzzle) => ({ label: puzzle.tname, value: puzzle.name }));
    if (defaultTheme && !selectOptions.some((option) => option.value === defaultTheme)) {
        selectOptions.push({ label: defaultTheme, value: defaultTheme });
    }
    // selectOptions.push({ label: 'Autre thème', value: CUSTOM_PUZZLE_VALUE });
    // selectOptions.push({ label: t('Autre thème'), value: CUSTOM_PUZZLE_VALUE });

    const subthemes = (defaultTheme && DEFAULT_SUBTHEMES[defaultTheme]) || [];

    return (
        <PageContainer>
            <BackButton href="/creer-une-enigme" label="Retour" />
            <Steps
                steps={[
                    { label: themeName || 'Énigme', href: '/creer-une-enigme/1' },
                    { label: "Créer l'énigme", href: '/creer-une-enigme/2' },
                    { label: 'Réponse', href: '/creer-une-enigme/3' },
                    { label: 'Pré-visualiser', href: '/creer-une-enigme/4' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Énigme choisie :{' '}
            </Title>
            <Select
                options={selectOptions}
                value={activity.data?.defaultTheme || CUSTOM_PUZZLE_VALUE}
                onChange={(newValue) => {
                    // changing theme resets customTheme
                    if (newValue === CUSTOM_PUZZLE_VALUE) {
                        setActivity({ type: 'enigme', ...activity, data: { ...activity.data, defaultTheme: CUSTOM_PUZZLE_VALUE, customTheme: '' } });
                    } else {
                        setActivity({ type: 'enigme', ...activity, data: { ...activity.data, defaultTheme: newValue, customTheme: '' } });
                    }
                }}
            />
            {useCustomTheme ? (
                <>
                    <Title variant="h2" marginTop="lg" marginBottom="md">
                        {"Présenter un autre type d'énigme :"}
                    </Title>
                    <p>Indiquez quel autre type d&apos;énigme vous souhaitez présenter :</p>
                    <Input
                        placeholder="Devinez..."
                        isFullWidth
                        marginY="md"
                        value={activity.data?.customTheme || ''}
                        onChange={(e) => {
                            setActivity({ type: 'enigme', ...activity, data: { ...activity.data, customTheme: e.target.value } });
                        }}
                    />
                </>
            ) : (
                <>
                    <Title variant="h2" marginTop="lg" marginBottom="md">
                        Veuillez préciser le thème <strong>{themeName}</strong>.
                    </Title>
                    {subthemes.length > 0 &&
                        subthemes.map((subtheme: SubThemeItem, index: number) => (
                            <Button
                                key={`subtheme-button-${index}`}
                                isFullWidth
                                color="primary"
                                variant="outlined"
                                marginBottom="sm"
                                label={subtheme.tname}
                                value={subtheme.name}
                                onClick={(e) => {
                                    setActivity({
                                        type: 'enigme',
                                        ...activity,
                                        data: { ...activity.data, customTheme: e.currentTarget.value }, // use customTheme to store subtheme
                                    });
                                    router.push('/creer-une-enigme/2');
                                }}
                            />
                        ))}
                    <Accordion
                        items={[
                            {
                                title: {
                                    text: `Autre...`,
                                    className: classNames(
                                        buttonStyles['button'],
                                        buttonStyles['isFullWidth'],
                                        buttonStyles['isUpperCase'],
                                        buttonStyles['color-primary'],
                                        buttonStyles['variant-outlined'],
                                        buttonStyles['size-md'],
                                    ),
                                    style: { display: 'flex', justifyContent: 'center' },
                                },
                                content: (
                                    <>
                                        <p>Autre type dans le thème : {themeName}</p>
                                        <Input
                                            placeholder=""
                                            isFullWidth
                                            marginY="md"
                                            value={activity.data?.customTheme || ''}
                                            onChange={(e) => {
                                                setActivity({ type: 'enigme', ...activity, data: { ...activity.data, customTheme: e.target.value } });
                                            }}
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <Button
                                                as="a"
                                                href="/creer-une-enigme/2"
                                                color="secondary"
                                                label="Continuez"
                                                rightIcon={<ChevronRightIcon />}
                                            ></Button>
                                        </div>
                                    </>
                                ),
                            },
                        ]}
                    />
                </>
            )}
            <Title variant="h2" marginTop={60} marginBottom="md">
                {<span>Énigmes des pélicopains sur ce thème :</span>}
            </Title>
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
                            Aucune énigme trouvée pour le thème <strong>{themeName}</strong>.
                        </p>
                    </div>
                )}
            </>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-une-enigme/2" color="primary" label="Étape suivante" rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
}
