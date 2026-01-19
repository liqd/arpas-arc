import { create } from "zustand";
import { SceneData, ObjectData, VariantData, CommentData, ReplyData } from "../types/objectData";
import { useCommentsStore } from "./commentsStore";
import { useRatingStore } from "./ratingStore";

interface SceneState {
    scene: SceneData;
    setScene: (scene: SceneData) => void;
    getObjectData: (id: number) => ObjectData | undefined;
    getVariantData: (objectId: number, variantId: number) => VariantData | undefined;
    getVariantDataOfObject: (object: ObjectData, variantId: number) => VariantData | undefined;
}

const useSceneStore = create<SceneState>((set) => ({
    scene: { id: 0, object_id: 0, content_type: 0, objects: [] },

    setScene: (scene) => {
        set({ scene });
        if (scene?.objects && scene.content_type) {
            useCommentsStore.getState().initFromScene(scene.objects);
            useRatingStore.getState().initFromScene(scene.objects);
        }
    },

    getObjectData: (id: number): ObjectData | undefined => {
        const { scene } = useSceneStore.getState();
        return scene?.objects?.find((o) => o.id === id);
    },

    getVariantData: (objectId: number, variantId: number): VariantData | undefined => {
        const object = useSceneStore.getState().getObjectData(objectId);
        const variant = object?.variants.find((v) => v.id === variantId);
        return variant;
    },
    getVariantDataOfObject(object: ObjectData, variantId: number): VariantData | undefined {
        const variant = object.variants.find((v) => v.id === variantId);
        return variant;
    },
}));

export default useSceneStore;