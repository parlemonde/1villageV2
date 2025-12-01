import dynamic from 'next/dynamic';

export const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false });
