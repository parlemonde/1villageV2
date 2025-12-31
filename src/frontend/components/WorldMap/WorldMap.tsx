/* eslint-disable no-debugger */
'use client';

import { VillageContext } from '@frontend/contexts/villageContext';
import { LngLatBounds, type Map } from 'maplibre-gl';
import { useContext, useEffect, useRef } from 'react';

import { getClassroomMarker } from './classroom-marker';
import { useFullScreen } from './use-full-screen';
import { initWorldMap } from './world';
import styles from './world-map.module.css';

const WorldMap = () => {
    //const [map, setMap] = useState<Map | null>(null);
    //A ref to store the MapLibre instance (persists across renders)
    const mapRef = useRef<Map | null>(null);
    const map: Map | null = mapRef.current;
    debugger;

    const canvasRef = useRef<HTMLDivElement | null>(null);
    const { containerRef, fullScreenButton } = useFullScreen(() => {
        debugger;
        map?.stop();
    });
    const { classroomsMap } = useContext(VillageContext);

    useEffect(() => {
        debugger; //mounted useEffect
        //Prevent creating the map more than once
        if (mapRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) {
            return () => {};
        }

        const { map, dispose } = initWorldMap(canvas);
        //Store the Map persistently accross renders
        mapRef.current = map;
        //setMap(map);
        let animationFrame: number | null = null;
        const render = () => {
            let newLng = map.getCenter().lng - 90;
            if (newLng < -180) {
                newLng += 360;
            }
            map.flyTo({
                center: { lng: newLng, lat: map.getCenter().lat },
                duration: 30000,
                easing: (t) => {
                    if (t === 1) {
                        animationFrame = requestAnimationFrame(render);
                    }
                    return t;
                },
            });
        };
        animationFrame = requestAnimationFrame(render);
        return () => {
            dispose();
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
            }
            //Cleanup
            debugger;
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const map: Map | null = mapRef.current;
        debugger; //useEffect [???map???, classroomsMap]
        if (!map || !canvas) {
            return () => {};
        }

        mapRef.current?.on('load', () => {
            //Auto zoom & pan to fit all markers
            debugger;
            if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 50, maxZoom: 10, duration: 1000 });
        });

        const bounds = new LngLatBounds();
        const markers = Object.values(classroomsMap)
            .filter((classroom) => classroom?.classroom !== undefined)
            .map((classroomVT) => getClassroomMarker({ classroomVT, canvas }));
        markers.forEach((marker) => {
            marker.marker.addTo(map);
            bounds.extend(marker.marker.getLngLat());
        });
        markers.forEach((marker) =>
            marker.setClickHandler(() => {
                map.flyTo({
                    center: marker.marker.getLngLat(),
                    zoom: map.getZoom(),
                });
            }),
        );

        return () => {
            markers.forEach((marker) => marker.dispose());
            markers.forEach((marker) => marker.marker.remove());
        };
    }, [classroomsMap]);

    debugger;
    return (
        <div ref={containerRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
            <div ref={canvasRef} style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>
            <div style={{ position: 'absolute', left: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {map && (
                    <>
                        <button
                            className={styles.button}
                            onClick={() => {
                                map.stop();
                                map.zoomIn();
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
                                map.stop();
                                map.zoomOut();
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

export default WorldMap;
