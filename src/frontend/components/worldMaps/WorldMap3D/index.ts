import dynamic from 'next/dynamic';

export const WorldMap = dynamic(() => import('./WorldMap3D'), { ssr: false });
