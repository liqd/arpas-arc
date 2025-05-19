import { SceneData } from "../types/objectData";
import { Position, Rotation, Scale } from "../types/transform";

// thanks gpt

export const BenchScene: SceneData = {
    id: 4,
    topicId: 404,
    objects: [
        {
            id: 1,
            name: "Wooden Bench",
            longitude: -0.1276,
            latitude: 51.5074,
            altitude: 0,
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
                    title: "Standard Finish",
                    description: "A plain wooden bench with a natural wood texture. The surface is untreated, showcasing the raw grain and organic color variations of the timber. Ideal for rustic or traditional outdoor settings.",
                    meshId: "wooden_bench_standard",
                    offsetPosition: new Position(-1, 0, 0),
                    offsetRotation: new Rotation(),
                    offsetScale: new Scale()
                },
                {
                    id: 2,
                    title: "Varnished",
                    description: "A shiny varnished version of the wooden bench that enhances the natural wood grain while providing a protective glossy coating. Resistant to weathering and ideal for maintaining a polished look in exposed environments.",
                    meshId: "wooden_bench_varnished",
                    offsetPosition: new Position(-1, 0, 0),
                    offsetRotation: new Rotation(),
                    offsetScale: new Scale()
                }
            ]
        },
        {
            id: 2,
            name: "Metal Bench",
            longitude: -0.1280,
            latitude: 51.5076,
            altitude: 0,
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
                    title: "Green Painted",
                    description: "A durable metal bench coated with a dark green paint finish. Designed to blend well with park and garden surroundings while providing excellent resistance to rust and environmental wear.",
                    meshId: "metal_bench_green",
                    offsetPosition: new Position(1, 0, 0),
                    offsetRotation: new Rotation(),
                    offsetScale: new Scale()
                }
            ]
        }
    ]
};
