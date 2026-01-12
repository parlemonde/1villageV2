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

export const Accordion = ({ items }: AccordionProps) => (
    <RadixAccordion.Root className="AccordionRoot" type="single" defaultValue="item-0" collapsible>
        {items.map((item, index) => (
            <RadixAccordion.Item className="AccordionItem" value={`item-${index}`} key={`item-${index}`}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
            </RadixAccordion.Item>
        ))}
    </RadixAccordion.Root>
);

const AccordionTrigger = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
    AccordionTrigger.displayName = 'AccordionTrigger';
    return (
        <RadixAccordion.Header className="AccordionHeader">
            <RadixAccordion.Trigger className={classNames('AccordionTrigger', className)} {...props} ref={forwardedRef}>
                {children}
                <ChevronDownIcon className="AccordionChevron" aria-hidden />
            </RadixAccordion.Trigger>
        </RadixAccordion.Header>
    );
});

const AccordionContent = React.forwardRef(({ children, className, ...props }, forwardedRef) => {
    AccordionContent.displayName = 'AccordionContent';
    return (
        <RadixAccordion.Content className={classNames('AccordionContent', className)} {...props} ref={forwardedRef}>
            <div className="AccordionContentText">{children}</div>
        </RadixAccordion.Content>
    );
});
