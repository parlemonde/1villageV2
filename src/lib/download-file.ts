export async function downloadFile(filePath: string) {
    try {
        const response = await fetch('http://localhost:3000/' + filePath);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filePath.split('/').pop() ?? 'media';
        document.body.appendChild(link);
        link.click();

        // Nettoyage
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
    }
}
