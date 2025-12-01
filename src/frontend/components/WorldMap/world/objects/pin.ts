import type { Classroom } from '@server/database/schemas/classrooms';
import type { User } from '@server/database/schemas/users';
import { Vector3, Color, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import { clamp } from 'three/src/math/MathUtils';

import { polar2Cartesian } from '../lib/coords-utils';
import type { HoverableObject } from '../lib/hoverable-object';
import { ImageTexture } from '../lib/image-texture';
import { loadGLB } from '../lib/load-glb';
import { GLOBE_RADIUS } from '../world.constants';

// Helper function to get Gravatar URL
const getGravatarUrl = (email: string) => {
    // Simple hash for client-side (using email directly in URL is not ideal, but for backward compatibility)
    const hash = email.trim().toLowerCase();
    return `https://www.gravatar.com/avatar/${hash}?s=128&d=identicon`;
};

export class Pin
    extends Group
    implements
        HoverableObject<{
            user: User;
            classroom: Classroom;
        }>
{
    private coords: {
        lat: number;
        lng: number;
    };
    private isOnPelicoGlobe: boolean;
    public userData: HoverableObject<{
        user: User;
        classroom: Classroom;
    }>['userData'];

    constructor(user: User, classroom: Classroom, cameraPos: Vector3, isOnPelicoGlobe = false, radius = GLOBE_RADIUS, isPelico = false) {
        super();

        // place
        this.coords = {
            lat: classroom.coordinates?.latitude ?? 0,
            lng: classroom.coordinates?.longitude ?? 0,
        };
        const pos = polar2Cartesian(this.coords.lat, this.coords.lng, 2, radius);
        this.position.x = pos.x;
        this.position.y = pos.y;
        this.position.z = pos.z;
        this.up = this.position.clone().add(new Vector3(0, 10, 0));

        this.lookAt(cameraPos); // face toward camera pos

        this.isOnPelicoGlobe = isOnPelicoGlobe;
        this.userData = {
            isHoverable: true,
            hoverableTargets: this.children,
            user,
            classroom,
        };
        this.name = 'pin';

        loadGLB(
            '/earth/pin.glb',
            (pinModel) => this.init(pinModel, user, classroom, isPelico),
            () => {},
        );
    }

    public init(pinModel: Group, user: User, classroom: Classroom, isPelico: boolean) {
        for (const child of pinModel.children) {
            const clonedChild = child.clone(true);
            this.add(clonedChild);
            if (isPelico) {
                ((clonedChild as Mesh).material as MeshStandardMaterial).color = new Color(0x4c3ed9);
                ((clonedChild as Mesh).material as MeshStandardMaterial).needsUpdate = true;
            }
        }

        const cylindar = new Mesh(
            new CylinderGeometry(3.8, 3.8, 0.8, 30),
            new MeshStandardMaterial({ color: isPelico ? 0x4c3ed9 : 13111312, roughness: 0.292, metalness: 0.25 }),
        );
        cylindar.position.y = 9.1;
        cylindar.position.z = 0.2;
        cylindar.rotation.x = Math.PI / 2;
        this.add(cylindar);

        const imgSrc = classroom.avatarUrl || getGravatarUrl(`classroom-${user.id}@parlemonde.org`);
        const cylindar2 = new Mesh(
            new CylinderGeometry(3.4, 3.4, 0.8, 30),
            new MeshStandardMaterial({
                map: new ImageTexture(imgSrc),
            }),
        );
        cylindar2.position.y = 9.1;
        cylindar2.position.z = 0.25;
        cylindar2.rotation.x = Math.PI / 2;
        cylindar2.rotation.y = Math.PI / 2;
        this.add(cylindar2);
    }

    public update(cameraPos: Vector3, altitude: number) {
        // scale with altitude
        let scale = clamp(altitude / 100 - 1, 0.2, 1);
        if (this.isOnPelicoGlobe) {
            scale *= 2;
        }
        this.scale.x = scale;
        this.scale.y = scale;
        this.scale.z = scale;

        // update face toward camera pos
        this.lookAt(cameraPos);
    }

    onMouseEnter(): void {}
    onMouseLeave(): void {}
}
