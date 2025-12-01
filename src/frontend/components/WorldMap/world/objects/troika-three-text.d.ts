declare module 'troika-three-text' {
    import type { Object3D } from 'three';

    export class Text extends Object3D {
        text: string;
        fontSize: number;
        color: number | string;
        anchorX: string | number;
        anchorY: string | number;
        textAlign: string;
        maxWidth: number;
        overflowWrap: string;
        sync(): void;
    }
}
