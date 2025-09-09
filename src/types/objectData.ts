import { ContentTypesData } from "./contentTypesData";
import type { TopicData } from "./topicData";

export type SceneData = {
    id: number;                             // Unique scene id (DB primary key)
    object_id: number;                      // Foreign key back to the logical object/entity
    content_type: number;                   // Django content type id for the scene model
    objects: Array<ObjectData>;             // AR-capable objects placed in this scene
};

export type ObjectData = {
    id: number;                              // Unique object id
    name: string;                            // Human-readable name
    qr_id: string;                           // Optional QR code identifier
    variants: Array<VariantData>;            // Visual / mesh variants
    coordinates: [number, number, number];   // World / geo coordinates: [lat, lng, alt]
    comments: Array<CommentData>;            // Initial comments (roots with replies)
};

export type VariantData = {
    id: number;                                 // Variant primary key
    name: string;                               // Display name
    description: string;                        // Optional description text
    mesh_id: string;                            // Internal mesh identifier
    mesh_url: string | null;                    // Pre-signed URL or null if not resolved
    offset_position: [number, number, number];  // Local position offset
    offset_rotation: [number, number, number];  // Local rotation offset (pitch,yaw,roll) in degrees
    offset_scale: [number, number, number];     // Local scale multiplier
    weight: number;                             // Weight / relevance factor
    likes: number;                              // Positive reaction count
    isLiked: boolean;                           // Whether current user liked
    dislikes: number;                           // Negative reaction count
    isDisliked: boolean;                        // Whether current user disliked
};

export type CommentData = {
    id: number;                              // Root comment id
    username: string;                        // Author display name
    isModerator: boolean;                    // Whether author is a moderator
    timestamp: number;                       // Unix timestamp (ms) created
    text: string;                            // Comment body text
    likes: number;                           // Positive reaction count
    isLiked: boolean;                        // Whether current user liked
    dislikes: number;                        // Negative reaction count
    isDisliked: boolean;                     // Whether current user disliked
    replies: Array<ReplyData>;               // Direct replies (will be normalized)
};

export type ReplyData = {
    id: number;                              // Reply id
    commentId: number;                       // Parent root comment id
    username: string;                        // Author display name
    isModerator: boolean;                    // Whether author is a moderator
    timestamp: number;                       // Unix timestamp (ms) created
    text: string;                            // Reply text
    likes: number;                           // Positive reaction count
    isLiked: boolean;                        // Whether current user liked
    dislikes: number;                        // Negative reaction count
    isDisliked: boolean;                     // Whether current
};

export type SceneEnvelope = {
    content_types: ContentTypesData;         // Content type data (ids)
    topic: TopicData;                        // Topic metadata
    scene: SceneData;                        // Scene payload
};