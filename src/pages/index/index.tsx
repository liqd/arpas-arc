import React, { useState, useCallback, useRef, JSX, useEffect } from "react";
import { useXRHitTest, useXRInputSourceEvent, useXRStore, XRDomOverlay } from "@react-three/xr";
import * as THREE from "three";
import { Matrix4 } from "three";
import { offsetGpsByMeters, gpsToMeters } from "../../utility/geolocation";
import { Reticle, SceneObject } from "../../components";
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

        const targetCoords = offsetGpsByMeters(currentCoords, new THREE.Vector2(0, 1.5)); // 1.5m north
        const { x, z } = gpsToMeters(initialCoords, targetCoords);

        boxRef.current.position.set(x, boxRef.current.position.y, z);
        boxRef.current.visible = true;
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

        const position = new THREE.Vector3().setFromMatrixPosition(matrix);
        const rotation = new THREE.Euler().setFromRotationMatrix(matrix);
        const scale = new THREE.Vector3(0.06, 0.06, 0.06);

        setSceneObjects((prevObjects) => [
            ...prevObjects,
            <SceneObject key={prevObjects.length} position={position} rotation={rotation} scale={scale} />,
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
            <Compass />
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
