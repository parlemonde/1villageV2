'use server';

import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export const deleteLanguage = async (languageCode: string): Promise<void> => {
    const user = await getCurrentUser();
    if (user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }

    await db.delete(languages).where(and(eq(languages.code, languageCode), eq(languages.isDefault, false)));
    revalidatePath('/admin/manage/translations');
};
