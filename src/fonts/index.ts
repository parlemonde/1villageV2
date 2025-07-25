import localFont from 'next/font/local';

const alegreyaSansFont = localFont({
    src: [
        { path: './alegreya-sans/alegreya-sans-v10-latin-300.woff2', weight: '300', style: 'normal' },
        { path: './alegreya-sans/alegreya-sans-v10-latin-400.woff2', weight: '400', style: 'normal' },
        { path: './alegreya-sans/alegreya-sans-v10-latin-500.woff2', weight: '500', style: 'normal' },
        { path: './alegreya-sans/alegreya-sans-v10-latin-700.woff2', weight: '700', style: 'normal' },
    ],
    display: 'swap',
    variable: '--font-alegreya-sans',
});

const openSansFont = localFont({
    src: [
        { path: './open-sans/open-sans-v17-latin-300.woff2', weight: '300', style: 'normal' },
        { path: './open-sans/open-sans-v17-latin-400.woff2', weight: '400', style: 'normal' },
        { path: './open-sans/open-sans-v17-latin-600.woff2', weight: '600', style: 'normal' },
        { path: './open-sans/open-sans-v17-latin-700.woff2', weight: '700', style: 'normal' },
    ],
    display: 'swap',
    variable: '--font-open-sans',
});

export { alegreyaSansFont, openSansFont };
