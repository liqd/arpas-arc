import React, { useMemo } from "react";
import { MinioData } from "../../types/databaseData";
import { MeshObject } from "..";
import { Position } from "../../types/transform";
import useLocationStore from "../../store/locationStore";
import useSceneStore from "../../store/sceneStore";
import { getObjectPosition } from "../../utility/objects";

interface ObjectSceneProps {
    selectedVariants: Record<number, number>;
    minioClientData: MinioData | null;
    worldRotation: number;
    worldPosition: Position;
}

const ObjectScene: React.FC<ObjectSceneProps> = ({
    selectedVariants,
    minioClientData,
    worldRotation,
    worldPosition,
}) => {
    const { scene } = useSceneStore();
    const getPosition = useLocationStore(state => state.getPosition);

    const renderedObjects = useMemo(() => {
        return scene.objects?.map((sceneObject) => {
            if (!sceneObject || !sceneObject.variants) {
                console.error("Invalid scene object:", sceneObject);
                return null;
            }

            const sceneObjectId = sceneObject.id;
            const variantId = selectedVariants[sceneObject.id] ?? sceneObject.variants[0]?.id;
            const variant = sceneObject.variants.find((v) => v.id === variantId);

            if (!variant || !variant.mesh_id) {
                console.error("Invalid variant:", variant);
                return null;
            }

            const position = getObjectPosition(sceneObject, variant, worldPosition, getPosition);

            return (
                <mesh
                    key={sceneObjectId}
                    userData={{ sceneObjectId }}
                    position={position.toArray()}
                    rotation={variant.offset_rotation}
                >
                    {variant.mesh_id === "primitive_cube" ? (
                        <>
                            <boxGeometry args={variant.offset_scale} />
                            <meshStandardMaterial color="#248cb5" />
                        </>
                    ) : variant.mesh_id === "primitive_sphere" ? (
                        <>
                            <sphereGeometry args={variant.offset_scale} />
                            <meshStandardMaterial color="#248cb5" />
                        </>
                    ) : (
                        <MeshObject
                            key={`${sceneObject.id}_${variant.id}`}
                            minioData={minioClientData}
                            sceneObjectId={sceneObjectId}
                            meshObjectId={variant.mesh_id}
                            scale={variant.offset_scale}
                        />
                    )}
                </mesh>
            );
        });
    }, [scene.objects, minioClientData, selectedVariants, worldPosition]);

    if (!scene) {
        console.warn("Scene data is null or undefined.");
        return null;
    }

    return <group rotation={[0, worldRotation, 0]}>{renderedObjects}</group>;
};

export default ObjectScene;