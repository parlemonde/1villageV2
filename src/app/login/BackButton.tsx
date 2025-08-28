'use client';

import { Link } from '@frontend/components/navigation/Link';
import BackIcon from '@frontend/svg/backIcon.svg';
import { usePathname } from 'next/navigation';

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
