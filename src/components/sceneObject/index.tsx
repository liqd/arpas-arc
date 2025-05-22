import * as THREE from "three";

import { Position, Rotation, Scale } from "../../types/transform";
import { GeolocationObject } from "../locationObjects";
import { ObjectData, VariantData } from "../../types/objectData";

class SceneObject {
    private readonly _objectData: ObjectData;
    get objectData(): ObjectData { return this._objectData; }
    get id(): number { return this._objectData.id; }

    private readonly _geolocationObject?: GeolocationObject;
    private _geoScenePosition?: Position;
    private _geoSceneRotation?: Rotation;

    private _currentVariantIndex: number;
    get currentVariantIndex(): number { return this._currentVariantIndex; }

    constructor(objectData: ObjectData, currentVariant: number = 0,
        initialCoords: GeolocationCoordinates, placeOnGround: boolean = false, groundMesh: THREE.Mesh | null = null
    ) {
        this._objectData = objectData;
        this._currentVariantIndex = currentVariant

        if (objectData.coordinates) {
            this._geolocationObject = new GeolocationObject(
                objectData.coordinates[0], // Latitude
                objectData.coordinates[1], // Longitude
                objectData.coordinates[2] ?? 0, // Altitude
                0 // Default north-facing rotation
            );

            // Initial position stays [0, 0, 0] because the scene group is moved instead
            this.updateGeoScenePosition(initialCoords, new Position(), placeOnGround, groundMesh);
        } else {
            console.warn(`SceneObject (ID: ${this._objectData.id}) lacks gps coordinates.`);
        }
    }

    updateGeoScenePosition(initialCoords: GeolocationCoordinates, initialPosition: Position = new Position(),
        placeOnGround: boolean = false, groundMesh: THREE.Mesh | null = null) {
        if (!this._geolocationObject) {
            console.warn(`SceneObject (ID: ${this._objectData.id}) lacks geolocation.`);
            return;
        }

        const { position, rotation } = this._geolocationObject.placeAtWorldCoords(initialCoords, initialPosition, placeOnGround, groundMesh);
        this._geoScenePosition = position;
        this._geoSceneRotation = rotation;

        console.log(`SceneObject (ID: ${this._objectData.id}) position recalculated:`, this._geoScenePosition);
    }

    getScenePosition(): Position {
        return (this._geoScenePosition?.clone() ?? new Position()).add(new Position(this.getCurrentVariant().offset_position));
    }
    getSceneRotation(): Rotation {
        return (this._geoSceneRotation?.clone() ?? new Rotation()).add(new Rotation(this.getCurrentVariant().offset_rotation));
    }
    getScale(): Scale {
        return new Scale(this.getCurrentVariant().offset_scale);
    }

    getCurrentVariant(): VariantData {
        return this._objectData.variants[this._currentVariantIndex];
    };
    changeVariant(variantIndex: number): VariantData {
        if (variantIndex >= 0 && variantIndex < this._objectData.variants.length) {
            this._currentVariantIndex = variantIndex;
        }
        return this.getCurrentVariant();
    }
    nextVariant(): VariantData {
        return this.changeVariant(Math.min(this._currentVariantIndex + 1, this._objectData.variants.length - 1));
    }
    previousVariant(): VariantData {
        return this.changeVariant(Math.max(this._currentVariantIndex - 1, 0));
    }
};

export default SceneObject;