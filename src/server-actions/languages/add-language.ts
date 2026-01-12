'use server';

import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import isoLanguages from './iso-639-languages.json';

interface IsoLanguage {
    code: string;
    name: string;
    nameInLanguage: string;
}

export const addLanguage = async (languageCode: string): Promise<void> => {
    const user = await getCurrentUser();
    if (user?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
    }

    // Validate that the language code exists in ISO 639-1
    const languageData = (isoLanguages as IsoLanguage[]).find((lang) => lang.code === languageCode);
    if (!languageData) {
        throw new Error('Invalid language code');
    }

    // Check if language already exists
    const existingLanguage = await db.select().from(languages).where(eq(languages.code, languageCode)).limit(1);
    if (existingLanguage.length > 0) {
        throw new Error('Language already exists');
    }

    // Insert new language
    await db.insert(languages).values({
        code: languageCode,
        label: languageData.name,
        labelInLanguage: languageData.nameInLanguage,
        isDefault: false,
    });

    revalidatePath('/admin/manage/translations');
};
