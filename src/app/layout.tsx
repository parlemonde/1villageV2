import { NProgressDone } from '@frontend/components/navigation/NProgress';
import { alegreyaSansFont, robotoFont } from '@frontend/fonts';
import classNames from 'clsx';
import type { Metadata, Viewport } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Tooltip } from 'radix-ui';
import { Suspense } from 'react';
import 'normalize.css/normalize.css';
import 'nprogress/nprogress.css';
import './globals.css';
import 'prosemirror-view/style/prosemirror.css';

const APP_URL = process.env.HOST_URL || '';
const APP_NAME = '1Village';
const APP_DESCRIPTION = "Application d'échanges entre classes de différents pays";

export const metadata: Metadata = {
    metadataBase: APP_URL ? new URL(APP_URL) : undefined,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    applicationName: APP_NAME,
    twitter: {
        card: 'summary_large_image',
        site: APP_URL,
        description: APP_DESCRIPTION,
        title: APP_NAME,
        images: '/static/images/android-chrome-192x192.png',
        creator: 'ParLeMonde',
    },
    openGraph: {
        type: 'website',
        title: APP_NAME,
        description: APP_DESCRIPTION,
        siteName: APP_NAME,
        url: APP_URL,
        images: [{ url: '/static/images/apple-touch-icon.png', width: 180, height: 180 }],
    },
    icons: {
        shortcut: '/favicon.ico',
        icon: [
            {
                url: '/static/images/favicon-32x32.png',
                sizes: '32x32',
            },
            { url: '/static/images/favicon-16x16.png', sizes: '16x16' },
        ],
        apple: '/static/images/apple-touch-icon.png',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    themeColor: '#4c3ed9',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className={classNames(alegreyaSansFont.variable, robotoFont.variable)}>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <NuqsAdapter>
                    <Tooltip.Provider delayDuration={0}>{children}</Tooltip.Provider>
                </NuqsAdapter>
                <Suspense>
                    <NProgressDone />
                </Suspense>
            </body>
        </html>
    );
}
