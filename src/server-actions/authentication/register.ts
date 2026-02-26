'use server';

import { getStringValue } from '@server/lib/get-string-value';

export async function register(_previousState: string, formData: FormData): Promise<string> {
    const email = getStringValue(formData.get('email'));
    const firstName = getStringValue(formData.get('firstName'));
    const lastName = getStringValue(formData.get('lastName'));
    const inviteCode = getStringValue(formData.get('inviteCode'));
    const password = getStringValue(formData.get('password'));
    const passwordConfirmation = getStringValue(formData.get('passwordConfirmation'));
}
