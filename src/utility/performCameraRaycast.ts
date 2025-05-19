import * as THREE from "three";

/**
 * Perform raycasting to find intersected objects in the scene.
 * @param mouse - Normalized device coordinates (THREE.Vector2).
 * @param camera - Camera used to set the ray's origin and direction.
 * @param scene - Scene containing objects to check for intersections.
 * @param recursive - Whether to check child objects recursively (default: true).
 * @returns Intersected objects sorted by distance.
 */
export const performCameraRaycast = (
    mouse: THREE.Vector2,
    camera: THREE.Camera,
    scene: THREE.Scene,
    recursive: boolean = true
): THREE.Intersection[] => {
    const raycaster = new THREE.Raycaster(); // Create a new Raycaster
    raycaster.setFromCamera(mouse, camera); // Set ray's origin and direction
    const intersects = raycaster.intersectObjects(scene.children, recursive); // Perform raycasting
    return intersects; // Return the intersected objects
};
