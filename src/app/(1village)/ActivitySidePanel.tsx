'use client';

import { getWeather, OPEN_WEATHER_BASE_URL } from '@app/api/weather/weather.get';
import { CountryFlag } from '@frontend/components/CountryFlag';
import { WorldMap } from '@frontend/components/WorldMap';
import { ActivityView } from '@frontend/components/activities/ActivityView';
import { Button } from '@frontend/components/ui/Button';
import { jsonFetcher } from '@lib/json-fetcher';
import { serializeToQueryUrl } from '@lib/serialize-to-query-url';
import type { Activity } from '@server/database/schemas/activities';
import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useExtracted } from 'next-intl';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import styles from './activity-side-panel.module.css';
import type { WeatherResponse } from '../../../types/weather.type';

interface ActivitySidePanelProps {
    activityId?: number;
}

export const ActivitySidePanel = ({ activityId: activityIdProp }: ActivitySidePanelProps) => {
    const pathname = usePathname();
    const params = useParams();
    const activityId = activityIdProp ?? Number(params?.id);
    const t = useExtracted('app.(1village)');

    const { data: activity } = useSWR<Activity>(activityId ? `/api/activity/${activityId}` : null, jsonFetcher);
    const { data: activityUser } = useSWR<User>(activity?.userId ? `/api/user/${activity.userId}` : null, jsonFetcher);
    const { data: activityClassroom } = useSWR<Classroom[]>(
        `/api/classrooms${serializeToQueryUrl({ classroomId: activity?.classroomId })}`,
        jsonFetcher,
    );

    const formatPseudo = activityUser?.name.replace(' ', '-');
    const showTeacherSheet = activityUser?.role === 'teacher';

    const [weather, setWeather] = useState<WeatherResponse | null>(null);
    const [localTime, setLocalTime] = useState<string | null>(null);

    useEffect(() => {
        if (!activityClassroom || !activityClassroom[0] || activityClassroom.length !== 1) return;

        const classroom = activityClassroom[0];
        if (!classroom) return;

        const coords = classroom.coordinates;
        if (coords === undefined || coords === null) return;

        async function fetchWeather() {
            const data = await getWeather({
                latitude: coords?.latitude,
                longitude: coords?.longitude,
            });
            setWeather(data);
        }
        fetchWeather();
    }, [activityClassroom]);

    useEffect(() => {
        if (!weather) return;

        const updateLocalTime = () => {
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

    const isOnActivityPage = pathname.startsWith('/activities/') || pathname.startsWith('/pelico');

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
                                label={t('Voir la fiche du professeur')}
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
