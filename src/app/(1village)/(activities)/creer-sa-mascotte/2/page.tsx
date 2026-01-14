'use client';

import { mascotActivityHelpers } from '@app/(1village)/(activities)/creer-sa-mascotte/helpers';
import { MASCOT_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-sa-mascotte/validators';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input, MultiSelect, TextArea } from '@frontend/components/ui/Form';
import { CountryOption } from '@frontend/components/ui/Form/CountryOption';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import PlusIcon from '@frontend/svg/plus.svg';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerSaMascotteStep2() {
    const t = useExtracted('app.(1village).(activities).creer-sa-mascotte.2');
    const tCommon = useExtracted('common');
    const router = useRouter();
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);

    const [isOpen, setIsOpen] = useState(false);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    const countriesOptions = Object.entries(COUNTRIES).map(([key, value]) => ({
        label: <CountryOption id={key} value={value} key={key} />,
        value: key,
        searchValue: value,
    }));

    const { setMascot } = mascotActivityHelpers(activity, setActivity);

    return (
        <>
            <PageContainer>
                <Steps
                    steps={[
                        {
                            label: t('Votre classe'),
                            href: '/creer-sa-mascotte/1',
                            status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                        },
                        { label: activity.data?.mascot?.name || t('Votre mascotte'), href: '/creer-sa-mascotte/2' },
                        { label: t('Langues et monnaies'), href: '/creer-sa-mascotte/3' },
                        { label: t('Le web de Pélico'), href: '/creer-sa-mascotte/4' },
                        { label: tCommon('Pré-visualiser'), href: '/creer-sa-mascotte/5' },
                    ]}
                    activeStep={2}
                    marginTop="xl"
                    marginBottom="md"
                />
                <Title variant="h2" marginBottom="md">
                    {t('Qui êtes-vous ? Choisissez une mascotte qui vous ressemble collectivement !')}
                </Title>
                <div className={styles.mascotUpload}>
                    <div className={styles.left}>
                        <div className={styles.imagePreview}>
                            {activity?.data?.mascot?.imageUrl ? (
                                <Image
                                    className={styles.image}
                                    src={activity?.data?.mascot?.imageUrl}
                                    unoptimized={activity?.data?.mascot?.imageUrl.startsWith('https')}
                                    alt="Placeholder"
                                    width={150}
                                    height={150}
                                    onClick={() => setIsOpen(true)}
                                />
                            ) : (
                                <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
                            )}
                            <p style={{ textAlign: 'center' }}>{t('Image de votre mascotte')}</p>
                        </div>
                    </div>
                    <div className={styles.right}>
                        <Field
                            marginBottom="md"
                            label={t('Nom')}
                            input={
                                <Input
                                    isFullWidth
                                    type="text"
                                    value={activity?.data?.mascot?.name || ''}
                                    onChange={(e) => {
                                        setMascot('name', e.target.value);
                                    }}
                                />
                            }
                        />
                        <Field
                            label={t("Que représente votre mascotte et pourquoi l'avoir choisie ?")}
                            input={
                                <TextArea
                                    placeholder="Description"
                                    size="md"
                                    isFullWidth
                                    value={activity?.data?.mascot?.description || ''}
                                    onChange={(e) => {
                                        setMascot('description', e.target.value);
                                    }}
                                />
                            }
                        />
                    </div>
                </div>
                <fieldset className={styles.personalityTraits}>
                    <legend>{t('3 traits de personnalité de votre mascotte')}</legend>
                    <div className={styles.row}>
                        <Input
                            type="text"
                            isFullWidth
                            value={activity?.data?.mascot?.personalityTraits?.[0] || ''}
                            onChange={(e) => {
                                const personalityTraits = [...(activity?.data?.mascot?.personalityTraits || [])];
                                personalityTraits[0] = e.target.value;
                                setMascot('personalityTraits', personalityTraits);
                            }}
                        />
                        <Input
                            type="text"
                            isFullWidth
                            value={activity?.data?.mascot?.personalityTraits?.[1] || ''}
                            onChange={(e) => {
                                const personalityTraits = [...(activity?.data?.mascot?.personalityTraits || [])];
                                personalityTraits[1] = e.target.value;
                                setMascot('personalityTraits', personalityTraits);
                            }}
                        />
                        <Input
                            type="text"
                            isFullWidth
                            value={activity?.data?.mascot?.personalityTraits?.[2] || ''}
                            onChange={(e) => {
                                const personalityTraits = [...(activity?.data?.mascot?.personalityTraits || [])];
                                personalityTraits[2] = e.target.value;
                                setMascot('personalityTraits', personalityTraits);
                            }}
                        />
                    </div>
                </fieldset>
                <Field
                    marginBottom="xl"
                    label={t('Dans quels pays rêve-t-elle de voyager ?')}
                    input={
                        <MultiSelect
                            placeholder={t('Choisir les pays')}
                            isFullWidth
                            value={activity?.data?.mascot?.favoriteCountries || []}
                            onChange={(countries) => setMascot('favoriteCountries', countries)}
                            options={countriesOptions}
                        />
                    }
                />
                <Field
                    className={styles.field}
                    marginBottom="xl"
                    label={t('À quel jeu de récréation votre mascotte joue-t-telle le plus souvent ?')}
                    input={
                        <div className={styles.line}>
                            <p>{t('Notre mascotte joue')}</p>
                            <Input
                                isFullWidth
                                type="text"
                                value={activity?.data?.mascot?.favoriteGame || ''}
                                onChange={(e) => setMascot('favoriteGame', e.target.value)}
                            />
                        </div>
                    }
                />
                <Field
                    className={styles.field}
                    marginBottom="md"
                    label={t('Quels sports pratique-t-elle le plus souvent ?')}
                    input={
                        <div className={styles.line}>
                            <p>{t('Notre mascotte pratique')}</p>
                            <Input
                                isFullWidth
                                type="text"
                                value={activity?.data?.mascot?.favoriteSport || ''}
                                onChange={(e) => setMascot('favoriteSport', e.target.value)}
                            />
                        </div>
                    }
                />
                <div className={styles.buttons}>
                    <Button
                        as="a"
                        href="/creer-sa-mascotte/1"
                        color="primary"
                        variant="outlined"
                        label={tCommon('Étape précédente')}
                        leftIcon={<ChevronLeftIcon />}
                    />
                    <Button
                        disabled={!MASCOT_STEPS_VALIDATORS.isStep2Valid(activity)}
                        onClick={() => router.push('/creer-sa-mascotte/3')}
                        color="primary"
                        variant="outlined"
                        label={tCommon('Étape suivante')}
                        rightIcon={<ChevronRightIcon />}
                    />
                </div>
            </PageContainer>
            <UploadImageModal
                getActivityId={getOrCreateDraft}
                isOpen={isOpen}
                initialImageUrl={activity?.data?.mascot?.imageUrl}
                onNewImage={(imageUrl) => setMascot('imageUrl', imageUrl)}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
