import type { Object3D } from 'three';
import { AmbientLight, PerspectiveCamera, Raycaster, Scene, Vector3, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import type { PopoverData } from '../Popover';
import { cartesian2Polar, polar2Cartesian } from './lib/coords-utils';
import { disposeNode } from './lib/dispose-node';
import type { HoverableObject } from './lib/hoverable-object';
import { isHoverable } from './lib/hoverable-object';
import type { GeoLabel } from './objects/capital';
import type { Country, GeoJSONCountryData } from './objects/country';
import type { UserAndClassroom } from './objects/earth';
import { Earth } from './objects/earth';
import type { Pin } from './objects/pin';
import { Sky } from './objects/sky';
import { GLOBE_RADIUS, MAX_DISTANCE, MIN_DISTANCE, SKY_RADIUS, START_DISTANCE } from './world.constants';

// Utility function
const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

type MouseStyleSetter = (mouseStyle: React.CSSProperties['cursor']) => void;
type PopoverDataSetter = (popoverData: PopoverData | null) => void;

const CENTER = new Vector3();

export class World {
    // -- global objects --
    private readonly scene: Scene;
    private readonly renderer: WebGLRenderer;
    private readonly raycaster: Raycaster;
    private readonly camera: PerspectiveCamera;
    private readonly controls: OrbitControls;

    // -- scene objects --
    private readonly earth: Earth;

    // -- mouse pos --
    public canvasRect: DOMRect;
    private mousePosition: {
        x: number;
        y: number;
    } | null;
    private readonly setMouseStyle: MouseStyleSetter;
    private readonly setPopoverData: PopoverDataSetter;
    private hoveredObject: HoverableObject | null;
    private restartRotationAnimationTimeout: number | null = null;

    constructor(canvas: HTMLCanvasElement, setMouseStyle: MouseStyleSetter, setPopoverData: PopoverDataSetter) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        this.canvasRect = canvas.getBoundingClientRect();
        this.setMouseStyle = setMouseStyle;
        this.setPopoverData = setPopoverData;
        this.mousePosition = null;
        this.hoveredObject = null;

        // -- Init scene, camera, and renderer --
        this.scene = new Scene();
        this.scene.add(new AmbientLight(0xffffff, 1));
        this.camera = new PerspectiveCamera(50, width / height, 0.1, SKY_RADIUS * 2.5);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = START_DISTANCE;
        this.renderer = new WebGLRenderer({ canvas, powerPreference: 'high-performance', antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.setSize(width, height, false);
        this.raycaster = new Raycaster();

        // -- Add earth --
        this.earth = new Earth();
        this.earth.position.copy(CENTER);
        this.earth.setCountryVisibility(false);
        this.scene.add(this.earth);

        // -- Add sky --
        this.scene.add(new Sky());

        // -- Setup camera controls --
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = MIN_DISTANCE;
        this.controls.maxDistance = MAX_DISTANCE;
        this.controls.enablePan = false;
        this.controls.enableDamping = false;
        this.controls.target = CENTER.clone();
        this.controls.rotateSpeed = 0.2;
        this.controls.zoomSpeed = 0.2;
        this.controls.addEventListener('change', this.onCameraChange.bind(this));
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.1;
    }

    public addCountriesAndCapitals({ countries, capitals }: { countries: GeoJSONCountryData[]; capitals: GeoLabel[] }) {
        this.earth.addCountries(countries);
        this.earth.addCapitals(capitals);
    }

    public addUsers(users: UserAndClassroom[]) {
        this.earth.addUsers(users, this.camera.position.clone().sub(CENTER));
    }

    private onResize() {
        const canvas = this.renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            this.canvasRect = canvas.getBoundingClientRect();
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height, false);
        }
    }

    public render() {
        // Update resize if needed
        this.onResize();

        // Update hovered object
        this.onHover();

        // Update controls
        this.controls.update();

        // Update scene
        this.renderer.render(this.scene, this.camera);
    }

    public dispose() {
        this.renderer.renderLists.dispose();
        this.renderer.dispose();
        this.controls.dispose();
        this.scene.children.forEach(disposeNode);
    }

    public onZoom(delta: number) {
        const { lat, lng, altitude } = cartesian2Polar(this.camera.position.clone().sub(CENTER));
        const { x, y, z } = polar2Cartesian(lat, lng, clamp(altitude + delta, MIN_DISTANCE, MAX_DISTANCE) - GLOBE_RADIUS);
        this.camera.position.x = x + CENTER.x;
        this.camera.position.y = y + CENTER.y;
        this.camera.position.z = z + CENTER.z;
    }

    private onCameraChange() {
        const altitude = this.camera.position.clone().distanceTo(CENTER);
        const showDecors = altitude < 240;
        if (this.earth.countryVisibility !== showDecors) {
            this.earth.setCountryVisibility(showDecors);
        }
        this.updateUsers(altitude);
    }

    private updateUsers(altitude: number) {
        for (const child of this.earth.children) {
            if (child.name === 'pin') {
                (child as Pin).update(this.camera.position.clone(), altitude);
            }
        }
    }

    public onMouseMove(event: React.MouseEvent) {
        const { top, left, width, height } = this.canvasRect;
        // calculate mouse position in normalized device coordinates, (-1 to +1) for both components
        this.mousePosition = {
            x: ((event.clientX - left) / width) * 2 - 1,
            y: 1 - ((event.clientY - top) / height) * 2,
        };
    }

    public onStopRotationAnimation() {
        if (this.restartRotationAnimationTimeout !== null) {
            clearTimeout(this.restartRotationAnimationTimeout);
        }
        this.controls.autoRotate = false;
        this.restartRotationAnimationTimeout = window.setTimeout(() => {
            this.restartRotationAnimationTimeout = null;
            this.controls.autoRotate = true;
        }, 10000);
    }

    public onHover() {
        if (this.mousePosition === null) {
            this.hoveredObject?.onMouseLeave();
            this.hoveredObject = null;
            this.setMouseStyle('default');
            this.setPopoverData(null);
            return;
        }

        const hoverableObjects: Object3D[] = [];
        this.scene.traverseVisible((object) => {
            if (isHoverable(object)) {
                if (object.userData.hoverableTargets) {
                    hoverableObjects.push(...object.userData.hoverableTargets);
                } else {
                    hoverableObjects.push(object);
                }
            }
        });
        this.raycaster.setFromCamera(this.mousePosition, this.camera);
        const intersections = this.raycaster.intersectObjects(hoverableObjects, false);
        const firstIntersectObject = intersections[0]?.object || null;
        let hoveredObject: HoverableObject | null = null;
        if (firstIntersectObject && isHoverable(firstIntersectObject)) {
            hoveredObject = firstIntersectObject;
        } else if (firstIntersectObject && isHoverable(firstIntersectObject.parent)) {
            hoveredObject = firstIntersectObject.parent;
        }

        // Update hovered events
        if (this.hoveredObject !== hoveredObject) {
            this.hoveredObject?.onMouseLeave();
            this.hoveredObject = hoveredObject;
            this.hoveredObject?.onMouseEnter();
            this.setMouseStyle(this.hoveredObject === null ? 'default' : this.hoveredObject.userData.cursor || 'pointer');
            if (this.hoveredObject !== null && this.hoveredObject.name === 'country') {
                this.setPopoverData({
                    type: 'country',
                    data: {
                        country: (this.hoveredObject as Country).userData.countryName,
                    },
                });
            } else if (this.hoveredObject !== null && this.hoveredObject.name === 'pin') {
                this.setPopoverData({
                    type: 'user-and-classroom',
                    data: {
                        user: (this.hoveredObject as Pin).userData.user,
                        classroom: (this.hoveredObject as Pin).userData.classroom,
                    },
                });
            } else {
                this.setPopoverData(null);
            }
        }
    }

    public getHoveredObjectName() {
        return this.hoveredObject?.name;
    }

    public resetHoverState() {
        this.mousePosition = null;
    }
}
