import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { DirectionalArrow, HelpMenu, ObjectDescription } from "../../components-ui";
import { SceneData, ObjectData } from "../../types/objectData";
import { MeshObject, RoundedPlane, SceneObject } from "../../components";
import { useLocationReference, useGeolocation, useCompassHeading, useCompassReference, useGeolocationHistory, useWorldRotation } from "../../hooks";
import { useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";
import { createSceneObject, getClosestObject, getIntersectedSceneObject } from "../../utility/objects";
import { Compass2D, Compass3D } from "../../components-ui/compass";
import "./style.css";
import { gpsToMeters } from "../../utility/geolocation";
import useWorldPosition from "../../hooks/geolocation/useWorldPosition";
import { ObjectSessionData } from "../../types/sessionData";

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
    const [currentGeolocation, accurateGeolocation] = useGeolocation(null, 35);
    const [locationHistory] = useGeolocationHistory(accurateGeolocation ?? currentGeolocation);
    const [currentCoordinates, referenceLocation] = useLocationReference(locationHistory);
    const [worldPosition] = useWorldPosition(referenceLocation?.position ?? new Position()); // TODO start position is way off..

    // Compass values
    const [compassHeading, compassCardinal, phoneTilt] = useCompassHeading();
    const [referenceCompassHeading] = useCompassReference(phoneTilt, compassHeading ?? 0, camera);
    const [worldRotation] = useWorldRotation(referenceCompassHeading, camera);

    // Scene values
    const [sceneObjectsData, setSceneObjectsData] = useState<ObjectData[]>([]);
    const [sceneObjectsSessionData, setSceneObjectsSessionData] = useState<Record<number, ObjectSessionData>>({});

    const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);
    const sceneObjectsRef = useRef(sceneObjects);
    const [selectedObject, setSelectedObject] = useState<SceneObject | null>(null);

    const addOrUpdateSceneObjectData = (objectData: ObjectData | null = null, objectSessionData: ObjectSessionData | null = null) => {
        if (objectData)
            setSceneObjectsData((prevDatas) => {
                const existingIndex = prevDatas.findIndex(obj => obj.id === objectData.id);
                if (existingIndex !== -1) {
                    // Update existing object data
                    const updatedDatas = [...prevDatas];
                    updatedDatas[existingIndex] = objectData;
                    return updatedDatas;
                } else {
                    // Add new object data
                    return [...prevDatas, objectData];
                }
            });

        // Store session data separately using object ID
        if (objectSessionData)
            setSceneObjectsSessionData((prevSessions) => ({
                ...prevSessions,
                [objectSessionData.id]: objectSessionData,
            }));
    };

    const findSceneObjectDataById = (id: number): { data: ObjectData; sessionData: ObjectSessionData } => {
        const data = sceneObjectsData.find(obj => obj.id === id) ?? sceneObjectsData[0]; // TODO should return a default data
        const sessionData = sceneObjectsSessionData[id] ?? {}; // Provide fallback session data

        return { data, sessionData };
    };

    const findSceneObjectById = (id: number) => {
        return sceneObjects.find(obj => obj.id === id);
    };

    // Apply data
    useEffect(() => {
        if (!data) {
            console.warn("No scene data provided to add object data.");
            return;
        }
        console.log("Data updated:", data);

        data.objects.forEach((objectData) => {
            const sessionData: ObjectSessionData = {
                id: objectData.id,
                selectedVariantId: 0,
            };

            addOrUpdateSceneObjectData(objectData, sessionData);
        });
    }, [data]);

    // Create scene objects
    useEffect(() => {
        if (!data) {
            console.warn("No scene object data provided to create/update objects.");
            return;
        }
        console.log("Scene objects updated:", sceneObjectsData);
        sceneObjectsData.forEach((objectData) => {
            if (objectData) {
                createSceneObject(objectData.id, findSceneObjectDataById, addOrUpdateSceneObjectData, groundMesh, setSceneObjects);
            }
        });
    }, [sceneObjectsData]);

    // Update scene objects ref
    useEffect(() => {
        sceneObjectsRef.current = sceneObjects;
    }, [sceneObjects]);

    useEffect(() => {
        // console.log(sceneObjectsSessionData);
    }, [sceneObjectsSessionData])

    useEffect(() => {
        console.log(selectedObject);
    }, [selectedObject])

    // Update objects
    // TODO remove this. it should not be necessary!
    useEffect(() => {
        let usedReferenceCoordinates = referenceLocation?.coordinates ?? null;
        if (!usedReferenceCoordinates) {
            if (!currentCoordinates) {
                console.warn("No reference location provided. Current coordinates are used.");
                usedReferenceCoordinates = currentCoordinates;
            } else
                return;
        }

        if (usedReferenceCoordinates)
            sceneObjects.forEach((sceneObject) => {
                if (sceneObject) sceneObject.updateGeoScenePosition(usedReferenceCoordinates);
            });
    }, [currentCoordinates, referenceLocation]);
    // Update objects

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
        const selectedObject = getIntersectedSceneObject(event, state, sceneObjectsRef.current);
        if (selectedObject) {
            setSelectedObject(selectedObject);
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

            {foo &&
                <p style={{ position: "absolute", bottom: "500px", width: "100%", textAlign: "center", color: "white" }}>
                    foo: {foo}, {sceneObjects.length}</p>}
            {currentGeolocation &&
                <p style={{ position: "absolute", bottom: "260px", width: "100%", textAlign: "center", color: "white" }}>
                    Curr Coord: {currentGeolocation.coords.latitude}, {currentGeolocation.coords.longitude}, {currentGeolocation.coords.speed}, acc {currentGeolocation.coords.accuracy}</p>}
            {referenceLocation &&
                <p style={{ position: "absolute", bottom: "10px", width: "100%", textAlign: "center", color: "white" }}>
                    Closest Distance: {getClosestObject(worldPosition.substractedPosition(new Position(camera.position)), sceneObjects)?.distance.toFixed(2)} meters
                </p>}
            {/* {referenceLocation && currentCoordinates &&
                <p style={{ position: "absolute", bottom: "220px", width: "100%", textAlign: "left", color: "white" }}>
                    - Pos: {gpsToMeters(referenceLocation.coordinates, currentCoordinates).x.toFixed(2)} ,
                    {gpsToMeters(referenceLocation?.coordinates, currentCoordinates).z.toFixed(2)}
                </p>} */}
            {currentCoordinates &&
                <p style={{ position: "absolute", bottom: "80px", width: "100%", textAlign: "left", color: "white" }}>
                    GPS: {currentCoordinates.latitude}, {currentCoordinates.longitude}, {currentCoordinates.altitude}
                </p>}

            <HelpMenu
                isVisible={isHelpVisible}
                onClose={() => setIsHelpVisible(false)}
                onLeave={() => store.getState().session?.end()}
            />

            {selectedObject &&
                <ObjectDescription
                    sceneObject={selectedObject}
                    headerHeight={headerHeight}
                    onClose={() => setSelectedObject(null)}
                />
            }
            <DirectionalArrow camera={camera} targetPos={new THREE.Vector3()} />
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

        <mesh
            key={123}
            userData={{ sceneObjectId: 1 }}
            position={new Position().toArray()}
            rotation={new Rotation().toArray()}
            scale={new Scale(0.2).toArray()}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#248cb5" />
        </mesh>

        <group
            position={worldPosition.toArray()}
            rotation={[0, worldRotation, 0]}
        >
            <primitive object={new THREE.AxesHelper(0.25)} /> {/* Add visual scene center */}
            {sceneObjects.map((sceneObject) => {
                const sceneObjectId = sceneObject.id;
                const variant = sceneObject.getCurrentVariantData();
                if (!variant) return null;

                return (
                    <mesh
                        key={sceneObjectId}
                        userData={{ sceneObjectId }}
                        position={sceneObject.getScenePosition().toArray()}
                        rotation={sceneObject.getSceneRotation().toArray()}
                        scale={sceneObject.getScale().toArray()}
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
