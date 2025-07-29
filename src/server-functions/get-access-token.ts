import { SignJWT } from 'jose';

const APP_SECRET = new TextEncoder().encode(process.env.APP_SECRET || '');

export type LoginData = {
    userId: number;
};

export async function getAccessToken(loginData: LoginData): Promise<string> {
    return new SignJWT(loginData).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(APP_SECRET);
}
