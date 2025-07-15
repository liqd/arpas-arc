import React, { useEffect, useState, Suspense, useRef } from "react";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { fetchGLTFModel, releaseGLTFModel } from "../../utility/fetchGLTFModel";
import { Position, Rotation, Scale } from "../../types/transform";
import { MinioData } from "../../types/databaseData";
import { LoadingSpheres, RoundedPlane } from "..";
import useMessageStore from "../../store/messagesStore";

interface MeshObjectProps {
    minioData: MinioData | null;
    sceneObjectId: number;
    meshObjectId: string;
    position?: Position;
    rotation?: Rotation;
    scale?: Scale | [number, number, number];
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    showOutline?: boolean;
    userData?: Record<string, any> | Readonly<Record<string, any> | undefined>;
}

const activeModels = new Map<string, Set<number>>(); // Map to track active sceneObjectIds for each meshObjectId

const MeshObject = ({
    minioData,
    sceneObjectId,
    meshObjectId,
    position = new Position(), rotation = new Rotation(), scale = new Scale(),
    onClick, showOutline = false, userData }: MeshObjectProps) => {

    const [modelUrl, setModelUrl] = useState<string | null>(null); // State to store the Blob URL for the model
    const [showLabel, setShowLabel] = useState(false);
    const [loading, setLoading] = useState(true); // State to track loading status
    const objectRef = useRef<THREE.Group | null>(null); // Ref for managing the scene object
    const { addScreenMessage, removeScreenMessage } = useMessageStore();

    const loadingSpheresScale = new Scale(.5, .5, .5);
    const modelName = meshObjectId.replace(/\.[^/.]+$/, ""); // Removes the file extension

    useEffect(() => {
        let isMounted = true;
        let retryCount = 0; // Track the number of retries
        const maxRetries = 5; // Set a maximum number of retries

        const loadModel = async () => {
            if (!minioData) {
                console.error("Minio client data is missing for mesh object with id:", meshObjectId);
                // Remove loading message if failed
                return;
            }

            // Skip loading if modelUrl is already set
            if (modelUrl) {
                // console.log(`Model already loaded: ${meshObjectId}`);
                return;
            }

            setLoading(true);
            addScreenMessage(`Model ${modelName} is loading...`, `loading_model_${meshObjectId}`);

            try {
                const url = await fetchGLTFModel(minioData, meshObjectId);
                if (isMounted) {
                    setModelUrl(url);
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
                    addScreenMessage(`Model ${modelName} loaded successfully`, `model_loaded_${meshObjectId}`, 5000, "#7bf1e3");
                }
            } catch (error) {
                console.warn(`Failed to load model: ${meshObjectId}. Retry attempt ${retryCount + 1}`);
                retryCount++;
                removeScreenMessage(`loading_model_${meshObjectId}`);
                if (retryCount >= maxRetries) {
                    setLoading(false);
                    clearInterval(loadModelInterval);
                    clearInterval(toggleLabelInterval);
                    setShowLabel(false);
                    addScreenMessage(`Model ${modelName} failed to load!`, `model_faild_to_load${meshObjectId}`, 7000, "red");
                } else {
                    addScreenMessage(`Model ${modelName} loading failed. Retrying...`, `model_loading_failed_${meshObjectId}`, 5000, "orange");
                }
            }
        };

        loadModel();

        const toggleLabelInterval = setInterval(() => setShowLabel((prev) => !prev), 3000); // Toggle label every few seconds
        const loadModelInterval = setInterval(loadModel, 10000); // Retry to load model every 10 seconds

        return () => {
            isMounted = false;
            clearInterval(loadModelInterval);
            clearInterval(toggleLabelInterval);
            // Remove loading message on unmount
            removeScreenMessage(`loading_model_${meshObjectId}`);
        };
        // Add meshObjectId and minioData to dependencies
    }, [meshObjectId, minioData, modelUrl]);

    // Add event listeners for highlighting and unhighlighting
    useEffect(() => {
        const object = objectRef.current;
        if (!object) {
            console.warn("Object reference is not set. Cannot add event listeners for highlighting on object with id:", sceneObjectId);
            return;
        }

        const handleMouseEnter = () => {
            addOutline(object); // Add outline on hover
        };

        const handleMouseLeave = () => {
            removeOutline(object); // Remove outline on mouse out
        };

        const mouseEnter = "mouseenter";
        const mouseLeave = "mouseleave";

        // @ts-ignore
        object.addEventListener(mouseEnter, handleMouseEnter);
        // @ts-ignore
        object.addEventListener(mouseLeave, handleMouseLeave);

        return () => {
            // @ts-ignore
            object.removeEventListener(mouseEnter, handleMouseEnter);
            // @ts-ignore
            object.removeEventListener(mouseLeave, handleMouseLeave);
        };
    }, [objectRef]);

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
}

const ModelComponent = ({ sceneObjectId, modelUrl, objectRef, position, rotation, scale }: ModelComponentProps) => {
    const { scene } = useGLTF(modelUrl); // Load the model using useGLTF

    const clonedScene = scene.clone();
    const boundingBox = new THREE.Box3().setFromObject(clonedScene); // Compute bounding box
    const size = boundingBox.getSize(new THREE.Vector3(1, 1, 1));
    const center = boundingBox.getCenter(new THREE.Vector3());

    return (
        <group
            scale={scale.toArray()}>
            <group
                ref={objectRef}
                position={position.toArray()}
                rotation={rotation.toArray()}
                // scale={scale.toArray()}
                castShadow
                receiveShadow
            >
                <primitive object={clonedScene} />
                <meshStandardMaterial color="white" transparent={false} opacity={1} depthWrite={true} />


                {/* Invisible object for click interaction */}
                <mesh position={center} userData={{ sceneObjectId }}>
                    <boxGeometry args={[size.x, size.y, size.z]} />
                    <meshStandardMaterial color="white" transparent={true} opacity={0.0001} depthWrite={false} /> {/* wireframe  */}
                </mesh>
            </group>
            <RoundedPlane
                position={new Position(position.x, position.y - size.y / 2, position.z)}
                rotation={new Rotation(0, rotation.y, 0)}
                radius={2}
                width={size.x * 1.2}
                height={size.z * 1.2}
                color="black"
                opacity={.15}
            ></RoundedPlane>
        </group>
    );
};


// Functions to add and remove outlines
const addOutline = (object: THREE.Object3D) => {
    if (object instanceof THREE.Mesh) { // Ensure it's a Mesh before cloning
        const outlinePass = new THREE.Mesh(object.geometry, new THREE.MeshBasicMaterial({ color: "yellow", side: THREE.BackSide }));
        outlinePass.scale.set(1.05, 1.05, 1.05); // Slightly larger for the outline effect
        object.add(outlinePass); // Add the outline as a child
    } else {
        console.warn("Object is not a Mesh and cannot be outlined.");
    }
};

const removeOutline = (object: THREE.Object3D) => {
    object.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
            object.remove(child); // Remove the outline child
        }
    });
};


export default MeshObject;
