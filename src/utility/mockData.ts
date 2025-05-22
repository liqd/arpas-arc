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
            coordinates: [-0.1276, 51.5074, 0],
            qr_id: "wooden_bench_1",
            comments: [
                {
                    id: 1,
                    username: "natureFan42",
                    isModerator: false,
                    timestamp: 1716100000000,
                    likes: 12,
                    dislikes: 0,
                    text: "This wooden bench is perfect for relaxing under the trees. I love its natural look!",
                    replies: [
                        {
                            id: 2,
                            username: "urbanExplorer",
                            isModerator: false,
                            timestamp: 1716103600000,
                            likes: 3,
                            dislikes: 0,
                            text: "Totally agree! Adds a nice touch of nature to the cityscape.",
                            replies: []
                        }
                    ]
                },
                {
                    id: 3,
                    username: "benchCritic",
                    isModerator: false,
                    timestamp: 1716110000000,
                    likes: 1,
                    dislikes: 5,
                    text: "Not a fan of the untreated wood—looks like it won’t last long outdoors.",
                    replies: []
                }
            ],
            variants: [
                {
                    id: 1,
                    name: "Standard Finish",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    mesh_id: "test/bench/bench.glb",
                    offset_position: [-1,0,0],
                    offset_rotation: [0,0,0],
                    offset_scale: [1,1,1],
                    weight: 0,
                },
                {
                    id: 2,
                    name: "Varnished",
                    description: "A shiny varnished version of the wooden bench that enhances the natural wood grain while providing a protective glossy coating. Resistant to weathering and ideal for maintaining a polished look in exposed environments.",
                    mesh_id: "test/bench/bench.glb",
                    offset_position: [-1,0,0],
                    offset_rotation: [0,0,0],
                    offset_scale: [1,1,1],
                    weight: 1
                }
            ]
        },
        {
            id: 2,
            name: "Metal Bench",
            coordinates: [-0.1280, 51.5076, 0],
            qr_id: "metal_bench_1",
            comments: [
                {
                    id: 4,
                    username: "metalLover",
                    isModerator: false,
                    timestamp: 1716120000000,
                    likes: 7,
                    dislikes: 1,
                    text: "Love the industrial feel of this metal bench—very sturdy and stylish.",
                    replies: [
                        {
                            id: 5,
                            username: "greenPeace",
                            isModerator: true,
                            timestamp: 1716123600000,
                            likes: 2,
                            dislikes: 0,
                            text: "Glad it’s painted green—it blends in better with the environment.",
                            replies: []
                        }
                    ]
                }
            ],
            variants: [
                {
                    id: 3,
                    name: "Green Painted",
                    description: "A durable metal bench coated with a dark green paint finish. Designed to blend well with park and garden surroundings while providing excellent resistance to rust and environmental wear.",
                    mesh_id: "test/bench/bench.glb",
                    offset_position: [1,0,0],
                    offset_rotation: [0,0,0],
                    offset_scale: [1,1,1],
                    weight: 0
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
