'use server';

import { getCurrentUser } from '@server/helpers/get-current-user';
import { isSSOUser } from '@server/helpers/is-sso-user';

export const checkIfSSOUser = async (): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) {
        return false;
    }
    return isSSOUser(user.id);
};
