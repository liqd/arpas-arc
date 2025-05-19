import React, { useEffect, useState, Suspense, useRef } from "react";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { fetchGLTFModel, releaseGLTFModel } from "../../utility/fetchGLTFModel";
import { Position, Rotation, Scale } from "../../utility/transform";
import LoadingSpheres from "../loadingSpheres";
import RoundedPlane from "../roundedPlane";

interface MeshObjectProps {
    bucketName: string;
    modelKey: string;
    position?: Position;
    rotation?: Rotation;
    scale?: Scale;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    showOutline?: boolean;
    userData?: Record<string, any> | Readonly<Record<string, any> | undefined>;
}

const MeshObject = ({
    bucketName, modelKey,
    position = new Position(), rotation = new Rotation(), scale = new Scale(),
    onClick, showOutline = false, userData }: MeshObjectProps) => {
    const [modelUrl, setModelUrl] = useState<string | null>(null); // State to store the Blob URL for the model
    const [showLabel, setShowLabel] = useState(false);
    const objectRef = useRef<THREE.Group | null>(null); // Ref for managing the scene object

    useEffect(() => {
        let isMounted = true;

        const loadModel = () => {
            // Fetch the model URL and increment its instance count
            fetchGLTFModel(bucketName, modelKey)
                .then((url) => {
                    if (isMounted) {
                        setModelUrl(url);
                        setShowLabel(false);
                    }
                })
                .catch(() => {
                    console.warn(`Failed to load model: ${modelKey}, retrying...`);
                });
        };

        loadModel();
        const toggleLabelInterval = setInterval(() => setShowLabel((prev) => !prev), 3000); // Toggle label every few seconds
        const loadModelInterval = setInterval(loadModel, 10000); // Retry to load model every 10 seconds

        // Cleanup function to decrement instance count and clean up cache if necessary
        return () => {
            isMounted = false;
            // clearTimeout(labelTimeout);
            clearInterval(loadModelInterval);
            clearInterval(toggleLabelInterval);
            releaseGLTFModel(bucketName, modelKey); // Decrement instance count
        };
    }, [bucketName, modelKey]);

    // Add event listeners for highlighting and unhighlighting
    useEffect(() => {
        const object = objectRef.current;
        if (!object) return;

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
    }, []);

    const modelName = modelKey.replace(/\.[^/.]+$/, ""); // Removes the file extension

    // Render loading visuals while the model URL is being fetched
    if (!modelUrl) {
        return (
            <>
                <LoadingSpheres position={position.clone().addY(0.5 * scale.z)} scale={scale.clone().multiplyScalar(0.5)} />
                <RoundedPlane
                    position={position}
                    rotation={new Rotation(rotation.x + 90, rotation.y, rotation.z)}
                    radius={1}
                    opacity={.2}
                ></RoundedPlane>
                {showLabel && (
                    <RoundedPlane
                        position={new Position(position.x, position.y + (0.5 * scale.y), position.z)}
                        width={Math.max(0.1, modelName.length * (0.13 * scale.z))}
                        height={0.2 * scale.z}
                        radius={0.3}
                        color="black"
                        hoverColor="gray"
                        opacity={0.8}
                        alwaysFaceCamera={true}
                        onlyFaceCameraAroundY={false}
                    >
                        <Text fontSize={0.2 * scale.z} position={new THREE.Vector3(0, 0, 0.0001)}>
                            {modelName}
                        </Text>
                    </RoundedPlane>
                )}
            </>
        );
    }

    console.log(position instanceof THREE.Vector3);

    // Render the model using Suspense and the ModelComponent
    return (
        <>
            {modelUrl && (
                <Suspense fallback={<LoadingSpheres position={position} scale={scale} />}>
                    <ModelComponent
                        modelUrl={modelUrl}
                        objectRef={objectRef}
                        position={position}
                        rotation={rotation}
                        scale={scale}
                    />
                </Suspense>
            )}
        </>
    );
};

interface ModelComponentProps {
    modelUrl: string;
    objectRef: React.RefObject<THREE.Group | null>;
    position: Position;
    rotation: Rotation;
    scale: Scale;
}

const ModelComponent = ({ modelUrl, objectRef, position, rotation, scale }: ModelComponentProps) => {
    const { scene } = useGLTF(modelUrl); // Load the model using useGLTF

    // Clone the scene to create a new independent instance
    const clonedScene = scene.clone();

    return (
        <group
            ref={objectRef}
            position={position.toArray()}
            rotation={rotation.toArray()}
            scale={scale.toArray()}
            castShadow
            receiveShadow
        >
            <primitive object={clonedScene} />
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
