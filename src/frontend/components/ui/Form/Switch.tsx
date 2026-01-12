import type { MarginProps } from '@frontend/components/ui/css-styles';
import { getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';
import classNames from 'clsx';
import { Switch as RadixSwitch } from 'radix-ui';
import { useId } from 'react';

import styles from './switch.module.css';

interface SwitchProps extends MarginProps {
    label?: string;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
    id?: string;
    name?: string;
    isChecked: boolean;
    onChange: (checked: boolean) => void;
}
export const Switch = ({ label, id: idProp, name, isChecked, onChange, color = 'primary', ...marginProps }: SwitchProps) => {
    const id = useId();
    const switchId = idProp || id;
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', ...getMarginAndPaddingStyle(marginProps) }}>
            {label && <label htmlFor={switchId}>{label}</label>}
            <RadixSwitch.Root
                className={classNames(styles.switchRoot, styles[`color-${color}`])}
                id={switchId}
                name={name}
                checked={isChecked}
                onCheckedChange={onChange}
            >
                <RadixSwitch.Thumb className={styles.switchThumb}>
                    <div className={styles.switchThumbCircle} />
                </RadixSwitch.Thumb>
            </RadixSwitch.Root>
        </div>
    );
};
