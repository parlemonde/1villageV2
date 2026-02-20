'use client';

import { BackButton } from '@frontend/components/activities/BackButton/BackButton';
import { Button } from '@frontend/components/ui/Button';
import { CircularProgress } from '@frontend/components/ui/CircularProgress';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { FamilyContext } from '@frontend/contexts/familyContext';
import { UserContext } from '@frontend/contexts/userContext';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { updateClassroom } from '@server-actions/classrooms/update-classroom';
import { useExtracted } from 'next-intl';
import { useContext } from 'react';

import styles from './page.module.css';

export default function FamillesStep1() {
    const t = useExtracted('app.(1village).familles.1');
    const tCommon = useExtracted('common');

    const { form } = useContext(FamilyContext);
    const { classroom } = useContext(UserContext);

    const toggleGlobalVisibility = async (value: boolean) => {
        await updateClassroom({
            id: classroom?.id,
            showOnlyClassroomActivities: value,
        });
    };

    return (
        <PageContainer>
            <BackButton href="/" />
            <Steps
                steps={[
                    { label: t('Visibilité'), href: '/familles/1' },
                    { label: t('Ajout enfants'), href: '/familles/2' },
                    { label: t('Communication'), href: '/familles/3' },
                    { label: t('Gestion'), href: '/familles/4' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                <p>{t('Choisissez parmi ces 2 options')}</p>
            </Title>
            <RadioGroup
                options={[
                    { label: t('Les familles peuvent voir toutes les activités publiées sur 1Village'), value: 'false' },
                    { label: t('Les familles ne peuvent voir que les activités publiées par notre classe'), value: 'true' },
                ]}
                value={`${form.showOnlyClassroomActivities}`}
                onChange={(value) => toggleGlobalVisibility(Boolean(value))}
                marginBottom="md"
            />
            <div className={styles.buttonContainer}>
                <Button
                    as="a"
                    color="primary"
                    href="/familles/2"
                    label={tCommon('Étape suivante')}
                    rightIcon={<ChevronRightIcon />}
                    marginBottom="md"
                />
            </div>
        </PageContainer>
    );
}
