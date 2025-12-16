import type { CustomLayerInterface } from 'maplibre-gl';
import { Map } from 'maplibre-gl';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { AmbientLight } from 'three';
import { DEG2RAD } from 'three/src/math/MathUtils';

import { disposeNode } from './stars/dispose-node';
import { Sky } from './stars/stars';
import type { Disposable } from './world-map.types';

import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_LIBRE_DEFAULT_FOV = 36.87;

export const initWorldMap = (canvas: HTMLDivElement): { map: Map } & Disposable => {
    const disposables: (() => void)[] = [];

    // Init map
    const map = new Map({
        container: canvas,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        zoom: 1,
        minZoom: 0.8,
        maxZoom: 16,
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
    scene.add(new AmbientLight(0xffffff, 1));
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

            // Apply rotations
            // 1. Roll (Z rotation) - usually 0
            // 2. Pitch (X rotation, negative)
            // 3. Bearing (Z rotation)
            // 4. Latitude (X rotation)
            // 5. Longitude (Y rotation, negative)
            const roll = transform.rollInRadians ?? 0;
            const pitch = transform.pitchInRadians ?? transform.pitch * DEG2RAD;
            const bearing = transform.bearingInRadians ?? transform.bearing * DEG2RAD;
            const lat = -(transform.center?.lat ?? 0) * DEG2RAD;
            const lng = -(transform.center?.lng ?? 0) * DEG2RAD;

            // Setup camera rotations by applying transforms in order
            camera.rotation.set(0, 0, 0);
            camera.rotateZ(roll);
            camera.rotateX(-pitch);
            camera.rotateZ(bearing);
            camera.rotateX(lat);
            camera.rotateY(-lng);

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
        // // Set french language for labels
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
                tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2024_3857/default/g/{z}/{y}/{x}.jpg'],
                type: 'raster',
            },
            paint: {
                'raster-opacity': ['interpolate', ['exponential', 2], ['zoom'], 1, 1, 2.8, 0],
            },
        });

        for (const layer of layers) {
            map.setLayerZoomRange(
                layer,
                Math.max(layer === 'natural_earth' ? 1.1 : 1.2, map.getLayer(layer)?.minzoom ?? 0),
                Math.min(16, map.getLayer(layer)?.maxzoom ?? 16),
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
