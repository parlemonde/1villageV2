'use client';

import type { MarginProps, PaddingProps } from '@frontend/components/ui/css-styles';
import { useFullScreen } from '@frontend/components/worldMaps/use-full-screen';
import styles from '@frontend/components/worldMaps/world-map.module.css';
import type { Coordinates } from '@frontend/components/worldMaps/world-map.types';
import { type Map } from 'maplibre-gl';
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';

import { DraggableMarker } from './DraggableMarker';
import { initMap } from './initMap';

type MapProps = {
    coordinates?: Coordinates;
    setCoordinates: (coordinates: Coordinates) => void;
} & MarginProps &
    PaddingProps;

export const DEFAULT_COORDINATES: Coordinates = { lat: 48.858, lng: 2.294 };

const Map2D = ({ coordinates = DEFAULT_COORDINATES, setCoordinates }: MapProps) => {
    //A ref to store the MapLibre instance (persists across renders)
    const [map, setMap] = useState<Map | null>(null);
    const canvasRef = useRef<HTMLDivElement | null>(null);

    const { containerRef, fullScreenButton } = useFullScreen(() => {
        map?.stop();
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return () => {};
        }

        const { map, dispose } = initMap(canvas, coordinates);
        setMap(map);

        return () => {
            dispose();
            setMap(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!map) {
            return;
        }

        map.flyTo({ center: [coordinates.lng, coordinates.lat] });
    }, [map, coordinates]);

    return (
        <div ref={containerRef} style={{ position: 'relative', height: '300px', width: '100%' }}>
            <div ref={canvasRef} style={{ width: '100%', height: '100%' }}></div>
            <div style={{ position: 'absolute', left: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {map && (
                    <>
                        <DraggableMarker map={map} coordinates={coordinates} setCoordinates={setCoordinates} />
                        <button
                            className={styles.button}
                            onClick={() => {
                                map?.stop();
                                map?.zoomIn();
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                        <button
                            className={`${styles.button} ${styles.bottom}`}
                            onClick={() => {
                                map?.stop();
                                map?.zoomOut();
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </>
                )}
                {fullScreenButton}
            </div>
        </div>
    );
};

export default Map2D;
