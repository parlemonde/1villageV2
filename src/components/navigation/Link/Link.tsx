'use client';

import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';
import NProgress from 'nprogress';
import * as React from 'react';

type LinkProps = Omit<NextLinkProps, 'ref'> & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof NextLinkProps>;

const LinkWithRef = (props: React.PropsWithChildren<LinkProps>, ref: React.ForwardedRef<HTMLAnchorElement>) => {
    return (
        <NextLink
            prefetch={false}
            {...props}
            onNavigate={(event) => {
                NProgress.configure({ showSpinner: false });
                NProgress.start();
                props.onNavigate?.(event);
            }}
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
