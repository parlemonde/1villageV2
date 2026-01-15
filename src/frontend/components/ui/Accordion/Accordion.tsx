'use client';
import type { MarginProps } from '@frontend/components/ui/css-styles';
// import { getMarginAndPaddingProps, getMarginAndPaddingStyle } from '@frontend/components/ui/css-styles';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { Accordion as RadixAccordion } from 'radix-ui';
import * as React from 'react';
import './accordion.module.css';

interface AccordionItem extends MarginProps {
    title: string | React.ReactNode;
    content: string | React.ReactNode;
}

interface AccordionProps extends MarginProps {
    items: AccordionItem[];
}

interface AccordionTriggerProps extends MarginProps {
    children: React.ReactNode;
    className?: string;
}

interface AccordionContentProps extends MarginProps {
    children: React.ReactNode;
    className?: string;
}

export const Accordion = ({ items }: AccordionProps) => (
    <RadixAccordion.Root className="AccordionRoot" type="single" defaultValue="item-0" collapsible>
        {items.map((item, index) => (
            <RadixAccordion.Item className="AccordionItem" value={`item-${index}`} key={`item-${index}`}>
                <AccordionTrigger className="AccordionTrigger">{item.title}</AccordionTrigger>
                <AccordionContent className="AccordionContent">{item.content}</AccordionContent>
            </RadixAccordion.Item>
        ))}
    </RadixAccordion.Root>
);

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(({ children, className, ...props }, forwardedRef) => (
    <RadixAccordion.Header className="AccordionHeader">
        <RadixAccordion.Trigger className={classNames('AccordionTrigger', className)} {...props} ref={forwardedRef}>
            {children}
            <ChevronDownIcon className="AccordionChevron" aria-hidden />
        </RadixAccordion.Trigger>
    </RadixAccordion.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(({ children, className, ...props }, forwardedRef) => (
    <RadixAccordion.Content className={classNames('AccordionContent', className)} {...props} ref={forwardedRef}>
        <div className="AccordionContentText">{children}</div>
    </RadixAccordion.Content>
));
AccordionContent.displayName = 'AccordionContent';
