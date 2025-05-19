import React, { useState, useRef, useEffect } from "react";
import { useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { gpsToMeters, getCompassHeading } from "../../utility/geolocation";
import { MeshObject } from "../../components";
import { Compass2D } from "../../components-ui/compass";
import "./style.css";
import { Position, Rotation, Scale } from "../../types/transform";
import geolocationConfig from "./geolocationConfig.json";
import { getClosestObject, placeObjectAtWorldCoordinates, placeObjectsAtWorldCoordinates } from "../../utility/objects";
import { normalizeAngleDifference } from "../../utility/angle";
import { SceneObjectData } from "../../types/sceneObjectData";

const defaultCoords: GeolocationCoordinates = {
    latitude: geolocationConfig.default_latitude ?? 0,
    longitude: geolocationConfig.default_longitude ?? 0,
    altitude: 0,
    heading: 0,
    accuracy: 0,
    altitudeAccuracy: null,
    speed: 0,
    toJSON: function () {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            altitude: this.altitude,
            heading: this.heading,
            accuracy: this.accuracy,
            altitudeAccuracy: this.altitudeAccuracy,
            speed: this.speed
        };
    }
};

const initialObjects: SceneObjectData[] = geolocationConfig.initialObjects.map(obj => ({
    id: obj.id,
    gpsCoords: obj.gpsCoords,
    bucket: obj.bucket,
    modelKey: obj.modelKey
}));

const GeolocationPage = () => {
    const store = useXRStore();
    const sceneRef = useRef(new THREE.Scene());
    const { camera } = useThree();
    const groundMesh = store.getState().groundMesh;
    const [lastValidGeolocation, updateGeolocation] = useState<GeolocationPosition>();
    const [currentCoords, setCurrentCoords] = useState<GeolocationCoordinates>(defaultCoords);
    const [locationHistory, setLocationHistory] = useState<GeolocationCoordinates[]>([]);
    const [referenceLocation, setReferenceLocation] = useState<{
        coords: GeolocationCoordinates;
        position: Position;
    }>({
        coords: defaultCoords,
        position: new Position(),
    });
    const [compassHeading, setCompassHeading] = useState(0);
    const [compassCardinal, setCompassCardinal] = useState("undef");
    const [phoneTilt, setPhoneTilt] = useState({ alpha: 0, beta: 0, gamma: 0 });
    const [compassHeadingHistory, setCompassHeadingHistory] = useState<number[]>([]);
    const [referenceCompassHeading, setReferenceCompassHeading] = useState<{
        heading: number;
        phoneYaw: number;
    }>({
        heading: 0,
        phoneYaw: 0,
    });
    const [sceneObjects, setSceneObjects] = useState<SceneObjectData[]>([]);

    useEffect(() => getCompassHeading(lastValidGeolocation ?? null, setCompassHeading, setCompassCardinal, setPhoneTilt), []);

    useEffect(() => {
        const onSuccess = (position: GeolocationPosition) => {
            const geoPosition = position.coords.accuracy <= 20 ? position : null;
            if (!geoPosition) {
                console.log("Received inaccurate geolocation:", geoPosition, "with accuracy of:", position.coords.accuracy);
                return;
            }

            if (geoPosition.coords) {
                console.log("Received accurate and valid geolocation:", geoPosition);
                // TODO: Uncomment to use GPS data instead of dummy location
                updateGeolocation(geoPosition);
            } else {
                console.warn("Invalid geolocation received, keeping default referenceCoords.");
            }
        };

        const watchId = navigator.geolocation.watchPosition(onSuccess, (error) => {
            console.error("Geolocation error:", error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const MAX_CURRENT_LOCATION_HISTORY = 10;
    useEffect(() => {
        if (!lastValidGeolocation) return;

        setLocationHistory(prevHistory => {
            const updatedHistory = [...prevHistory, lastValidGeolocation.coords];
            return updatedHistory.length > MAX_CURRENT_LOCATION_HISTORY ? updatedHistory.slice(1) : updatedHistory;
        });
    }, [lastValidGeolocation]);

    const locationDriftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blockLocationUpdateTimeRef = useRef<number>(0);
    useEffect(() => {
        if (!locationHistory || locationHistory.length == 0) return;

        const lastCoords = locationHistory[locationHistory.length - 1];

        const getMedian = (values: number[]) => {
            if (values.length === 0) return 0;

            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);

            return sorted.length % 2 === 0
                ? (sorted[mid - 1] + sorted[mid]) / 2
                : sorted[mid];
        };

        const medianLatitude = getMedian(locationHistory.map(loc => loc.latitude));
        const medianLongitude = getMedian(locationHistory.map(loc => loc.longitude));

        // Compute the average location to smooth out fluctuations
        const avgLatitude = locationHistory.reduce((sum, loc) => sum + loc.latitude, 0) / locationHistory.length;
        const avgLongitude = locationHistory.reduce((sum, loc) => sum + loc.longitude, 0) / locationHistory.length;
        const avgAccuracy = locationHistory.reduce((sum, loc) => sum + loc.accuracy, 0) / locationHistory.length;

        // Define an average coordinates object
        const averageCoords: GeolocationCoordinates = {
            latitude: medianLatitude,
            longitude: medianLongitude,
            altitude: 0, // keep it 0 for now. newCoords.altitude
            heading: 0,
            accuracy: avgAccuracy,
            altitudeAccuracy: lastCoords.altitudeAccuracy,
            speed: lastCoords.speed,
            toJSON: lastCoords.toJSON
        };

        // Update current Coordinates
        setCurrentCoords(averageCoords);

        // Check if reference needs to be updated
        if (!referenceLocation) {
            setReferenceLocation({ coords: averageCoords, position: new Position() });
        }
        else { // Update coordinates if there is a string drift
            const distanceThreshold = 10; // Meters before updating reference
            const timeThreshold = 5000; // Milliseconds before updating

            // Calculate distance between reference and averaged coordinates
            const distance = gpsToMeters(referenceLocation.coords, averageCoords);
            const positionDriftDetected = Math.sqrt(distance.x ** 2 + distance.z ** 2) > distanceThreshold;

            const currentTime = Date.now();

            if (positionDriftDetected) {
                console.log("Large geolocation drift detected! Waiting...");

                if (currentTime - blockLocationUpdateTimeRef.current > timeThreshold) {
                    console.log("Updating reference coordinates due to sustained drift:", averageCoords);
                    setReferenceLocation({ coords: averageCoords, position: new Position(distance.x, 0, distance.z) });

                    blockLocationUpdateTimeRef.current = currentTime;
                    blockCompassUpdateTimeRef.current = currentTime;
                }
            }
        }
    }, [locationHistory]);

    const blockCompassUpdateTimeRef = useRef<number>(0);
    useEffect(() => {
        if (!phoneTilt) return;

        const MAX_TILT_ANGLE = 30; // Threshold to prevent extreme angles from affecting heading updates
        const currentTime = Date.now();

        if (phoneTilt.beta == null || Math.abs(phoneTilt.beta) > MAX_TILT_ANGLE
            || phoneTilt.gamma == null || Math.abs(phoneTilt.gamma) > MAX_TILT_ANGLE) {
            blockCompassUpdateTimeRef.current = currentTime;
            return; // Skip heading update when device is tilted too much
        }

        const HISTORY_SIZE = 10; // Number of past values to store
        const MAX_VARIATION = 5; // Maximum allowed deviation in heading

        setCompassHeadingHistory(prev => {
            const updatedHistory = [...prev, compassHeading].slice(-HISTORY_SIZE);

            const timeThreshold = 2000; // Milliseconds before updating

            if (currentTime - blockCompassUpdateTimeRef.current > timeThreshold && updatedHistory.length >= HISTORY_SIZE) {
                const isStable = updatedHistory.every((heading, index, array) => {
                    if (index === 0) return true;
                    return normalizeAngleDifference(array[index - 1], heading) <= MAX_VARIATION;
                });

                if (isStable) {
                    const CameraRotationRad = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
                    const cameraYaw = THREE.MathUtils.radToDeg(CameraRotationRad.y);
                    setReferenceCompassHeading({ heading: compassHeading, phoneYaw: cameraYaw });
                    setCompassHeadingHistory([]);

                    blockCompassUpdateTimeRef.current = currentTime + 3000;
                    blockLocationUpdateTimeRef.current = currentTime;
                }
            }

            return updatedHistory;
        });

    }, [phoneTilt]);

    useEffect(() => {
        if (!initialObjects) {
            console.warn("No initial objects to place.");
            return;
        }

        placeObjectsAtWorldCoordinates(
            referenceLocation, groundMesh, initialObjects,
            setSceneObjects);
    }, [referenceLocation, referenceCompassHeading]);

    const groupRotationEulerY = (referenceCompassHeading.phoneYaw - referenceCompassHeading.heading + 540) % 360;
    const groupRotationY = THREE.MathUtils.degToRad(groupRotationEulerY);

    return (
        <>
            <XRDomOverlay style={{ width: "100%", height: "100%" }}>
                <button id="exit-button" onClick={() => store.getState().session?.end()}>X</button>
                <>
                    <Compass2D heading={compassHeading} cardinal={compassCardinal} />
                </>
                <p style={{ position: "absolute", bottom: "10px", width: "100%", textAlign: "center", color: "white" }}>
                    Closest Distance: {getClosestObject(referenceLocation.position, sceneObjects)?.distance.toFixed(2)} meters
                </p>
                <p style={{ position: "absolute", bottom: "220px", width: "100%", textAlign: "left", color: "white" }}>
                    - Pos: {gpsToMeters(referenceLocation.coords, currentCoords).x.toFixed(2)} ,
                    {gpsToMeters(referenceLocation.coords, currentCoords).z.toFixed(2)}
                </p>
                <p style={{ position: "absolute", bottom: "140px", width: "100%", textAlign: "left", color: "white" }}>
                    - Compass: {compassHeading.toFixed(1)}, {compassCardinal}, ref head: {referenceCompassHeading.heading.toFixed(2)},
                    yaw: {referenceCompassHeading.phoneYaw.toFixed(2)}, EulerY: {groupRotationEulerY.toFixed(2)}
                </p>
                <p style={{ position: "absolute", bottom: "80px", width: "100%", textAlign: "left", color: "white" }}>
                    - GPS: {currentCoords.latitude}, {currentCoords.longitude}
                </p>
                <p style={{ position: "absolute", bottom: "40px", width: "100%", textAlign: "left", color: "white" }}>
                    - curr Acc: {currentCoords.accuracy.toFixed(5)}, loc his: {locationHistory.length}
                </p>
            </XRDomOverlay>
            <ambientLight intensity={5} />
            <directionalLight intensity={10} />
            <primitive object={new THREE.AxesHelper(0.25)} />
            <group rotation={[0, groupRotationY, 0]}>
                <primitive object={new THREE.AxesHelper(0.15)} />
                {sceneObjects.map((sceneObject) => (
                    <MeshObject key={sceneObject.id} bucketName={sceneObject.bucket} modelKey={sceneObject.modelKey}
                        position={sceneObject.position} rotation={sceneObject.rotation} scale={sceneObject.scale} />
                ))}
            </group>
        </>
    );
};

export default GeolocationPage;
