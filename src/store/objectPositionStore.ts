import { create } from "zustand";
import { Position } from "../types/transform";
import { ObjectData, VariantData } from "../types/objectData";
import { getObjectPosition } from "../utility/objects";

interface ObjectPositionState {
    objectPositions: Record<number, Position>;

    setObjectPosition: (objectId: number, position: Position) => void;
    getStoredPosition: (objectId: number) => Position | null;

    computeAndSetObjectPosition: (
        object: ObjectData,
        variant: VariantData,
        getPosition: (lat: number, lng: number) => Position
    ) => void;
}

export const useObjectPositionStore = create<ObjectPositionState>((set, get) => ({
    objectPositions: {},

    // Store computed object position
    setObjectPosition: (objectId, position) => {
        set((state) => ({
            objectPositions: {
                ...state.objectPositions,
                [objectId]: position,
            },
        }));
    },

    // Retrieve stored object position
    getStoredPosition: (objectId) => {
        const position = get().objectPositions[objectId];
        return position || null;
    },

    // Compute and store object position based on GPS data
    computeAndSetObjectPosition: (object, variant, getPosition) => {
        const position = getObjectPosition(object, variant, getPosition);
        get().setObjectPosition(object.id, position);
    },
}));