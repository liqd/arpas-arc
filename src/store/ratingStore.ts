import { create } from "zustand";
import { listObjectRatings, submitObjectRating, type RawRating, type RatingTarget } from "../utility/databaseApi";
import type { ObjectData, CommentData, ReplyData, VariantData } from "../types/objectData";

// Add ratingId to model
export interface RatingModel {
    contentType: number;
    key: string;
    target: RatingTarget;
    objectPk: number;
    targetId: number;
    likes: number;
    dislikes: number;
    isLiked: boolean;
    isDisliked: boolean;
    ratingId?: number | null; // backend rating record id
}

type Key = string;
type ObjKey = string;

const makeKey = (ct: number, objPk: number, target: RatingTarget, id: number): Key =>
    `${ct}:${objPk}:${target}:${id}`;

interface RatingState {
    sceneContentType: number;
    variantContentType: number;
    commentContentType: number;
    byKey: Record<Key, RatingModel>;
    loadingObjects: Set<ObjKey>;

    setSceneContentType: (ct: number) => void;
    getSceneContentType: () => number;
    setVariantContentType: (ct: number) => void;
    getVariantContentType: () => number;
    setCommentContentType: (ct: number) => void;
    getCommentContentType: () => number;

    initFromScene: (objects: ObjectData[]) => void;
    ensureObjectLoaded: (objPk: number) => void;

    // selectors
    getVariantRating: (objPk: number, variantId: number) => RatingModel | undefined;
    getCommentRating: (objPk: number, commentId: number) => RatingModel | undefined;

    // actions (optimistic, no API yet)
    toggleVariantLike: (variantPk: number, variantId: number) => void;
    toggleVariantDislike: (variantPk: number, variantId: number) => void;
    toggleCommentLike: (commentPk: number, commentId: number) => void;
    toggleCommentDislike: (commentPk: number, commentId: number) => void;
}

// Patch applicator stores/updates ratingId
function applyRemotePatch(byKey: Record<Key, RatingModel>, r: RawRating) {
    const k = makeKey(r.content_type, r.object_pk, r.target, r.target_id);
    const current = byKey[k] ?? {
        key: k,
        target: r.target,
        contentType: r.content_type,
        objectPk: r.object_pk,
        targetId: r.target_id,
        likes: 0,
        dislikes: 0,
        isLiked: false,
        isDisliked: false,
        ratingId: null
    };
    const next: RatingModel = { ...current };

    // counts (prefer top-level, then meta_info)
    if (typeof r.positive_rating_count === "number") next.likes = r.positive_rating_count;
    else if (typeof r.meta_info?.positive_ratings_on_same_object === "number") next.likes = r.meta_info.positive_ratings_on_same_object;
    if (typeof r.negative_rating_count === "number") next.dislikes = r.negative_rating_count;
    else if (typeof r.meta_info?.negative_ratings_on_same_object === "number") next.dislikes = r.meta_info.negative_ratings_on_same_object;

    const val = typeof r.value === "number"
        ? r.value
        : (typeof r.meta_info?.user_rating_on_same_object_value === "number" ? r.meta_info.user_rating_on_same_object_value : 0);
    next.isLiked = val === 1;
    next.isDisliked = val === -1;

    next.ratingId = r.id ?? r.meta_info?.user_rating_on_same_object_id ?? next.ratingId ?? null;

    byKey[k] = next;
}

function upsertVariant(models: Record<Key, RatingModel>, ct: number, objPk: number, v: VariantData) {
    const k = makeKey(ct, objPk, "variant", v.id);
    models[k] = models[k] ?? {
        key: k,
        target: "variant",
        contentType: ct,
        objectPk: objPk,
        targetId: v.id,
        likes: v.likes ?? 0,
        dislikes: v.dislikes ?? 0,
        isLiked: v.isLiked ?? false,
        isDisliked: v.isDisliked ?? false
    };
    models[k] = {
        ...models[k],
        likes: v.likes ?? models[k].likes,
        dislikes: v.dislikes ?? models[k].dislikes,
        isLiked: v.isLiked ?? models[k].isLiked,
        isDisliked: v.isDisliked ?? models[k].isDisliked
    };
}

function upsertComment(models: Record<Key, RatingModel>, ct: number, objPk: number, c: CommentData | ReplyData) {
    const k = makeKey(ct, objPk, "comment", c.id);
    models[k] = models[k] ?? {
        key: k,
        target: "comment",
        contentType: ct,
        objectPk: objPk,
        targetId: c.id,
        likes: 0,
        dislikes: 0,
        isLiked: false,
        isDisliked: false
    };
    models[k] = {
        ...models[k],
        likes: c.likes ?? models[k].likes,
        dislikes: c.dislikes ?? models[k].dislikes,
        isLiked: c.isLiked ?? models[k].isLiked,
        isDisliked: c.isDisliked ?? models[k].isDisliked
    };
}

export const useRatingStore = create<RatingState>((set, get) => ({
    sceneContentType: 0,
    variantContentType: 0,
    commentContentType: 0,
    byKey: {},
    loadingObjects: new Set(),

    setSceneContentType: (ct) => {
        set({ sceneContentType: ct });
    },
    getSceneContentType: () => {
        return get().sceneContentType;
    },
    setVariantContentType: (ct) => {
        set({ variantContentType: ct });
    },
    getVariantContentType: () => {
        return get().variantContentType;
    },
    setCommentContentType: (ct) => {
        set({ commentContentType: ct });
    },
    getCommentContentType: () => {
        return get().commentContentType;
    },

    initFromScene: (objects) => {
        if (!objects) return;
        set((state) => {
            const byKey = { ...state.byKey };
            objects.forEach(obj => {
                // variants
                (obj.variants || []).forEach(v => upsertVariant(byKey, get().variantContentType, obj.id, v));
                // comments + replies
                (obj.comments || []).forEach(c => {
                    upsertComment(byKey, get().commentContentType, obj.id, c);
                    (c.replies || []).forEach(r => upsertComment(byKey, get().commentContentType, obj.id, r));
                });
            });
            return { byKey };
        });
    },

    ensureObjectLoaded: (objPk) => {
        const key = `${get().variantContentType}:${objPk}`;
        const loading = get().loadingObjects;
        if (loading.has(key)) return;
        const next = new Set(loading);
        next.add(key);
        set({ loadingObjects: next });

        listObjectRatings(get().variantContentType, objPk)
            .then(list => {
                set(s => {
                    const byKey = { ...s.byKey };
                    list.forEach(r => applyRemotePatch(byKey, r));
                    return { byKey };
                });
            })
            .catch(e => console.debug("Ratings refresh failed:", e))
            .finally(() => {
                set(s => {
                    const n = new Set(s.loadingObjects);
                    n.delete(key);
                    return { loadingObjects: n };
                });
            });
    },

    getVariantRating: (objPk, variantId) => get().byKey[makeKey(get().variantContentType, objPk, "variant", variantId)],
    getCommentRating: (objPk, commentId) => get().byKey[makeKey(get().commentContentType, objPk, "comment", commentId)],

    toggleVariantLike: (objPk, variantId) => {
        const ct = get().variantContentType;
        const k = makeKey(ct, objPk, "variant", variantId);
        const prev = get().byKey[k];
        const wasLiked = !!prev?.isLiked;
        const wasDisliked = !!prev?.isDisliked;

        set(s => ({
            byKey: {
                ...s.byKey,
                [k]: {
                    key: k,
                    target: "variant",
                    contentType: ct,
                    objectPk: objPk,
                    targetId: variantId,
                    likes: (prev?.likes ?? 0) + (wasLiked ? -1 : 1),
                    dislikes: (prev?.dislikes ?? 0) - (wasDisliked ? 1 : 0),
                    isLiked: !wasLiked,
                    isDisliked: false,
                    ratingId: prev?.ratingId ?? null
                }
            }
        }));

        submitObjectRating(ct, objPk, "variant", variantId, wasLiked ? "clear" : "like", prev?.ratingId ?? null)
            .then(res => {
                if (res && typeof res === "object" && !Array.isArray(res)) {
                    const normalized = {
                        ...(res as any),
                        target: "variant",
                        target_id: variantId,
                        content_type: (res as any).content_type ?? ct,
                        object_pk: (res as any).object_pk ?? objPk
                    } as RawRating;
                    set(s => { const byKey = { ...s.byKey }; applyRemotePatch(byKey, normalized); return { byKey }; });
                } else if (Array.isArray(res) && res.length) {
                    const newId = Number(res[0]);
                    if (!Number.isNaN(newId)) {
                        set(s => {
                            const byKey = { ...s.byKey };
                            const cur = byKey[k];
                            if (cur) byKey[k] = { ...cur, ratingId: newId };
                            return { byKey };
                        });
                    } else {
                        get().ensureObjectLoaded(objPk);
                    }
                } else {
                    get().ensureObjectLoaded(objPk);
                }
            })
            .catch(() => set(s => ({ byKey: { ...s.byKey, [k]: prev! } })));
    },
    toggleVariantDislike: (objPk, variantId) => {
        const ct = get().variantContentType;
        const k = makeKey(ct, objPk, "variant", variantId);
        const prev = get().byKey[k];
        const wasDisliked = !!prev?.isDisliked;
        const wasLiked = !!prev?.isLiked;

        set(s => ({
            byKey: {
                ...s.byKey,
                [k]: {
                    key: k,
                    target: "variant",
                    contentType: ct,
                    objectPk: objPk,
                    targetId: variantId,
                    dislikes: (prev?.dislikes ?? 0) + (wasDisliked ? -1 : 1),
                    likes: (prev?.likes ?? 0) - (wasLiked ? 1 : 0),
                    isLiked: false,
                    isDisliked: !wasDisliked,
                    ratingId: prev?.ratingId ?? null
                }
            }
        }));

        submitObjectRating(ct, objPk, "variant", variantId, wasDisliked ? "clear" : "dislike", prev?.ratingId ?? null)
            .then(res => {
                if (res && typeof res === "object" && !Array.isArray(res)) {
                    const normalized = {
                        ...(res as any),
                        target: "variant",
                        target_id: variantId,
                        content_type: (res as any).content_type ?? ct,
                        object_pk: (res as any).object_pk ?? objPk
                    } as RawRating;
                    set(s => { const byKey = { ...s.byKey }; applyRemotePatch(byKey, normalized); return { byKey }; });
                } else if (Array.isArray(res) && res.length) {
                    const newId = Number(res[0]);
                    if (!Number.isNaN(newId)) {
                        set(s => {
                            const byKey = { ...s.byKey };
                            const cur = byKey[k];
                            if (cur) byKey[k] = { ...cur, ratingId: newId };
                            return { byKey };
                        });
                    } else {
                        get().ensureObjectLoaded(objPk);
                    }
                } else {
                    get().ensureObjectLoaded(objPk);
                }
            })
            .catch(() => set(s => ({ byKey: { ...s.byKey, [k]: prev! } })));
    },

    toggleCommentLike: (objPk, commentId) => {
        const ct = get().variantContentType;
        const k = makeKey(ct, objPk, "comment", commentId);
        const prev = get().byKey[k];
        const wasLiked = !!prev?.isLiked;
        const wasDisliked = !!prev?.isDisliked;

        set(s => ({
            byKey: {
                ...s.byKey,
                [k]: {
                    key: k,
                    target: "comment",
                    contentType: ct,
                    objectPk: objPk,
                    targetId: commentId,
                    likes: (prev?.likes ?? 0) + (wasLiked ? -1 : 1),
                    dislikes: (prev?.dislikes ?? 0) - (wasDisliked ? 1 : 0),
                    isLiked: !wasLiked,
                    isDisliked: false,
                    ratingId: prev?.ratingId ?? null
                }
            }
        }));

        submitObjectRating(ct, objPk, "comment", commentId, wasLiked ? "clear" : "like", prev?.ratingId ?? null)
            .then(res => {
                if (res && typeof res === "object" && !Array.isArray(res)) {
                    const normalized = {
                        ...(res as any),
                        target: "comment",
                        target_id: commentId,
                        content_type: (res as any).content_type ?? ct,
                        object_pk: (res as any).object_pk ?? objPk
                    } as RawRating;
                    set(s => { const byKey = { ...s.byKey }; applyRemotePatch(byKey, normalized); return { byKey }; });
                } else if (Array.isArray(res) && res.length) {
                    const newId = Number(res[0]);
                    if (!Number.isNaN(newId)) {
                        set(s => {
                            const byKey = { ...s.byKey };
                            const cur = byKey[k];
                            if (cur) byKey[k] = { ...cur, ratingId: newId };
                            return { byKey };
                        });
                    } else {
                        get().ensureObjectLoaded(objPk);
                    }
                } else {
                    get().ensureObjectLoaded(objPk);
                }
            })
            .catch(() => set(s => ({ byKey: { ...s.byKey, [k]: prev! } })));
    },
    toggleCommentDislike: (objPk, commentId) => {
        const ct = get().variantContentType;
        const k = makeKey(ct, objPk, "comment", commentId);
        const prev = get().byKey[k];
        const wasDisliked = !!prev?.isDisliked;
        const wasLiked = !!prev?.isLiked;

        set(s => ({
            byKey: {
                ...s.byKey,
                [k]: {
                    key: k,
                    target: "comment",
                    contentType: ct,
                    objectPk: objPk,
                    targetId: commentId,
                    dislikes: (prev?.dislikes ?? 0) + (wasDisliked ? -1 : 1),
                    likes: (prev?.likes ?? 0) - (wasLiked ? 1 : 0),
                    isLiked: false,
                    isDisliked: !wasDisliked,
                    ratingId: prev?.ratingId ?? null
                }
            }
        }));

        submitObjectRating(ct, objPk, "comment", commentId, wasDisliked ? "clear" : "dislike", prev?.ratingId ?? null)
            .then(res => {
                if (res && typeof res === "object" && !Array.isArray(res)) {
                    const normalized = {
                        ...(res as any),
                        target: "comment",
                        target_id: commentId,
                        content_type: (res as any).content_type ?? ct,
                        object_pk: (res as any).object_pk ?? objPk
                    } as RawRating;
                    set(s => { const byKey = { ...s.byKey }; applyRemotePatch(byKey, normalized); return { byKey }; });
                } else if (Array.isArray(res) && res.length) {
                    const newId = Number(res[0]);
                    if (!Number.isNaN(newId)) {
                        set(s => {
                            const byKey = { ...s.byKey };
                            const cur = byKey[k];
                            if (cur) byKey[k] = { ...cur, ratingId: newId };
                            return { byKey };
                        });
                    } else {
                        get().ensureObjectLoaded(objPk);
                    }
                } else {
                    get().ensureObjectLoaded(objPk);
                }
            })
            .catch(() => set(s => ({ byKey: { ...s.byKey, [k]: prev! } })));
    }
}));