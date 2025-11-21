'use server';

import { db } from '@server/database';
import { classrooms } from '@server/database/schemas/classrooms';
import { users, type UserRole } from '@server/database/schemas/users';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export interface CreateUserData {
    name: string;
    email: string;
    role: UserRole;
    classroom?: {
        name: string;
        address: string;
        city: string;
        level?: string | null;
        countryCode: string;
        villageId?: number | null;
    };
}

export const createUser = async (data: CreateUserData) => {
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

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email.trim()),
    });

    if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Create user
    const [newUser] = await db
        .insert(users)
        .values({
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
            emailVerified: false,
        })
        .returning();

    // Create classroom if provided and user is a teacher
    if (data.classroom && data.role === 'teacher') {
        await db.insert(classrooms).values({
            name: data.classroom.name,
            address: data.classroom.address,
            city: data.classroom.city,
            level: data.classroom.level,
            countryCode: data.classroom.countryCode,
            teacherId: newUser.id,
            villageId: data.classroom.villageId || null,
        });
    }

    revalidatePath('/admin/manage/users');

    return newUser;
};
