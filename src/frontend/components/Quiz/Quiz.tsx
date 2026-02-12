'use client';

import type { GameResponsesClassrooms } from '@app/api/game-responses/route';
import { Avatar } from '@frontend/components/Avatar';
import { CountryFlag } from '@frontend/components/CountryFlag';
import type { RadioOption } from '@frontend/components/ui/Form/RadioGroup';
import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import { VillageContext } from '@frontend/contexts/villageContext';
import classNames from 'clsx';
import { useExtracted } from 'next-intl';
import { RadioGroup as RadixRadioGroup } from 'radix-ui';
import { useContext, useMemo, useState } from 'react';

import styles from './quiz.module.css';

function shuffle(array: { label: React.ReactNode; value: string }[]) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

interface QuizProps extends MarginProps {
    options: RadioOption[];
    onChange?: (value: string) => void;
    readonly?: boolean;
    responses?: Record<string, GameResponsesClassrooms[]>;
    showResponses: boolean;
}

export const Quiz = ({ options, onChange, readonly, responses, showResponses, ...marginProps }: QuizProps) => {
    const tCommon = useExtracted('common');
    const { village } = useContext(VillageContext);
    const [checkedAnswers, setCheckedAnswers] = useState<string[]>([]);
    const [isRight, setIsRight] = useState(false);

    // useMemo to avoid re-shuffle on each render
    const shuffledOptions = useMemo(() => {
        const copy = [...options];
        shuffle(copy);
        return copy;
    }, [options]);

    const onValueChange = (value: string) => {
        setCheckedAnswers([...checkedAnswers, value]);
        if (value === 'true') {
            setIsRight(true);
        }

        onChange?.(value);
    };

    const optionPositionMap: Record<number, string> = {};
    shuffledOptions.forEach((option, index) => (optionPositionMap[index] = option.value));

    const isError = (value: string) => value !== 'true' && checkedAnswers.includes(value);
    const isSuccess = (value: string) => value === 'true' && checkedAnswers.includes(value);

    return (
        <div className={styles.container}>
            {village?.countries.map((country) => (
                <div key={country} className={styles.flag}>
                    <CountryFlag country={country} />
                    <p className={styles.flagDescription}>
                        {responses?.[country]?.length ?? 0} {responses?.[country]?.length === 1 ? tCommon('réponse') : tCommon('réponses')}
                    </p>
                </div>
            ))}

            <RadixRadioGroup.Root
                onValueChange={(checkedValue) => onValueChange(checkedValue)}
                className={classNames(styles.root, { [styles.readonly]: readonly || isRight })}
                style={getMarginAndPaddingStyle(marginProps)}
            >
                {shuffledOptions.map((option) => (
                    <div
                        key={option.value}
                        style={{ display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'center', marginBottom: '12px' }}
                    >
                        <div style={{ flex: '0 0 auto', minWidth: '300px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RadixRadioGroup.Item
                                className={classNames(styles.item, {
                                    [styles.error]: isError(option.value),
                                    [styles.success]: isSuccess(option.value),
                                })}
                                value={option.value}
                                id={option.value}
                            >
                                <RadixRadioGroup.Indicator
                                    className={classNames(styles.indicator, {
                                        [styles.error]: isError(option.value),
                                        [styles.success]: isSuccess(option.value),
                                    })}
                                />
                            </RadixRadioGroup.Item>
                            <label className={styles.label} htmlFor={option.value}>
                                {option.label}
                            </label>
                        </div>

                        {responses && showResponses && (
                            <div className={styles.results}>
                                {village?.countries.map((country) => (
                                    <div key={country} className={styles.avatarList}>
                                        {responses?.[country]
                                            ?.filter((r) => r.game_responses.response === option.value)
                                            .map((r) => (
                                                <Avatar key={r.classrooms.id} size="xs" classroom={r.classrooms} />
                                            ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </RadixRadioGroup.Root>
        </div>
    );
};
