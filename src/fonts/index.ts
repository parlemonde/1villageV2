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

const robotoFont = localFont({
    src: [
        { path: './roboto/Roboto-Thin.woff2', weight: '200', style: 'normal' },
        { path: './roboto/Roboto-Light.woff2', weight: '300', style: 'normal' },
        { path: './roboto/Roboto-Regular.woff2', weight: '400', style: 'normal' },
        { path: './roboto/Roboto-Medium.woff2', weight: '500', style: 'normal' },
        { path: './roboto/Roboto-Bold.woff2', weight: '700', style: 'normal' },
    ],
    display: 'swap',
    variable: '--font-roboto',
});
export { alegreyaSansFont, robotoFont };
