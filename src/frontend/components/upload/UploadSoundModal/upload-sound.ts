'use client';

import { addMedia } from '@server-actions/file-upload/add-media';
import { getS3UploadParameters } from '@server-actions/file-upload/get-s3-upload-parameters';

export const uploadSound = async (file: File, isPelicoSound: boolean, duration: number) => {
    const formData = new FormData();

    const s3UploadParameters = await getS3UploadParameters(file.name, 'audios', isPelicoSound);

    if (s3UploadParameters) {
        const { formParameters, s3Url } = s3UploadParameters;
        for (const [key, value] of Object.entries(formParameters)) {
            formData.append(key, value);
        }
        formData.append('file', file);
        const key = formParameters.key;
        if (!key) {
            throw new Error('Failed to upload sound');
        }
        const response = await fetch(s3Url, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload sound');
        }
        await addMedia({
            type: 'audio',
            url: `/${key}`,
            isPelico: isPelicoSound,
            metadata: {
                duration,
            },
        });
        return `/${key}`;
    } else {
        formData.append('file', file);
        formData.append('isPelicoAudio', `${isPelicoSound}`);
        formData.append('duration', `${duration}`);
        const response = await fetch('/api/audios', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload sound');
        }
        const { url } = (await response.json()) as { url: string };
        return url;
    }
};
