import { ChevronRightIcon } from '@radix-ui/react-icons';

import styles from './admin-link.module.css';
import { Link } from '../ui/Link';

interface AdminLinkProps {
    href: string;
    label: string;
}

export const AdminLink = ({ href, label }: AdminLinkProps) => {
    return (
        <Link href={href} className={styles.link}>
            <span>{label}</span>
            <ChevronRightIcon width={24} height={24} />
        </Link>
    );
};
