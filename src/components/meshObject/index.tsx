import React, { useEffect, useState, Suspense, useRef } from "react";
import { useGLTF, Text } from "@react-three/drei";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { fetchGLTFModel, releaseGLTFModel } from "../../utility/fetchGLTFModel";
import { Position, Rotation, Scale } from "../../types/transform";
import LoadingSpheres from "../loadingSpheres";
import RoundedPlane from "../roundedPlane";
import { MinioData } from "../../types/databaseData";

interface MeshObjectProps {
    minioData: MinioData;
    sceneObjectId: number;
    meshObjectId: string;
    position?: Position;
    rotation?: Rotation;
    scale?: Scale;
    onClick?: (e: ThreeEvent<MouseEvent>) => void;
    showOutline?: boolean;
    userData?: Record<string, any> | Readonly<Record<string, any> | undefined>;
}

const MeshObject = ({
    minioData,
    sceneObjectId,
    meshObjectId,
    position = new Position(), rotation = new Rotation(), scale = new Scale(),
    onClick, showOutline = false, userData }: MeshObjectProps) => {

    const [modelUrl, setModelUrl] = useState<string | null>(null); // State to store the Blob URL for the model
    const [showLabel, setShowLabel] = useState(false);
    const objectRef = useRef<THREE.Group | null>(null); // Ref for managing the scene object

    useEffect(() => {
        let isMounted = true;

        const loadModel = () => {
            // Fetch the model URL and increment its instance count
            fetchGLTFModel(minioData, meshObjectId)
                .then((url) => {
                    if (isMounted) {
                        setModelUrl(url);
                        setShowLabel(false);
                    }
                })
                .catch(() => {
                    console.warn(`Failed to load model: ${meshObjectId}, retrying...`);
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
            releaseGLTFModel(meshObjectId); // Decrement instance count
        };
    }, [meshObjectId]);

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

    const loadingSpheresScale = new Scale(.5, .5, .5);
    const modelName = meshObjectId.replace(/\.[^/.]+$/, ""); // Removes the file extension

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
                        scale={scale}
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
    const size = boundingBox.getSize(new THREE.Vector3());
    const center = boundingBox.getCenter(new THREE.Vector3());

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
            <meshStandardMaterial color="white" transparent={false} opacity={1} depthWrite={true}/>

            {/* Invisible object for click interaction */}
            <mesh position={center} userData={{ sceneObjectId }}>
                <boxGeometry args={[size.x, size.y, size.z]} />
                <meshStandardMaterial color="white" transparent={true} opacity={0.0001} depthWrite={false} /> {/* wireframe  */}
            </mesh>
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
