'use client';

import PelicoSouriant from '@frontend/svg/pelico/pelico-souriant.svg';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import crypto from 'crypto';
import Image from 'next/image';

import styles from './avatar.module.css';
import { Link } from '../ui/Link';

export const getGravatarUrl = (email: string, size: number) => {
    const hash = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
    return `https://0.gravatar.com/avatar/${hash}?s${size}&r=g&d=identicon`;
};

type SIZE = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
const SIZES: Record<SIZE, number> = {
    xs: 20,
    sm: 30,
    md: 40,
    lg: 80,
    xl: 140,
};

interface AvatarProps {
    user?: User;
    isPelico?: boolean;
    classroom?: Classroom;
    size?: SIZE | number;
    isLink?: boolean;
}
export const Avatar = ({ user, classroom, isPelico, size = 'md', isLink = true }: AvatarProps) => {
    const dimension = typeof size === 'string' ? SIZES[size] : size;
    if (isPelico) {
        return isLink ? (
            <Link href={`/pelico`} className={styles.avatar} style={{ width: dimension, height: dimension }}>
                <PelicoSouriant style={{ width: '80%', height: 'auto' }} />
            </Link>
        ) : (
            <div className={styles.avatar} style={{ width: dimension, height: dimension }}>
                <PelicoSouriant style={{ width: '80%', height: 'auto' }} />
            </div>
        );
    }
    if (classroom) {
        const imgSrc = classroom.avatarUrl || getGravatarUrl(`classroom-${classroom.id}@parlemonde.org`, dimension);
        return classroom.mascotteId && isLink ? (
            <Link href={`/activities/${classroom.mascotteId}`} className={styles.avatar} style={{ width: dimension, height: dimension }}>
                <Image unoptimized={imgSrc.startsWith('https')} alt="Avatar" src={imgSrc} width={dimension} height={dimension} />
            </Link>
        ) : (
            <div className={styles.avatar} style={{ width: dimension, height: dimension }}>
                <Image loader={({ src }) => src} alt="Avatar" src={imgSrc} width={dimension} height={dimension} />
            </div>
        );
    }
    if (user) {
        const imgSrc = user.image || getGravatarUrl(user.email, dimension);
        return (
            <div className={styles.avatar} style={{ width: dimension, height: dimension }}>
                <Image alt="Avatar" src={imgSrc} width={dimension} height={dimension} unoptimized={imgSrc.startsWith('https')} />
            </div>
        );
    }
    return <div className={styles.avatar} style={{ width: dimension, height: dimension }}></div>;
};
