import { create } from "zustand";
import { SceneData, ObjectData, VariantData, CommentData, ReplyData } from "../types/objectData";
import { useCommentsStore } from "./commentsStore";
import { useRatingStore } from "./ratingStore";

interface SceneState {
    scene: SceneData;
    setScene: (scene: SceneData) => void;
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
}));

export default useSceneStore;