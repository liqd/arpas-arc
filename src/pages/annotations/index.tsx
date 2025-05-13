import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useXRStore, XRDomOverlay } from "@react-three/xr";
import { Reticle, SceneObject, RoundedPlane } from "../../components";
import { BottomSheet, DirectionalArrow } from "../../components-ui";
import { useHitTestMatrix } from "../../hooks";
import { SlDislike, SlLike } from "react-icons/sl";
import { LiaLightbulbSolid } from "react-icons/lia";
import "./style.css";

// NOTE : these are example annotations for debugging, should be replaced with database imports later
const exampleAnnotations: AnnotationData[] = [{
    id: 0,
    position: new THREE.Vector3(0, 0, 5),
    title: "Bench Example",
    description: "Das ist eine schöne Bank",
    likes: 5,
    isLiked: false,
    dislikes: 1,
    isDisliked: false,
    insightful: 7,
    isInsightful: false
}, {
    id: 1,
    position: new THREE.Vector3(0, 0, -5),
    title: "Bench Example 2",
    description: "Wer mich liest, liest mich",
    likes: 1,
    isLiked: false,
    dislikes: 42,
    isDisliked: true,
    insightful: 19,
    isInsightful: true
}];

type AnnotationData = {
    id: number;
    position: THREE.Vector3;
    title: string;
    description: string;
    likes: number;
    isLiked: boolean;
    dislikes: number;
    isDisliked: boolean;
    insightful: number;
    isInsightful: boolean;
}

type SceneObjectData = {
    id: number;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    annotations: AnnotationData[];
}

const reactions = [{
    key: "likes",
    flag: "isLiked",
    icon: <SlLike className="icon-symbol" style={{ backgroundColor: "#0056b3" }} />,
    color: "#2998d9"
}, {
    key: "dislikes",
    flag: "isDisliked",
    icon: <SlDislike className="icon-symbol" style={{ backgroundColor: "#c20808" }} />,
    color: "#2998d9"
}, {
    key: "insightful",
    flag: "isInsightful",
    icon: <LiaLightbulbSolid className="icon-symbol" style={{ backgroundColor: "#e3c027" }} />,
    color: "#2998d9"
}] as const;

const AnnotationOverlay = ({
    annotation,
    onClose,
    onUpdate,
    onDelete,
}: {
    annotation: AnnotationData | null,
    onClose: () => void,
    onUpdate: (id: number, updates: Partial<AnnotationData>) => void,
    onDelete: (id: number) => void,
}) => {
    // if (!annotation) annotation = exampleAnnotations[0]; // NOTE : debugging

    if (!annotation) return <BottomSheet isVisible={false} />;
    const { id, title, description, likes, dislikes, insightful } = annotation;

    return (
        <BottomSheet
            isVisible={true}
            onClose={onClose}
        >
            <div className="popup-header">
                <div>{title}</div>
                <button onClick={onClose}>X</button>
            </div>
            <div className="popup-body">
                <div className="popup-entry">
                    <h1>Description</h1>
                    <textarea value={description} onChange={(e) => onUpdate(id, { description: e.target.value })} />
                </div>
                <div className="popup-entry">
                    <h1>Reactions</h1>
                    <div className="icons">
                        All {likes + dislikes + insightful}
                        {reactions.map(({ key, flag, icon, color }) => {
                            const count = annotation[key];
                            const isActive = annotation[flag];
                            return (
                                <div
                                    key={key}
                                    className="icon"
                                    onClick={() => onUpdate(id, {
                                        [key]: isActive ? count - 1 : count + 1,
                                        [flag]: !isActive,
                                    })}
                                >
                                    {icon}
                                    <div style={{ color: isActive ? color : "white" }}>{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <button className="popup-delete" onClick={() => onDelete(id)}>Delete</button>
        </BottomSheet>
    );
};

const AnnotationsPage = () => {
    const store = useXRStore();
    const { camera } = useThree();

    const nextIdRef = useRef(0);
    const [sceneObjects, setSceneObjects] = useState<SceneObjectData[]>([]);
    const [activeAnnotation, setActiveAnnotation] = useState<AnnotationData | null>(null);
    const [hitTestMatrix, hitTestMatricesRef] = useHitTestMatrix();

    const placeObject = () => {
        const matrix = hitTestMatricesRef.current["none"];
        if (!matrix || !camera) return;

        const position = new THREE.Vector3().setFromMatrixPosition(matrix).add(new THREE.Vector3(0, 0.25, 0));

        // face object towards camera position
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.lookAt(new THREE.Vector3(camera.position.x, position.y, camera.position.z));
        dummy.rotateY(-Math.PI / 2); // fix for bench model rotation
        const rotation = new THREE.Euler().setFromQuaternion(dummy.quaternion);

        const scale = new THREE.Vector3(0.06, 0.06, 0.06);

        const id = nextIdRef.current++;

        setSceneObjects((prev) => [...prev, { id, position, rotation, scale, annotations: exampleAnnotations }]);
    };

    const updateAnnotation = (annotationId: number, updates: Partial<AnnotationData>) => {
        setSceneObjects((prevObjects) =>
            prevObjects.map((obj) => ({
                ...obj,
                annotations: obj.annotations.map((annotation) =>
                    annotation.id === annotationId
                        ? { ...annotation, ...updates }
                        : annotation
                ),
            }))
        );

        setActiveAnnotation((prev) => prev?.id === annotationId ? { ...prev, ...updates } : prev);
    };

    const deleteAnnotation = (annotationId: number) => {
        setSceneObjects((prevObjects) =>
            prevObjects.map((obj) => ({
                ...obj,
                annotations: obj.annotations.filter((annotation) => annotation.id !== annotationId)
            }))
        );

        if (activeAnnotation?.id === annotationId)
            setActiveAnnotation(null);
    };

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const { action } = event.data;
            if (action === "spawn") {
                placeObject();
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);

    return (<>
        <XRDomOverlay style={{ width: "100%", height: "100%" }}>
            <button id="exit-button" onClick={() => store.getState().session?.end()}>X</button>
            <button id="spawn-button" onClick={placeObject}>Spawn</button>
            <DirectionalArrow 
                camera={camera} 
                targetPos={new THREE.Vector3()}
            />
            <AnnotationOverlay
                annotation={activeAnnotation}
                onClose={() => setActiveAnnotation(null)}
                onUpdate={updateAnnotation}
                onDelete={deleteAnnotation}
            />
        </XRDomOverlay>

        <ambientLight intensity={5} />
        <directionalLight intensity={10} />
        <Reticle hitTestMatrix={hitTestMatrix["none"]} />

        {sceneObjects.map((sceneObject) => {
            const { id: sceneObjectId, position, rotation, scale, annotations } = sceneObject;

            return (
                <group key={sceneObjectId} position={position} rotation={rotation} scale={scale}>
                    <SceneObject />
                    {annotations.map((annotation) => {
                        const { id: annotationId, position, title, description } = annotation;

                        return (
                            <group key={annotationId} position={position}>
                                <mesh onClick={() => setActiveAnnotation(annotation)}>
                                    <sphereGeometry args={[0.5, 24, 24]} />
                                    <meshStandardMaterial color={"#206ec7"} />
                                </mesh>
                                {activeAnnotation?.id == annotationId &&
                                    <RoundedPlane
                                        position={new THREE.Vector3(0, 2, 0)}
                                        rotation={new THREE.Euler(0, 1.5, 0)}
                                        width={4}
                                        height={2}
                                        radius={0.3}
                                        color="#206ec7"
                                    >
                                        <Text fontSize={0.335} position={new THREE.Vector3(0, 0.5, 0.0001)}>
                                            {title}
                                        </Text>
                                        <Text fontSize={0.28} position={new THREE.Vector3(0, -0.5, 0.0001)}>
                                            {description}
                                        </Text>
                                    </RoundedPlane>
                                }
                            </group>
                        );
                    })}
                </group>
            );
        })}
    </>);
};

export default AnnotationsPage;
