import { eq } from 'drizzle-orm';

import { db } from '@/database';
import { villages } from '@/database/schemas/villages';

export const getVillage = async (villageId: number) => {
    const village = await db.query.villages.findFirst({
        where: eq(villages.id, villageId),
    });
    return village;
};
