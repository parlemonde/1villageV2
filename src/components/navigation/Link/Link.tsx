'use client';

import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import * as React from 'react';

type LinkProps = Omit<NextLinkProps, 'ref'> & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>;

const LinkWithRef = (props: React.PropsWithChildren<LinkProps>, ref: React.ForwardedRef<HTMLAnchorElement>) => {
    const pathname = usePathname();
    return (
        <NextLink
            prefetch={false}
            {...props}
            onNavigate={
                pathname !== props.href
                    ? (event) => {
                          NProgress.configure({ showSpinner: false });
                          NProgress.start();
                          props.onNavigate?.(event);
                      }
                    : undefined
            }
            ref={(node) => {
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
        />
    );
};

export const Link = React.forwardRef(LinkWithRef);
