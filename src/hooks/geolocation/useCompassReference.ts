import { useEffect, useState } from "react";
import * as THREE from "three";
import { normalizeAngleDifference } from "../../utility/angle";

function getPhoneYaw(camera: THREE.Camera): number {
    const CameraRotationRad = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    return THREE.MathUtils.radToDeg(CameraRotationRad.y);
}

/**
 * A React hook that stabilizes and tracks compass heading data, ensuring **consistent orientation**
 * while avoiding erratic updates due to device tilt or sudden heading fluctuations.
 *
 * @returns [{ heading: number, phoneYaw: number } | null] - The computed stable compass reference.
 */
export default function useCompassReference(
    compassHeading: number,
    phoneTilt: { beta: number | null, gamma: number | null } | null,
    camera: THREE.Camera,
    updateReferenceCompassHeading?: (referenceCompassHeading: { heading: number, phoneYaw: number }) => void
): [{ heading: number, phoneYaw: number } | null] {

    const MAX_HISTORY_LENGTH = 20;
    const MAX_TILT_ANGLE = 30;
    const TIME_THRESHOLD = 5000;

    const [headingHistory, setHeadingHistory] = useState<number[]>([]);
    const [referenceHeading, setReferenceHeading] = useState<{ heading: number, phoneYaw: number } | null>(null);
    const [lastDataUpdateTime, setLastDataUpdateTime] = useState<number>(0);
    const [lastCalculationTime, setLastCalculationTime] = useState<number>(0);
    const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now() - TIME_THRESHOLD + 1000); // Initialize to allow updates after short time and gatther some data before first update

    useEffect(() => {
        if (!compassHeading || !phoneTilt) {
            console.warn("Invalid compass heading or phone tilt data.");
            return;
        }

        const currentTime = Date.now();
        const phoneYaw = getPhoneYaw(camera);

        if (!referenceHeading) {
            const newReference = { heading: compassHeading, phoneYaw };
            setReferenceHeading(newReference);
            if (updateReferenceCompassHeading) updateReferenceCompassHeading(newReference);
        }

        if ( // Skip update if phone tilt is extreme
            phoneTilt.beta == null || Math.abs(phoneTilt.beta) > MAX_TILT_ANGLE ||
            phoneTilt.gamma == null || Math.abs(phoneTilt.gamma) > MAX_TILT_ANGLE
        ) {
            // console.warn("Skipping update due to extreme tilt");
            return;
        }

        if (currentTime - lastDataUpdateTime < 200) { // Reduce data update frequency
            const updatedHistory = [...headingHistory, compassHeading].slice(-MAX_HISTORY_LENGTH);
            setHeadingHistory(updatedHistory);
            setLastDataUpdateTime(currentTime);
        }

        if (currentTime - lastCalculationTime < 1000) return; // Reduce calculation frequency
        setLastCalculationTime(currentTime);

        // Outlier Detection using Interquartile Range (IQR)
        const removeOutliers = (values: number[]) => {
            if (values.length < 4) return values;
            const sorted = [...values].sort((a, b) => a - b);
            const q1 = sorted[Math.floor(sorted.length * 0.25)];
            const q3 = sorted[Math.floor(sorted.length * 0.75)];
            const iqr = q3 - q1;
            return values.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
        };

        const filteredHeadings = removeOutliers(headingHistory);

        // Weighted Moving Average for compass heading
        const getWeightedAverage = (values: number[]) => {
            const weights = values.map((_, i) => i + 1);
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
        };

        const averagedHeading = getWeightedAverage(filteredHeadings);

        // Adaptive Drift Detection
        const angleDifference = referenceHeading ? Math.abs(normalizeAngleDifference(referenceHeading.heading, averagedHeading)) : 0;
        const dynamicThreshold = Math.max(2, angleDifference / 3);

        if (!referenceHeading || angleDifference > dynamicThreshold) {
            if (currentTime - lastUpdateTime > TIME_THRESHOLD) {
                console.log(`Significant rotation drift detected. Updating reference heading.`);
                const newReference = { heading: averagedHeading, phoneYaw };
                setReferenceHeading(newReference);
                if (updateReferenceCompassHeading) updateReferenceCompassHeading(newReference);
                setLastUpdateTime(currentTime);
            }
        }
    }, [compassHeading, phoneTilt]);

    return [referenceHeading];
}
