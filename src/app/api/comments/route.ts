import { db } from '@server/database';
import { classrooms, type Classroom } from '@server/database/schemas/classrooms';
import type { Comment } from '@server/database/schemas/comments';
import { comments } from '@server/database/schemas/comments';
import type { User } from '@server/database/schemas/users';
import { users } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createLoader, parseAsInteger } from 'nuqs/server';

export interface UserComment {
    user: User;
    comment: Comment;
    classroom?: Classroom;
}

const commentsSearchParams = {
    activityId: parseAsInteger,
};

const loadSearchParams = createLoader(commentsSearchParams);

export const GET = async ({ nextUrl }: NextRequest): Promise<NextResponse<UserComment[]>> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse(null, { status: 401 });
    }

    const { activityId } = loadSearchParams(nextUrl.searchParams);
    if (!activityId) {
        return new NextResponse(null, { status: 400 });
    }

    const result = await db
        .select()
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .leftJoin(classrooms, eq(classrooms.teacherId, user.id))
        .where(eq(comments.activityId, activityId));

    return NextResponse.json(
        result.map((r) => ({
            user: r.users,
            classroom: r.classrooms ?? undefined,
            comment: r.comments,
        })),
    );
};
