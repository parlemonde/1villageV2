import { db } from '@server/database';
import { villages } from '@server/database/schemas/villages';
import { eq } from 'drizzle-orm';

export const getVillage = async (villageId: number) => {
    const village = await db.query.villages.findFirst({
        where: eq(villages.id, villageId),
    });
    return village;
};
