import type { FeatureCollection, Point } from 'geojson';
import { CircleGeometry, Group, Mesh, MeshLambertMaterial, Vector3 } from 'three';
import { Text } from 'troika-three-text';

import { polar2Cartesian } from '../lib/coords-utils';
import { GLOBE_RADIUS } from '../world.constants';

export type GeoJSONCityData = FeatureCollection<Point, { cityNameFR: string; iso2: string }>;
export type GeoLabel = GeoJSONCityData['features'][0];

const pxPerDeg = (2 * Math.PI * GLOBE_RADIUS) / 360;

export class Capital extends Group {
  constructor(geojson: GeoLabel) {
    super();
    const circleGeometry = new CircleGeometry(1, 16);
    const material = new MeshLambertMaterial({ color: '#000' });

    // dot
    const dotObj = new Mesh(circleGeometry, material);
    const dotRadius = 0.1 * pxPerDeg;
    dotObj.scale.x = dotObj.scale.y = dotRadius;

    // text
    const textHeight = 0.4 * pxPerDeg;
    const labelObj = new Text();
    labelObj.name = 'Text';
    labelObj.text = geojson.properties.cityNameFR;
    labelObj.fontSize = textHeight;
    labelObj.color = 0x000000;
    labelObj.anchorX = 'center';
    labelObj.position.y = -dotRadius * 1.1;
    labelObj.sync(); // Update the rendering

    this.add(dotObj);
    this.add(labelObj);

    // place
    const pos = polar2Cartesian(geojson.geometry.coordinates[1], geojson.geometry.coordinates[0], 1);
    this.position.x = pos.x;
    this.position.y = pos.y;
    this.position.z = pos.z;

    // rotate
    this.lookAt(new Vector3(0, 0, 0)); // face globe (local) center
    this.rotateY(Math.PI); // face outwards

    this.name = 'capital';
  }
}
