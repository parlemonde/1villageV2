import type { NextRequest } from 'next/server';
import qs from 'qs';

export const getJsonBody = async (request: NextRequest) => {
    try {
        if (
            request.headers.get('content-type')?.startsWith('multipart/form-data') ||
            request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')
        ) {
            const queryString = [...(await request.formData()).entries()]
                .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(`${value}`))
                .join('&');
            return qs.parse(queryString);
        } else {
            return await request.json();
        }
    } catch {
        return {};
    }
};
