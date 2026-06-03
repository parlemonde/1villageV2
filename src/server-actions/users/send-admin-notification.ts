'use server';

import { EmailType } from '@server/emails/templates/utils/types';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { getEnvVariable } from '@server/lib/get-env-variable';
import { sendEmail } from '@server/lib/sendEmail';
import type { ServerActionResponse } from '@server-actions/common/server-action-response';

export const sendAdminNotification = async (type: keyof typeof EmailType, subject: string): Promise<ServerActionResponse> => {
    const user = await getCurrentUser();
    if (!user) {
        return { error: { message: 'Unauthorized' } };
    }

    const adminEmail = getEnvVariable('ADMIN_EMAIL');
    const frontUrl = getEnvVariable('HOST_URL');
    const emailType = EmailType[type as keyof typeof EmailType];

    return sendEmail({
        to: adminEmail,
        subject,
        emailType,
        props: {
            userName: user.name,
            userEmail: user.email,
            frontUrl,
        },
    });
};
