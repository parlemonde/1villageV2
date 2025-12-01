import type { FeatureCollection, Geometry, Position } from 'geojson';
import type { ColorRepresentation } from 'three';
import { MeshBasicMaterial, Mesh, DoubleSide } from 'three';
import ConicPolygonBufferGeometry from 'three-conic-polygon-geometry';

import type { HoverableObject } from '../lib/hoverable-object';
import { GLOBE_RADIUS } from '../world.constants';

export type GeoJSONCountriesData = FeatureCollection<Geometry, { iso2: string; name: string; nameFR: string; continent: string }>;
export type GeoJSONCountryData = GeoJSONCountriesData['features'][number];

export class Country
    extends Mesh
    implements
        HoverableObject<{
            countryName: string;
        }>
{
    private baseMaterials: MeshBasicMaterial[];
    private hoverMaterial: MeshBasicMaterial;

    public userData: HoverableObject<{
        countryName: string;
    }>['userData'];

    constructor(coords: Position[][], geojsonProperties: GeoJSONCountryData['properties'], color: ColorRepresentation) {
        // materials
        const baseMaterials = [];
        baseMaterials.push(
            new MeshBasicMaterial({
                side: DoubleSide,
                color,
            }),
        );
        baseMaterials.push(
            new MeshBasicMaterial({
                side: DoubleSide,
                color,
            }),
        );
        const hoverMaterial = new MeshBasicMaterial({ side: DoubleSide, color: '#3f51b5' });

        // country object
        const countryGeometry = new ConicPolygonBufferGeometry(coords, GLOBE_RADIUS + 0.5, GLOBE_RADIUS + 1, false, true, true, 5);
        super(countryGeometry, baseMaterials);
        this.baseMaterials = baseMaterials;
        this.hoverMaterial = hoverMaterial;

        this.userData = {
            isHoverable: true,
            cursor: 'default',
            countryName: geojsonProperties.nameFR,
        };
        this.name = 'country';
    }

    public onMouseEnter(): void {
        this.material = this.hoverMaterial;
    }
    public onMouseLeave(): void {
        this.material = this.baseMaterials;
    }
}
