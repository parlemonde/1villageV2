'use client';

import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';

import { Avatar } from '../Avatar';
import { CountryFlag } from '../CountryFlag';

export const UserPopover = ({ classroom, user }: { classroom: Classroom; user: User }) => {
    return (
        <div style={{ margin: 0, padding: 0, display: 'flex', alignItems: 'center' }}>
            <Avatar user={user} classroom={classroom} size="sm" isLink={false} />
            <div style={{ marginLeft: '0.5rem' }}>
                <h2 style={{ margin: 0, padding: 0, fontSize: '0.875rem', fontWeight: 600 }}>{classroom.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ margin: 0, padding: 0, fontSize: '0.75rem', color: '#666' }}>{classroom.address}</p>
                    <CountryFlag country={classroom.countryCode} size="small" />
                </div>
            </div>
        </div>
    );
};
