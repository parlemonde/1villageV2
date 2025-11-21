'use server';

import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { users, type UserRole } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface UpdateUserData {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    classroom?: {
        id: number;
        name: string;
        address: string;
        city: string;
        level?: string | null;
        countryCode: string;
        villageId?: number | null;
    };
}

export const updateUser = async (data: UpdateUserData) => {
    const currentUser = await getCurrentUser();
    if (currentUser?.role !== 'admin') {
        throw new Error('Non autorisé');
    }

    // Validate data
    if (!data.email || data.email.trim().length === 0) {
        throw new Error("L'email ne peut pas être vide");
    }

    if (!data.name || data.name.trim().length === 0) {
        throw new Error('Le nom ne peut pas être vide');
    }

    // Check if email already exists for another user
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email.trim()),
    });

    if (existingUser && existingUser.id !== data.id) {
        throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Update user
    const [updatedUser] = await db
        .update(users)
        .set({
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
            updatedAt: new Date(),
        })
        .where(eq(users.id, data.id))
        .returning();

    // Update classroom if provided and exists
    if (data.classroom) {
        await db
            .update(classrooms)
            .set({
                name: data.classroom.name,
                address: data.classroom.address,
                city: data.classroom.city,
                level: data.classroom.level,
                countryCode: data.classroom.countryCode,
                villageId: data.classroom.villageId || null,
            })
            .where(eq(classrooms.id, data.classroom.id));
    }

    revalidatePath('/admin/manage/users');
    revalidatePath(`/admin/manage/users/${data.id}`);

    return updatedUser;
};
