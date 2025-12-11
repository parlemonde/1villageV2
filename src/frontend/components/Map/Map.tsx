'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { RefObject } from 'react';
import { useMemo, useRef } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import { getMarginAndPaddingStyle, type MarginProps, type PaddingProps } from '../ui/css-styles';

const DEFAULT_ICON = L.icon({
    iconUrl: '/static/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [13.5, 41],
});

export interface Coordinates {
    lat: number;
    lng: number;
}

interface DraggableMarkerProps {
    coordinates: Coordinates;
    setCoordinates: (coordinates: Coordinates) => void;
    icon: L.Icon;
}

function DraggableMarker({ icon, coordinates, setCoordinates }: DraggableMarkerProps) {
    const markerRef: RefObject<L.Marker<Coordinates> | null> = useRef(null);
    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setCoordinates(marker.getLatLng());
                }
            },
        }),
        [setCoordinates],
    );

    return <Marker icon={icon} draggable={true} eventHandlers={eventHandlers} position={coordinates} ref={markerRef} />;
}

type MapProps = {
    coordinates: Coordinates | undefined;
    zoom: number;
    setCoordinates: (coordinates: Coordinates) => void;
} & MarginProps &
    PaddingProps;

const DEFAULT_COORDINATES: Coordinates = { lat: 48.858, lng: 2.294 };

const Map = ({ coordinates = DEFAULT_COORDINATES, setCoordinates, zoom = 5, ...marginAndPaddingProps }: MapProps) => {
    return (
        <MapContainer
            style={{ ...getMarginAndPaddingStyle(marginAndPaddingProps), width: '550px', height: '250px' }}
            center={coordinates}
            zoom={zoom}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DraggableMarker coordinates={coordinates} setCoordinates={setCoordinates} icon={DEFAULT_ICON} />
        </MapContainer>
    );
};

export default Map;
