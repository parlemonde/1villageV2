export async function downloadFile(path: string, fileName?: string) {
    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName ?? path.split('/').pop() ?? 'media';
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
    }
}
