import { auth } from '@server/lib/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createLoader, parseAsBoolean } from 'nuqs/server';

const params = {
    fromLogin: parseAsBoolean.withDefault(false),
};

const loadSearchParams = createLoader(params);

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const email = cookieStore.get('pendingEmail')?.value;

    if (!email) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const { fromLogin } = loadSearchParams(request);

    // If coming from registration page, signUpEmail automatically sends the verification email
    if (fromLogin) {
        await auth.api.sendVerificationEmail({
            body: {
                email,
                callbackURL: '/',
            },
        });
    }

    cookieStore.delete('pendingEmail');

    return NextResponse.redirect(new URL('/login/famille/verify-email', request.url));
}
