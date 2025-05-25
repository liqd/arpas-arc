import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CommentData, SceneData } from "../types/objectData";

const initialState: SceneData = {
    id: 0,
    object_id: 0,
    content_type: 0,
    objects: []
};

const sceneSlice = createSlice({
    name: "scene",
    initialState,
    reducers: {
        setScene: (_, action: PayloadAction<SceneData>) => action.payload,

        toggleVariantLike: (state, action: PayloadAction<{ objectId: number; variantId: number }>) => {
            const { objectId, variantId } = action.payload;
            const object = state.objects.find(obj => obj.id === objectId);
            const variant = object?.variants.find(v => v.id === variantId);
            if (!variant) return;

            if (variant.isLiked) {
                variant.likes--;
                variant.isLiked = false;
            } else {
                variant.likes++;
                if (variant.isDisliked) {
                    variant.dislikes--;
                    variant.isDisliked = false;
                }
                variant.isLiked = true;
            }
        },

        toggleVariantDislike: (state, action: PayloadAction<{ objectId: number; variantId: number }>) => {
            const { objectId, variantId } = action.payload;
            const object = state.objects.find(obj => obj.id === objectId);
            const variant = object?.variants.find(v => v.id === variantId);
            if (!variant) return;

            if (variant.isDisliked) {
                variant.dislikes--;
                variant.isDisliked = false;
            } else {
                variant.dislikes++;
                if (variant.isLiked) {
                    variant.likes--;
                    variant.isLiked = false;
                }
                variant.isDisliked = true;
            }
        },

        addCommentToObject: (
            state,
            action: PayloadAction<{ objectId: number; comment: CommentData }>
        ) => {
            const { objectId, comment } = action.payload;
            const object = state.objects.find(obj => obj.id === objectId);
            if (object) {
                object.comments = [...(object.comments || []), comment];
            }
        },

        toggleCommentLike: (state, action: PayloadAction<{ objectId: number; commentId: number }>) => {
            const object = state.objects.find(obj => obj.id === action.payload.objectId);
            const comment = object?.comments.find(c => c.id === action.payload.commentId);
            if (!comment) return;

            if (comment.isLiked) {
                comment.likes--;
                comment.isLiked = false;
            } else {
                comment.likes++;
                if (comment.isDisliked) {
                    comment.dislikes--;
                    comment.isDisliked = false;
                }
                comment.isLiked = true;
            }
        },

        toggleCommentDislike: (state, action: PayloadAction<{ objectId: number; commentId: number }>) => {
            const object = state.objects.find(obj => obj.id === action.payload.objectId);
            const comment = object?.comments.find(c => c.id === action.payload.commentId);
            if (!comment) return;

            if (comment.isDisliked) {
                comment.dislikes--;
                comment.isDisliked = false;
            } else {
                comment.dislikes++;
                if (comment.isLiked) {
                    comment.likes--;
                    comment.isLiked = false;
                }
                comment.isDisliked = true;
            }
        },

    },
});

export const {
    setScene,
    toggleVariantLike,
    toggleVariantDislike,
    addCommentToObject,
    toggleCommentLike,
    toggleCommentDislike
} = sceneSlice.actions;

export default sceneSlice.reducer;
