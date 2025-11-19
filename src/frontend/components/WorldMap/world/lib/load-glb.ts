import type { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const LOADER = new GLTFLoader();

export const loadGLB = (path: string, onLoad: (model: Group) => void, onError: (error: ErrorEvent) => void) => {
  LOADER.load(
    path,
    (gltf) => {
      onLoad(gltf.scene);
    },
    () => {},
    (error) => {
      console.error('An error happened loading the model...');
      console.error(error);
      onError(error);
    },
  );
};
