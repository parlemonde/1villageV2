'use server';

import { EmailType } from '@server/emails/templates/utils/types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { sendEmail } from '@server/lib/sendEmail';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';

export const reportInvalidCountry = async (): Promise<ServerActionResponse> => {
    const user = await getCurrentUser();
    if (!user) {
        return { error: { message: 'Unauthorized' } };
    }

    const adminEmail = getEnvVariable('ADMIN_EMAIL');
    const frontUrl = getEnvVariable('HOST_URL');

    return sendEmail({
        to: adminEmail,
        subject: '[1Village] Pays invalide — signalement professeur',
        emailType: EmailType.INVALID_COUNTRY,
        props: {
            userName: user.name,
            userEmail: user.email,
            frontUrl,
        },
    });
};
