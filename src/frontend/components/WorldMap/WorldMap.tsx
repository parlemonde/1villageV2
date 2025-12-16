'use client';

import { VillageContext } from '@frontend/contexts/villageContext';
import type { Map } from 'maplibre-gl';
import { useContext, useEffect, useRef, useState } from 'react';

import { getClassroomMarker } from './classroom-marker';
import { useFullScreen } from './use-full-screen';
import { initWorldMap } from './world';
import styles from './world-map.module.css';

const WorldMap = () => {
    const [map, setMap] = useState<Map | null>(null);
    const canvasRef = useRef<HTMLDivElement | null>(null);
    const { containerRef, fullScreenButton } = useFullScreen();
    const { classroomsMap } = useContext(VillageContext);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return () => {};
        }
        const { map, dispose } = initWorldMap(canvas);
        setMap(map);
        // let animationFrame: number | null = null;
        // const render = () => {
        //     newWorld.render();
        //     animationFrame = requestAnimationFrame(render);
        // };
        // animationFrame = requestAnimationFrame(render);
        return () => {
            dispose();
            // if (animationFrame !== null) {
            //     cancelAnimationFrame(animationFrame);
            // }
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!map || !canvas) {
            return () => {};
        }
        const markers = Object.values(classroomsMap)
            .filter((classroom) => classroom !== undefined)
            .map((classroom) => getClassroomMarker({ classroom, canvas }));
        markers.forEach((marker) => marker.marker.addTo(map));
        return () => {
            markers.forEach((marker) => marker.dispose());
            markers.forEach((marker) => marker.marker.remove());
        };
    }, [map, classroomsMap]);

    return (
        <div ref={containerRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
            <div ref={canvasRef} style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>
            <div style={{ position: 'absolute', left: 8, top: 8, display: 'flex', flexDirection: 'column', gap: 0 }}>
                {map && (
                    <>
                        <button
                            className={styles.button}
                            onClick={() => {
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
