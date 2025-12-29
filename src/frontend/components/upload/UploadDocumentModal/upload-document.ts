'use client';

import { addMedia } from '@server-actions/file-upload/add-media';
import { getS3UploadParameters } from '@server-actions/file-upload/get-s3-upload-parameters';

export const uploadDocument = async (file: File, isPelicoDocument: boolean, activityId: number) => {
    const formData = new FormData();

    const s3UploadParameters = await getS3UploadParameters(file.name, 'documents', isPelicoDocument);

    if (s3UploadParameters) {
        const { formParameters, s3Url } = s3UploadParameters;
        for (const [key, value] of Object.entries(formParameters)) {
            formData.append(key, value);
        }
        formData.append('file', file);
        const key = formParameters.key;
        if (!key) {
            throw new Error('Failed to upload document');
        }
        const response = await fetch(s3Url, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload document');
        }
        await addMedia({
            type: 'pdf',
            url: `/${key}`,
            isPelico: isPelicoDocument,
            metadata: null,
            activityId,
        });
        return `/${key}`;
    } else {
        formData.append('file', file);
        formData.append('isPelicoDocument', `${isPelicoDocument}`);
        formData.append('activityId', activityId.toString());
        const response = await fetch('/api/documents', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error('Failed to upload document');
        }
        const { url } = (await response.json()) as { url: string };
        return url;
    }
};
