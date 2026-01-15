'use client';

import { MASCOT_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-sa-mascotte/validators';
import { ActivityStepPreview } from '@frontend/components/activities/ActivityStepPreview';
import { Button } from '@frontend/components/ui/Button';
import { Loader } from '@frontend/components/ui/Loader';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import { COUNTRIES } from '@lib/iso-3166-countries-french';
import { CURRENCIES } from '@lib/iso-4217-currencies-french';
import { LANGUAGES } from '@lib/iso-639-languages-french';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerSaMascotteStep5() {
    const t = useExtracted('app.(1village).(activities).creer-sa-mascotte.5');
    const tCommon = useExtracted('common');
    const router = useRouter();
    const { activity, onPublishActivity, onUpdateActivity } = useContext(ActivityContext);
    const { classroom, setClassroom } = useContext(UserContext);

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!activity || activity.type !== 'mascotte') {
        return null;
    }

    const isValid =
        MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) &&
        MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) &&
        MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) &&
        MASCOT_STEPS_VALIDATORS.isStep4Valid(activity);

    const onSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (activity.publishDate) {
                await onUpdateActivity();
            } else {
                await onPublishActivity();
            }

            const { data: updatedClassroom, error } = await updateClassroom({
                id: classroom?.id,
                alias: activity?.data?.classroom?.alias,
                avatarUrl: activity?.data?.mascot?.imageUrl,
                mascotteId: activity?.id,
            });
            if (error) {
                console.error(error);
                return;
            }
            setClassroom(updatedClassroom?.[0]);
            router.push('/creer-sa-mascotte/success');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageContainer>
            <Steps
                steps={[
                    {
                        label: t('Votre classe'),
                        href: '/creer-sa-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || t('Votre mascotte'),
                        href: '/creer-sa-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Langues et monnaies'),
                        href: '/creer-sa-mascotte/3',
                        status: MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: t('Le web de Pélico'),
                        href: '/creer-sa-mascotte/4',
                        status: MASCOT_STEPS_VALIDATORS.isStep4Valid(activity) ? 'success' : 'warning',
                    },
                    { label: tCommon('Pré-visualiser'), href: '/creer-sa-mascotte/5' },
                ]}
                activeStep={5}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Pré-visualisez votre mascotte et publiez-la')}
            </Title>
            <p>{t('Relisez votre publication une dernière fois avant de la publier !')}</p>
            <ActivityStepPreview
                stepName={t('Votre classe')}
                href="/creer-sa-mascotte/1"
                status={MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <p>
                    {t('Nous sommes')} {classroom?.name}.
                </p>
                <p>
                    {t('Nous sommes {studentsCount} élèves, dont {girlsCount} {girls} et {boysCount} {boys}.', {
                        studentsCount: `${activity?.data?.classroom?.students?.totalCount}`,
                        girlsCount: `${activity?.data?.classroom?.students?.femalesCount}`,
                        girls: activity?.data?.classroom?.students?.femalesCount === 1 ? t('fille') : t('filles'),
                        boysCount: `${activity?.data?.classroom?.students?.malesCount}`,
                        boys: activity?.data?.classroom?.students?.malesCount === 1 ? t('garçon') : t('garcons'),
                    })}
                </p>
                <p>
                    {t("En moyenne, l'âge des enfants de notre classe est {age} ans.", {
                        age: `${activity?.data?.classroom?.students?.meanAge}`,
                    })}
                </p>
                <p>
                    {t('Nous avons {teacherCount} {teacher}, dont {womanCount} {woman} et {manCount} {man}.', {
                        teacherCount: `${activity?.data?.classroom?.teachers?.totalCount}`,
                        teacher: activity?.data?.classroom?.teachers?.totalCount === 1 ? t('professeur') : t('professeurs'),
                        womanCount: `${activity?.data?.classroom?.teachers?.femalesCount}`,
                        woman: activity?.data?.classroom?.teachers?.femalesCount === 1 ? t('femme') : t('femmes'),
                        manCount: `${activity?.data?.classroom?.teachers?.malesCount}`,
                        man: activity?.data?.classroom?.teachers?.malesCount === 1 ? t('homme') : t('hommes'),
                    })}
                </p>
                <p>
                    {t('Dans notre école, il y a {classroomsCount} {classrooms} et {studentsCount} élèves.', {
                        classroomsCount: `${activity?.data?.classroom?.school?.classroomsCount}`,
                        classrooms: activity?.data?.classroom?.school?.classroomsCount === 1 ? t('classe') : t('classes'),
                        studentsCount: `${activity?.data?.classroom?.school?.studentsCount}`,
                    })}
                </p>
                {activity.data?.classroom?.imageUrl && (
                    <div className={styles.imageContainer}>
                        <Image
                            width={0}
                            height={0}
                            src={activity.data?.classroom?.imageUrl}
                            alt={t('Notre classe')}
                            sizes="600px"
                            style={{ objectFit: 'cover', width: '600px', height: 'auto', margin: '16px 0' }}
                        />
                    </div>
                )}
                <p>{activity.data?.mascot?.description}</p>
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Votre mascotte')}
                href="/creer-sa-mascotte/2"
                status={MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <div className={styles.mascotStepContainer}>
                    <div className={styles.left}>
                        {activity.data?.mascot?.imageUrl && (
                            <Image
                                src={activity.data?.mascot?.imageUrl}
                                alt={t('Notre mascotte')}
                                width={150}
                                height={150}
                                style={{ objectFit: 'cover', borderRadius: '50%' }}
                            />
                        )}
                    </div>
                    <div className={styles.right}>
                        <p>
                            {t("Notre mascotte s'appelle {mascotName}, elle nous représente.", {
                                mascotName: activity.data?.mascot?.name || '',
                            })}
                        </p>
                        <p>{activity.data?.mascot?.description}</p>
                        <p>
                            {activity.data?.mascot?.name} {t('est')} {activity.data?.mascot?.personalityTraits?.[0]},{' '}
                            {activity.data?.mascot?.personalityTraits?.[1]} {t('et')} {activity.data?.mascot?.personalityTraits?.[2]}.
                        </p>
                        <p>
                            {t("Notre mascotte rêve d'aller dans ces pays :")}{' '}
                            {activity.data?.mascot?.favoriteCountries?.map((country) => COUNTRIES[country]).join(', ')}.
                        </p>
                        <p>
                            {t('Notre mascotte joue {favoriteGame} et pratique {favoriteSport}.', {
                                favoriteGame: activity.data?.mascot?.favoriteGame || '',
                                favoriteSport: activity.data?.mascot?.favoriteSport || '',
                            })}
                        </p>
                    </div>
                </div>
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName={t('Langues et monnaies')}
                href="/creer-sa-mascotte/3"
                status={MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <p>
                    {t('Tous les enfants de notre classe parlent :')}{' '}
                    {activity.data?.languages?.spokenByAll?.map((language) => LANGUAGES[language]).join(', ')}.
                </p>
                <p>
                    {t('Au moins un enfant de notre classe parle :')}{' '}
                    {activity.data?.languages?.spokenBySome?.map((language) => LANGUAGES[language]).join(', ')}.
                </p>
                <p>
                    {activity?.data?.mascot?.name}, {t('comme tous les enfants de notre classe, apprend :')}{' '}
                    {activity.data?.languages?.taught?.map((language) => LANGUAGES[language]).join(', ')}.
                </p>
                <p>
                    {t('Nous utilisons comme monnaie :')} {activity.data?.languages?.currencies?.map((currency) => CURRENCIES[currency]).join(', ')}.
                </p>
            </ActivityStepPreview>
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/creer-sa-mascotte/3"
                    color="primary"
                    variant="outlined"
                    label={tCommon('Étape précédente')}
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    color="primary"
                    variant="contained"
                    label={activity.publishDate ? tCommon('Modifier') : tCommon('Publier')}
                    disabled={!isValid}
                    onClick={onSubmit}
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
