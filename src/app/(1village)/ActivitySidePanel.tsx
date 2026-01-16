/* eslint-disable no-debugger */
'use client';

import { getWeather, OPEN_WEATHER_BASE_URL } from '@app/api/weather/weather.get';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { WorldMap } from '@frontend/components/WorldMap';
import { ActivityView } from '@frontend/components/activities/ActivityView';
import { Button } from '@frontend/components/ui/Button';
import { jsonFetcher } from '@lib/json-fetcher';
import type { Activity } from '@server/database/schemas/activities';
import type { User } from '@server/database/schemas/users';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import styles from './activity-side-panel.module.css';
import type { WeatherResponse } from '../../../types/weather.type';

export const ActivitySidePanel = () => {
    const pathname = usePathname();
    const params = useParams();
    const activityId = Number(params?.id);

    const { data: activity } = useSWR<Activity>(activityId ? `/api/activity/${activityId}` : null, jsonFetcher);
    const { data: activityUser } = useSWR<User>(activity?.userId ? `/api/user/${activity.userId}` : null, jsonFetcher);
    const formatPseudo = activityUser?.name.replace(' ', '-');
    const showTeacherSheet = activityUser?.role === 'teacher';

    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [localTime, setLocalTime] = useState<string | null>(null);

    useEffect(() => {
        debugger;
        async function fetchWeather() {
            debugger;
            const data = await getWeather({ latitude: 5, longitude: 45 });
            debugger;
            setWeather(data);
        }
        fetchWeather();
    }, []);

    useEffect(() => {
        debugger;
        if (!weather) return;

        const updateLocalTime = () => {
            debugger;
            const localTimestamp = (weather.dt + weather.timezone) * 1000;
            const localDate = new Date(localTimestamp);

            const hours = String(localDate.getUTCHours()).padStart(2, '0');
            const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');

            setLocalTime(`${hours}h${minutes}`);
        };

        updateLocalTime();
        const interval = setInterval(updateLocalTime, 10000);

        return () => clearInterval(interval);
    }, [weather]);

    debugger;
    const isOnActivityPage = pathname.startsWith('/activities/');

    if (!isOnActivityPage) return null;

    return (
        <div className={styles.activitySidePanel}>
            <div className={styles.avatar}>
                {activity && <ActivityView activity={activity} showDetails={false} />}
                {showTeacherSheet && (
                    <div className={styles.ficheProf}>
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <Button
                                as="a"
                                href={`https://prof.parlemonde.org/les-professeurs-partenaires/${formatPseudo}/profile`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ overflow: 'hidden', marginBottom: '10px', textAlign: 'center' }}
                                variant="outlined"
                                label="Voir la fiche du professeur"
                            ></Button>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.WorldMapContainer}>
                <WorldMap activity={activity} />
            </div>

            {weather && (
                <div className={styles.weather}>
                    <div className={styles.countryContainer}>
                        <div>{<CountryFlag country={weather.sys.country}></CountryFlag>}</div>
                        <div>{weather.name}</div>
                    </div>
                    <p>{localTime}</p>
                    <Image
                        alt="meteo"
                        layout="fixed"
                        width="100"
                        height="100"
                        objectFit="contain"
                        src={`${OPEN_WEATHER_BASE_URL}/img/wn/${weather.weather[0].icon}@2x.png`}
                        unoptimized
                    />
                    <p>{weather.main.temp}°C</p>
                </div>
            )}
        </div>
    );
};
