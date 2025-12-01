import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import type { Vector3 } from 'three';
import { DirectionalLight, Group, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

import type { HoverableObject } from '../lib/hoverable-object';
import { ImageTexture } from '../lib/image-texture';
import { GLOBE_IMAGE_URL, GLOBE_RADIUS } from '../world.constants';
import { AtmosphereGlow } from './atmosphere-glow';
import type { GeoLabel } from './capital';
import { Capital } from './capital';
import type { GeoJSONCountryData } from './country';
import { CountryGroup } from './countryGroup';
import { Pin } from './pin';

export type UserAndClassroom = {
    user: User;
    classroom: Classroom;
};

export class Earth extends Group implements HoverableObject {
    public countryVisibility: boolean;
    public userVisibility: boolean;
    public userData: HoverableObject['userData'];

    constructor() {
        super();

        // Add globe
        const globeGeometry = new SphereGeometry(GLOBE_RADIUS, 75, 75);
        const defaultGlobeMaterial = new MeshBasicMaterial({
            map: new ImageTexture(GLOBE_IMAGE_URL),
            transparent: false,
        });
        const globeObj = new Mesh(globeGeometry, defaultGlobeMaterial);
        globeObj.rotation.y = -Math.PI / 2; // face prime meridian along Z axis
        globeObj.name = 'globe';
        this.add(globeObj);

        // Add glow
        const glowObj = new AtmosphereGlow();
        this.add(glowObj);

        // Add directional light
        this.add(new DirectionalLight(0xffffff, 0.6));

        // Set data
        this.countryVisibility = true;
        this.userVisibility = true;
        this.name = 'earth';
        this.userData = {
            isHoverable: true,
            hoverableTargets: [globeObj],
        };
    }

    public addCountries(countries: GeoJSONCountryData[]) {
        this.remove(...this.children.filter((child) => child.name === 'country-group'));
        for (let i = 0; i < countries.length; i++) {
            const newCountry = new CountryGroup(countries[i], i);
            newCountry.visible = this.countryVisibility;
            this.add(newCountry);
        }
    }
    public addCapitals(capitals: GeoLabel[]) {
        this.remove(...this.children.filter((child) => child.name === 'capital'));
        for (let i = 0; i < capitals.length; i++) {
            const newCapital = new Capital(capitals[i]);
            newCapital.visible = this.countryVisibility;
            this.add(newCapital);
        }
    }
    public setCountryVisibility(isVisible: boolean) {
        this.countryVisibility = isVisible;
        for (const child of this.children) {
            if (child.name === 'country-group' || child.name === 'capital') {
                child.visible = isVisible;
            }
        }
    }

    public addUsers(users: UserAndClassroom[], cameraPos: Vector3) {
        this.remove(...this.children.filter((child) => child.name === 'pin'));
        for (const data of users) {
            const userPin = new Pin(data.user, data.classroom, cameraPos);
            userPin.visible = this.userVisibility;
            this.add(userPin);
        }
    }
    public setUserVisibility(isVisible: boolean) {
        this.userVisibility = isVisible;
        for (const child of this.children) {
            if (child.name === 'pin') {
                child.visible = isVisible;
            }
        }
    }

    public onMouseEnter(): void {}
    public onMouseLeave(): void {}
}
