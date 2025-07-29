'use client';

import { usePathname } from 'next/navigation';

import { Link } from '@/components/navigation/Link';
import BackIcon from '@/svg/backIcon.svg';

export function BackButton() {
    const pathname = usePathname();
    if (!pathname.startsWith('/login/')) {
        return null;
    }
    const firstPath = pathname.split('/')[2];
    const label = firstPath === 'education' ? 'Village en famille' : 'Village en classe';
    return (
        <Link href="/login" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
            <BackIcon style={{ marginRight: '8px' }} />
            {label}
        </Link>
    );
}
