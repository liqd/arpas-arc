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
                                        likes: !variant.isLiked ? variant.likes + 1 : variant.likes - 1,
                                        isLiked: !variant.isLiked,
                                        // Optionally reset dislike if switching from dislike to like
                                        dislikes: variant.isDisliked ? variant.dislikes - 1 : variant.dislikes,
                                        isDisliked: false,
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
                                        dislikes: !variant.isDisliked ? variant.dislikes + 1 : variant.dislikes - 1,
                                        isDisliked: !variant.isDisliked,
                                        // Optionally reset like if switching from dislike to like
                                        likes: variant.isLiked ? variant.likes - 1 : variant.likes,
                                        isLiked: false,
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
