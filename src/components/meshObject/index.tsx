import React, { useEffect, useState, Suspense, useRef } from "react";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { fetchGLTFModel, fetchGLTFModelFromMinio, releaseGLTFModel } from "../../utility/fetchGLTFModel";
import { Position, Rotation, Scale } from "../../types/transform";
import { MinioData } from "../../types/databaseData";
import { LoadingSpheres, RoundedPlane } from "..";
import useMessageStore from "../../store/messagesStore";

interface MeshObjectProps {
    sceneObjectId: number;
    meshObjectId: string;
    meshObjectUrl: string | null;
    position?: Position;
    rotation?: Rotation;
    scale?: Scale | [number, number, number];
    minioData?: MinioData | null;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    userData?: Record<string, any> | Readonly<Record<string, any> | undefined>;
}

const activeModels = new Map<string, Set<number>>(); // Map to track active sceneObjectIds for each meshObjectId

const MeshObject = ({
    sceneObjectId,
    meshObjectId,
    meshObjectUrl,
    position = new Position(), rotation = new Rotation(), scale = new Scale(),
    minioData,
    onClick, userData }: MeshObjectProps) => {

    const [modelUrl, setModelUrl] = useState<string | null>(null); // State to store the Blob URL for the model
    const [showLabel, setShowLabel] = useState(false);
    const [loading, setLoading] = useState(true); // State to track loading status
    const objectRef = useRef<THREE.Group | null>(null); // Ref for managing the scene object
    const { addScreenMessage, removeScreenMessage } = useMessageStore();

    const loadingSpheresScale = new Scale(.5, .5, .5);
    const modelName = meshObjectId.split("/").pop()?.replace(/\.[^/.]+$/, "") ?? meshObjectId;

    useEffect(() => {
        let isMounted = true;
        let retryCount = 0; // Track retry attempts for loading the model
        const maxRetries = 5; // Maximum number of retry attempts

        let loadModelIntervalId: number | undefined;
        let toggleLabelIntervalId: number | undefined;

        const loadModel = async () => {

            // Skip loading if modelUrl is already set
            if (modelUrl) {
                // console.log(`Model already loaded: ${meshObjectId}`);
                return;
            }

            setLoading(true);
            console.log(`Loading model for meshObjectId: ${meshObjectId}, sceneObjectId: ${sceneObjectId}`);
            addScreenMessage(`Model ${modelName} is loading...`, `loading_model_${meshObjectId}`);

            try {
                let blobUrl: string;
                let wasCached = false;

                if (meshObjectUrl) {
                    // If meshObjectUrl is provided, use it directly
                    blobUrl = meshObjectUrl;
                    const result = await fetchGLTFModel(meshObjectId, blobUrl);
                    wasCached = result.wasCached;
                } else {
                    console.warn("Presigned URL not provided, try fetching from MinIO...");

                    if (!minioData) {
                        console.error("Fallback minio client data is also missing for mesh object with id:", meshObjectId);
                        return;
                    }
                    console.warn("Fallback minio client data is used for fetching mesh object with id:", meshObjectId);

                    // Fetch the model URL from MinIO
                    const result = await fetchGLTFModelFromMinio(meshObjectId, minioData);
                    blobUrl = await result.blobUrl; // Wait for the Blob URL to be ready
                    wasCached = result.wasCached;
                }

                if (isMounted) {
                    setModelUrl(blobUrl);
                    setShowLabel(false);

                    // Add sceneObjectId to the activeModels map
                    if (!activeModels.has(meshObjectId)) {
                        activeModels.set(meshObjectId, new Set());
                    }
                    activeModels.get(meshObjectId)!.add(sceneObjectId);

                    console.log(`Model loaded successfully: ${meshObjectId}`);
                    retryCount = 0; // Reset retry count on success
                    // Remove loading message on success
                    setLoading(false);
                    removeScreenMessage(`loading_model_${meshObjectId}`);
                    if (!wasCached)
                        addScreenMessage(`Model ${modelName} loaded successfully`, `model_loaded_${meshObjectId}`, 5000, "#7bf1e3");
                }
            } catch (error) {
                console.warn(`Failed to load model: ${meshObjectId}. Retry attempt ${retryCount + 1}`);
                retryCount++;
                removeScreenMessage(`loading_model_${meshObjectId}`);
                if (retryCount >= maxRetries) {
                    setLoading(false);
                    if (loadModelIntervalId) clearInterval(loadModelIntervalId);
                    if (toggleLabelIntervalId) clearInterval(toggleLabelIntervalId);
                    setShowLabel(false);
                    addScreenMessage(`Model ${modelName} failed to load!`, `model_faild_to_load${meshObjectId}`, 7000, "red");
                } else {
                    addScreenMessage(`Model ${modelName} loading failed. Retrying...`, `model_loading_failed_${meshObjectId}`, 5000, "orange");
                }
            }
        };

        loadModel();

        toggleLabelIntervalId = window.setInterval(() => setShowLabel((prev) => !prev), 3000);
        loadModelIntervalId = window.setInterval(loadModel, 10000);

        return () => {
            isMounted = false;
            if (loadModelIntervalId) clearInterval(loadModelIntervalId);
            if (toggleLabelIntervalId) clearInterval(toggleLabelIntervalId);
            // Remove the model from activeModels when unmounting
            removeScreenMessage(`loading_model_${meshObjectId}`);
        };
    }, [meshObjectId, meshObjectUrl, minioData]);

    // If loading failed
    if (!modelUrl && !loading) {
        return (
            <>
                <RoundedPlane
                    position={position}
                    rotation={new Rotation(0, rotation.y, 0)}
                    radius={1}
                    opacity={.2}
                ></RoundedPlane>
                <RoundedPlane
                    position={position}
                    rotation={new Rotation(0, rotation.y, 0)}
                    radius={1}
                    opacity={.2}
                >
                    <Text fontSize={0.2} position={new THREE.Vector3(0, 0, 0.0001)}>
                        Not loaded: {modelName}
                    </Text>
                </RoundedPlane>
            </>
        );
    }

    // Render loading visuals while the model URL is being fetched
    if (!modelUrl) {
        return (
            <>
                <LoadingSpheres position={position.clone().addY(loadingSpheresScale.y * .75)} scale={loadingSpheresScale} />
                <RoundedPlane
                    position={position}
                    rotation={new Rotation(0, rotation.y, 0)}
                    radius={1}
                    opacity={.2}
                ></RoundedPlane>
                {showLabel && (
                    <RoundedPlane
                        position={position.clone().addY(loadingSpheresScale.y * .65)}
                        width={Math.max(0.1, modelName.length * (0.13))}
                        height={0.2}
                        radius={0.3}
                        color="black"
                        hoverColor="gray"
                        opacity={0.8}
                        alwaysFaceCamera={true}
                        onlyFaceCameraAroundY={false}
                    >
                        <Text fontSize={0.2} position={new THREE.Vector3(0, 0, 0.0001)}>
                            {modelName}
                        </Text>
                    </RoundedPlane>
                )}
            </>
        );
    }

    // Render the model using Suspense and the ModelComponent
    return (
        <>
            {modelUrl && (
                <Suspense fallback={<LoadingSpheres position={position.clone().addY(loadingSpheresScale.y * .75)} scale={loadingSpheresScale} />}>
                    <ModelComponent
                        sceneObjectId={sceneObjectId}
                        modelUrl={modelUrl}
                        objectRef={objectRef}
                        position={position}
                        rotation={rotation}
                        scale={new Scale(scale)}
                        onClick={onClick}
                    />
                </Suspense>
            )}
        </>
    );
};

interface ModelComponentProps {
    sceneObjectId: number;
    modelUrl: string;
    objectRef: React.RefObject<THREE.Group>;
    position: Position;
    rotation: Rotation;
    scale: Scale;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
}

const ModelComponent = ({ sceneObjectId, modelUrl, objectRef, position, rotation, scale, onClick }: ModelComponentProps) => {
    const { scene } = useGLTF(modelUrl);
    const clonedScene = React.useMemo(() => scene.clone(true), [scene]); // clone the scene to avoid modifying the original

    React.useEffect(() => {
        clonedScene.traverse((child) => {
            // attach the id to each mesh's userData
            const mesh = child as unknown as THREE.Mesh;
            if ((mesh as any).isMesh) {
                mesh.userData = { ...mesh.userData, sceneObjectId };
            }
        });
    }, [clonedScene, sceneObjectId]);

    // Memoize bounding box to avoid misscalculation when scene re-renders
    const { shadowSize, shadowCenter } = React.useMemo(() => {
        const box = new THREE.Box3().setFromObject(clonedScene);
        return {
            shadowSize: box.getSize(new THREE.Vector3(1, 1, 1)),
            shadowCenter: box.getCenter(new THREE.Vector3())
        };
    }, [clonedScene]);

    {/* Invisible object for click interaction */ }
    //            <mesh position={center} userData={{ sceneObjectId }}>
    //                <boxGeometry args={[size.x, size.y, size.z]} />
    //                <meshStandardMaterial color="green" transparent={false} opacity={0.0001} depthWrite={false} wireframe={true} /> {/* wireframe  */}
    //            </mesh>
    return (
        <group scale={scale.toArray()}>
            <group
                ref={objectRef}
                position={position.toArray()}
                rotation={rotation.toArray()}
                castShadow
                receiveShadow
                onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
            >
                <primitive object={clonedScene} />
            </group>

            {/* Show shadow plane */}
            <RoundedPlane
                position={new Position(position.x, shadowCenter.y - shadowSize.y / 2, position.z)}
                rotation={new Rotation(0, rotation.y, 0)}
                radius={2}
                width={shadowSize.x * 1.2}
                height={shadowSize.z * 1.2}
                color="black"
                opacity={.15}
            />
        </group>
    );
};

export default MeshObject;
