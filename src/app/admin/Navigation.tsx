'use client';

import { Menu } from '@frontend/components/ui/Menu';
import { BarChartIcon, GearIcon, ImageIcon, Pencil1Icon, RocketIcon } from '@radix-ui/react-icons';
import { usePathname } from 'next/navigation';

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
