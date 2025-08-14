import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Fragment } from 'react';

import { Link } from '../Link';
import styles from './breadcrumbs.module.css';

interface Breadcrumb {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    breadcrumbs: Breadcrumb[];
}

export const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
    return (
        <div className={styles.breadcrumbs}>
            {breadcrumbs.map((breadcrumb, index) => (
                <Fragment key={index}>
                    {breadcrumb.href ? (
                        <Link href={breadcrumb.href} className={styles.breadcrumbsLink}>
                            {breadcrumb.label}
                        </Link>
                    ) : (
                        <span>{breadcrumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && <ChevronRightIcon fill="currentColor" />}
                </Fragment>
            ))}
        </div>
    );
};
