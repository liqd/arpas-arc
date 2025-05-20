import * as THREE from "three";
import { GeolocationObject } from "../components";
import { SceneObjectData } from "../types/SceneObjectData";
import { Position, Rotation, Scale } from "./transform";

export function placeObjectAtWorldCoordinates(
    referenceLocation: { coords: GeolocationCoordinates; position: Position },
    groundMesh: THREE.Mesh,
    geolocationObject: GeolocationObject,
    id: string,
    bucket: string,
    modelKey: string,
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObjectData[]>>,
    relativePosition?: Position,
    relativeRotation?: Rotation,
    scale?: Scale
) {
    try {
        let { position, rotation } = geolocationObject.placeAtWorldCoords(referenceLocation.coords, referenceLocation.position, true, groundMesh);
        console.log(`Placing/updating object at ${position}.`);

        if(relativePosition) position.add(relativePosition);
        if(relativeRotation) rotation.add(relativeRotation);

        setSceneObjects((prevObjects) => {
            return prevObjects.some((obj) => obj.id === id)
                ? prevObjects.map((obj) => (obj.id === id ? { ...obj, relativePosition: position, relativeRotation: rotation } : obj))
                : [...prevObjects, { id, relativePosition: position, relativeRotation: rotation, scale: scale ?? new Scale(1, 1, 1), bucket, modelKey }];
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
        objectData.id, objectData.bucket, objectData.modelKey, setSceneObjects, 
        objectData.relativePosition, objectData.relativeRotation, objectData.scale);
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
        if (obj.relativePosition) {
            const dx = obj.relativePosition.x - referencePosition.x;
            const dy = obj.relativePosition.z - referencePosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy); // Simple Euclidean distance approximation

            if (distance < closestDistance) {
                closestObject = obj;
                closestDistance = distance;
            }
        }
    });

    return { object: closestObject, distance: closestDistance };
};