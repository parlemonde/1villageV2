export async function uploadImage(file: File | Blob, isPelicoImage?: boolean): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    if (isPelicoImage) {
        formData.append('isPelicoImage', 'true');
    }

    const response = await fetch('/api/images', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Failed to upload image');
    }
    const { url } = (await response.json()) as { url: string };
    return url;
}
