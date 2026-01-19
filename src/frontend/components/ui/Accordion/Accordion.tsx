'use client';
import type { MarginProps } from '@frontend/components/ui/css-styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { Accordion as RadixAccordion } from 'radix-ui';
import * as React from 'react';

import styles from './accordion.module.css';

interface AccordionItem {
    title: { text: string; className?: string; style?: React.CSSProperties } | React.ReactNode;
    content: { text: string; className?: string; style?: React.CSSProperties } | React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
}

interface AccordionTriggerProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

interface AccordionContentProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export const Accordion = ({ items }: AccordionProps) => (
    <RadixAccordion.Root className={styles.AccordionRoot} type="single" defaultValue="item-0" collapsible>
        {items.map((item, index) => (
            <RadixAccordion.Item className={styles.AccordionItem} value={`item-${index}`} key={`item-${index}`}>
                <AccordionTrigger
                    className={`${item.title?.className ? item.title.className : ''}`}
                    style={typeof item.title === 'object' && 'style' in item.title ? item.title.style : {}}
                >
                    {item.title?.text ? item.title.text : item.title}
                </AccordionTrigger>
                <AccordionContent
                    className={`${item.content?.className ? item.content.className : ''}`}
                    style={typeof item.content === 'object' && 'style' in item.content ? item.content.style : {}}
                >
                    {item.content?.text ? item.content.text : item.content}
                </AccordionContent>
            </RadixAccordion.Item>
        ))}
    </RadixAccordion.Root>
);

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(({ children, className, ...props }, forwardedRef) => (
    <RadixAccordion.Header className={styles.AccordionHeader}>
        <RadixAccordion.Trigger className={classNames(styles.AccordionTrigger, className)} {...props} ref={forwardedRef}>
            {children}
            <ChevronDownIcon className={styles.AccordionChevron} aria-hidden />
        </RadixAccordion.Trigger>
    </RadixAccordion.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(({ children, className, ...props }, forwardedRef) => (
    <RadixAccordion.Content className={classNames(styles.AccordionContent, className)} {...props} ref={forwardedRef}>
        <div className={styles.AccordionContentText}>{children}</div>
    </RadixAccordion.Content>
));
AccordionContent.displayName = 'AccordionContent';
