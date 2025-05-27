import { create } from "zustand";
import { SceneData, ObjectData, VariantData, CommentData, ReplyData } from "../types/objectData";

interface SceneState {
    scene: SceneData;
    setScene: (scene: SceneData) => void;
    toggleVariantLike: (objectId: number, variantId: number) => void;
    toggleVariantDislike: (objectId: number, variantId: number) => void;
    postComment: (objectId: number, comment: CommentData) => void;
    postCommentReply: (objectId: number, commentId: number, reply: ReplyData) => void;
    toggleCommentLike: (objectId: number, commentId: number) => void;
    toggleCommentDislike: (objectId: number, commentId: number) => void;
}

const useSceneStore = create<SceneState>((set) => ({
    scene: { id: 0, object_id: 0, content_type: 0, objects: [] },

    setScene: (scene) => set({ scene }),

    toggleVariantLike: (objectId, variantId) =>
        set((state) => ({
            scene: {
                ...state.scene,
                objects: state.scene.objects.map((obj) =>
                    obj.id === objectId
                        ? {
                            ...obj,
                            variants: obj.variants.map((variant) =>
                                variant.id === variantId
                                    ? {
                                        ...variant,
                                        isLiked: !variant.isLiked,
                                        likes: !variant.isLiked ? variant.likes + 1 : variant.likes - 1,
                                        isDisliked: variant.isLiked ? variant.isDisliked : false,
                                        dislikes: variant.isLiked ? variant.dislikes : variant.dislikes - 1,
                                    }
                                    : variant
                            ),
                        }
                        : obj
                ),
            },
        })),

    toggleVariantDislike: (objectId, variantId) =>
        set((state) => ({
            scene: {
                ...state.scene,
                objects: state.scene.objects.map((obj) =>
                    obj.id === objectId
                        ? {
                            ...obj,
                            variants: obj.variants.map((variant) =>
                                variant.id === variantId
                                    ? {
                                        ...variant,
                                        isDisliked: !variant.isDisliked,
                                        dislikes: !variant.isDisliked ? variant.dislikes + 1 : variant.dislikes - 1,
                                        isLiked: variant.isDisliked ? variant.isLiked : false,
                                        likes: variant.isDisliked ? variant.likes : variant.likes - 1,
                                    }
                                    : variant
                            ),
                        }
                        : obj
                ),
            },
        })),

    postComment: (objectId, comment) =>
        set((state) => ({
            scene: {
                ...state.scene,
                objects: state.scene.objects.map((obj) =>
                    obj.id === objectId ? { ...obj, comments: [...obj.comments, comment] } : obj
                ),
            },
        })),

    postCommentReply: (objectId, commentId, reply) =>
        set((state) => ({
            scene: {
                ...state.scene,
                objects: state.scene.objects.map((obj) =>
                    obj.id === objectId
                        ? {
                            ...obj,
                            comments: obj.comments.map((comment) =>
                                comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment
                            ),
                        }
                        : obj
                ),
            },
        })),

    toggleCommentLike: (objectId, commentId) =>
        set((state) => ({
            scene: {
                ...state.scene,
                objects: state.scene.objects.map((obj) =>
                    obj.id === objectId
                        ? {
                            ...obj,
                            comments: obj.comments.map((comment) =>
                                comment.id === commentId
                                    ? {
                                        ...comment,
                                        isLiked: !comment.isLiked,
                                        likes: !comment.isLiked ? comment.likes + 1 : comment.likes - 1,
                                        isDisliked: comment.isLiked ? comment.isDisliked : false,
                                        dislikes: comment.isLiked ? comment.dislikes : comment.dislikes - 1,
                                    }
                                    : comment
                            ),
                        }
                        : obj
                ),
            },
        })),

    toggleCommentDislike: (objectId, commentId) =>
        set((state) => ({
            scene: {
                ...state.scene,
                objects: state.scene.objects.map((obj) =>
                    obj.id === objectId
                        ? {
                            ...obj,
                            comments: obj.comments.map((comment) =>
                                comment.id === commentId
                                    ? {
                                        ...comment,
                                        isDisliked: !comment.isDisliked,
                                        dislikes: !comment.isDisliked ? comment.dislikes + 1 : comment.dislikes - 1,
                                        isLiked: comment.isDisliked ? comment.isLiked : false,
                                        likes: comment.isDisliked ? comment.likes : comment.likes - 1,
                                    }
                                    : comment
                            ),
                        }
                        : obj
                ),
            },
        })),
}));

export default useSceneStore;
