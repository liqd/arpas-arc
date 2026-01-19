import { ContentTypesData } from "../types/contentTypesData";
import { SceneData } from "../types/objectData";
import { TopicData } from "../types/topicData";

export const ContentTypes : ContentTypesData = {
    variant_content_type_id: 74,
    comments_content_type_id: 122,
};

export const MockScene: SceneData = {
    id: 4,
    object_id: 404,
    content_type: 116,
    objects: [
        {
            id: 1,
            name: "Object 1",
            coordinates: [import.meta.env.VITE_DEFAULT_LAT ?? 0, import.meta.env.VITE_DEFAULT_LONG ?? 0, 0],
            qr_id: "object_1",
            comments: [
                {
                    id: 1,
                    username: "User 1",
                    isModerator: false,
                    timestamp: 1716100000000,
                    likes: 12,
                    isLiked: true,
                    dislikes: 0,
                    isDisliked: false,
                    text: "This object is perfect. I love its natural look!",
                    replies: [
                        {
                            id: 2,
                            commentId: 1,
                            username: "User 2",
                            isModerator: false,
                            timestamp: 1716103600000,
                            likes: 3,
                            isLiked: true,
                            dislikes: 0,
                            isDisliked: false,
                            text: "Totally agree!",
                        }
                    ]
                },
                {
                    id: 3,
                    username: "User 3",
                    isModerator: false,
                    timestamp: 1716110000000,
                    likes: 1,
                    isLiked: false,
                    dislikes: 5,
                    isDisliked: false,
                    text: "Not a fan of the idea.",
                    replies: []
                }
            ],
            variants: [
                {
                    id: 0,
                    name: "Var 1",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    mesh_url: null,
                    offset_position: [0, 0.3, 0],
                    offset_rotation: [0, 90, 0],
                    offset_scale: [0.1, 0.1, 0.1],
                    weight: 0,
                    likes: 42,
                    isLiked: true,
                    dislikes: 4,
                    isDisliked: false
                },
                {
                    id: 1,
                    name: "Var 2",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    mesh_url: null,
                    offset_position: [3, 0.3, 0],
                    offset_rotation: [0, 90, 0],
                    offset_scale: [0.1, 0.1, 0.1],
                    weight: 0,
                    likes: 42,
                    isLiked: true,
                    dislikes: 4,
                    isDisliked: false
                },
                {
                    id: 2,
                    name: "Var 3",
                    description: "Another object variant with a different 3D model.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    mesh_url: null,
                    offset_position: [0, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [3, 3, 3],
                    weight: 1,
                    likes: 3,
                    isLiked: false,
                    dislikes: 8,
                    isDisliked: true
                }
            ]
        },
        {
            id: 2,
            name: "Object 2",
            coordinates: [import.meta.env.VITE_DEFAULT_LAT ?? 0, import.meta.env.VITE_DEFAULT_LONG ?? 0, 0],
            qr_id: "object_2",
            comments: [
                {
                    id: 4,
                    username: "User 2",
                    isModerator: false,
                    timestamp: 1716120000000,
                    likes: 7,
                    isLiked: true,
                    dislikes: 1,
                    isDisliked: false,
                    text: "I think this design could use some improvements.",
                    replies: [
                        {
                            id: 5,
                            commentId: 4,
                            username: "user 3",
                            isModerator: true,
                            timestamp: 1716123600000,
                            likes: 2,
                            isLiked: false,
                            dislikes: 0,
                            isDisliked: true,
                            text: "I like it.",
                        }
                    ]
                }
            ],
            variants: [
                {
                    id: 0,
                    name: "Great 3D object",
                    description: "Another object variant with a different 3D model.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    mesh_url: null,
                    offset_position: [0, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [3, 3, 3],
                    weight: 0,
                    likes: 11,
                    isLiked: false,
                    dislikes: 2,
                    isDisliked: false
                }
            ]
        }
    ]
};

export const MockTopic: TopicData = {
    id: 404,
    slug: "topic-404",
    name: "Topic #404",
    description: "<figure class=\"image\"><img style=\"aspect-ratio:4000/6000;\" src=\"/media/uploads/admin/2025/05/20/shai-pal-0sPzcUzpEds-unsplash.jpg\" alt=\"Park benches in a sunny park\" width=\"4000\" height=\"6000\"></figure><p><i>Explore and give feedback on new park bench designs in your neighborhood using Augmented Reality. Your opinion matters for future public spaces!</i>&nbsp;</p>",
    category: "Public Space Development",
    labels: [
        "AR Feedback",
        "Urban Furniture",
        "Community Participation",
        "Local Parks"
    ],
    module: 1,
    created: "2025-05-21T11:00:00.000000+02:00"
}
