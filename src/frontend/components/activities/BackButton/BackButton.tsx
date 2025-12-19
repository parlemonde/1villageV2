import { Link } from '@frontend/components/ui/Link';
import { ChevronLeftIcon } from '@radix-ui/react-icons';
import React from 'react';

import styles from './backButton.module.css';

interface BackButtonProps {
    href: string;
    label?: string;
}
export const BackButton = ({ href, label = 'Retour' }: BackButtonProps) => {
    return (
        <Link href={href} className={styles.backButton}>
            <ChevronLeftIcon /> {label}
        </Link>
    );
};
