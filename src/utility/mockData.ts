import { SceneData } from "../types/objectData";
import { TopicData } from "../types/topicData";

// thanks gpt

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
                    id: 1,
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
                            id: 2,
                            commentId: 1,
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
                    id: 3,
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
                    name: "Var 1",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    offset_position: [100, 0, 0],
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
                    name: "Var 2",
                    description: "A shiny varnished version of the wooden bench that enhances the natural wood grain while providing a protective glossy coating. Resistant to weathering and ideal for maintaining a polished look in exposed environments.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    offset_position: [0, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [5, 5, 5],
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
            name: "Metal Bench",
            coordinates: [import.meta.env.VITE_DEFAULT_LAT ?? 0, import.meta.env.VITE_DEFAULT_LONG ?? 0, 0],
            qr_id: "metal_bench_1",
            comments: [
                {
                    id: 4,
                    username: "metalLover",
                    isModerator: false,
                    timestamp: 1716120000000,
                    likes: 7,
                    isLiked: true,
                    dislikes: 1,
                    isDisliked: false,
                    text: "Love the industrial feel of this metal bench—very sturdy and stylish.",
                    replies: [
                        {
                            id: 5,
                            commentId: 4,
                            username: "greenPeace",
                            isModerator: true,
                            timestamp: 1716123600000,
                            likes: 2,
                            isLiked: false,
                            dislikes: 0,
                            isDisliked: true,
                            text: "Glad it’s painted green—it blends in better with the environment.",
                        }
                    ]
                }
            ],
            variants: [
                {
                    id: 0,
                    name: "Green Painted",
                    description: "A durable metal bench coated with a dark green paint finish. Designed to blend well with park and garden surroundings while providing excellent resistance to rust and environmental wear.",
                    mesh_id: "republica/Stop1 Fabmobil/billboard.glb",
                    offset_position: [0, 0, 0],
                    offset_rotation: [0, 0, 0],
                    offset_scale: [1, 1, 1],
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
