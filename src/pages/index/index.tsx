import { useEffect, useLayoutEffect, useMemo, useCallback, useState } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { DirectionalArrow, HelpMenu, ObjectDescription } from "../../components-ui";
import { SceneData, ObjectData, VariantData } from "../../types/objectData";
import { MeshObject } from "../../components";
import { useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { getIntersectedSceneObject } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import useSceneStore from "../../store/sceneStore";
import useLocationStore from "../../store/locationStore";
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

const IndexPage = ({ minioData, data }: { minioData: MinioData, data: SceneData }) => {
    // XR objects and values
    const store = useXRStore();
    const state = useThree();
    const { camera } = useThree();
    const { scene, setScene } = useSceneStore();
    const { getPosition } = useLocationStore();
    const groundMesh = store.getState().groundMesh;
    const [minioClientData, setMinioData] = useState<MinioData>();

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
        setMinioData(minioData);
    }, [minioData]);

    useEffect(() => {
        if (!data) {
            console.warn("No scene data provided to add object data.");
            return;
        }
        console.log("Data updated:", data);

        setScene(data);
        const variants = data.objects.reduce((acc, object) => {
            acc[object.id] = object.variants[0]?.id ?? null;
            return acc;
        }, {} as Record<number, number>);
        setSelectedVariants(variants);
    }, [data]);

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

    const getObjectPosition = useMemo(() => (sceneObject: ObjectData): Position => {
        const variantId = selectedVariants[sceneObject.id] ?? sceneObject.variants[0]?.id;
        const variant = sceneObject.variants.find((v) => v.id === variantId);

        return getPosition(sceneObject.coordinates[0], sceneObject.coordinates[1])
            .addedPosition(variant?.offset_position ?? new Position())
            .substractedPosition(worldPosition);
    }, [selectedVariants, worldPosition]);

    return (
        <>
            <XRDomOverlay style={{ width: "100%", height: "100%" }}>
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
                        onClick={() => setIsHelpVisible(true)}
                    >
                        <small>
                            <i className="fas fa-info-circle"></i> Help
                        </small>
                    </button>
                </div>
                <div style={{ top: `${headerHeight}px` }}>
                    <Compass2D />
                </div>

                <HelpMenu
                    isVisible={isHelpVisible}
                    onClose={() => setIsHelpVisible(false)}
                    onLeave={() => store.getState().session?.end()}
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
                    <p>Header Height: {headerHeight}px</p>
                    <p>Selected Object: {selectedObject ?? "None"}</p>
                </div>
            </XRDomOverlay>

            <ambientLight intensity={5} />
            <directionalLight intensity={10} />
            <Compass3D headingInRad={worldRotation} camera={camera} />

            <group rotation={[0, worldRotation, 0]}>
                {scene.objects?.map((sceneObject) => {
                    if (!sceneObject || !sceneObject.variants || !minioClientData) return null;

                    const sceneObjectId = sceneObject.id;
                    const variantId = selectedVariants[sceneObject.id] ?? sceneObject.variants[0]?.id;
                    const variant = sceneObject.variants.find((v) => v.id === variantId);
                    if (!variant) return null;

                    return (
                        <mesh
                            key={sceneObjectId}
                            userData={{ sceneObjectId }}
                            position={getObjectPosition(sceneObject).toArray()}
                            rotation={variant.offset_rotation}
                            scale={variant.offset_scale}
                        >
                            {variant.mesh_id === "primitive_cube" ? (
                                <>
                                    <boxGeometry args={[1, 1, 1]} />
                                    <meshStandardMaterial color="#248cb5" />
                                </>
                            ) : variant.mesh_id === "primitive_sphere" ? (
                                <>
                                    <sphereGeometry args={[1, 1, 1]} />
                                    <meshStandardMaterial color="#248cb5" />
                                </>
                            ) : (
                                <MeshObject
                                    key={`${sceneObject.id}_${variant.id}`}
                                    minioData={minioClientData}
                                    sceneObjectId={sceneObjectId}
                                    meshObjectId={variant.mesh_id}
                                />
                            )}
                        </mesh>
                    );
                })}
            </group>
        </>
    );
};

export default IndexPage;

