'use client';

import { Menu } from '@frontend/components/navigation/Menu';
import { usePathname } from 'next/navigation';

export const AdminNavigation = () => {
    const pathname = usePathname();
    const secondPath = pathname.startsWith('/admin/') ? pathname.split('/')[2] : undefined;
    return (
        <Menu
            items={[
                { label: 'Créer', href: '/admin', isActive: pathname === '/admin' || secondPath === 'create' },
                { label: 'Publier', href: '/admin/publish', isActive: secondPath === 'publish' },
                { label: 'Gérer', href: '/admin/manage', isActive: secondPath === 'manage' },
                { label: 'Analyser', href: '/admin/analyze', isActive: secondPath === 'analyze' },
                { label: 'Médiathèque', href: '/admin/medias', isActive: secondPath === 'medias' },
            ]}
        />
    );
};
