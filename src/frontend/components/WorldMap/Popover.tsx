'use client';

import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';

import { UserPopover } from './UserPopover';

export type PopoverData<T extends 'country' | 'classroom' = 'country' | 'classroom'> = {
    type: T;
    data: T extends 'country'
        ? {
              country: string;
          }
        : T extends 'classroom'
          ? Classroom
          : never;
};
export type PopoverProps = {
    x: number;
    y: number;
} & PopoverData;

export const isCountry = (props: PopoverData): props is PopoverData<'country'> => props.type === 'country';
export const isClassroom = (props: PopoverData): props is PopoverData<'classroom'> => props.type === 'classroom';

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
                    {isClassroom(props) && <UserPopover classroom={props.data} />}
                </div>
            </div>
        </div>
    );
};
