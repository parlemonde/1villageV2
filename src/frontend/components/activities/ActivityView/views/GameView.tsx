import type { ActivityContentViewProps } from '@frontend/components/activities/ActivityView/activity-view.types';
import { Button } from '@frontend/components/ui/Button';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { Title } from '@frontend/components/ui/Title';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import type { IdiomGame } from '@server/database/schemas/activity-types';
import Image from 'next/image';
import { useExtracted } from 'next-intl';
import { useMemo, useState } from 'react';

export const GameView = ({ activity }: ActivityContentViewProps) => {
    const t = useExtracted('GameView');
    const tCommon = useExtracted('common');

    const [index, setIndex] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showError, setShowError] = useState(false);

    // useMemo do avoid creating a new array on each render
    const createOptions = useMemo(() => {
        if (activity.type !== 'jeu' || activity.data?.theme !== 'expression') {
            return [];
        }

        const data = activity.data as IdiomGame;
        const options = [{ label: data.idioms?.[index]?.meaning ?? '', value: 'true' }];

        data.idioms?.[index]?.falseMeanings?.forEach((falseMeaning, index) => {
            options.push({ label: falseMeaning, value: index.toString() }); // value must be unique
        });

        return options;
    }, [index, activity.data, activity.type]);

    if (activity.type !== 'jeu' || activity.data?.theme !== 'expression') {
        return null;
    }

    const checkAnswer = (answer: string) => {
        if (answer === 'true') {
            setShowError(false);
            setShowAnswers(true);
        } else {
            setShowError(true);
        }
    };

    const goToNextQuestion = () => {
        setShowAnswers(false);
        setIndex(index + 1);
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    marginTop: '32px',
                    border: '1px solid var(--primary-color)',
                    padding: '32px',
                    borderRadius: '10px',
                }}
            >
                <div style={{ margin: 'auto', textAlign: 'center' }}>
                    <Title variant="h2" marginBottom="sm">
                        {activity.data?.idioms?.[index]?.value}
                    </Title>
                    {activity.data?.idioms?.[index]?.imageUrl && (
                        <Image
                            src={activity.data?.idioms?.[index].imageUrl}
                            alt={activity.data?.idioms?.[index].value ?? ''}
                            width={500}
                            height={300}
                            style={{ objectFit: 'cover' }}
                        />
                    )}
                </div>
                <Title variant="h3" color="inherit" marginTop="md">
                    {t('Que signifie cette expression ?')}
                </Title>
                <div style={{ display: 'flex', flexDirection: 'row', margin: '32px 0' }}>
                    <RadioGroup key={index} isQuiz options={createOptions} onChange={(selectedAnswer: string) => checkAnswer(selectedAnswer)} />
                </div>
                <p
                    style={{
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: 'var(--grey-100)',
                        borderRadius: '10px',
                        visibility: showAnswers || showError ? 'visible' : 'hidden',
                    }}
                >
                    {showAnswers && t("C'est exact ! Vous avez trouvé la signification de cette expression.")}
                    {showError && t("Dommage ! Ce n'est pas la bonne réponse. Essayez encore !")}
                </p>
            </div>
            <div style={{ marginTop: '32px', textAlign: 'right' }}>
                {index < (activity.data?.idioms || []).length - 1 && (
                    <Button color="primary" label={tCommon('Jeu suivant')} rightIcon={<ChevronRightIcon />} onClick={goToNextQuestion} />
                )}
            </div>
        </>
    );
};
