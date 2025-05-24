import { useEffect, useLayoutEffect, useState } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { HelpMenu, ObjectDescription } from "../../components-ui";
import { SceneData } from "../../types/objectData";
import { MeshObject, RoundedPlane, SceneObject } from "../../components";
import { useLocationReference, useGeolocation, useCompassHeading, useCompassReference, useGeolocationHistory, useWorldRotation } from "../../hooks";
import { useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { getClosestObject, placeObjectsAtWorldCoordinates } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import { gpsToMeters } from "../../utility/geolocation";
import useWorldPosition from "../../hooks/geolocation/useWorldPosition";

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
    const groundMesh = store.getState().groundMesh;

    // UI values
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);

    // Location values
    const [valideGeolocation] = useGeolocation(defaultCoords);
    const [locationHistory] = useGeolocationHistory(valideGeolocation);
    const [currentCoordinates, referenceLocation] = useLocationReference(locationHistory);
    const [worldPosition] = useWorldPosition(referenceLocation);

    // Compass values
    const [compassHeading, compassCardinal, phoneTilt] = useCompassHeading();
    const [referenceCompassHeading] = useCompassReference(phoneTilt, compassHeading ?? 0, camera);
    const [worldRotation] = useWorldRotation(referenceCompassHeading, camera);

    // Scene values
    const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
    const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);

    // Smooth world position
    // TODO

    // Place objects
    useEffect(() => {
        if (!data) {
            console.warn("No scene data provided to place objects.");
            return;
        }

        if (referenceLocation)
            placeObjectsAtWorldCoordinates(referenceLocation, groundMesh, data.objects, setSceneObjects);
    }, [referenceLocation, referenceCompassHeading]);

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
        // const selectedObject = getIntersectedSceneObject(event, state, sceneObjects);
        // if (selectedObject) {
        //     setSelectedObject(selectedObject);
        // }
        const inputSource = event.inputSource;
        const referenceSpace = state.gl.xr.getReferenceSpace() as XRSpace;
        const pose = event.frame.getPose(inputSource.targetRaySpace, referenceSpace);
        if (!pose) return;

        const { x, y, z } = pose.transform.position;
        const { x: qx, y: qy, z: qz, w: qw } = pose.transform.orientation;
        const origin = new THREE.Vector3(x, y, z);
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(
            new THREE.Quaternion(qx, qy, qz, qw)
        );

        const raycaster = new THREE.Raycaster(origin, direction);
        const intersects = raycaster.intersectObjects(state.scene.children, true);

        for (const hit of intersects) {
            const sceneObjectId = hit.object?.userData?.sceneObjectId;

            if (sceneObjectId !== undefined) {
                const sceneObject = sceneObjects.find(obj => obj.id === sceneObjectId);
                if (sceneObject) {
                    setSelectedObject(sceneObject);
                }
                return;
            }
        }
    }, []);

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
                <Compass2D heading={compassHeading} cardinal={compassCardinal} />
            </div>

            {referenceLocation &&
                <p style={{ position: "absolute", bottom: "10px", width: "100%", textAlign: "center", color: "white" }}>
                    Closest Distance: {getClosestObject(referenceLocation.position, sceneObjects)?.distance.toFixed(2)} meters
                </p>}
            {referenceLocation && currentCoordinates &&
                <p style={{ position: "absolute", bottom: "220px", width: "100%", textAlign: "left", color: "white" }}>
                    - Pos: {gpsToMeters(referenceLocation.coordinates, currentCoordinates).x.toFixed(2)} ,
                    {gpsToMeters(referenceLocation?.coordinates, currentCoordinates).z.toFixed(2)}
                </p>}
            {currentCoordinates &&
                <p style={{ position: "absolute", bottom: "80px", width: "100%", textAlign: "left", color: "white" }}>
                    - GPS: {currentCoordinates.latitude}, {currentCoordinates.longitude}
                </p> &&
                <p style={{ position: "absolute", bottom: "40px", width: "100%", textAlign: "left", color: "white" }}>
                    - curr Acc: {currentCoordinates.accuracy.toFixed(5)}, loc his: {locationHistory.length}
                </p>}

            <HelpMenu
                isVisible={isHelpVisible}
                onClose={() => setIsHelpVisible(false)}
                onLeave={() => store.getState().session?.end()}
            />

            {selectedObject && selectedObject.objectData &&
                <ObjectDescription
                    object={selectedObject.objectData}
                    variant={selectedObject.getCurrentVariant() ?? null}
                    headerHeight={headerHeight}
                    onClose={() => setSelectedObject(null)}
                    onSelectVariant={(variantId) => {
                        if (!selectedObject) return;
                        selectedObject.changeVariant(variantId);
                    }}
                />
            }
        </XRDomOverlay>

        <ambientLight intensity={5} />
        <directionalLight intensity={10} />
        <Compass3D headingInRad={worldRotation} cardinal={compassCardinal} camera={camera} />

        <primitive object={new THREE.AxesHelper(0.15)} /> {/* Add visual start position */}
        <RoundedPlane
            position={new Position()}
            rotation={new Rotation(0, worldRotation, 0)}
            scale={new Scale(0.5)}
            radius={1}
            opacity={.2}
        ></RoundedPlane>

        <group
            position={worldPosition.toArray()}
            rotation={[0, worldRotation, 0]}
        >
            <primitive object={new THREE.AxesHelper(0.25)} /> {/* Add visual scene center */}
            {sceneObjects.map((sceneObject) => {
                const variant = sceneObject.getCurrentVariant();
                if (!variant) return null;

                return (
                    <mesh
                        key={sceneObject.id}
                        position={sceneObject.getScenePosition().toArray()}
                        rotation={sceneObject.getSceneRotation().toArray()}
                        scale={sceneObject.getScale().toArray()}
                        onClick={() => setSelectedObject(sceneObject)}
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
                            <MeshObject key={`${sceneObject.id}_${variant.id}`} meshObjectId={variant.mesh_id} />
                        )}
                    </mesh>
                );
            })}
        </group>
    </>);
};

export default IndexPage;
