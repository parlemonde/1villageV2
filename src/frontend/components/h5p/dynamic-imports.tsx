import dynamic from 'next/dynamic';

export const H5pEditor = dynamic(() => import('./H5pEditor'), { ssr: false });
export const H5pPlayer = dynamic(() => import('./H5pPlayer'), { ssr: false });
