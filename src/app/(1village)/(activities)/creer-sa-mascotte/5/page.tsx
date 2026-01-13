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
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerSaMascotteStep5() {
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
                        label: 'Votre classe',
                        href: '/creer-sa-mascotte/1',
                        status: MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: activity.data?.mascot?.name || 'Votre mascotte',
                        href: '/creer-sa-mascotte/2',
                        status: MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: 'Langues et monnaies',
                        href: '/creer-sa-mascotte/3',
                        status: MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning',
                    },
                    {
                        label: 'Le web de Pélico',
                        href: '/creer-sa-mascotte/4',
                        status: MASCOT_STEPS_VALIDATORS.isStep4Valid(activity) ? 'success' : 'warning',
                    },
                    { label: 'Pré-visualiser', href: '/creer-sa-mascotte/5' },
                ]}
                activeStep={5}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                Pré-visualisez votre mascotte et publiez-la
            </Title>
            <p>Relisez votre publication une dernière fois avant de la publier !</p>
            <ActivityStepPreview
                stepName="Votre classe"
                href="/creer-sa-mascotte/1"
                status={MASCOT_STEPS_VALIDATORS.isStep1Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <p>Nous sommes {classroom?.name}</p>
                <p>
                    Nous sommes {activity.data?.classroom?.students?.totalCount}, dont {activity.data?.classroom?.students?.femalesCount} fille(s) et{' '}
                    {activity.data?.classroom?.students?.malesCount} garçon(s).
                </p>
                <p>En moyenne, l&apos;âge des enfants de notre classe est {activity.data?.classroom?.students?.meanAge} ans</p>
                <p>
                    Nous avons {activity.data?.classroom?.teachers?.totalCount} professeur(s), dont {activity.data?.classroom?.teachers?.femalesCount}{' '}
                    femme(s) et {activity.data?.classroom?.teachers?.malesCount} homme(s).
                </p>
                <p>
                    Dans notre école, il y a {activity.data?.classroom?.school?.classroomsCount} classes et{' '}
                    {activity.data?.classroom?.school?.studentsCount} élèves
                </p>
                {activity.data?.classroom?.imageUrl && (
                    <div className={styles.imageContainer}>
                        <Image
                            width={0}
                            height={0}
                            src={activity.data?.classroom?.imageUrl}
                            alt={'Notre classe'}
                            sizes="100vw"
                            style={{ objectFit: 'cover', width: '100%', height: 'auto', margin: '16px 0' }}
                        />
                    </div>
                )}
                <p>{activity.data?.mascot?.description}</p>
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Votre mascotte"
                href="/creer-sa-mascotte/2"
                status={MASCOT_STEPS_VALIDATORS.isStep2Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <div className={styles.mascotStepContainer}>
                    <div className={styles.left}>
                        {activity.data?.mascot?.imageUrl && (
                            <Image
                                src={activity.data?.mascot?.imageUrl}
                                alt={'Notre mascotte'}
                                width={150}
                                height={150}
                                style={{ objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    <div className={styles.right}>
                        <p>Notre mascotte s&apos;appelle {activity.data?.mascot?.name}, elle nous représente.</p>
                        <p>{activity.data?.mascot?.description}</p>
                        <p>
                            {activity.data?.mascot?.name} est {activity.data?.mascot?.personalityTraits?.[0]},{' '}
                            {activity.data?.mascot?.personalityTraits?.[1]} et {activity.data?.mascot?.personalityTraits?.[2]}.
                        </p>
                        <p>
                            Notre mascotte rêve d&apos;aller dans ces pays :{' '}
                            {activity.data?.mascot?.favoriteCountries?.map((country) => COUNTRIES[country]).join(', ')}.
                        </p>
                        <p>
                            Notre mascotte joue {activity.data?.mascot?.favoriteGame} et pratique {activity.data?.mascot?.favoriteSport}.
                        </p>
                    </div>
                </div>
            </ActivityStepPreview>
            <ActivityStepPreview
                stepName="Langues et monnaies"
                href="/creer-sa-mascotte/3"
                status={MASCOT_STEPS_VALIDATORS.isStep3Valid(activity) ? 'success' : 'warning'}
                style={{ margin: '16px 0' }}
            >
                <p>
                    Tous les enfants de notre classe parlent :{' '}
                    {activity.data?.languages?.spokenByAll?.map((language) => LANGUAGES[language]).join(', ')}.
                </p>
                <p>
                    Au moins un enfant de notre classe parle :{' '}
                    {activity.data?.languages?.spokenBySome?.map((language) => LANGUAGES[language]).join(', ')}.
                </p>
                <p>
                    {activity?.data?.mascot?.name}, comme tous les enfants de notre classe, apprend :{' '}
                    {activity.data?.languages?.taught?.map((language) => LANGUAGES[language]).join(', ')}.
                </p>
                <p>Nous utilisons comme monnaie : {activity.data?.languages?.currencies?.map((currency) => CURRENCIES[currency]).join(', ')}.</p>
            </ActivityStepPreview>
            <div className={styles.buttons}>
                <Button
                    as="a"
                    href="/creer-sa-mascotte/3"
                    color="primary"
                    variant="outlined"
                    label="Étape précédente"
                    leftIcon={<ChevronLeftIcon />}
                />
                <Button
                    color="primary"
                    variant="contained"
                    label={activity.publishDate ? 'Modifier' : 'Publier'}
                    disabled={!isValid}
                    onClick={onSubmit}
                />
            </div>
            <Loader isLoading={isSubmitting} />
        </PageContainer>
    );
}
