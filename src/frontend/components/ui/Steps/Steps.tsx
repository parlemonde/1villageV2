import { Link } from '@frontend/components/ui/Link';
import type { MarginProps } from '@frontend/components/ui/css-styles';
import { getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';
import { CheckIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import React from 'react';

import styles from './steps.module.css';

interface Step {
    label: string;
    href: string;
    status?: 'success' | 'warning';
}

interface StepsProps extends MarginProps {
    steps: Step[];
    activeStep: number;
}

export const Steps = ({ steps, activeStep, ...marginProps }: StepsProps) => {
    const marginAndPaddingStyle = getMarginAndPaddingStyle(marginProps);
    return (
        <div className={styles.steps} style={marginAndPaddingStyle}>
            {steps.map((step, index) => (
                <Link
                    key={index}
                    href={step.href}
                    className={classNames(styles.step, {
                        [styles.stepSuccess]: step.status === 'success',
                        [styles.stepWarning]: step.status === 'warning',
                    })}
                >
                    <div className={styles.stepNumberWrapper}>
                        <div
                            className={classNames(styles.stepNumberLine, {
                                [styles.stepNumberLineHidden]: index === 0,
                                [styles.stepNumberLineActive]: index <= activeStep - 1,
                            })}
                        ></div>
                        <div
                            className={classNames(styles.stepNumber, {
                                [styles.stepNumberActive]: index === activeStep - 1,
                            })}
                        >
                            {step.status === 'success' ? <CheckIcon width={26} height={26} /> : index + 1}
                        </div>
                        <div
                            className={classNames(styles.stepNumberLine, {
                                [styles.stepNumberLineHidden]: index === steps.length - 1,
                                [styles.stepNumberLineActive]: index < activeStep - 1,
                            })}
                        ></div>
                    </div>
                    <span className={styles.stepLabel}>{step.label}</span>
                </Link>
            ))}
        </div>
    );
};
