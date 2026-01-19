import { useEffect, useLayoutEffect, useMemo, useCallback, useState, useRef } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { Header, Footer, DirectionalArrow, HelpMenu, ObjectDescription } from "../../components-ui";
import { ContentTypesData } from "../../types/contentTypesData";
import { SceneData, ObjectData, VariantData } from "../../types/objectData";
import { TopicData } from "../../types/topicData";
import { ObjectScene } from "../../components";
import { Camera, useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { getClosestObject, getIntersectedSceneObject } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import useSceneStore from "../../store/sceneStore";
import { useMessageStore } from "../../store/messagesStore";
import { MinioData } from "../../types/databaseData";
import { useWorldRotation, useWorldPosition } from "../../hooks";
import { useObjectPositionStore } from "../../store/objectPositionStore";
import { useCommentsStore } from "../../store/commentsStore";
import { useRatingStore } from "../../store/ratingStore";
import { useLocationStore } from "../../store/locationStore";

const debounce = (func: () => void, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    };
};

const IndexPage = ({
    contentTypes,
    sceneData,
    topicData,
    minioData
}: {
    contentTypes: ContentTypesData;
    sceneData: SceneData;
    topicData: TopicData;
    minioData?: MinioData;
}) => {

    // XR objects and values
    const store = useXRStore();
    const { camera, ...state } = useThree();
    const { scene, setScene } = useSceneStore();
    const { messages } = useMessageStore();

    const [minioClientData, setMinioClientData] = useState<MinioData | null>(null);

    // UI values
    const fontSize = 22;
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Location values
    const [worldPosition] = useWorldPosition(20, 2);
    const [fixedWorldPosition, setFixedWorldPosition] = useState<Position | null>(null);

    // Compass values
    const [worldRotation] = useWorldRotation(camera);
    const [fixedWorldRotation, setFixedWorldRotation] = useState<number | null>(null);

    const [compassPosition, setCompassPosition] = useState(camera.position.clone());
    // Memoized camera position for ObjectScene
    const cameraPositionMemo = camera.position.clone();

    // Scene values
    const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
    const [selectedVariantIds, setSelectedVariantIds] = useState<Record<number, number>>({});
    const [positionOfSelectedVariant, setPositionOfSelectedVariant] = useState<Position | null>(null);
    const [distanceToSelectedVariant, setDistanceToSelectedVariant] = useState<number | null>(null);

    const setCurrentVariant = useCallback((objectId: number, variantId: number) => {
        setSelectedVariantIds((prev) => ({ ...prev, [objectId]: variantId }));
    }, []);

    // Apply data
    useEffect(() => {
        if (!contentTypes) {
            console.warn("No content types provided.");
            return;
        }

        if (!sceneData) {
            console.warn("No scene data provided to add object data.");
            return;
        }

        // Set content types
        useCommentsStore.getState().setVariantContentType(contentTypes.variant_content_type_id);
        useCommentsStore.getState().setCommentContentType(contentTypes.comments_content_type_id);
        useRatingStore.getState().setSceneContentType(sceneData.content_type);
        useRatingStore.getState().setVariantContentType(contentTypes.variant_content_type_id);
        useRatingStore.getState().setCommentContentType(contentTypes.comments_content_type_id);
        console.log("Content types set:", contentTypes);

        // Apply scene data
        setScene(sceneData);
        console.log("Scene data updated:", sceneData);

        const variants = sceneData.objects.reduce((acc, object) => {
            acc[object.id] = object.variants[0]?.id ?? null;
            return acc;
        }, {} as Record<number, number>);

        setSelectedVariantIds(variants);
        // setSelectedObjectId(sceneData.objects[0]?.id ?? null); // enable to select first object by default
    }, [contentTypes, sceneData]);

     useEffect(() => {
        console.log('Topic data updated:', topicData);
    }, [topicData]);

    useEffect(() => {
        if (!minioData) return;
        setMinioClientData(minioData);
        console.log("Minio data set:", minioData);
    }, [minioData]);

    useEffect(() => {
        console.log('Scene objects:', scene.objects);
    }, [scene.objects]);

    useEffect(() => {
        if (selectedObjectId === null || !scene) {
            setPositionOfSelectedVariant(null);
            setDistanceToSelectedVariant(null);
            return;
        }
        const selectedVariantId = selectedVariantIds[selectedObjectId];
        if(selectedVariantId === undefined) {
            setPositionOfSelectedVariant(null);
            setDistanceToSelectedVariant(null);
            return;
        }

        let storedPosition = useObjectPositionStore.getState().getStoredPosition(selectedObjectId, selectedVariantId) ?? null;
        if (!storedPosition) {
            console.warn(`No stored position for object ${selectedObjectId} variant ${selectedVariantId}. Computing and storing.`);
            try {
                const sceneObject = useSceneStore.getState().getObjectData(selectedObjectId);
                if (!sceneObject) throw new Error(`Scene object not found: ${selectedObjectId}`);
                const variant = useSceneStore.getState().getVariantDataOfObject(sceneObject, selectedVariantId);
                if (!variant) throw new Error(`Variant not found for object ${selectedObjectId} variant ${selectedVariantId}`);

                const getPosition = useLocationStore(state => state.getPosition);
                storedPosition = useObjectPositionStore.getState().computeAndSetObjectPosition(sceneObject, variant, getPosition);
            } catch (err) {
                console.error("Error computing/storing object position:", err, "object:", selectedObjectId, "variant:", selectedVariantId);
                // fallback to zero position if compute failed
                storedPosition = new Position(0, 0, 0);
            }
        }

        // Position
        const position = storedPosition 
            ? storedPosition.substractedPosition(worldPosition)
            : new Position(0, 0, 0);
        setPositionOfSelectedVariant(position);

        const dx = position.x - camera.position.x;
        const dz = position.z - camera.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        setDistanceToSelectedVariant(distance);
    }, [selectedObjectId, selectedVariantIds, scene, worldPosition, camera.position.x, camera.position.y, camera.position.z]);

    // Update header height on mount and window resize
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
                setSelectedObjectId(selectedObjectId);
            }
        },
        [scene]
    );
    
    // Update compass position if camera moves significantly
    useEffect(() => {
        const distance = compassPosition.distanceTo(camera.position);
        if (distance > 0.2) {
            setCompassPosition(camera.position.clone());
        }
    }, [camera.position.x, camera.position.z]); 

    return (
        <>
            <XRDomOverlay style={{ width: "100%", height: "100%", fontSize: `${fontSize}px`, boxSizing: "border-box" }}>
                <div className="xr-message-stack">
                    {messages.map((msg) => (
                        <div key={msg.id} className="xr-loading-label py-2 px-3 fw-bold text-center" style={{ fontSize: `${fontSize * 0.8}px`, color: msg.color ?? "white" }}>
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Header */}
                <Header
                    isHelpVisible={isHelpVisible}
                    onToggleHelp={() => setIsHelpVisible((v) => !v)}
                    onLeave={() => store.getState().session?.end()}
                    fontSize={fontSize}
                />

                { positionOfSelectedVariant && (
                    <div id="arrow-overlay">
                        <DirectionalArrow
                            key={selectedObjectId}
                            worldRotationRad={(fixedWorldRotation ?? worldRotation) ?? 0}
                            worldPosition={(fixedWorldPosition ?? worldPosition)}
                            camera={camera}
                            targetPosition={positionOfSelectedVariant}
                            distanceToPosition={distanceToSelectedVariant}
                            hideArrowAngle={15}
                            nearDistance={6}
                            fixedPosition={false}
                            color="red"
                            size={50}
                            headerOffset={headerHeight}
                        />
                    </div>
                )}

                {/* Content */}
                <div style={{ top: `${headerHeight}px` }}>
                    <Compass2D showCardinal={!fixedWorldPosition && !fixedWorldRotation} />
                    <div id="compass-container" style={{ background: "transparent" }}>
                        <button
                            className={`compass-fix-btn${fixedWorldPosition && fixedWorldRotation ? " active" : ""}`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                if (fixedWorldPosition && fixedWorldRotation) {
                                    setFixedWorldPosition(null);
                                    setFixedWorldRotation(null);
                                } else {
                                    setFixedWorldPosition(worldPosition);
                                    setFixedWorldRotation(worldRotation);
                                }
                            }}
                        >
                            { }
                        </button>
                    </div>
                </div>

                <HelpMenu
                    isVisible={isHelpVisible}
                    onClose={() => setIsHelpVisible(false)}
                    onLeave={() => store.getState().session?.end()}
                    headerHeight={headerHeight}
                    fontSize={fontSize}
                />

                {selectedObjectId && (
                    <ObjectDescription
                        objectId={selectedObjectId}
                        variantId={selectedVariantIds[selectedObjectId]}
                        headerHeight={headerHeight}
                        setCurrentVariant={setCurrentVariant}
                        onClose={() => setSelectedObjectId(null)}
                        fontSize={fontSize}
                        distance={distanceToSelectedVariant}
                        bearing={worldRotation}
                    />
                )}

                {/* Footer */}
                {/* <Footer>
                  <small className="text-dark">Selected: {selectedObject ?? "None"}</small>
                  <small className="text-muted">Heading: {worldRotation.toFixed(2)} rad</small>
                </Footer> */}

                {/* Debugging box can be removed or kept */}
                {/* <div
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
                </div> */}
            </XRDomOverlay>

            {/* 3D Scene */}
            {scene && (
                <>
                    <ambientLight intensity={5} />
                    <directionalLight intensity={10} />
                    <Compass3D headingInRad={worldRotation} cameraPosition={compassPosition} />

                    <ObjectScene
                        selectedVariants={selectedVariantIds}
                        minioClientData={minioClientData}
                        worldRotation={fixedWorldRotation ?? worldRotation}
                        worldPosition={fixedWorldPosition ?? worldPosition}
                    />
                </>
            )}
        </>
    );
};

export default IndexPage;