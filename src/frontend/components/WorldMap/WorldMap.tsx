'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { VillageContext } from '@frontend/contexts/villageContext';
import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import React from 'react';
import useSWR from 'swr';

import type { PopoverData } from './Popover';
import { isUserAndClassroom, Popover } from './Popover';
import { useFullScreen } from './use-full-screen';
import { World } from './world';
import type { GeoJSONCityData } from './world/objects/capital';
import type { GeoJSONCountriesData } from './world/objects/country';
import type { UserAndClassroom } from './world/objects/earth';

const getCountriesAndCapitals = async () => {
    const [countriesResponse, capitalResponse] = await Promise.all([
        fetch('/static/earth/countries.geo.json').then((res) => res.json() as Promise<GeoJSONCountriesData>),
        fetch('/static/earth/capitals.geo.json').then((res) => res.json() as Promise<GeoJSONCityData>),
    ]);
    return {
        countries: countriesResponse.features || [],
        capitals: capitalResponse.features || [],
    };
};

const WorldMap = () => {
    const router = useRouter();
    const { usersMap, classroomsMap } = useContext(VillageContext);
    const usersAndClassrooms: UserAndClassroom[] = React.useMemo(
        () =>
            Object.values(classroomsMap)
                .map((classroom) => {
                    const user = classroom ? usersMap[classroom.teacherId] : undefined;
                    if (!user || !classroom) {
                        return undefined;
                    }
                    return {
                        user,
                        classroom,
                    };
                })
                .filter((d) => d !== undefined),
        [usersMap, classroomsMap],
    );

    // -- 3D world --
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [world, setWorld] = useState<World | null>(null);
    const [mouseStyle, setMouseStyle] = useState<CSSProperties['cursor']>('default');
    const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [popoverData, setPopoverData] = useState<PopoverData | null>(null);
    const { containerRef, fullScreenButton } = useFullScreen();
    const { data: countriesAndCapitals } = useSWR('3d-world-countries-and-capitals', getCountriesAndCapitals);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return () => {};
        }
        const newWorld = new World(canvas, setMouseStyle, setPopoverData);
        const prevent = (event: Event) => {
            event.preventDefault();
            newWorld?.onStopRotationAnimation();
        };
        canvas.addEventListener('mousewheel', prevent);
        canvas.addEventListener('wheel', prevent);
        let animationFrame: number | null = null;
        const render = () => {
            newWorld.render();
            animationFrame = requestAnimationFrame(render);
        };
        animationFrame = requestAnimationFrame(render);
        setWorld(newWorld);
        return () => {
            canvas.removeEventListener('mousewheel', prevent);
            canvas.removeEventListener('wheel', prevent);
            newWorld.dispose();
            if (animationFrame !== null) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, []);

    useEffect(() => {
        if (world && countriesAndCapitals) {
            world.addCountriesAndCapitals(countriesAndCapitals);
        }
    }, [world, countriesAndCapitals]);

    useEffect(() => {
        if (world && usersAndClassrooms.length > 0) {
            world.addUsers(usersAndClassrooms);
        }
    }, [world, usersAndClassrooms]);

    return (
        <div ref={containerRef} style={{ position: 'relative', height: '100%', width: '100%' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', backgroundColor: 'black', cursor: mouseStyle }}
                onClick={() => {
                    if (popoverData && isUserAndClassroom(popoverData) && popoverData.data.classroom.mascotteId) {
                        world?.resetHoverState();
                        router.push(`/activities/${popoverData.data.classroom.mascotteId}`);
                    }
                    world?.onStopRotationAnimation();
                }}
                onMouseMove={(event) => {
                    if (world) {
                        world.onMouseMove.bind(world)(event);
                        setPopoverPos({
                            x: event.clientX - world.canvasRect.left,
                            y: event.clientY - world.canvasRect.top + 20,
                        });
                    }
                }}
            ></canvas>
            {popoverData !== null && <Popover {...popoverPos} {...popoverData} />}
            <div style={{ position: 'absolute', left: '0.5rem', top: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {world && (
                        <>
                            <button
                                style={{
                                    color: '#000',
                                    border: '1px solid #c5c5c5',
                                    padding: '8px',
                                    minWidth: 0,
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    borderRadius: '4px 4px 0 0',
                                }}
                                onClick={() => {
                                    world.onZoom(-20);
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                            <button
                                style={{
                                    color: '#000',
                                    border: '1px solid #c5c5c5',
                                    borderTop: 'none',
                                    padding: '8px',
                                    minWidth: 0,
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    borderRadius: '0 0 4px 4px',
                                }}
                                onClick={() => {
                                    world.onZoom(20);
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
        </div>
    );
};

export default WorldMap;
