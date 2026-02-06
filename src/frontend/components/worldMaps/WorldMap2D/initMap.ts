import 'maplibre-gl/dist/maplibre-gl.css';
import type { Coordinates, Disposable } from '@frontend/components/worldMaps/world-map.types';
import { Map } from 'maplibre-gl';

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 18;
export const initMap = (canvas: HTMLDivElement, coordinates: Coordinates): { map: Map } & Disposable => {
    const disposables: (() => void)[] = [];

    // Init map
    const map = new Map({
        container: canvas,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        zoom: 3,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        center: [coordinates.lng, coordinates.lat],
        maplibreLogo: false,
        pixelRatio: window.devicePixelRatio || 1,
        canvasContextAttributes: {
            antialias: true,
        },
    });
    disposables.push(() => {
        map.remove();
    });

    return {
        map,
        dispose: () => {
            disposables.forEach((dispose) => dispose());
        },
    };
};
