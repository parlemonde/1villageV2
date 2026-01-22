'use client';

import {
    useEnigmeThemes,
    useEnigmeSubthemes,
    useGetStepThemeName,
    CUSTOM_THEME_VALUE,
    type ThemeName,
    type SubThemeItem,
} from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
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
import { useExtracted } from 'next-intl';
import { useContext } from 'react';
import useSWR from 'swr';

export default function CreerUneEnigmeStep1() {
    const DEFAULT_THEMES = useEnigmeThemes();
    const DEFAULT_SUBTHEMES = useEnigmeSubthemes();
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

    const defaultTheme: ThemeName = activity?.data?.defaultTheme || CUSTOM_THEME_VALUE;
    const activities = allActivities.filter((a) => a.type === 'enigme' && a.data?.defaultTheme === activity?.data?.defaultTheme);
    const selectOptions = DEFAULT_THEMES.map((theme) => ({ label: theme.tname, value: theme.name }));
    const subthemes: SubThemeItem[] = DEFAULT_SUBTHEMES[defaultTheme] || [];

    const customTheme = activity?.data?.customTheme;
    const stepTheme = useGetStepThemeName(defaultTheme, customTheme);
    const tCommon = useExtracted('common');

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    return (
        <PageContainer>
            <BackButton href="/creer-une-enigme" label="Retour" />
            <Steps
                steps={[
                    { label: stepTheme || 'Énigme', href: '/creer-une-enigme/1' },
                    { label: "Créer l'énigme", href: '/creer-une-enigme/2' },
                    { label: 'Réponse', href: '/creer-une-enigme/3' },
                    { label: tCommon('Pré-visualiser'), href: '/creer-une-enigme/4' },
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
                value={activity.data?.defaultTheme || CUSTOM_THEME_VALUE}
                onChange={(newValue) => {
                    // changing theme resets customTheme
                    if (newValue === CUSTOM_THEME_VALUE) {
                        setActivity({
                            type: 'enigme',
                            ...activity,
                            data: { ...activity.data, defaultTheme: CUSTOM_THEME_VALUE, customTheme: undefined },
                        });
                    } else {
                        setActivity({ type: 'enigme', ...activity, data: { ...activity.data, defaultTheme: newValue, customTheme: undefined } });
                    }
                }}
            />
            {defaultTheme === CUSTOM_THEME_VALUE ? (
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
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            as="a"
                            href="/creer-une-enigme/2"
                            color="secondary"
                            label={tCommon('Continuez')}
                            rightIcon={<ChevronRightIcon />}
                        ></Button>
                    </div>
                </>
            ) : (
                <>
                    <Title variant="h2" marginTop="lg" marginBottom="md">
                        Veuillez préciser le thème <strong>{stepTheme}</strong>.
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
                                        <p>Autre type dans le thème : {stepTheme}</p>
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
                            Aucune énigme trouvée pour le thème <strong>{stepTheme}</strong>.
                        </p>
                    </div>
                )}
            </>
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-une-enigme/2" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
}
