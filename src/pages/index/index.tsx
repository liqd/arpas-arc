import { useEffect, useLayoutEffect, useMemo, useCallback, useState } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { DirectionalArrow, HelpMenu, ObjectDescription } from "../../components-ui";
import { SceneData, ObjectData, VariantData } from "../../types/objectData";
import { ObjectScene } from "../../components";
import { useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { getIntersectedSceneObject } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import useSceneStore from "../../store/sceneStore";
import { useMessageStore } from "../../store/messagesStore";
import { MinioData } from "../../types/databaseData";
import useWorldPosition from "../../hooks/geolocation/useWorldPosition";
import { useWorldRotation } from "../../hooks";

const debounce = (func: () => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
};

const IndexPage = ({ minioData, data: sceneData }: { minioData: MinioData, data: SceneData }) => {
    // XR objects and values
    const store = useXRStore();
    const state = useThree();
    const { camera } = useThree();
    const { scene, setScene } = useSceneStore();
    const { messages, addScreenMessage, removeScreenMessage } = useMessageStore();
    const groundMesh = store.getState().groundMesh;
    const [minioClientData, setMinioClientData] = useState<MinioData | null>(null);

    // UI values
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Location values
    const [worldPosition] = useWorldPosition(20, 2);

    // Compass values
    const [worldRotation] = useWorldRotation(camera);

    // Scene values
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    const setCurrentVariant = useCallback((objectId: number, variantId: number) => {
        setSelectedVariants((prev) => ({ ...prev, [objectId]: variantId }));
    }, []);

    // Apply data
    useEffect(() => {
        if (!minioData) {
            console.error("Minio data is missing.");
            return;
        }
        setMinioClientData(minioData);
        console.log("Minio data updated:", minioData);
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

    useEffect(() => {
        if (!minioClientData) {
            addScreenMessage("Wait for database...", "wait_for_database");
        } else {
            removeScreenMessage("wait_for_database");
        }
    }, [minioClientData]);

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

            const selectedObjectId = getIntersectedSceneObject(event, state, scene.objects);
            if (selectedObjectId) {
                setSelectedObject(selectedObjectId);
            }
        },
        [scene]
    );

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
                        <Compass2D />
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

            {scene && minioClientData && (
                <>
                    <ambientLight intensity={5} />
                    <directionalLight intensity={10} />
                    <Compass3D headingInRad={worldRotation} camera={camera} />

                    <ObjectScene
                        selectedVariants={selectedVariants}
                        minioClientData={minioClientData}
                        worldRotation={worldRotation}
                        worldPosition={worldPosition}
                    />
                </>
            )
            }
        </>
    );
};

export default IndexPage;

