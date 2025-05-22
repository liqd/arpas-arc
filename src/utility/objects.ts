import * as THREE from "three";
import { SceneObject } from "../components";
import { ObjectData } from "../types/objectData";
import { Position } from "../types/transform";

export function placeObjectAtWorldCoordinates(
    referenceLocation: { coordinates: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    objectData: ObjectData,
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>
) {
    try {
        setSceneObjects((prevObjects) => {
            return prevObjects.some((obj) => obj.id === objectData.id)
                ? prevObjects.map((obj) =>
                    obj.id === objectData.id
                        ? new SceneObject(objectData, obj.currentVariantIndex, referenceLocation.coordinates, true, groundMesh)
                        : obj
                )
                : [...prevObjects, new SceneObject(objectData, 0, referenceLocation.coordinates, true, groundMesh)];
        });
    } catch (error) {
        console.error("Error placing object:", error);
        return;
    }
}

export function placeObjectDataAtWorldCoordinates(
    referenceLocation: { coordinates: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    objectData: ObjectData,
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>,
) {
    placeObjectAtWorldCoordinates(referenceLocation, groundMesh, objectData, setSceneObjects);
}

export function placeObjectsAtWorldCoordinates(
    referenceLocation: { coordinates: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    objectsData: ObjectData[],
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>,
) {
    objectsData.forEach((objectData) => {
        if (!objectData) {
            console.warn("Encountered a null object in objectsData, skipping.");
            return;
        }
        placeObjectDataAtWorldCoordinates(referenceLocation, groundMesh, objectData, setSceneObjects);
    });
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