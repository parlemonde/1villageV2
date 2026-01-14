'use client';

import { mascotActivityHelpers } from '@app/(1village)/(activities)/creer-sa-mascotte/helpers';
import { MASCOT_STEPS_VALIDATORS } from '@app/(1village)/(activities)/creer-sa-mascotte/validators';
import { Button } from '@frontend/components/ui/Button';
import { Field, Input, TextArea } from '@frontend/components/ui/Form';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { UploadImageModal } from '@frontend/components/upload/UploadImageModal';
import { ActivityContext } from '@frontend/contexts/activityContext';
import { UserContext } from '@frontend/contexts/userContext';
import PlusIcon from '@frontend/svg/plus.svg';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

import styles from './page.module.css';

const isValidCount = (count1?: number, count2?: number, totalCount?: number) => {
    if (count1 === undefined || count2 === undefined || totalCount === undefined) {
        return true;
    }
    return count1 + count2 === totalCount;
};

export default function CreerSaMascotteStep1() {
    const t = useExtracted('app.(1village).(activities).creer-sa-mascotte.1');
    const tCommon = useExtracted('common');
    const router = useRouter();
    const { activity, setActivity, getOrCreateDraft } = useContext(ActivityContext);
    const { user } = useContext(UserContext);

    const [isOpen, setIsOpen] = useState(false);

    if (user.role !== 'teacher' || !activity || activity.type !== 'mascotte') {
        return null;
    }

    const classroomStudentsCountError = !isValidCount(
        activity?.data?.classroom?.students?.malesCount,
        activity?.data?.classroom?.students?.femalesCount,
        activity?.data?.classroom?.students?.totalCount,
    );
    const totalTeachersError = !isValidCount(
        activity?.data?.classroom?.teachers?.malesCount,
        activity?.data?.classroom?.teachers?.femalesCount,
        activity?.data?.classroom?.teachers?.totalCount,
    );

    const womanTerm = activity.data?.classroom?.students?.femalesCount === 1 ? t('femme') : t('femmes');
    const manTerm = activity.data?.classroom?.students?.malesCount === 1 ? t('homme') : t('hommes');

    const { setClassroom, setClassroomStudents, setTeachers, setSchool } = mascotActivityHelpers(activity, setActivity);

    return (
        <>
            <PageContainer>
                <Steps
                    steps={[
                        { label: t('Votre classe'), href: '/creer-sa-mascotte/1' },
                        { label: activity.data?.mascot?.name || 'Votre mascotte', href: '/creer-sa-mascotte/2' },
                        { label: t('Langues et monnaies'), href: '/creer-sa-mascotte/3' },
                        { label: t('Le web de Pélico'), href: '/creer-sa-mascotte/4' },
                        { label: tCommon('Pré-visualiser'), href: '/creer-sa-mascotte/5' },
                    ]}
                    activeStep={1}
                    marginTop="xl"
                    marginBottom="md"
                />
                <Title variant="h2" marginBottom="md">
                    {t('Qui est dans votre classe ?')}
                </Title>
                <div className={styles.paragraph}>
                    <div className={styles.line}>
                        <p>{t('Nous sommes')}</p>
                        <Input type="text" value={activity.data?.classroom?.alias} onChange={(e) => setClassroom('alias', e.target.value)} />
                    </div>
                    <div className={styles.line}>
                        <p>{t('Nous sommes')}</p>
                        <Input
                            hasError={classroomStudentsCountError}
                            type="number"
                            value={activity?.data?.classroom?.students?.totalCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setClassroomStudents('totalCount', value);
                            }}
                        />
                        <p>
                            {t('élèves')} {t('dont')}
                        </p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.students?.femalesCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setClassroomStudents('femalesCount', value);
                            }}
                        />
                        <p>
                            {' '}
                            {t('fille(s)')} {t('et')}
                        </p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.students?.malesCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setClassroomStudents('malesCount', value);
                            }}
                        />
                        <p> {t('garçon(s)')}.</p>
                    </div>
                    <div className={styles.line}>
                        <p>{t("En moyenne, l'âge des enfants de notre classe est")}</p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.students?.meanAge ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setClassroomStudents('meanAge', value);
                            }}
                        />
                        <p> {t('ans')}.</p>
                    </div>
                    <div className={styles.line}>
                        <p>{t('Nous avons')}</p>
                        <Input
                            hasError={totalTeachersError}
                            type="number"
                            value={activity?.data?.classroom?.teachers?.totalCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setTeachers('totalCount', value);
                            }}
                        />
                        <p>
                            {' '}
                            {t('professeur(s)')} {t('dont')}
                        </p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.teachers?.femalesCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setTeachers('femalesCount', value);
                            }}
                        />
                        <p>
                            {' '}
                            {womanTerm} {t('et')}
                        </p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.teachers?.malesCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setTeachers('malesCount', value);
                            }}
                        />
                        <p> {manTerm}.</p>
                    </div>
                    <div className={styles.line}>
                        <p>{t('Dans notre école, il y a')}</p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.school?.classroomsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setSchool('classroomsCount', value);
                            }}
                        />
                        <p>
                            {' '}
                            {t('classe(s)')} {t('et')}
                        </p>
                        <Input
                            type="number"
                            value={activity?.data?.classroom?.school?.studentsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setSchool('studentsCount', value);
                            }}
                        />
                        <p> {t('élèves')}.</p>
                    </div>
                </div>
                <Title variant="h2" marginBottom="md">
                    {t('À quoi ressemble votre classe ?')}
                </Title>
                <p>
                    {t(
                        "Pour donner un aperçu de votre classe aux pélicopains, choisissez la photo d'une affiche ou d'une décoration accrochée aux murs !",
                    )}
                </p>
                <div className={styles.imageUploadForm}>
                    <div className={styles.imagePreview}>
                        {activity?.data?.classroom?.imageUrl ? (
                            <Image
                                className={styles.image}
                                src={activity?.data?.classroom?.imageUrl}
                                unoptimized={activity?.data?.classroom?.imageUrl.startsWith('https')}
                                alt="Placeholder"
                                width={150}
                                height={150}
                                onClick={() => setIsOpen(true)}
                            />
                        ) : (
                            <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
                        )}
                        <p>{t('Image de votre affiche ou décoration')}</p>
                    </div>
                    <div className={styles.description}>
                        <Field
                            className={styles.field}
                            label={t("Que représente cette photo et pourquoi l'avoir choisie ?")}
                            input={
                                <TextArea
                                    size="md"
                                    isFullWidth
                                    placeholder={t('Description de votre image')}
                                    value={activity?.data?.classroom?.description ?? ''}
                                    onChange={(e) => setClassroom('description', e.target.value)}
                                />
                            }
                        />
                    </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button
                        disabled={!MASCOT_STEPS_VALIDATORS.isStep1Valid(activity)}
                        onClick={() => router.push('/creer-sa-mascotte/2')}
                        color="primary"
                        label={tCommon('Étape suivante')}
                        rightIcon={<ChevronRightIcon />}
                    ></Button>
                </div>
            </PageContainer>
            <UploadImageModal
                getActivityId={getOrCreateDraft}
                isOpen={isOpen}
                initialImageUrl={activity?.data?.classroom?.imageUrl}
                onNewImage={(imageUrl) => setClassroom('imageUrl', imageUrl)}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
