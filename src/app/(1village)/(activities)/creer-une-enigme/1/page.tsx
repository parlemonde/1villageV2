'use client';

import ExampleActivities from '@app/(1village)/(activities)/creer-une-enigme/ExampleActivities';
import {
    useEnigmeThemes,
    useEnigmeSubthemes,
    useGetStepThemeName,
    CUSTOM_THEME_VALUE,
    type ThemeName,
    type SubThemeItem,
} from '@app/(1village)/(activities)/creer-une-enigme/enigme-constants';
import { ThemeSelectorButton } from '@frontend/components/ThemeSelectorButton/ThemeSelectorButton';
import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Form';
import { Select } from '@frontend/components/ui/Form/Select';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

export default function CreerUneEnigmeStep1() {
    const DEFAULT_THEMES = useEnigmeThemes();
    const DEFAULT_SUBTHEMES = useEnigmeSubthemes();
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);
    const tCommon = useExtracted('common');

    const defaultTheme: ThemeName = (activity?.type === 'enigme' ? activity.data?.defaultTheme : undefined) || CUSTOM_THEME_VALUE;
    const subthemes: SubThemeItem[] = DEFAULT_SUBTHEMES[defaultTheme] || [];
    const customTheme = activity?.type === 'enigme' ? activity.data?.customTheme : undefined;
    const stepTheme = useGetStepThemeName(defaultTheme, customTheme);

    if (!activity || activity.type !== 'enigme') {
        return null;
    }

    const selectOptions = DEFAULT_THEMES.map((theme) => ({ label: theme.tname, value: theme.name }));

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
                    const themeValue = newValue as ThemeName;
                    if (themeValue === CUSTOM_THEME_VALUE) {
                        setActivity({
                            type: 'enigme',
                            ...activity,
                            data: { ...activity.data, defaultTheme: CUSTOM_THEME_VALUE, customTheme: undefined },
                        });
                    } else {
                        setActivity({ type: 'enigme', ...activity, data: { ...activity.data, defaultTheme: themeValue, customTheme: undefined } });
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
                        Veuillez préciser le thème <strong>{defaultTheme}</strong>.
                    </Title>
                    {subthemes.length > 0 &&
                        subthemes.map((subtheme: SubThemeItem, index: number) => (
                            <ThemeSelectorButton
                                key={`subtheme-button-${index}`}
                                title={subtheme.tname}
                                marginBottom="lg"
                                paddingX="md"
                                paddingY="sm"
                                onClick={() => {
                                    setActivity({
                                        type: 'enigme',
                                        ...activity,
                                        data: { ...activity.data, customTheme: subtheme.name }, // use customTheme to store subtheme
                                    });
                                    router.push('/creer-une-enigme/2');
                                }}
                            />
                        ))}
                    <ThemeSelectorButton
                        title={tCommon('Autre...')}
                        onClick={() => {}}
                        paddingX="md"
                        paddingY="sm"
                        dropdownContent={
                            <>
                                <p>Autre type dans le thème : {defaultTheme}</p>
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
                        }
                    />
                </>
            )}

            <ExampleActivities activityType="enigme" theme={activity.data?.defaultTheme} />

            <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <Button as="a" href="/creer-une-enigme/2" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />}></Button>
            </div>
        </PageContainer>
    );
}
