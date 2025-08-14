import classNames from 'clsx';
import { DropdownMenu } from 'radix-ui';

import styles from './dropdown-menu-item.module.css';
import { Link } from '@/components/navigation/Link';

interface DropdownMenuItemProps {
    label: string;
    href?: string;
    onClick?: () => void;
    color?: 'primary' | 'secondary' | 'danger';
}

export const DropdownMenuItem = ({ label, href, onClick, color }: DropdownMenuItemProps) => {
    if (href) {
        return (
            <DropdownMenu.Item asChild className={classNames(styles.dropdownMenuItem, { [styles[`color-${color}`]]: color !== undefined })}>
                <Link href={href}>{label}</Link>
            </DropdownMenu.Item>
        );
    }
    return (
        <DropdownMenu.Item className={classNames(styles.dropdownMenuItem, { [styles[`color-${color}`]]: color !== undefined })} onClick={onClick}>
            {label}
        </DropdownMenu.Item>
    );
};
