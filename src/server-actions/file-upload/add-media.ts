'use server';

import { db } from '@server/database/database';
import type { Media } from '@server/database/schemas/medias';
import { medias } from '@server/database/schemas/medias';
import { getCurrentUser } from '@server/helpers/get-current-user';

type NewMedia = Pick<Media, 'type' | 'url' | 'isPelico' | 'metadata'>;

export const addMedia = async (media: NewMedia) => {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    if (media.isPelico && user.role !== 'admin' && user.role !== 'mediator') {
        throw new Error('Forbidden');
    }
    const newMedia = await db
        .insert(medias)
        .values({ ...media, userId: user.id })
        .returning();
    return newMedia;
};
