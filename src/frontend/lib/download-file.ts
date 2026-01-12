export function downloadFile(path: string, fileName?: string) {
    const link = document.createElement('a');
    link.href = path;
    link.download = fileName ?? path.split('/').pop() ?? 'media';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
