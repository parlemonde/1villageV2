'use client';

import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';

import { UserPopover } from './UserPopover';

type CountryPopoverData = {
    type: 'country';
    data: {
        country: string;
    };
};
type UserAndClassroomPopoverData = {
    type: 'user-and-classroom';
    data: {
        user: User;
        classroom: Classroom;
    };
};
export type PopoverData = CountryPopoverData | UserAndClassroomPopoverData;
export type PopoverProps = {
    x: number;
    y: number;
} & PopoverData;

export const isCountry = (props: PopoverData): props is CountryPopoverData => props.type === 'country';
export const isUserAndClassroom = (props: PopoverData): props is UserAndClassroomPopoverData => props.type === 'user-and-classroom';

export const Popover = ({ x, y, ...props }: PopoverProps) => {
    return (
        <div style={{ position: 'absolute', display: 'inline-block', left: x, top: y }}>
            <div style={{ position: 'relative', left: '-50%', pointerEvents: 'none', userSelect: 'none' }}>
                <div
                    style={{
                        padding: '0.5rem',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                >
                    {isCountry(props) && <span style={{ fontSize: '0.875rem' }}>{props.data.country}</span>}
                    {isUserAndClassroom(props) && <UserPopover user={props.data.user} classroom={props.data.classroom} />}
                </div>
            </div>
        </div>
    );
};
