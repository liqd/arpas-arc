import { Position, Rotation, Scale } from "./transform";

export type SceneData = {
    id: number,
    topicId: number,
    objects: Array<ObjectData>
}

export type ObjectData = {
    id: number,
    name: string,
    variants: Array<VariantData>,
    longitude: number,
    latitude: number,
    altitude: number,
    comments: Array<CommentData>
}

export type VariantData = {
    id: number,
    title: string,
    description: string,
    meshId: string,
    offsetPosition: Position,
    offsetRotation: Rotation,
    offsetScale: Scale,
}

export type CommentData = {
    id: number,
    username: string,
    isModerator: boolean,
    timestamp: number,
    text: string,
    likes: number,
    dislikes: number,
    replies: Array<CommentData>
}
