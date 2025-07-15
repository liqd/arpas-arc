import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { normalizeAngleDifference } from "../../utility/angle";
import { getMedian, getWeightedAverage, removeOutliers } from "../../utility/filtering";
import { getCameraYawWorldY } from "../../utility/camera";

export default function useWorldRotationReference(
    compassHeading: number | null,
    smoothedHeading: number | null,
    phoneTilt: { beta: number | null, gamma: number | null } | null,
    camera: THREE.Camera,
): [number | null, number | null] {

    const MAX_HISTORY_LENGTH = 12;
    const TIME_THRESHOLD = 3000;
    const MIN_TILT_ANGLE = 25;
    const MAX_TILT_ANGLE = 45;

    const [rotationHistory, setRotationHistory] = useState<number[]>([]);
    const [currentRotation, setCurrentRotation] = useState<number | null>(null);
    const [referenceHistory, setReferenceHistory] = useState<number[]>([]);
    const [rotationReference, setRotationReference] = useState<number | null>(null);

    const lastCalculationTimeRef = useRef(0);
    const lastUpdateTimeRef = useRef(0);
    const lastDataUpdateTimeRef = useRef(0);

    useEffect(() => {
        if (!smoothedHeading || !phoneTilt) {
            console.warn("Invalid smoothed compass heading or phone tilt data.");
            return;
        }

        if ( // Skip update if phone tilt is extreme
            phoneTilt.beta == null || phoneTilt.beta < MIN_TILT_ANGLE || phoneTilt.beta > MAX_TILT_ANGLE) {
            // console.warn("Skipping update due to extreme tilt");
            return;
        }

        /**
         * Calculates the world rotation in radians based on compass heading and camera yaw.
         * @param compassHeading The current compass heading in degrees.
         * @param camera The THREE.Camera instance.
         * @returns The world rotation in radians.
        */
        function getWorldRotationFromCompassAndCamera(compassHeading: number, camera: THREE.Camera): number {
            const cameraYawDeg = getCameraYawWorldY(camera);
            return THREE.MathUtils.degToRad((540 - compassHeading + cameraYawDeg) % 360);
        }

        const newRotation = getWorldRotationFromCompassAndCamera(smoothedHeading, camera);
        if (!newRotation) return;
        setCurrentRotation(newRotation);

        const currentTime = Date.now();
        // if (!referenceRotation) {
        //     setReferenceRotation(currentRotation);
        //     setLastCalculationTime(currentTime);
        // }

        if (currentTime - lastDataUpdateTimeRef.current > 250) { // Reduce data update frequency
            // Update rotation history, keeping the most recent entries
            const updatedHistory = [...rotationHistory, newRotation].slice(-MAX_HISTORY_LENGTH);
            setRotationHistory(updatedHistory);
            lastDataUpdateTimeRef.current = currentTime;
        }

        if (currentTime - lastCalculationTimeRef.current < 1500) return; // Reduce calculation frequency
        lastCalculationTimeRef.current = currentTime;

        const filteredHeadings = removeOutliers(rotationHistory);
        const averagedHeading = getWeightedAverage(filteredHeadings);

        // Adaptive Drift Detection
        const angleDifference = rotationReference ? Math.abs(normalizeAngleDifference(rotationReference, averagedHeading)) : 0;
        const dynamicThreshold = Math.max(2, angleDifference / 3);

        const updateTimeDelta = currentTime - lastUpdateTimeRef.current;
        if (!rotationReference || angleDifference > dynamicThreshold || updateTimeDelta > TIME_THRESHOLD * 5) {
            if (updateTimeDelta > TIME_THRESHOLD) {
                console.log(`Significant rotation drift detected. Updating reference history heading.`);
                const updatedHistory = [...referenceHistory, averagedHeading].slice(-5);
                setReferenceHistory(updatedHistory);
                const tempRotationReference = rotationReference;
                const newRotationReference = getMedian(updatedHistory.length > 3 ? updatedHistory : [newRotation])
                setRotationReference(newRotationReference);

                if (newRotationReference && tempRotationReference != newRotationReference) {
                    console.log(`Updated rotation reference: ${THREE.MathUtils.radToDeg(newRotationReference).toFixed(2)}°`);
                }

                lastUpdateTimeRef.current = currentTime;
            }
        }

    }, [smoothedHeading, phoneTilt]);

    return [currentRotation, rotationReference];
}
