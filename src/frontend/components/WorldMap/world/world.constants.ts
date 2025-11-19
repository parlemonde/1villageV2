import type { WorldMapUser, UserType } from '../types';

type User = WorldMapUser;

export const GLOBE_IMAGE_URL = '/static-images/earth-blue-marble.jpg';
export const BACKGROUND_IMAGE_URL = '/static-images/night-sky.png';
export const PELICO_IMAGE_URL = '/static-images/pelico-globe.jpg';
export const GLOBE_RADIUS = 100;
export const SKY_RADIUS = GLOBE_RADIUS * 2000;

/* camera zoom */
export const MIN_DISTANCE = 110;
export const START_DISTANCE = 310;
export const MAX_DISTANCE = 510;
export const ZOOM_DELTA = 20;

export const PELICO_USER: User = {
  id: 0,
  position: {
    lat: 46.603354, // todo
    lng: 1.8883335, // todo
  },
  classroom: {
    id: 0,
    name: 'Pelico',
    address: '',
    level: '',
    city: '',
    coordinates: {
      latitude: 46.603354,
      longitude: 1.8883335,
    },
    avatarUrl: '/static-images/pelico-avatar.jpg',
    mascotteId: null,
    teacherId: '00000000-0000-0000-0000-000000000000',
    villageId: null,
    countryCode: 'FR',
  },
};
