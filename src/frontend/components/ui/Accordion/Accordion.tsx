'use client';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import classNames from 'clsx';
import { Accordion as RadixAccordion } from 'radix-ui';
import * as React from 'react';
import './accordion.module.css';

export const Accordion = () => (
    <RadixAccordion.Root className="AccordionRoot" type="single" defaultValue="item-1" collapsible>
        <RadixAccordion.Item className="AccordionItem" value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </RadixAccordion.Item>

        <RadixAccordion.Item className="AccordionItem" value="item-2">
            <AccordionTrigger>Is it unstyled?</AccordionTrigger>
            <AccordionContent>Yes. It's unstyled by default, giving you freedom over the look and feel.</AccordionContent>
        </RadixAccordion.Item>

        <RadixAccordion.Item className="AccordionItem" value="item-3">
            <AccordionTrigger>Can it be animated?</AccordionTrigger>
            <RadixAccordion.Content className="AccordionContent">
                <div className="AccordionContentText">Yes! You can animate the Accordion with CSS or JavaScript.</div>
            </RadixAccordion.Content>
        </RadixAccordion.Item>
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
