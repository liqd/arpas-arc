export type SceneData = {
    id: number,
    object_id: number,
    content_type: number,
    objects: Array<ObjectData>
}

export type ObjectData = {
    id: number,                                     // ARObject ID
    name: string,                                   // ARObject name
    qr_id: string,                                  // QR code identifier   
    variants: Array<VariantData>,                   // Array of variants for this AR object
    coordinates: [number, number, number],          // [latitude, longitude, altitude]
    comments: Array<CommentData>                    // not given by django as of now
}

export type VariantData = {
    id: number,                                     // Variant ID
    name: string,                                   // Variant name
    description: string,                            // Variant description
    mesh_id: string,                                // MinIO mesh identifier (bucket/path format)
    mesh_url: string | null                         // Presigned URL for the 3D mesh file
    offset_position: [number, number, number],      // Position offset [x, y, z]
    offset_rotation: [number, number, number],      // Rotation offset [x, y, z] in degrees
    offset_scale: [number, number, number],         // Scale offset [x, y, z]
    weight: number,                                 // Ordering weight
    likes: number,                                  // Not given by Django as of now
    isLiked: boolean,                               // Not given by Django as of now
    dislikes: number,                               // Not given by Django as of now
    isDisliked: boolean                             // Not given by Django as of now
}

export type CommentData = {
    id: number,
    username: string,
    isModerator: boolean,
    timestamp: number,
    text: string,
    likes: number,
    isLiked: boolean,
    dislikes: number,
    isDisliked: boolean,
    replies: Array<ReplyData>
}

export type ReplyData = {
    id: number,
    commentId: number,
    username: string,
    isModerator: boolean,
    timestamp: number,
    text: string,
    likes: number,
    isLiked: boolean,
    dislikes: number,
    isDisliked: boolean
}
