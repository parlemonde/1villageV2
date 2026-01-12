'use client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { Accordion as RadixAccordion } from 'radix-ui';
import * as React from 'react';
import './accordion.module.css';

interface AccordionItem {
    title: string;
    content: string;
}

interface AccordionProps {
    items: AccordionItem[];
}

interface AccordionTriggerProps {
    children: React.ReactNode;
    className?: string;
}

interface AccordionContentProps {
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
