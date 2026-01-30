'use client';

import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import classNames from 'clsx';
import { RadioGroup as RadixRadioGroup } from 'radix-ui';
import { useMemo, useState } from 'react';

import styles from './radio-group.module.css';

function shuffle(array: { label: React.ReactNode; value: string }[]) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

export interface RadioOption {
    label: React.ReactNode;
    value: string;
}

interface RadioGroupProps extends MarginProps {
    options: { label: React.ReactNode; value: string }[];
    value?: string;
    onChange?: (value: string) => void;
    readonly?: boolean;
    isQuiz?: boolean;
}

export const RadioGroup = ({ options, value, onChange, readonly, isQuiz, ...marginProps }: RadioGroupProps) => {
    const [checkedAnswers, setCheckedAnswers] = useState<string[]>([]);
    const [isRight, setIsRight] = useState(false);

    // useMemo to avoid re-shuffle on each render
    const shuffledOptions = useMemo(() => {
        if (!isQuiz) return options;

        const copy = [...options];
        shuffle(copy);
        return copy;
    }, [options, isQuiz]);

    const onValueChange = (value: string) => {
        if (isQuiz) {
            setCheckedAnswers([...checkedAnswers, value]);
            if (value === 'true') {
                setIsRight(true);
            }
        }

        onChange?.(value);
    };

    const isError = (value: string) => isQuiz && value !== 'true' && checkedAnswers.includes(value);
    const isSuccess = (value: string) => isQuiz && value === 'true' && checkedAnswers.includes(value);

    return (
        <RadixRadioGroup.Root
            onValueChange={(checkedValue) => onValueChange(checkedValue)}
            className={classNames(styles.root, { [styles.readonly]: readonly || isRight })}
            value={value}
            style={getMarginAndPaddingStyle(marginProps)}
        >
            {shuffledOptions.map((option) => (
                <div key={option.value} className={styles.itemContainer}>
                    <RadixRadioGroup.Item
                        className={classNames(styles.item, { [styles.error]: isError(option.value), [styles.success]: isSuccess(option.value) })}
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
            ))}
        </RadixRadioGroup.Root>
    );
};
