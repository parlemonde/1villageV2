/* eslint-disable no-debugger */
import type { WeatherResponse } from '../../../../types/weather.type';

export const OPEN_WEATHER_BASE_URL = 'https://openweathermap.org';

//const API_KEY = process.env.NEXT_PUBLIC_OPEN_WEATHER_APP_ID;
const API_KEY = '979023fcb2e0e3856a982a4e9608a3fa';
//const API_KEY = getEnvVariable('OPEN_WEATHER_APP_ID');
debugger;

export async function getWeather(coords: { latitude: number; longitude: number }): Promise<WeatherResponse> {
    const { latitude, longitude } = coords;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`Weather API error: ${res.status}`);
    }

    const data: WeatherResponse = await res.json();
    return data;
}
