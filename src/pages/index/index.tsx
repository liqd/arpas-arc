import React, { useState, useCallback, useRef, JSX, useEffect } from "react";
import { useXRHitTest, useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { Matrix4 } from "three";
import { offsetGpsByMeters, gpsToMeters, getCompassHeading } from "../../utility/geolocation";
import { Position, Rotation, Scale } from "../../utility/transform";
import { Reticle, MeshObject } from "../../components";
import { Compass } from "../../components-ui";
import "./style.css";

type HitTestResults = {
    none: Matrix4 | undefined;
    left: Matrix4 | undefined;
    right: Matrix4 | undefined;
}

const IndexPage = () => {
    const store = useXRStore();

    /* -------------- GEOLOCATION -------------- */

    const boxRef = useRef<THREE.Mesh>(null);
    const [initialCoords, setInitialCoords] = useState<GeolocationCoordinates | null>(null);
    const [currentCoords, setCurrentCoords] = useState<GeolocationCoordinates | null>(null);

    const [compassHeading, setCompassHeading] = useState(0);
    const [compassCardinal, setCompassCardinal] = useState("undef");
    const [phoneTilt, setPhoneTilt] = useState({ alpha: 0, beta: 0, gamma: 0 });

    useEffect(() => getCompassHeading(null, setCompassHeading, setCompassCardinal, setPhoneTilt), []);

    useEffect(() => {
        const onSuccess = (position: GeolocationPosition) => {
            if (!initialCoords)
                setInitialCoords(position.coords);
            setCurrentCoords(position.coords);
        };

        const onError = (error: GeolocationPositionError) => {
            console.error("Error getting geolocation: ", error);
        };

        const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
        });

        return () => { navigator.geolocation.clearWatch(watchId); };
    }, []);

    useEffect(() => {
        if (!boxRef.current) return;

        if (!initialCoords || !currentCoords) {
            boxRef.current.visible = false;
            return;
        }

    }, [currentCoords, initialCoords]);

    /* -------------- HIT-TEST -------------- */

    const [sceneObjects, setSceneObjects] = useState<JSX.Element[]>([]);
    const [hitTestMatrix, setHitTestMatrix] = useState<HitTestResults>({
        left: undefined,
        right: undefined,
        none: undefined,
    });
    const hitTestMatricesRef = useRef(hitTestMatrix);

    const onHitTestResult = useCallback((
        handedness: XRHandedness,
        results: XRHitTestResult[],
        getWorldMatrix: (target: Matrix4, hit: XRHitTestResult) => void
    ) => {
        if (results.length === 0) return;

        const matrix = hitTestMatricesRef.current[handedness] ?? new Matrix4();
        getWorldMatrix(matrix, results[0]);
        hitTestMatricesRef.current = { ...hitTestMatricesRef.current, [handedness]: matrix };
        setHitTestMatrix(hitTestMatricesRef.current);
    }, []);

    useXRHitTest(onHitTestResult.bind(null, "none"), "viewer");

    const placeObject = () => {
        const matrix = hitTestMatricesRef.current["none"];
        if (!matrix) return;

        const bucketName = "test";
        const modelKey = "bench.glb";
        const position = new Position().setFromMatrixPosition(matrix);
        const rotation = new Rotation().setFromRotationMatrix(matrix);
        const scale = new Scale(1, 1, 1);

        setSceneObjects((prevObjects) => [
            ...prevObjects,
            <MeshObject
                key={prevObjects.length}
                bucketName={bucketName} modelKey={modelKey}
                position={position} rotation={rotation} scale={scale} />,
        ]);
    }

    useXRInputSourceEvent("all", "selectstart", placeObject, []);
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
            <Compass heading={compassHeading}/>
        </XRDomOverlay>
        <ambientLight intensity={5} />
        <directionalLight intensity={10} />
        <mesh ref={boxRef} visible={false}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="orange" />
        </mesh>
        <Reticle hitTestMatrix={hitTestMatrix["none"]} />
        {sceneObjects}
    </>);
};

export default IndexPage;
