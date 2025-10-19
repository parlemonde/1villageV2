'use client';

import { addMedia } from '@server-actions/file-upload/add-media';
import { getS3UploadParameters } from '@server-actions/file-upload/get-s3-upload-parameters';

export const uploadVideo = async (file: File, isPelicoVideo: boolean) => {
    const formData = new FormData();

    const s3UploadParameters = await getS3UploadParameters(file.name, 'videos', isPelicoVideo);

    if (s3UploadParameters) {
        const { formParameters, s3Url } = s3UploadParameters;
        for (const [key, value] of Object.entries(formParameters)) {
            formData.append(key, value);
        }
        formData.append('file', file);
        const key = formParameters.key;
        if (!key) {
            throw new Error('Failed to upload video');
        }
        const response = await fetch(s3Url, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload video');
        }
        await addMedia({
            type: 'video',
            url: `/${key}`,
            isPelico: isPelicoVideo,
            metadata: null,
        });
        return `/${key}`;
    } else {
        formData.append('file', file);
        formData.append('isPelicoVideo', `${isPelicoVideo}`);
        const response = await fetch('/api/videos', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload video');
        }
        const { url } = (await response.json()) as { url: string };
        return url;
    }
};
