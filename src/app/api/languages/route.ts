import { db } from '@server/database';
import { languages } from '@server/database/schemas/languages';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const languageList = await db.query.languages.findMany({
        orderBy: languages.createdAt,
    });
    return NextResponse.json(languageList);
};
