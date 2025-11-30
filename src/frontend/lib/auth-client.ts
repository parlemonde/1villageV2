import { adminClient } from 'better-auth/client/plugins';
import { adminAc, userAc } from 'better-auth/plugins/admin/access';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    plugins: [
        adminClient({
            roles: {
                admin: adminAc,
                mediator: userAc,
                teacher: userAc,
                parent: userAc,
            },
        }),
    ],
});
