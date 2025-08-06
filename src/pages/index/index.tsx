import { useEffect, useLayoutEffect, useMemo, useCallback, useState, useRef } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { DirectionalArrow, HelpMenu, ObjectDescription } from "../../components-ui";
import { SceneData, ObjectData, VariantData } from "../../types/objectData";
import { ObjectScene } from "../../components";
import { useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { getClosestObject, getIntersectedSceneObject, getObjectPosition } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import useSceneStore from "../../store/sceneStore";
import { useMessageStore } from "../../store/messagesStore";
import { MinioData } from "../../types/databaseData";
import { useWorldRotation, useWorldPosition } from "../../hooks";

const debounce = (func: () => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
};

const IndexPage = ({ data: sceneData, minioData }: { data: SceneData, minioData?: MinioData }) => {
    // XR objects and values
    const store = useXRStore();
    const { camera, ...state } = useThree();
    const { scene, setScene } = useSceneStore();
    const { messages, addScreenMessage, removeScreenMessage } = useMessageStore();
    const groundMesh = store.getState().groundMesh;
    const [minioClientData, setMinioClientData] = useState<MinioData | null>(null);

    // UI values
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Location values
    const [worldPosition] = useWorldPosition(20, 2);
    const [fixedWorldPosition, setFixedWorldPosition] = useState<Position | null>(null);

    // Compass values
    const [compassPosition, setCompassPosition] = useState(camera?.position?.clone() ?? new THREE.Vector3(0, 0, 0));
    const [worldRotation] = useWorldRotation(camera);
    const [fixedWorldRotation, setFixedWorldRotation] = useState<number | null>(null);

    // Memoized camera position for ObjectScene
    const cameraPositionMemo = useMemo(() => camera?.position?.clone() ?? new THREE.Vector3(0, 0, 0), [worldPosition]);

    // Scene values
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    const setCurrentVariant = useCallback((objectId: number, variantId: number) => {
        setSelectedVariants((prev) => ({ ...prev, [objectId]: variantId }));
    }, []);

    // Apply data
    useEffect(() => {
        if (!minioData) return;
        setMinioClientData(minioData);
        console.log("Minio data set:", minioData);
    }, [minioData]);

    useEffect(() => {
        if (!sceneData) {
            console.warn("No scene data provided to add object data.");
            return;
        }

        setScene(sceneData);
        console.log("Scene data updated:", sceneData);
        const variants = sceneData.objects.reduce((acc, object) => {
            acc[object.id] = object.variants[0]?.id ?? null;
            return acc;
        }, {} as Record<number, number>);
        setSelectedVariants(variants);
    }, [sceneData]);

    useEffect(() => {
        console.log('Scene objects:', scene.objects);
    }, [scene.objects]);

    useLayoutEffect(() => {
        const updateHeaderHeight = () => {
            const header = document.querySelector("#arc-header") as HTMLElement;
            if (header) {
                setHeaderHeight(header.offsetTop + header.offsetHeight);
            }
        };

        // Delay the calculation slightly to ensure the DOM is fully rendered
        setTimeout(updateHeaderHeight, 100);

        // Debounced update for resize events
        const debouncedUpdateHeaderHeight = debounce(updateHeaderHeight, 200);
        window.addEventListener("resize", debouncedUpdateHeaderHeight);
        return () => window.removeEventListener("resize", debouncedUpdateHeaderHeight);
    }, []);

    // Handle scene object selection
    useXRInputSourceEvent(
        "all",
        "selectstart",
        (event) => {
            if (!scene) return;

            const selectedObjectId = getIntersectedSceneObject(event, { ...state, camera }, scene.objects);
            if (selectedObjectId) {
                setSelectedObject(selectedObjectId);
            }
        },
        [scene]
    );


    useEffect(() => {
        const distance = compassPosition.distanceTo(camera.position);
        if (distance > 0.2) {
            setCompassPosition(camera.position.clone());
        }
    }, [camera.position.x, camera.position.z]);

    const fontSize = "22px";

    return (
        <>
            <XRDomOverlay style={{ width: "100%", height: "100%", fontSize: fontSize, boxSizing: "border-box", }}>
                <div className="xr-message-stack">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="xr-loading-label py-2 px-3 fw-bold text-center"
                            style={{ fontSize: 18, color: msg.color ?? "white" }}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
                <>
                    <div id="arc-logo-header" className="py-1 px-2">
                        <span className="border-0 fw-bold text-uppercase text-dark">ARPAS</span>
                    </div>
                    <div id="arc-header" className="py-1 px-2">
                        <button
                            className="border-0 fw-bold text-uppercase text-dark"
                            onClick={() => store.getState().session?.end()}
                        >
                            <small>
                                <i className="fas fa-arrow-left" aria-hidden="true"></i> Leave AR
                            </small>
                        </button>
                        <button
                            className="border-0 fw-bold text-uppercase text-dark"
                            onClick={() => setIsHelpVisible((v) => !v)}
                        >
                            <small>
                                {isHelpVisible ? (
                                    <>
                                        <i className="fas fa-times" aria-hidden="true"></i> Close Help
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-info-circle"></i> Help
                                    </>
                                )}
                            </small>
                        </button>
                    </div>
                    <div style={{ top: `${headerHeight}px` }}>
                        <Compass2D showCardinal={!fixedWorldPosition && !fixedWorldRotation}/>
                        <div id="compass-container" style={{ background: "transparent" }}>
                            <button
                                className={`compass-fix-btn${fixedWorldPosition && fixedWorldRotation ? " active" : ""}`}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                    if (fixedWorldPosition && fixedWorldRotation) {
                                        setFixedWorldPosition(null);
                                        setFixedWorldRotation(null);
                                    } else {
                                        setFixedWorldPosition(worldPosition);
                                        setFixedWorldRotation(worldRotation);
                                    }
                                }}
                            > {} </button>
                        </div>
                    </div>
                </>

                <HelpMenu
                    isVisible={isHelpVisible}
                    onClose={() => setIsHelpVisible(false)}
                    onLeave={() => store.getState().session?.end()}
                    headerHeight={headerHeight}
                    fontSize={fontSize}
                />

                {selectedObject && (
                    <ObjectDescription
                        objectId={selectedObject}
                        variantId={selectedVariants[selectedObject]}
                        headerHeight={headerHeight}
                        setCurrentVariant={setCurrentVariant}
                        onClose={() => setSelectedObject(null)}
                    />
                )}

                {/* Debugging Information */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        zIndex: 1000,
                    }}
                >
                    <p>world rot: {worldRotation.toFixed(3)}</p>
                    <p>Selected Object: {selectedObject ?? "None"}</p>
                </div>
            </XRDomOverlay >

            {scene && (
                <>
                    <ambientLight intensity={5} />
                    <directionalLight intensity={10} />
                    <Compass3D headingInRad={worldRotation} cameraPosition={compassPosition} />

                    <ObjectScene
                        selectedVariants={selectedVariants}
                        minioClientData={minioClientData}
                        worldRotation={fixedWorldRotation ?? worldRotation}
                        worldPosition={fixedWorldPosition ?? worldPosition}
                        cameraPosition={cameraPositionMemo}
                    />
                </>
            )
            }
        </>
    );
};

export default IndexPage;

