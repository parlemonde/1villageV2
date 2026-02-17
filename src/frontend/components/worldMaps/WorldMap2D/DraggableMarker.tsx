import type { Coordinates } from '@frontend/components/worldMaps/world-map.types';
import type { Map, Marker } from 'maplibre-gl';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

interface DraggableMarkerProps {
    map: Map;
    coordinates: Coordinates;
    setCoordinates: (coordinates: Coordinates) => void;
}

export const DraggableMarker = ({ map, coordinates, setCoordinates }: DraggableMarkerProps) => {
    const markerRef = useRef<Marker | null>(null);

    useEffect(() => {
        if (!map || markerRef.current) {
            return;
        }

        const marker = new maplibregl.Marker({ draggable: true }).setLngLat([coordinates.lng, coordinates.lat]).addTo(map);

        const onDragEnd = () => {
            const lngLat = marker.getLngLat();
            setCoordinates({ lat: lngLat.lat, lng: lngLat.lng });
        };

        marker.on('dragend', onDragEnd);

        markerRef.current = marker;

        return () => {
            marker.off('dragend', onDragEnd);
            marker.remove();
            markerRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    useEffect(() => {
        if (!markerRef.current) {
            return;
        }
        markerRef.current.setLngLat([coordinates.lng, coordinates.lat]);
    }, [coordinates]);

    return null;
};
