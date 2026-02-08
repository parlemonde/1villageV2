import { db } from '@server/database';
import type { User } from '@server/database/schemas/users';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const getUser = async (id: string): Promise<User | null> => {
    const result = await db.select().from(users).where(eq(users.id, id));

    return result[0] ?? null;
};

export const GET = async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) return new NextResponse(null, { status: 401 });

    const userId = await params;

    const user = await getUser(userId.id);
    if (!user) return new NextResponse('User not found', { status: 404 });

    return NextResponse.json(user);
};
