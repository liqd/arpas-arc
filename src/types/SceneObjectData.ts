import { Position, Rotation, Scale } from "./transform";

export type SceneData = {
    id: number,
    topicId: number,
    objects: Array<ObjectData>
}

export type ObjectData = {
    id: number,
    name: string,
    variants: Array<VariantData>,
    longitude: number,
    latitude: number,
    altitude: number
}

export type VariantData = {
    id: number,
    title: string,
    description: string,
    meshId: string,
    offsetPosition: Position,
    offsetRotation: Rotation,
    offsetScale: Scale,
}

export type SceneObjectData = {
    id: string;
    gpsCoords?: {
        latitude: number;
        longitude: number;
        altitude: number;
    };
    heading?: number;
    position?: Position;
    rotation?: Rotation;
    scale?: Scale;
    bucket: string;
    modelKey: string;
}