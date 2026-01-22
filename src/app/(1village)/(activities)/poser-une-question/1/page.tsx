'use client';

import { Button } from '@frontend/components/ui/Button';
import { PageContainer } from '@frontend/components/ui/PageContainer';
import { Steps } from '@frontend/components/ui/Steps';
import { Title } from '@frontend/components/ui/Title';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { useExtracted } from 'next-intl';

import styles from './page.module.css';

export default function PoserUneQuestionStep1() {
    const t = useExtracted('app.(1village).(activities).poser-une-question.1');
    const tCommon = useExtracted('common');

    const questions = []; // TODO

    return (
        <PageContainer>
            <Steps
                steps={[
                    { label: t('Les questions'), href: '/poser-une-question/1' },
                    { label: t('Poser ses questions'), href: '/poser-une-question/2' },
                    { label: tCommon('Pré-visualiser'), href: '/poser-une-question/3' },
                ]}
                activeStep={1}
                marginTop="xl"
                marginBottom="md"
            />
            <Title variant="h2" marginBottom="md">
                {t('Les questions déjà posées')}
            </Title>
            <p>
                {t(
                    'Vous trouverez ici les questions qui ont été posées par les pélicopains. Si vous vous posez la même question que certains, vous pouvez cliquer sur "Je me pose la question."',
                )}
            </p>
            {questions.length === 0 && (
                <p className={styles.noQuestions}>
                    <strong>{t("Aucune question n'a été posée dans votre village monde, soyez la première classe à poser une question !")}</strong>
                </p>
            )}
            <div className={styles.buttonContainer}>
                <Button as="a" href="/poser-une-question/2" color="primary" label={tCommon('Étape suivante')} rightIcon={<ChevronRightIcon />} />
            </div>
        </PageContainer>
    );
}
