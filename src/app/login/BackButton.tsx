'use client';

import { Link } from '@frontend/components/ui/Link';
import BackIcon from '@frontend/svg/backIcon.svg';
import { usePathname } from 'next/navigation';

const getButton = (pathname: string): { label: string; href: string } => {
    if (pathname.includes('education')) {
        return { label: 'Village en famille', href: '/login' };
    }
    if (pathname.includes('famille/inscription')) {
        return { label: 'Retour à la page de connexion', href: '/login/famille' };
    }
    return { label: 'Village en classe', href: '/login' };
};

export function BackButton() {
    const pathname = usePathname();
    if (!pathname.startsWith('/login/')) {
        return null;
    }

    const { label, href } = getButton(pathname);

    return (
        <Link href={href} style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
            <BackIcon style={{ marginRight: '8px' }} />
            {label}
        </Link>
    );
}
