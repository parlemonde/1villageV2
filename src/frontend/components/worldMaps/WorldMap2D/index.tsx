import dynamic from 'next/dynamic';

export const WorldMap2D = dynamic(() => import('./WorldMap2D'), { ssr: false });
