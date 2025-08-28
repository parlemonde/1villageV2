import { db } from '@server/database';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { NextResponse } from 'next/server';

export const GET = async () => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }
    if (user.role !== 'admin') {
        return new NextResponse(null, { status: 403 });
    }

    const allUsers = await db.query.users.findMany({
        columns: {
            id: true,
            email: true,
            name: true,
            accountRegistration: true,
            role: true,
        },
        orderBy: users.id,
    });
    return NextResponse.json(allUsers);
};
