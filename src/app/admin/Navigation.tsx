'use client';

import { Menu, MobileMenu } from '@frontend/components/ui/Menu';
import { BarChartIcon, ExitIcon, GearIcon, HomeIcon, ImageIcon, Pencil1Icon, RocketIcon } from '@radix-ui/react-icons';
import { logout } from '@server-actions/authentication/logout';
import classNames from 'clsx';
import { usePathname } from 'next/navigation';

import styles from './navigation.module.css';

export const AdminNavigation = () => {
    const pathname = usePathname();
    const secondPath = pathname.startsWith('/admin/') ? pathname.split('/')[2] : undefined;
    return (
        <Menu
            items={[
                { label: 'Créer', href: '/admin', isActive: pathname === '/admin' || secondPath === 'create', icon: <Pencil1Icon /> },
                { label: 'Publier', href: '/admin/publish', isActive: secondPath === 'publish', icon: <RocketIcon /> },
                { label: 'Gérer', href: '/admin/manage', isActive: secondPath === 'manage', icon: <GearIcon /> },
                { label: 'Analyser', href: '/admin/analyze', isActive: secondPath === 'analyze', icon: <BarChartIcon /> },
                { label: 'Médiathèque', href: '/admin/medias', isActive: secondPath === 'medias', icon: <ImageIcon /> },
            ]}
        />
    );
};

interface AdminMobileNavigationProps {
    onClose: () => void;
}

export const AdminMobileNavigation = ({ onClose }: AdminMobileNavigationProps) => {
    const pathname = usePathname();
    const secondPath = pathname.startsWith('/admin/') ? pathname.split('/')[2] : undefined;

    return (
        <div className={styles.navigationMobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.navigationMobileMenuHeader}>
                <div className={classNames(styles.navigationCardTitle, styles.navigationCardTitleMobile)}>
                    <strong>Portail Admin</strong>
                </div>
            </div>
            <MobileMenu
                items={[
                    {
                        label: 'Créer',
                        href: '/admin',
                        isActive: pathname === '/admin' || secondPath === 'create',
                        icon: <Pencil1Icon />,
                        onClick: () => onClose(),
                    },
                    { label: 'Publier', href: '/admin/publish', isActive: secondPath === 'publish', icon: <RocketIcon />, onClick: () => onClose() },
                    { label: 'Gérer', href: '/admin/manage', isActive: secondPath === 'manage', icon: <GearIcon />, onClick: () => onClose() },
                    {
                        label: 'Analyser',
                        href: '/admin/analyze',
                        isActive: secondPath === 'analyze',
                        icon: <BarChartIcon />,
                        onClick: () => onClose(),
                    },
                    { label: 'Médiathèque', href: '/admin/medias', isActive: secondPath === 'medias', icon: <ImageIcon />, onClick: () => onClose() },
                    { label: 'Aller au village', href: '/', icon: <HomeIcon />, hasSeparatorTop: true, onClick: () => onClose() },
                    {
                        label: 'Se déconnecter',
                        icon: <ExitIcon />,
                        color: 'danger',
                        hasSeparatorTop: true,
                        onClick: () => logout().catch(),
                        textAlign: 'center',
                    },
                ]}
            />
        </div>
    );
};
