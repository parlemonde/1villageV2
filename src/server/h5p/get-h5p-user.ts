import type { IUser } from '@lumieducation/h5p-server';
import { getCurrentUser } from '@server/helpers/get-current-user';

export const getH5pUser = async (): Promise<IUser | undefined> => {
    const user = await getCurrentUser();
    if (!user) {
        return undefined;
    }
    return {
        email: user.email,
        id: user.id,
        name: user.name,
        type: user.role,
    };
};
