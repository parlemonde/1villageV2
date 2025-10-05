import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    poweredByHeader: false,
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
        });

        config.module.rules.push({
            test: /\.(html|txt|pug)$/,
            use: ['raw-loader'],
        });
        return config;
    },
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
            '*.html': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
            '*.txt': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
            '*.pug': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
    },
    output: 'standalone',
    outputFileTracingExcludes: {
        '/*': ['./tmp/**/*'],
    },
    serverExternalPackages: ['@lumieducation/h5p-server'],
    images: {
        loader: 'custom',
        loaderFile: './src/image-loader.js',
    },
};

export default nextConfig;
