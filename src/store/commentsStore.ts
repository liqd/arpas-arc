import { create } from "zustand";
import { listObjectComments, createObjectComment, type RawComment } from "../utility/databaseApi";
import type { ObjectData, CommentData, ReplyData } from "../types/objectData";

export interface CommentModel {
    id: number;
    objectPk: number;
    parentId: number | null;
    text: string;
    userName?: string;
    created?: string;
    likes?: number;
    dislikes?: number;
    _optimistic?: boolean;
    _pending?: boolean;
}

type ObjKey = string;

interface CommentsState {
    variantContentType: number;
    commentContentType: number;
    byId: Record<number, CommentModel>;
    rootIdsByObject: Record<ObjKey, number[]>;
    childIds: Record<number, number[]>;
    loadingObjects: Set<ObjKey>;

    setVariantContentType: (ct: number) => void;
    getVariantContentType: () => number;
    setCommentContentType: (ct: number) => void;
    getCommentContentType: () => number;

    initFromScene: (objects: ObjectData[]) => void;
    ensureObjectLoaded: (objPk: number) => void;

    getCommentRoots: (objPk: number) => CommentModel[];
    getCommentCount: (objPk: number) => number;
    getReplyComments: (parentId: number) => CommentModel[];
    addComment: (objPk: number, text: string, parentId?: number) => Promise<void>;
}

function normalizeRaw(r: RawComment): CommentModel {
    return {
        id: r.id,
        objectPk: r.object_pk,
        parentId: r.parent ?? null,
        text: r.comment,
        userName: r.user_name,
        created: r.created,
        likes: r.ratings?.positive_ratings ?? 0,
        dislikes: r.ratings?.negative_ratings ?? 0,
    };
}

function upsert(arr: number[], id: number) {
    const idx = arr.indexOf(id);
    if (idx !== -1) return;
    arr.push(id);
}

// Flatten possible nested child_comments from list endpoint
function flattenComments(root: RawComment): RawComment[] {
    const out: RawComment[] = [];
    const stack: { node: RawComment; parentId: number | null }[] = [{ node: root, parentId: root.parent ?? null }];
    while (stack.length) {
        const { node, parentId } = stack.pop()!;
        const copy: RawComment = { ...node, parent: parentId ?? node.parent ?? null, child_comments: undefined };
        out.push(copy);
        const children = node.child_comments || [];
        for (let i = 0; i < children.length; i++) {
            const ch = children[i];
            stack.push({ node: ch, parentId: node.id });
        }
    }
    return out;
}

export const useCommentsStore = create<CommentsState>((set, get) => ({
    variantContentType: 0,
    commentContentType: 0,
    byId: {},
    rootIdsByObject: {},
    childIds: {},
    loadingObjects: new Set(),

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
        set(state => {
            const byId = { ...state.byId };
            const rootIdsByObject = { ...state.rootIdsByObject };
            const childIds = { ...state.childIds };
            objects.forEach(obj => {
                const key = `${obj.id}`;
                if (!rootIdsByObject[key]) rootIdsByObject[key] = [];
                const rootIds: number[] = [];
                (obj.comments || []).forEach((c: CommentData) => {
                    // root
                    byId[c.id] = {
                        id: c.id,
                        objectPk: obj.id,
                        parentId: null,
                        text: c.text,
                        userName: c.username,
                        created: new Date(c.timestamp).toISOString()
                    };
                    rootIds.push(c.id);
                    // replies
                    (c.replies || []).forEach((r: ReplyData) => {
                        byId[r.id] = {
                            id: r.id,
                            objectPk: obj.id,
                            parentId: r.commentId,
                            text: r.text,
                            userName: r.username,
                            created: new Date(r.timestamp).toISOString()
                        };
                        if (!childIds[r.commentId]) childIds[r.commentId] = [];
                        upsert(childIds[r.commentId], r.id);
                    });
                });

                // Reverse root and child arrays so newest is first
                rootIdsByObject[key] = rootIds.reverse();
                Object.keys(childIds).forEach(cid => {
                    const numCid = Number(cid);
                    childIds[numCid] = childIds[numCid].reverse();
                });
            });
            return { byId, rootIdsByObject, childIds };
        });
    },

    ensureObjectLoaded: (objPk) => {
        const key = `${objPk}`;
        const s = get();
        if (s.loadingObjects.has(key)) return;
        s.loadingObjects.add(key);
        listObjectComments(s.variantContentType, objPk)
            .then(rawList => {
                // if API returns nested child_comments, flatten them
                const flatList: RawComment[] = [];
                for (const r of rawList) {
                    if (Array.isArray(r.child_comments) && r.child_comments.length) {
                        flatList.push(...flattenComments(r));
                    } else {
                        flatList.push(r);
                    }
                }

                set(st => {
                    const byId = { ...st.byId };
                    const rootIdsByObject = { ...st.rootIdsByObject };
                    const childIds = { ...st.childIds };
                    const roots: number[] = [];

                    flatList.forEach(r => {
                        const m = normalizeRaw(r);
                        byId[m.id] = { ...(byId[m.id] || {}), ...m, _optimistic: false, _pending: false };
                    });

                    flatList.forEach(r => {
                        const id = r.id;
                        if (r.parent) {
                            if (!childIds[r.parent]) childIds[r.parent] = [];
                            upsert(childIds[r.parent], id);
                        } else {
                            roots.push(id);
                        }
                    });

                    rootIdsByObject[key] = roots.reverse();
                    return { byId, rootIdsByObject, childIds };
                });
            })
            .catch(e => console.debug("Comment refresh failed:", e))
            .finally(() => {
                set(st => {
                    const lo = new Set(st.loadingObjects);
                    lo.delete(key);
                    return { loadingObjects: lo };
                });
            });
    },

    getCommentRoots: (objPk) => {
        const key = `${objPk}`;
        const s = get();
        return (s.rootIdsByObject[key] || [])
            .map(id => s.byId[id])
            .filter(Boolean);
    },

    getReplyComments: (parentId) => {
        const s = get();
        return (s.childIds[parentId] || [])
            .map(id => s.byId[id])
            .filter(Boolean);
    },

    // Get total comment count including replies
    getCommentCount: (objPk: number) => {
        const s = get();
        const key = `${objPk}`;

        let count = 0;

        const root = s.rootIdsByObject[key] || [];

        for (const rootId of root) {
            count++;    // count root comment
            const replyCount = s.childIds[rootId] || [];
            for (const replyID of replyCount) {
                count++;    // count each reply
            }
        }
        return count;
    },

    addComment: async (objPk, text, parentId) => {
        const tempId = -Date.now();
        const key = `${objPk}`;
        set(st => {
            const byId = { ...st.byId };
            const rootIdsByObject = { ...st.rootIdsByObject };
            const childIds = { ...st.childIds };
            byId[tempId] = {
                id: tempId,
                objectPk: objPk,
                parentId: parentId ?? null,
                text,
                likes: 0,
                dislikes: 0,
                _optimistic: true,
                _pending: true
            };
            if (parentId) {
                if (!childIds[parentId]) childIds[parentId] = [];
                childIds[parentId].unshift(tempId);
            } else {
                if (!rootIdsByObject[key]) rootIdsByObject[key] = [];
                rootIdsByObject[key].unshift(tempId);
            }
            if (parentId) {
                childIds[parentId] = (childIds[parentId] || []).filter(i => i !== tempId);
                upsert(childIds[parentId], tempId);
            } else {
                rootIdsByObject[key] = (rootIdsByObject[key] || []).filter(i => i !== tempId);
                upsert(rootIdsByObject[key], tempId);
            }
            return { byId, rootIdsByObject, childIds };
        });

        try {
            const created = await createObjectComment(parentId === undefined ? get().variantContentType : get().commentContentType, parentId ?? objPk, text, parentId);
            set(st => {
                const byId = { ...st.byId };
                const childIds = { ...st.childIds };
                const rootIdsByObject = { ...st.rootIdsByObject };
                delete byId[tempId];

                // normalize and ensure parent fallbacks to our parentId if server omitted it
                const model = normalizeRaw({ ...created, parent: created.parent ?? parentId ?? null });
                byId[model.id] = model;

                if (model.parentId) {
                    // Remove tempId and any duplicate of model.id
                    childIds[model.parentId] = (childIds[model.parentId] || [])
                        .filter(i => i !== tempId && i !== model.id);
                    // Add confirmed reply at the start
                    upsert(childIds[model.parentId], model.id);
                } else {
                    rootIdsByObject[key] = (rootIdsByObject[key] || [])
                        .filter(i => i !== tempId && i !== model.id);
                    upsert(rootIdsByObject[key], model.id);
                }
                return { byId, childIds, rootIdsByObject };
            });
        } catch (e) {
            set(st => {
                const byId = { ...st.byId };
                const childIds = { ...st.childIds };
                const rootIdsByObject = { ...st.rootIdsByObject };
                delete byId[tempId];
                if (parentId) {
                    if (childIds[parentId]) childIds[parentId] = childIds[parentId].filter(i => i !== tempId);
                } else {
                    if (rootIdsByObject[key]) rootIdsByObject[key] = rootIdsByObject[key].filter(i => i !== tempId);
                }
                return { byId, childIds, rootIdsByObject };
            });
            console.warn("Add comment failed:", e);
        }

        // Optional: re-fetch to pick up server-enriched fields
        await get().ensureObjectLoaded(objPk);
    }
}));