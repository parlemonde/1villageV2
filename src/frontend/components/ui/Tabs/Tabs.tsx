'use client';

import { getMarginAndPaddingStyle, type MarginProps } from '@frontend/components/ui/css-styles';
import { Tabs as RadixTabs } from 'radix-ui';

import styles from './tabs.module.css';

export interface Tab {
    id: string;
    title: string;
}

interface TabsProps<T> extends MarginProps {
    tabs: Tab[];
    onChange?: (value: T) => void;
    value?: T;
}

export const Tabs = <T extends string>({ tabs, onChange, value, ...marginProps }: TabsProps<T>) => (
    <RadixTabs.Root
        className={styles.root}
        style={getMarginAndPaddingStyle(marginProps)}
        value={value}
        onValueChange={(value) => onChange?.(value as T)}
    >
        <RadixTabs.List className={styles.list}>
            {tabs.map((tab) => (
                <RadixTabs.Trigger className={styles.trigger} value={tab.id} key={tab.id}>
                    {tab.title}
                </RadixTabs.Trigger>
            ))}
        </RadixTabs.List>
    </RadixTabs.Root>
);
