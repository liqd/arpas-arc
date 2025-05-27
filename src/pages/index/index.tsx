import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { DirectionalArrow, HelpMenu, ObjectDescription } from "../../components-ui";
import { SceneData, ObjectData, VariantData } from "../../types/objectData";
import { MeshObject, } from "../../components";
import { useWorldRotation } from "../../hooks";
import { useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { getIntersectedSceneObject } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import useWorldPosition from "../../hooks/geolocation/useWorldPosition";
import useSceneStore from "../../store/sceneStore";
import useLocationStore from "../../store/locationStore";

const defaultCoords: GeolocationPosition = {
    coords: {
        longitude: import.meta.env.VITE_DEFAULT_LONG,
        latitude: import.meta.env.VITE_DEFAULT_LAT,
        altitude: 0,
        heading: 0,
        accuracy: 0,
        altitudeAccuracy: null,
        speed: 0,
        toJSON: function () {
            return {
                longitude: this.longitude,
                latitude: this.latitude,
                altitude: this.altitude,
                heading: this.heading,
                accuracy: this.accuracy,
                altitudeAccuracy: this.altitudeAccuracy,
                speed: this.speed
            };
        }
    },
    timestamp: Date.now(),
    toJSON: function () {
        return {
            coords: this.coords,
            timestamp: this.timestamp
        };
    }
};

const IndexPage = ({ data }: { data: SceneData }) => {

    // XR objects and values
    const store = useXRStore();
    const state = useThree();
    const { camera } = useThree();
    const { scene, setScene } = useSceneStore();
    const { getPosition } = useLocationStore();
    const groundMesh = store.getState().groundMesh;

    // UI values
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Location values
    const [worldPosition] = useWorldPosition(20, 2);

    // Compass values
    const [worldRotation] = useWorldRotation(camera, Math.PI / 2, 1);

    // Scene values
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    const setCurrentVariant = (objectId: number, variantId: number) => {
        setSelectedVariants((prev) => ({ ...prev, [objectId]: variantId }))
    }

    // Apply data
    useEffect(() => {
        if (!data) {
            console.warn("No scene data provided to add object data.");
            return;
        }
        console.log("Data updated:", data);

        setScene(data);

        // Set current variants
        data.objects.forEach(object => {
            setCurrentVariant(object.id, object.variants[0].id);
        });
    }, [data]);

    // useEffect(() => {
    //     console.log("curr loc:", currentLocation);
    // }, [currentLocation])
    // useEffect(() => {
    //     console.log("ref loc:", referenceLocation);
    // }, [referenceLocation])
    // useEffect(() => {
    //     console.log("world pos:", worldPosition);
    // }, [worldPosition])

    // useEffect(() => {
    //     console.log("selected object:", selectedObject);
    // }, [selectedObject])

    useLayoutEffect(() => {
        const updateHeaderHeight = () => {
            const header = document.querySelector("#arc-header") as HTMLElement;
            if (header) {
                setHeaderHeight(header.offsetTop + header.offsetHeight);
            }
        };

        updateHeaderHeight();
        window.addEventListener("resize", updateHeaderHeight);
        return () => window.removeEventListener("resize", updateHeaderHeight);
    }, []);

    // Handle scene object selection
    useXRInputSourceEvent("all", "selectstart", (event) => {
        if (!scene) return;

        const selectedObjectId = getIntersectedSceneObject(event, state, scene.objects);
        if (selectedObjectId) {
            setSelectedObject(selectedObjectId);
        }
    }, [scene]);

    // TODO Cache!
    const getObjectPosition = (sceneObject: ObjectData): Position => {
        const variantId = selectedVariants[sceneObject.id];
        const variant = sceneObject.variants.find((v) => v.id === variantId);

        return getPosition(sceneObject.coordinates[0], sceneObject.coordinates[1])
            .addedPosition(variant?.offset_position ?? new Position())
            .substractedPosition(worldPosition);
    };

    // const getClosestObject = (position: Position, sceneObjects: ObjectData[]
    // ): [ObjectData | null, Position | null, number] => {
    //     if (!sceneObjects.length) return [null, null, 0];

    //     let closestObject = sceneObjects[0];
    //     let closestObjectPosition = getObjectPosition(closestObject)
    //     let closestDistance = position.distanceTo(getObjectPosition(closestObject));

    //     for (let i = 1; i < sceneObjects.length; i++) {
    //         const currentObject = sceneObjects[i];
    //         const currentObjectPosition = getObjectPosition(currentObject);
    //         const currentDistance = position.distanceTo(currentObjectPosition);

    //         if (currentDistance < closestDistance) {
    //             closestObject = currentObject;
    //             closestObjectPosition = currentObjectPosition;
    //             closestDistance = currentDistance;
    //         }
    //     }

    //     return [closestObject, closestObjectPosition, closestDistance];
    // };
    // useEffect(() => {
    //     const [closestObjectToCamera, closestObjectToCameraPosition, closestObjectDistanceToCamera] = getClosestObject(new Position(camera.position), scene.objects);
    // }, );

    return (<>
        <XRDomOverlay style={{ width: "100%", height: "100%" }}>
            <div id="arc-logo-header" className="py-1 px-2">
                <span className="border-0 fw-bold text-uppercase text-dark">ARPAS</span>
            </div>
            <div id="arc-header" className="py-1 px-2">
                <button className="border-0 fw-bold text-uppercase text-dark" onClick={() => store.getState().session?.end()}>
                    <small><i className="fas fa-arrow-left" aria-hidden="true"></i> Leave AR</small>
                </button>
                <button className="border-0 fw-bold text-uppercase text-dark" onClick={() => setIsHelpVisible(true)}>
                    <small><i className="fas fa-info-circle"></i> Help</small>
                </button>
            </div>
            <div style={{ top: `${headerHeight}px` }}>
                <Compass2D />
            </div>

            {/* {selectedObject &&
                <p style={{ position: "absolute", bottom: "400px", width: "100%", textAlign: "center", color: "white" }}>
                    Selected: {selectedObject}</p>}

            {currentGeolocation &&
                <p style={{ position: "absolute", bottom: "360px", width: "100%", textAlign: "center", color: "white" }}>
                    Curr Coord: {currentGeolocation.coords.latitude}, {currentGeolocation.coords.longitude}, {currentGeolocation.coords.speed}, acc {currentGeolocation.coords.accuracy}</p>}
            {/* {(closestObjectDistanceToCamera) &&
                <p style={{ position: "absolute", bottom: "550px", width: "100%", textAlign: "left", color: "white" }}>
                    Closest: {closestObjectDistanceToCamera?.toFixed(2)} m, {closestObjectToCameraPosition?.x}, {closestObjectToCameraPosition?.z}
                </p>}
            {currentLocation && (
                <>
                    <p style={{ position: "absolute", bottom: "80px", width: "100%", textAlign: "left", color: "white" }}>
                        GPS: {currentLocation.coordinates.latitude}, {currentLocation.coordinates.longitude}, {currentLocation.coordinates.altitude}
                    </p>
                    <p style={{ position: "absolute", bottom: "150px", width: "100%", textAlign: "left", color: "white" }}>
                        Pos: {currentLocation.position.x.toFixed(2)}, {currentLocation.position.y.toFixed(2)}, {currentLocation.position.z.toFixed(2)}
                    </p>
                </>
            )}
            {referenceLocation && (
                <>
                    <p style={{ position: "absolute", bottom: "180px", width: "100%", textAlign: "left", color: "white" }}>
                        ref GPS: {referenceLocation.coordinates.latitude}, {referenceLocation.coordinates.longitude}, {referenceLocation.coordinates.altitude}
                    </p>
                    <p style={{ position: "absolute", bottom: "250px", width: "100%", textAlign: "left", color: "white" }}>
                        refPos: {referenceLocation.position.x.toFixed(2)}, {referenceLocation.position.y.toFixed(2)}, {referenceLocation.position.z.toFixed(2)}
                    </p>
                </>
            )}

            <p style={{ position: "absolute", bottom: "280px", width: "100%", textAlign: "left", color: "white" }}>
                World: {worldPosition.x.toFixed(2)}, {worldPosition.y.toFixed(2)}, {worldPosition.z.toFixed(2)}
            </p>
            <p style={{ position: "absolute", bottom: "320px", width: "100%", textAlign: "left", color: "white" }}>
                hist: {locationHistory?.length}
            </p> */}

            <HelpMenu
                isVisible={isHelpVisible}
                onClose={() => setIsHelpVisible(false)}
                onLeave={() => store.getState().session?.end()}
            />

            {selectedObject &&
                <ObjectDescription
                    objectId={selectedObject}
                    variantId={selectedVariants[selectedObject]}
                    headerHeight={headerHeight}
                    setCurrentVariant={setCurrentVariant}
                    onClose={() => setSelectedObject(null)}
                />
            }
            {/* {closestObjectToCameraPosition &&
                <DirectionalArrow camera={camera} targetPos={closestObjectToCameraPosition} />
            } */}
        </XRDomOverlay>

        <ambientLight intensity={5} />
        <directionalLight intensity={10} />
        {/* <Compass3D headingInRad={worldRotation} cardinal={compassCardinal} camera={camera} /> */}

        {/* <primitive object={new THREE.AxesHelper(0.15)} /> Add visual start position */}
        {/* <RoundedPlane
            rotation={new Rotation(0, worldRotation, 0)}
            scale={new Scale(0.5)}
            radius={1}
            opacity={.2}
        ></RoundedPlane> */}

        <mesh
            key={123}
            userData={{ sceneObjectId: 1 }}
            scale={new Scale(0.2).toArray()}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#248cb5" />
        </mesh>

        <group
            rotation={[0, worldRotation, 0]}
        >
            {/* <primitive object={new THREE.AxesHelper(0.25)} /> Add visual scene center */}

            {scene.objects.map((sceneObject) => {
                if (!sceneObject) return null;
                const sceneObjectId = sceneObject.id;
                const variantId = selectedVariants[sceneObject.id];
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
                            <MeshObject key={`${sceneObject.id}_${variant.id}`} sceneObjectId={sceneObjectId} meshObjectId={variant.mesh_id} />
                        )}
                    </mesh>
                );
            })}
        </group>
    </>);
};

export default IndexPage;
