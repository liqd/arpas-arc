import { Position, Rotation, Scale } from "../components";

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