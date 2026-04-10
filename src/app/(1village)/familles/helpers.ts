import { downloadFile } from '@frontend/lib/download-file';

const generatePdfName = (suffix: string) => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}_${suffix}.pdf`;
};

export const downloadPdf = async (pdfBuffer: Uint8Array<ArrayBufferLike>, suffix: string) => {
    const buffer = new Uint8Array(pdfBuffer);
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, generatePdfName(suffix));
};
