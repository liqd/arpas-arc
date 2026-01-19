import { create } from "zustand";
import { Position } from "../types/transform";
import { ObjectData, VariantData } from "../types/objectData";
import { getObjectPosition } from "../utility/objects";

interface ObjectPositionState {
    objectPositions: Record<string, Position>;

    setObjectPosition: (objectId: number, variantId: number, position: Position) => void;
    getStoredPosition: (objectId: number, variantId: number) => Position | null;

    computeAndSetObjectPosition: (
        object: ObjectData,
        variant: VariantData,
        getPosition: (lat: number, lng: number) => Position
    ) => Position;
}

const keyFor = (objectId: number, variantId: number) => `${objectId}_${variantId}`;

export const useObjectPositionStore = create<ObjectPositionState>((set, get) => ({
    objectPositions: {},

    // Store computed object position
    setObjectPosition: (objectId, variantId, position) => {
        set((state) => ({
            objectPositions: {
                ...state.objectPositions,
                [keyFor(objectId, variantId)]: position,
            },
        }));
    },

    // Retrieve stored object position
    getStoredPosition: (objectId, variantId) => {
        const position = get().objectPositions[keyFor(objectId, variantId)];
        return position || null;
    },

    // Compute and store object position based on GPS data
    computeAndSetObjectPosition: (object, variant, getPosition) => {
        const existing = get().objectPositions[keyFor(object.id, variant.id)];
        if (existing) return existing;

        const position = getObjectPosition(object, variant, getPosition);
        get().setObjectPosition(object.id, variant.id, position);

        return position;
    },
}));