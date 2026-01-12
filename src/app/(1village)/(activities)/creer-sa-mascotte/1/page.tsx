'use client';

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
import { useContext, useState } from 'react';

import styles from './page.module.css';

export default function CreerSaMascotteStep1() {
    const router = useRouter();
    const { activity, setActivity } = useContext(ActivityContext);
    const { user, classroom } = useContext(UserContext);

    const mascotData = activity?.type === 'mascotte' ? activity.data : null;

    const [classroomAlias, setClassroomAlias] = useState(classroom?.alias || '');
    const [classroomStudentsCount, setClassroomStudentsCount] = useState(mascotData?.classroom?.students.totalCount);
    const [maleStudentsCount, setMaleStudentsCount] = useState(mascotData?.classroom?.students.malesCount);
    const [femaleStudentsCount, setFemaleStudentsCount] = useState(mascotData?.classroom?.students.femalesCount);
    const [meanAge, setMeanAge] = useState(mascotData?.classroom?.students.meanAge);
    const [totalTeachers, setTotalTeachers] = useState(mascotData?.classroom?.teachers?.totalCount);
    const [maleTeachersCount, setMaleTeachersCount] = useState(mascotData?.classroom?.teachers?.malesCount);
    const [femaleTeachersCount, setFemaleTeachersCount] = useState(mascotData?.classroom?.teachers?.femalesCount);
    const [classroomsCount, setClassroomsCount] = useState(mascotData?.classroom?.school?.classroomsCount);
    const [schoolStudentsCount, setSchoolStudentsCount] = useState(mascotData?.classroom?.school?.studentsCount);

    const [imageUrl, setImageUrl] = useState<string>(mascotData?.classroom?.imageUrl || '');
    const [description, setDescription] = useState(mascotData?.classroom?.description || '');
    const [isOpen, setIsOpen] = useState(false);

    const classroomStudentsCountError =
        classroomStudentsCount !== undefined &&
        maleStudentsCount !== undefined &&
        femaleStudentsCount !== undefined &&
        classroomStudentsCount !== maleStudentsCount + femaleStudentsCount;

    const totalTeachersError =
        totalTeachers !== undefined &&
        maleTeachersCount !== undefined &&
        femaleTeachersCount !== undefined &&
        totalTeachers !== maleTeachersCount + femaleTeachersCount;

    if (user.role !== 'teacher' || !activity || activity.type !== 'mascotte') {
        return null;
    }

    const isValid =
        classroomAlias.trim().length > 0 &&
        Number(classroomStudentsCount) > 0 &&
        Number(maleStudentsCount) >= 0 &&
        Number(femaleStudentsCount) >= 0 &&
        Number(meanAge) > 0 &&
        Number(maleTeachersCount) >= 0 &&
        Number(femaleTeachersCount) >= 0 &&
        Number(classroomsCount) > 0 &&
        Number(schoolStudentsCount) > 0 &&
        imageUrl.trim().length > 0 &&
        description.trim().length > 0 &&
        Number(classroomStudentsCount) === Number(maleStudentsCount) + Number(femaleStudentsCount) &&
        Number(totalTeachers) === Number(maleTeachersCount) + Number(femaleTeachersCount);

    const goToNextStep = () => {
        saveActivity();
        router.push('/creer-sa-mascotte/2');
    };

    const saveActivity = () => {
        setActivity({
            ...activity,
            data: {
                ...activity.data,
                classroom: {
                    ...activity.data?.classroom,
                    students: {
                        ...activity.data?.classroom?.students,
                        totalCount: classroomStudentsCount,
                        femalesCount: femaleStudentsCount,
                        malesCount: maleStudentsCount,
                        meanAge: meanAge,
                    },
                    alias: classroomAlias,
                    imageUrl: imageUrl,
                    description: description,
                    teachers: {
                        ...activity.data?.classroom?.teachers,
                        totalCount: totalTeachers,
                        femalesCount: femaleTeachersCount,
                        malesCount: maleTeachersCount,
                    },
                    school: {
                        ...activity.data?.classroom?.school,
                        classroomsCount: classroomsCount,
                        studentsCount: schoolStudentsCount,
                    },
                },
            },
        });
    };

    return (
        <>
            <PageContainer>
                <Steps
                    steps={[
                        { label: 'Votre classe', href: '/creer-sa-mascotte/1' },
                        { label: activity.data?.mascot?.name || 'Votre mascotte', href: '/creer-sa-mascotte/2' },
                        { label: 'Langues et monnaies', href: '/creer-sa-mascotte/3' },
                        { label: 'Le web de Pélico', href: '/creer-sa-mascotte/4' },
                        { label: 'Pré-visualiser', href: '/creer-sa-mascotte/5' },
                    ]}
                    activeStep={1}
                    marginTop="xl"
                    marginBottom="md"
                />
                <Title variant="h2" marginBottom="md">
                    Qui est dans votre classe ?
                </Title>
                <div className={styles.paragraph}>
                    <div className={styles.line}>
                        <p>Nous sommes</p>
                        <Input type="text" value={classroomAlias} onChange={(e) => setClassroomAlias(e.target.value)} />
                    </div>
                    <div className={styles.line}>
                        <p>Nous sommes</p>
                        <Input
                            hasError={classroomStudentsCountError}
                            type="number"
                            value={classroomStudentsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setClassroomStudentsCount(value);
                            }}
                        />
                        <p>élèves, dont</p>
                        <Input
                            type="number"
                            value={femaleStudentsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setFemaleStudentsCount(value);
                            }}
                        />
                        <p> filles et</p>
                        <Input
                            type="number"
                            value={maleStudentsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setMaleStudentsCount(value);
                            }}
                        />
                        <p> garçons.</p>
                    </div>
                    <div className={styles.line}>
                        <p>En moyenne, l&apos;âge des enfants de notre classe est</p>
                        <Input
                            type="number"
                            value={meanAge ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setMeanAge(value);
                            }}
                        />
                        <p> ans.</p>
                    </div>
                    <div className={styles.line}>
                        <p>Nous avons</p>
                        <Input
                            hasError={totalTeachersError}
                            type="number"
                            value={totalTeachers ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setTotalTeachers(value);
                            }}
                        />
                        <p> professeur(s), dont</p>
                        <Input
                            type="number"
                            value={femaleTeachersCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setFemaleTeachersCount(value);
                            }}
                        />
                        <p> femme(s) et</p>
                        <Input
                            type="number"
                            value={maleTeachersCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setMaleTeachersCount(value);
                            }}
                        />
                        <p> homme(s).</p>
                    </div>
                    <div className={styles.line}>
                        <p>Dans notre école, il y a</p>
                        <Input
                            type="number"
                            value={classroomsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setClassroomsCount(value);
                            }}
                        />
                        <p> classes, et</p>
                        <Input
                            type="number"
                            value={schoolStudentsCount ?? ''}
                            onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                setSchoolStudentsCount(value);
                            }}
                        />
                        <p> élèves.</p>
                    </div>
                </div>
                <Title variant="h2" marginBottom="md">
                    À quoi ressemble votre classe ?
                </Title>
                <p>
                    Pour donner un aperçu de votre classe aux pélicopains, choisissez la photo d&apos;une affiche ou d&apos;une décoration accrochée
                    aux murs !
                </p>
                <div className={styles.imageUploadForm}>
                    <div className={styles.imagePreview}>
                        {imageUrl ? (
                            <Image
                                className={styles.image}
                                src={imageUrl}
                                unoptimized
                                alt="Placeholder"
                                width={150}
                                height={150}
                                onClick={() => setIsOpen(true)}
                            />
                        ) : (
                            <PlusIcon className={styles.image + ' ' + styles.svg} onClick={() => setIsOpen(true)} />
                        )}
                        <p>Image de votre affiche ou décoration</p>
                    </div>
                    <div className={styles.description}>
                        <Field
                            className={styles.field}
                            label="Que représente cette photo et pourquoi l'avoir choisie ?"
                            input={
                                <TextArea
                                    size="md"
                                    isFullWidth
                                    placeholder="Description de votre image"
                                    value={description ?? ''}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            }
                        />
                    </div>
                </div>
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <Button
                        disabled={!isValid}
                        onClick={() => goToNextStep()}
                        color="primary"
                        label="Étape suivante"
                        rightIcon={<ChevronRightIcon />}
                    ></Button>
                </div>
            </PageContainer>
            <UploadImageModal
                isOpen={isOpen}
                initialImageUrl={imageUrl}
                onNewImage={(imageUrl) => setImageUrl(imageUrl)}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
