'use server';

import { USE_S3 } from '@server/files/file-upload';
import { getCurrentUser } from '@server/helpers/get-current-user';
import { hmac, buf2hex } from '@server/lib/crypto';
import { getEnvVariable } from '@server/lib/get-env-variable';
import mime from 'mime-types';
import path from 'node:path';
import { v4 } from 'uuid';

const AVAILABLE_MEDIA_TYPES = ['audios', 'documents', 'videos'] as const;

export async function getS3UploadParameters(
    fileName: string,
    mediaType: (typeof AVAILABLE_MEDIA_TYPES)[number],
    isPelicoMedia: boolean,
): Promise<{ formParameters: Record<string, string>; s3Url: string } | false> {
    if (!USE_S3) {
        return false;
    }

    if (!AVAILABLE_MEDIA_TYPES.includes(mediaType)) {
        throw new Error('Unauthorized');
    }

    const currentUser = await getCurrentUser();

    if (!currentUser) {
        throw new Error('Unauthorized');
    }

    const uuid = v4();
    const extension = path.extname(fileName).substring(1);
    const key = `media/${mediaType}/users/${isPelicoMedia && (currentUser.role === 'admin' || currentUser.role === 'mediator') ? 'pelico' : currentUser.id}/${uuid}.${extension}`;
    const contentType = mime.lookup(key) || undefined;

    if (!contentType || (!contentType.startsWith('audio/') && !contentType.startsWith('video/') && contentType !== 'application/pdf')) {
        throw new Error('Invalid file');
    }

    if (
        !getEnvVariable('AWS_ACCESS_KEY_ID') ||
        !getEnvVariable('S3_BUCKET_NAME') ||
        !getEnvVariable('AWS_SECRET_ACCESS_KEY') ||
        !getEnvVariable('AWS_REGION')
    ) {
        throw new Error('Unauthorized');
    }

    const currentDate = `${new Date().toISOString().slice(0, -5).replaceAll(/[-:.]/g, '')}Z`;
    const expirationDate = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

    const algorithm = 'AWS4-HMAC-SHA256';
    const credential = `${getEnvVariable('AWS_ACCESS_KEY_ID')}/${currentDate.split('T')[0]}/${getEnvVariable('AWS_REGION')}/s3/aws4_request`;

    const policy = {
        expiration: `${expirationDate.toISOString().slice(0, -5)}Z`,
        conditions: [
            {
                bucket: getEnvVariable('S3_BUCKET_NAME'),
            },
            {
                key,
            },
            {
                'Content-Type': contentType,
            },
            ['content-length-range', 0, 50 * 1024 * 1024],
            {
                'X-Amz-Algorithm': algorithm,
            },
            {
                'X-Amz-Credential': credential,
            },
            {
                'X-Amz-Date': currentDate,
            },
        ] as Array<(string | number)[] | Record<string, string>>,
    };
    if (getEnvVariable('AWS_SESSION_TOKEN')) {
        policy.conditions.push({
            'X-Amz-Security-Token': getEnvVariable('AWS_SESSION_TOKEN'),
        });
    }
    const base64Policy = Buffer.from(JSON.stringify(policy)).toString('base64');

    // Signature
    const kDate = await hmac('AWS4' + getEnvVariable('AWS_SECRET_ACCESS_KEY'), currentDate.split('T')[0]);
    const kRegion = await hmac(kDate, getEnvVariable('AWS_REGION'));
    const kService = await hmac(kRegion, 's3');
    const kCredentials = await hmac(kService, 'aws4_request');
    const signature = await hmac(kCredentials, base64Policy);

    const formParameters: Record<string, string> = {
        bucket: getEnvVariable('S3_BUCKET_NAME'),
        key,
        'Content-Type': contentType,
        'X-Amz-Algorithm': algorithm,
        'X-Amz-Credential': credential,
        'X-Amz-Date': currentDate,
    };
    if (getEnvVariable('AWS_SESSION_TOKEN')) {
        formParameters['X-Amz-Security-Token'] = getEnvVariable('AWS_SESSION_TOKEN');
    }
    formParameters.Policy = base64Policy;
    formParameters['X-Amz-Signature'] = buf2hex(signature);
    return { formParameters, s3Url: `https://${getEnvVariable('S3_BUCKET_NAME')}.s3.${getEnvVariable('AWS_REGION')}.amazonaws.com/` };
}
