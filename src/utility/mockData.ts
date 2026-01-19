import { ContentTypesData } from "../types/contentTypesData";
import { SceneData } from "../types/objectData";
import { TopicData } from "../types/topicData";

// thanks gpt

export const ContentTypes : ContentTypesData = {
    variant_content_type_id: 74,
    comments_content_type_id: 122,
};

export const BenchScene: SceneData = {
    id: 4,
    object_id: 404,
    content_type: 102,
    objects: [
        {
            id: 1,
            name: "Wooden Bench",
            coordinates: [import.meta.env.VITE_DEFAULT_LAT ?? 0, import.meta.env.VITE_DEFAULT_LONG ?? 0, 0],
            qr_id: "wooden_bench_1",
            comments: [
                {
                    id: 101,
                    username: "natureFan42",
                    isModerator: false,
                    timestamp: 1716100000000,
                    likes: 12,
                    isLiked: true,
                    dislikes: 0,
                    isDisliked: false,
                    text: "This wooden bench is perfect for relaxing under the trees. I love its natural look!",
                    replies: [
                        {
                            id: 102,
                            commentId: 101,
                            username: "urbanExplorer",
                            isModerator: false,
                            timestamp: 1716103600000,
                            likes: 3,
                            isLiked: true,
                            dislikes: 0,
                            isDisliked: false,
                            text: "Totally agree! Adds a nice touch of nature to the cityscape.",
                        }
                    ]
                },
                {
                    id: 103,
                    username: "benchCritic",
                    isModerator: false,
                    timestamp: 1716110000000,
                    likes: 1,
                    isLiked: false,
                    dislikes: 5,
                    isDisliked: false,
                    text: "Not a fan of the untreated wood—looks like it won’t last long outdoors.",
                    replies: []
                }
            ],
            variants: [
                {
                    id: 0,
                    name: "Bank 1",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    mesh_url: null,
                    offset_position: [0, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
                    weight: 0,
                    likes: 42,
                    isLiked: true,
                    dislikes: 4,
                    isDisliked: false
                },
                {
                    id: 1,
                    name: "Bank 1.3",
                    description: "A shiny varnished version of the wooden bench that enhances the natural wood grain while providing a protective glossy coating. Resistant to weathering and ideal for maintaining a polished look in exposed environments.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    mesh_url: null,
                    offset_position: [0, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
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
            name: "Wooden Bench 2",
            coordinates: [import.meta.env.VITE_DEFAULT_LAT?? 0, import.meta.env.VITE_DEFAULT_LONG ?? 0, 0],
            qr_id: "wooden_bench_1",
            comments: 
            [
                {
                    id: 201,
                    username: "natureFan42",
                    isModerator: false,
                    timestamp: 1716100000000,
                    likes: 12,
                    isLiked: true,
                    dislikes: 0,
                    isDisliked: false,
                    text: "This wooden bench is perfect for relaxing under the trees. I love its natural look!",
                    replies: []
                }
            ],
            variants: [                
                {
                    id: 0,
                    name: "Bank 2",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    mesh_url: null,
                    offset_position: [300, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
                    weight: 0,
                    likes: 42,
                    isLiked: true,
                    dislikes: 4,
                    isDisliked: false
                },
                {
                    id: 1,
                    name: "Bank 2.2",
                    description: "A shiny varnished version of the wooden bench that enhances the natural wood grain while providing a protective glossy coating. Resistant to weathering and ideal for maintaining a polished look in exposed environments.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    mesh_url: null,
                    offset_position: [300, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
                    weight: 1,
                    likes: 3,
                    isLiked: false,
                    dislikes: 8,
                    isDisliked: true
                }
            ]
        },
        {
        id: 3,
            name: "Wooden Bench 3",
            coordinates: [import.meta.env.VITE_DEFAULT_LAT ?? 0, import.meta.env.VITE_DEFAULT_LONG ?? 0, 0],
            qr_id: "wooden_bench_1",
            comments:[
                {
                    id: 301,
                    username: "natureFan42",
                    isModerator: false,
                    timestamp: 1716100000000,
                    likes: 12,
                    isLiked: true,
                    dislikes: 0,
                    isDisliked: false,
                    text: "This wooden bench is perfect for relaxing under the trees. I love its natural look!",
                    replies: []
                },
                {
                    id: 302,
                    username: "natureFan42",
                    isModerator: false,
                    timestamp: 1716100000000,
                    likes: 12,
                    isLiked: true,
                    dislikes: 0,
                    isDisliked: false,
                    text: "This wooden bench is perfect for relaxing under the trees. I love its natural look!",
                    replies: []
                }
            ],
            variants: [
                {
                    id: 0,
                    name: "Bank 3",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    mesh_url: null,
                    offset_position: [50, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
                    weight: 0,
                    likes: 42,
                    isLiked: true,
                    dislikes: 4,
                    isDisliked: false
                },
                {
                    id: 1,
                    name: "Bank3.2",
                    description: "A shiny varnished version of the wooden bench that enhances the natural wood grain while providing a protective glossy coating. Resistant to weathering and ideal for maintaining a polished look in exposed environments.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    mesh_url: null,
                    offset_position: [50, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
                    weight: 1,
                    likes: 3,
                    isLiked: false,
                    dislikes: 8,
                    isDisliked: true
                }
            ]
        }
    ]
};

export const BenchTopic: TopicData = {
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
