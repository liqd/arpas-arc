import * as THREE from "three";
import { RootState } from "@react-three/fiber";
import { ObjectData, VariantData } from "../types/objectData";
import { Position } from "../types/transform";

/**
 * Computes XR interaction and returns the first intersected scene object.
 *
 * @param {XRInputSourceEvent} event - XR input event from selectstart.
 * @param {THREE.Scene} scene - The active Three.js scene.
 * @param {Array<{ id: number }>} sceneObjects - List of tracked scene objects.
 * @returns { { id: number } | null } - The selected scene object or null if no valid object is found.
 */
export function getIntersectedSceneObject(event: XRInputSourceEvent, state: RootState, objects: ObjectData[]
): number | null {
    const inputSource = event.inputSource;
    const referenceSpace = state.gl.xr.getReferenceSpace() as XRSpace;

    const pose = event.frame.getPose(inputSource.targetRaySpace, referenceSpace);
    if (!pose) return null;

    const { x, y, z } = pose.transform.position;
    const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
    const origin = new THREE.Vector3(x, y, z);
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion(qx, qy, qz, qw));

    const raycaster = new THREE.Raycaster(origin, direction);
    const intersects = raycaster.intersectObjects(state.scene.children, true);

    console.log("Intersects:", intersects);
    for (const hit of intersects) {
        const sceneObjectId = hit.object?.userData?.sceneObjectId;
        if (sceneObjectId !== undefined) {
            return objects.find(obj => obj.id === sceneObjectId)?.id || null;
        }
    }

    return null;
}

export const getObjectPosition = (
    sceneObject: ObjectData,
    variant: VariantData,
    worldPosition: Position,
    getPosition: (latitude: number, longitude: number) => Position
): Position => {
    const coordinates = sceneObject.coordinates || [0, 0];
    const offsetPosition = variant?.offset_position || new Position();

    return getPosition(coordinates[0], coordinates[1])
        .addedPosition(offsetPosition)
        .substractedPosition(worldPosition);
};

export function getClosestObject(
    targetPosition: Position,
    sceneObjects: ObjectData[],
    selectedVariants: Record<number, number>,
    worldPosition: Position,
    getPosition: (latitude: number, longitude: number) => Position
) {
    if (!sceneObjects || sceneObjects.length === 0) return null;

    let closest = null;
    let minDistance = Infinity;

    for (const sceneObject of sceneObjects) {
        if (!sceneObject || !sceneObject.variants) continue;
        const variantId = selectedVariants[sceneObject.id] ?? sceneObject.variants[0]?.id;
        const variant = sceneObject.variants.find((v) => v.id === variantId);
        if (!variant) continue;

        const position = getObjectPosition(sceneObject, variant, worldPosition, getPosition);
        const distance = targetPosition.distanceTo(position);
        if (distance < minDistance) {
            minDistance = distance;
            closest = { sceneObject, variant, position, distance };
        }
    }
    return closest;
}