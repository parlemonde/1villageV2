import { db } from '@server/database';
import { users, type User } from '@server/database/schemas/users';
import { eq } from 'drizzle-orm';

export async function getUser(userId: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    return user ?? null;
}
