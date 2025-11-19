import type { Position } from 'geojson';
import { Line, Group, LineBasicMaterial } from 'three';

import { GeoJsonGeometry } from '../lib/geo-json-geometry';
import type { GeoJSONCountryData } from './country';
import { Country } from './country';

const COLORS: { [key: string]: string[] } = {
  'North America': ['#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7'],
  Asia: ['#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4'],
  Africa: ['#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107'],
  Oceania: ['#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#ff5722', '#fbe9e7'],
  Europe: ['#fce4ec', '#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#e91e63'],
  'South America': ['#BBF7D0', '#99F6E4', '#047857', '#059669', '#34D399', '#6EE7B7'],
};

export class CountryGroup extends Group {
  constructor(geoJson: GeoJSONCountryData, index = 0) {
    super();

    const polygons: Position[][][] = [];
    if (geoJson.geometry.type === 'Polygon') {
      polygons.push(geoJson.geometry.coordinates);
    } else if (geoJson.geometry.type === 'MultiPolygon') {
      polygons.push(...geoJson.geometry.coordinates);
    }

    const lineMaterial = new LineBasicMaterial({ color: 'white' });
    for (const polygon of polygons) {
      const country = new Country(polygon, geoJson.properties, COLORS[geoJson.properties.continent][index % 6]);
      this.add(country);
      this.add(new Line(new GeoJsonGeometry({ type: 'Polygon', coordinates: polygon }, 1), lineMaterial));
    }

    this.name = 'country-group';
  }
}
