import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { MinioData } from "../../types/databaseData";
import { MeshObject } from "..";
import { Position } from "../../types/transform";
import useLocationStore from "../../store/locationStore";
import useSceneStore from "../../store/sceneStore";
import { useObjectPositionStore } from "../../store/objectPositionStore";

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
    const getStoredPosition = useObjectPositionStore(state => state.getStoredPosition);
    const computeAndSetObjectPosition = useObjectPositionStore(state => state.computeAndSetObjectPosition);

    const renderedObjects = useMemo(() => {
        if (!scene?.objects) return [];

        return scene.objects.map((sceneObject) => {
            if (!sceneObject || !sceneObject.variants) {
                console.error("Invalid scene object:", sceneObject);
                return null;
            }
            
            const sceneObjectId = sceneObject.id;
            const variantId = selectedVariants[sceneObject.id] ?? sceneObject.variants[0]?.id;
            const variant = sceneObject.variants.find((v) => v.id === variantId);
            
            if (!variant || !variant.mesh_id) {
                console.error("Invalid or missing variant for sceneObjectId:", sceneObjectId, "variantId:", variantId);
                return null;
            }
            
            let storedPosition = getStoredPosition(sceneObjectId, variantId);
            if (!storedPosition) {
                console.warn(`No stored position for object ${sceneObjectId} variant ${variantId}. Computing and storing.`);
                try {
                    storedPosition = computeAndSetObjectPosition(sceneObject, variant, getPosition);
                } catch (err) {
                    console.error("Error computing/storing object position:", err, "object:", sceneObjectId, "variant:", variantId);
                    // fallback to zero position if compute failed
                    storedPosition = new Position(0, 0, 0);
                }
            }

            // Position
            const position = storedPosition 
                ? storedPosition.substractedPosition(worldPosition)
                : new Position(0, 0, 0);
            const positionArray = position.toArray();

            // Rotation
            const rotation = variant.offset_rotation || [0, 0, 0];
            const rotationRadians: [number, number, number] = [
                THREE.MathUtils.degToRad(-rotation[0]),
                THREE.MathUtils.degToRad(-rotation[1]),
                THREE.MathUtils.degToRad(-rotation[2])
            ];
            
            // Create label with variant name and comment count
            const labelText = variant.name;

            // Outer group holds world position (so rotation doesn't offset the world translation).
            // Inner group gets local rotation so geometry is rotated around its own origin.
            return (
                <group key={sceneObjectId} userData={{ sceneObjectId }} position={positionArray}>
                    <group rotation={rotationRadians}>
                        {variant.mesh_id === "primitive_cube" ? (
                            <mesh>
                                <boxGeometry args={variant.offset_scale} />
                                <meshStandardMaterial color="#248cb5" />
                            </mesh>
                        ) : variant.mesh_id === "primitive_sphere" ? (
                            <mesh>
                                <sphereGeometry args={variant.offset_scale} />
                                <meshStandardMaterial color="#248cb5" />
                            </mesh>
                        ) : (
                            <MeshObject
                                key={`${sceneObject.id}_${variant.id}`}
                                sceneObjectId={sceneObjectId}
                                meshObjectId={variant.mesh_id}
                                meshObjectUrl={variant.mesh_url || null}
                                label={labelText}   
                                scale={variant.offset_scale}
                                minioData={minioClientData}
                            />
                        )}
                    </group>
                </group>
            );
        });
    }, [scene?.objects, minioClientData, selectedVariants, worldPosition, worldRotation]);

    if (!scene) {
        console.warn("Scene data is null or undefined.");
        return null;
    }

    return <group rotation={[0, -worldRotation - Math.PI / 2, 0]}>
         {renderedObjects}
    </group>;
};

export default ObjectScene;