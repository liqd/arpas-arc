import * as THREE from "three";
import { SceneObject } from "../components";
import { ObjectData } from "../types/objectData";
import { Position } from "../types/transform";
import { ObjectSessionData } from "../types/sessionData";
import { RootState } from "@react-three/fiber";

export function createSceneObject(
    id: number,
    getObjectData: (id: number) => { data: ObjectData, sessionData: ObjectSessionData },
    postObjectData: (objectData: ObjectData | null, sessionData: ObjectSessionData | null) => void,
    groundMesh: THREE.Mesh,
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>
) {
    try {
        setSceneObjects((prevObjects) => {
            const existingIndex = prevObjects.findIndex(obj => obj.id === id);

            if (existingIndex !== -1) {
                // ✅ Update existing object
                console.log("Update object", id);
                const updatedObjects = [...prevObjects];
                const currentObject = updatedObjects[existingIndex];
                updatedObjects[existingIndex] = new SceneObject(id, getObjectData, postObjectData, currentObject.currentVariantId, true, groundMesh);
                return updatedObjects;
            } else {
                console.log("Add object", id);
                // ✅ Add new object if it doesn't exist
                return [...prevObjects, new SceneObject(id, getObjectData, postObjectData, 0, true, groundMesh)];
            }
        });
    } catch (error) {
        console.error("Error placing object:", error);
        return;
    }
}

export function getClosestObject(referencePosition: Position, sceneObjects: SceneObject[]): { object: SceneObject | null, distance: number } {
    let closestObject = null;
    let closestDistance = Infinity;

    sceneObjects.forEach((obj) => {
        const scenePosition = obj.getScenePosition();
        if (scenePosition) {
            const dx = scenePosition.x - referencePosition.x;
            const dy = scenePosition.z - referencePosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy); // Simple Euclidean distance approximation

            if (distance < closestDistance) {
                closestObject = obj;
                closestDistance = distance;
            }
        }
    });

    return { object: closestObject, distance: closestDistance };
};

/**
 * Computes XR interaction and returns the first intersected scene object.
 *
 * @param {XRInputSourceEvent} event - XR input event from selectstart.
 * @param {THREE.Scene} scene - The active Three.js scene.
 * @param {Array<{ id: number }>} sceneObjects - List of tracked scene objects.
 * @returns { { id: number } | null } - The selected scene object or null if no valid object is found.
 */
export function getIntersectedSceneObject(event: XRInputSourceEvent, state: RootState, sceneObjects: SceneObject[]
): SceneObject | null {
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

    for (const hit of intersects) {
        const sceneObjectId = hit.object?.userData?.sceneObjectId;
        if (sceneObjectId !== undefined) {
            return sceneObjects.find(obj => obj.id === sceneObjectId) || null;
        }
    }

    return null;
}
