'use client';

import type { GameResponsesClassrooms } from '@app/api/game-responses/route';
import { Quiz } from '@frontend/components/Quiz/Quiz';
import { sendToast } from '@frontend/components/Toasts';
import { Button } from '@frontend/components/ui/Button';
import type { RadioOption } from '@frontend/components/ui/Form/RadioGroup';
import { Title } from '@frontend/components/ui/Title';
import { VideoPlayer } from '@frontend/components/ui/VideoPlayer';
import { UserContext } from '@frontend/contexts/userContext';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { insertGameResponse } from '@server-actions/game-responses/insert-game-responses';
import Image from 'next/image';
import { useExtracted } from 'next-intl';
import { useContext, useState } from 'react';

export interface Round {
    questionId: number;
    title: string;
    imageUrl?: string;
    videoUrl?: string;
    options: RadioOption[];
}

interface GameEngineProps {
    rounds: Round[];
    gameId: number;
    question: string;
    successMessage: string;
    errorMessage: string;
}

export const GameEngine = ({ rounds, gameId, question, successMessage, errorMessage }: GameEngineProps) => {
    const tCommon = useExtracted('common');
    const { classroom } = useContext(UserContext);

    const [index, setIndex] = useState(0);
    const [showAnswers, setShowAnswers] = useState(false);
    const [showError, setShowError] = useState(false);
    const [responses, setResponses] = useState<Record<string, GameResponsesClassrooms[]>>({});
    const [sessionId, setSessionId] = useState<number | undefined>();

    const checkAnswer = async (answer: string) => {
        const newSessionId = await insertGameResponse({
            gameId,
            questionId: rounds?.[index]?.questionId,
            classroomId: classroom?.id ?? -1,
            response: answer,
            sessionId,
        });

        setSessionId(newSessionId);

        if (answer === 'true') {
            setShowError(false);
            setShowAnswers(true);
            await fetchResults(gameId, rounds?.[index]?.questionId);
        } else {
            setShowError(true);
        }
    };

    const fetchResults = async (gameId: number, questionId: number) => {
        try {
            const httpResponse = await fetch(`/api/game-responses${serializeToQueryUrl({ gameId: gameId, questionId: questionId })}`);
            if (!httpResponse.ok) {
                throw new Error();
            }

            const responses: GameResponsesClassrooms[] = await httpResponse.json();

            const responsesMap: Record<string, GameResponsesClassrooms[]> = {};
            responses?.map((r) => {
                if (responsesMap[r.classrooms.countryCode]) {
                    responsesMap[r.classrooms.countryCode].push(r);
                } else {
                    responsesMap[r.classrooms.countryCode] = [r];
                }
            });
            setResponses(responsesMap);
        } catch {
            sendToast({
                type: 'error',
                message: tCommon('Une erreur est survenue lors de la récupération des réponses.'),
            });
            setResponses({});
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
                <div style={{ margin: 'auto', textAlign: 'center', width: '100%' }}>
                    <Title variant="h2" marginBottom="sm">
                        {rounds[index].title}
                    </Title>
                    {rounds?.[index]?.imageUrl && (
                        <div style={{ width: 'min(90%, 500px)', height: '300px', position: 'relative', margin: 'auto' }}>
                            <Image src={rounds[index].imageUrl} alt={rounds[index].title} fill sizes={'500px'} style={{ objectFit: 'contain' }} />
                        </div>
                    )}
                    {rounds?.[index]?.videoUrl && (
                        <div style={{ width: '80%', margin: 'auto' }}>
                            <VideoPlayer src={rounds[index].videoUrl} />
                        </div>
                    )}
                </div>
                <Title variant="h3" color="inherit" marginTop="md">
                    {question}
                </Title>
                <Quiz
                    key={index}
                    responses={responses}
                    showResponses={showAnswers}
                    options={rounds[index].options}
                    onChange={(selectedAnswer: string) => checkAnswer(selectedAnswer)}
                    marginBottom="md"
                />
                <p
                    style={{
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: 'var(--grey-100)',
                        borderRadius: '10px',
                        visibility: showAnswers || showError ? 'visible' : 'hidden',
                    }}
                >
                    {showAnswers && successMessage}
                    {showError && errorMessage}
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
