import classNames from 'clsx';
import { DropdownMenu } from 'radix-ui';

import styles from './dropdown-menu-item.module.css';

interface DropdownMenuItemProps {
    label: string;
    onClick?: () => void;
    color?: 'primary' | 'secondary' | 'danger';
}

export const DropdownMenuItem = ({ label, onClick, color }: DropdownMenuItemProps) => {
    return (
        <DropdownMenu.Item className={classNames(styles.DropdownMenuItem, { [styles[`color-${color}`]]: color !== undefined })} onClick={onClick}>
            {label}
        </DropdownMenu.Item>
    );
};
