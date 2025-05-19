import { SceneData } from "../types/sceneObjectData";
import { Position, Rotation, Scale } from "../types/transform";

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
            variants: [
                {
                    id: 1,
                    title: "Standard Finish",
                    description: "A plain wooden bench with no paint.",
                    meshId: "wooden_bench_standard",
                    offsetPosition: new Position(-1, 0, 0),
                    offsetRotation: new Rotation(),
                    offsetScale: new Scale()
                },
                {
                    id: 2,
                    title: "Varnished",
                    description: "A shiny varnished version of the wooden bench.",
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
            variants: [
                {
                    id: 3,
                    title: "Green Painted",
                    description: "A metal bench painted dark green.",
                    meshId: "metal_bench_green",
                    offsetPosition: new Position(1, 0, 0),
                    offsetRotation: new Rotation(),
                    offsetScale: new Scale()
                }
            ]
        }
    ]
};
