export type SceneData = {
    id: number,
    object_id: number,
    content_type: number,
    objects: Array<ObjectData>
}

export type ObjectData = {
    id: number,
    name: string,
    qr_id: string,
    variants: Array<VariantData>,
    coordinates: [number, number, number],
    comments: Array<CommentData> // not given by django as of now
}

export type VariantData = {
    id: number,
    name: string,
    description: string,
    mesh_id: string,
    offset_position: [number, number, number],
    offset_rotation: [number, number, number],
    offset_scale: [number, number, number],
    weight: number,
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
