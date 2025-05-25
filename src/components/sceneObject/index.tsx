import * as THREE from "three";
import { Position, Rotation, Scale } from "../../types/transform";
import { GeolocationObject } from "../locationObjects";
import { CommentData, ObjectData, VariantData } from "../../types/objectData";
import { nullCoordinates } from "../locationObjects/geolocation";
import { ObjectSessionData } from "../../types/sessionData";

class SceneObject {
    private readonly _id: number;
    get id(): number { return this._id; }
    private readonly _getObjectData: (id: number) => { data: ObjectData, sessionData: ObjectSessionData };
    private readonly _postObjectData: (objectData: ObjectData | null, sessionData: ObjectSessionData | null) => void;
    get objectData(): { data: ObjectData, sessionData: ObjectSessionData } {
        const objectData = this._getObjectData(this._id);
        if (!objectData) {
            console.error("!!!", this._id); // TODO
            return { data: {} as ObjectData, sessionData: {} as ObjectSessionData };
        }
        return this._getObjectData(this._id);
    }
    private _cachedData: ObjectData | null = null;
    get data(): ObjectData {
        this._cachedData = this.objectData.data;
        return this._cachedData;
    }
    private _cachedSessionData: ObjectSessionData | null = null;
    get sessionData(): ObjectSessionData {
        this._cachedSessionData = this.objectData.sessionData;
        return this._cachedSessionData;
    }
    set objectData(objectData: { data: ObjectData; sessionData: ObjectSessionData }) {
        this._postObjectData(objectData.data, objectData.sessionData);
    }
    set data(data: ObjectData) {
        this._postObjectData(data, null);
    }
    set sessionData(sessionData: ObjectSessionData) {
        this._postObjectData(null, sessionData);
    }

    private readonly _geolocationObject?: GeolocationObject;
    private _geoScenePosition?: Position;
    private _geoSceneRotation?: Rotation;

    get currentVariantId(): number {
        return this.sessionData.selectedVariantId;
    }

    constructor(id: number,
        getObjectData: (id: number) => { data: ObjectData, sessionData: ObjectSessionData },
        postObjectData: (objectData: ObjectData | null, sessionData: ObjectSessionData | null) => void,
        currentVariantIndex: number = 0, placeOnGround: boolean = false, groundMesh: THREE.Mesh | null = null
    ) {
        this._id = id;
        this._getObjectData = getObjectData;
        this._postObjectData = postObjectData;
        this.changeVariant(currentVariantIndex); // Ensure the index is in range

        if (this.data.coordinates) {
            if (!this.data.coordinates[0] || !this.data.coordinates[1]) {
                console.warn("Invalied coordinates provided for scene object with id: ", this.id);
            }
            else {
                this._geolocationObject = new GeolocationObject(
                    this.data.coordinates[0], // Latitude
                    this.data.coordinates[1], // Longitude
                    this.data.coordinates[2] ?? 0, // Altitude
                    0 // Default north-facing rotation
                );

                // Reference position stays [0, 0, 0] because the scene group is moved instead
                this.updateGeoScenePosition(nullCoordinates, new Position(), placeOnGround, groundMesh);
            }
        } else {
            console.warn(`SceneObject (ID: ${this.id}) lacks gps coordinates.`);
        }
    }

    updateGeoScenePosition(referenceCoordinates: GeolocationCoordinates, relativeWorldPosition: Position = new Position(),
        placeOnGround: boolean = false, groundMesh: THREE.Mesh | null = null) {
        if (!referenceCoordinates) return;

        if (!this._geolocationObject) {
            console.warn(`SceneObject (ID: ${this.id}) lacks geolocation.`);
            return;
        }

        const { position, rotation } = this._geolocationObject.placeAtWorldCoords(referenceCoordinates, relativeWorldPosition, placeOnGround, groundMesh);
        this._geoScenePosition = position;
        this._geoSceneRotation = rotation;

        console.log(`SceneObject (ID: ${this.id}) position recalculated:`, this._geoScenePosition);
    }

    getScenePosition(): Position {
        return (this._geoScenePosition?.clone() ?? new Position()).add(new Position(this.getCurrentVariantData().offset_position));
    }
    getSceneRotation(): Rotation {
        return (this._geoSceneRotation?.clone() ?? new Rotation()).add(new Rotation(this.getCurrentVariantData().offset_rotation));
    }
    getScale(): Scale {
        return new Scale(this.getCurrentVariantData().offset_scale);
    }

    getVariantsData(): VariantData[] {
        return this.data.variants;
    }
    getCurrentVariantData(): VariantData {
        return this.getVariantsData()[this.sessionData.selectedVariantId];
    };
    changeVariant(variantId: number): VariantData {
        if (this.getVariantsData().find(variant => variant.id === variantId)) {
            const updatedSessionData = { ...this.sessionData, selectedVariantId: variantId };
            this.sessionData = updatedSessionData;
        }
        return this.getCurrentVariantData();
    }
    nextVariant(): VariantData {
        return this.changeVariant(Math.min(this.currentVariantId + 1, this.data.variants.length - 1));
    }
    previousVariant(): VariantData {
        return this.changeVariant(Math.max(this.currentVariantId - 1, 0));
    }

    getComments(): CommentData[] {
        return this.data.comments;
    }
    // getCommment(id: number): CommentData {
    //     return this.getComments().find(comment => comment.id === this.id);
    // }
    addComment(newComment: CommentData): CommentData[] {
        const updatedData = {
            ...this.data,
            comments: [...(this.data.comments || []), newComment],
        };
        this.data = updatedData;
        return updatedData.comments;
    }
    updateComment(comment: CommentData): CommentData {
        console.log("wevcwe");
        const updatedComments = this.data.comments.map(c =>
            c.id === comment.id ? comment : c
        );
    
        this.data = { ...this.data, comments: updatedComments };
        return comment;
    }
};

export default SceneObject;