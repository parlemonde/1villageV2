'use client';

import { Button } from '@frontend/components/ui/Button';
import type { RadioOption } from '@frontend/components/ui/Form/RadioGroup';
import { RadioGroup } from '@frontend/components/ui/Form/RadioGroup';
import { Title } from '@frontend/components/ui/Title';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useExtracted } from 'next-intl';
import { useState } from 'react';

export interface Round {
    question: string;
    imageUrl: string;
    options: RadioOption[];
}

interface GameEngineProps {
    rounds: Round[];
}

export const GameEngine = ({ rounds }: GameEngineProps) => {
    const t = useExtracted('GameEngine');
    const tCommon = useExtracted('common');

    const [index, setIndex] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showError, setShowError] = useState(false);

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
                        {rounds[index].question}
                    </Title>
                    {rounds?.[index]?.imageUrl && (
                        <Image src={rounds[index].imageUrl} alt={rounds[index].question} width={500} height={300} style={{ objectFit: 'cover' }} />
                    )}
                </div>
                <Title variant="h3" color="inherit" marginTop="md">
                    {t('Que signifie cette expression ?')}
                </Title>
                <div style={{ display: 'flex', flexDirection: 'row', margin: '32px 0' }}>
                    <RadioGroup
                        key={index}
                        isQuiz
                        options={rounds[index].options}
                        onChange={(selectedAnswer: string) => checkAnswer(selectedAnswer)}
                    />
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
                {index < rounds[index].options.length - 1 ? (
                    <Button color="primary" label={tCommon('Jeu suivant')} rightIcon={<ChevronRightIcon />} onClick={goToNextQuestion} />
                ) : (
                    <Button as="a" href="/" color="primary" label={tCommon("Retour à l'accueil")} />
                )}
            </div>
        </>
    );
};
