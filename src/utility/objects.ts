import * as THREE from "three";
import { GeolocationObject } from "../components";
import { SceneObjectData } from "../types/objectData";
import { Position, Scale } from "../types/transform";

export function placeObjectAtWorldCoordinates(
    referenceLocation: { coords: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    geolocationObject: GeolocationObject,
    id: string,
    bucket: string,
    modelKey: string,
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObjectData[]>>,
) {
    try {
        const { position, rotation } = geolocationObject.placeAtWorldCoords(referenceLocation.coords, referenceLocation.position, true, groundMesh);
        console.log(`Placing/updating object at ${position}.`);

        setSceneObjects((prevObjects) => {
            return prevObjects.some((obj) => obj.id === id)
                ? prevObjects.map((obj) => (obj.id === id ? { ...obj, position, rotation } : obj))
                : [...prevObjects, { id, position, rotation, scale: new Scale(1, 1, 1), bucket, modelKey }];
        });
    } catch (error) {
        console.error("Error placing object:", error);
        return;
    }
}

export function placeObjectDataAtWorldCoordinates(
    referenceLocation: { coords: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    objectData: SceneObjectData,
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObjectData[]>>,
) {
    if (!objectData.gpsCoords) {
        console.warn("Encountered an object without gps coordinates, skipping.");
        return;
    }

    const geolocationObject = new GeolocationObject(
        objectData.gpsCoords.latitude,
        objectData.gpsCoords.longitude,
        objectData.gpsCoords.altitude ?? 0,
        objectData.heading
    );

    placeObjectAtWorldCoordinates(referenceLocation, groundMesh, geolocationObject,
        objectData.id, objectData.bucket, objectData.modelKey, setSceneObjects);
}

export function placeObjectsAtWorldCoordinates(
    referenceLocation: { coords: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    objectsData: SceneObjectData[],
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObjectData[]>>,
) {
    objectsData.forEach((objectData) => {
        if (!objectData) {
            console.warn("Encountered a null object in objectsData, skipping.");
            return;
        }
        placeObjectDataAtWorldCoordinates(referenceLocation, groundMesh, objectData, setSceneObjects);
    });
}

export function getClosestObject(referencePosition: Position, sceneObjects: SceneObjectData[]): { object: SceneObjectData | null, distance: number } {
    let closestObject = null;
    let closestDistance = Infinity;

    sceneObjects.forEach((obj) => {
        if (obj.position) {
            const dx = obj.position.x - referencePosition.x;
            const dy = obj.position.z - referencePosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy); // Simple Euclidean distance approximation

            if (distance < closestDistance) {
                closestObject = obj;
                closestDistance = distance;
            }
        }
    });

    return { object: closestObject, distance: closestDistance };
};