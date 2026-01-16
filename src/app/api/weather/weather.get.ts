import { getEnvVariable } from '@server/lib/get-env-variable';

import type { WeatherResponse } from '../../../../types/weather.type';

export const OPEN_WEATHER_BASE_URL = 'https://openweathermap.org';

const API_KEY = getEnvVariable('OPEN_WEATHER_APP_ID');

export async function getWeather(coords: { latitude: number | undefined; longitude: number | undefined }): Promise<WeatherResponse> {
    const { latitude, longitude } = coords;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.status}`);
    }

    const data: WeatherResponse = await res.json();
    return data;
}
