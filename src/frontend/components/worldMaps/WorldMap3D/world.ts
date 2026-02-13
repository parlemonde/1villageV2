import type { Disposable } from '@frontend/components/worldMaps/world-map.types';
import type { CustomLayerInterface } from 'maplibre-gl';
import { Map } from 'maplibre-gl';
import { PerspectiveCamera, Scene, WebGLRenderer, MathUtils } from 'three';

import { disposeNode } from './stars/dispose-node';
import { Sky } from './stars/stars';

import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_LIBRE_DEFAULT_FOV = 36.87;
const MIN_ZOOM = 0.8;
const MAX_ZOOM = 18;

export const initWorldMap = (canvas: HTMLDivElement): { map: Map } & Disposable => {
    const disposables: (() => void)[] = [];

    // Init map
    const map = new Map({
        container: canvas,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        zoom: 1,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        center: [0, 0],
        maplibreLogo: false,
        pixelRatio: window.devicePixelRatio || 1,
        canvasContextAttributes: {
            antialias: true,
        },
    });
    disposables.push(() => {
        map.remove();
    });

    // Init stars
    const scene = new Scene();
    const stars = new Sky();
    scene.add(stars);
    const camera = new PerspectiveCamera(MAP_LIBRE_DEFAULT_FOV, 1, 0.1, 100);
    camera.position.set(0, 0, 0);
    let renderer: WebGLRenderer | undefined;
    const starsLayer: CustomLayerInterface = {
        id: 'stars',
        type: 'custom',
        renderingMode: '3d',
        onAdd: (map, gl) => {
            renderer = new WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true,
            });
            renderer.autoClear = false;
        },
        render: () => {
            if (!renderer) {
                return;
            }

            // Get map transform values
            const transform = map.transform;
            const canvas = map.getCanvas();

            // Update camera projection to match map's field of view
            const fov = transform.fov ?? MAP_LIBRE_DEFAULT_FOV;
            camera.fov = fov;
            camera.aspect = canvas.width / canvas.height;
            camera.updateProjectionMatrix();

            // Setup camera rotation
            const lat = -(transform.center?.lat ?? 0) * MathUtils.DEG2RAD;
            const lng = -(transform.center?.lng ?? 0) * MathUtils.DEG2RAD;
            camera.rotation.set(lat, -lng, 0);

            // Render sky
            renderer.resetState();
            renderer.render(scene, camera);
            map.triggerRepaint();
        },
    };
    disposables.push(() => {
        if (renderer) {
            renderer.renderLists.dispose();
            renderer.dispose();
        }
        scene.children.forEach(disposeNode);
    });

    map.on('style.load', () => {
        // Set globe projection
        map.setProjection({
            type: 'globe',
        });
        // Set french language for labels
        map.setLayoutProperty('label_country_1', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_country_2', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_country_3', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_city', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_city_capital', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_state', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_town', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_village', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('label_other', 'text-field', ['get', `name:fr`]);
        map.setLayoutProperty('water_name_point_label', 'text-field', ['get', `name:fr`]);

        const layers = map.getLayersOrder();
        const firstLayer = layers[0];
        // Add stars layer before the first layer.
        map.addLayer(starsLayer, firstLayer);
        // Add satellite layer last.
        map.addLayer({
            id: 'satellite',
            type: 'raster',
            source: {
                type: 'raster',
                tiles: ['/static/images/earth-tiles/tile-{z}-{y}-{x}.webp'],
                maxzoom: 2,
            },
            paint: {
                'raster-opacity': ['interpolate', ['exponential', 2], ['zoom'], 1, 1, 2.8, 0],
            },
            maxzoom: 3,
        });

        for (const layer of layers) {
            map.setLayerZoomRange(
                layer,
                Math.max(1.1, map.getLayer(layer)?.minzoom ?? 0),
                Math.min(MAX_ZOOM + 1, map.getLayer(layer)?.maxzoom ?? MAX_ZOOM + 1),
            );
        }
    });

    return {
        map,
        dispose: () => {
            disposables.forEach((dispose) => dispose());
        },
    };
};
