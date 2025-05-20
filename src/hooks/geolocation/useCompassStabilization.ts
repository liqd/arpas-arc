import { useRef } from "react";
import * as THREE from "three";
import { normalizeAngleDifference } from "../../utility/angle";

export default function useCompassStabilization(
    phoneTilt: any, compassHeading: number, camera: THREE.Camera,
    updateReferenceCompassHeading: (referenceCompassHeading: { heading: number, phoneYaw: number }) => void) {
    const updateCompassHeadingHistory = useRef<number[]>([])
    const blockLocationUpdateTimeRef = useRef<number>(0);
    const blockCompassUpdateTimeRef = useRef<number>(0);

    if (!phoneTilt) return;

    const MAX_TILT_ANGLE = 30; // Threshold to prevent extreme angles from affecting heading updates
    const currentTime = Date.now();

    if (phoneTilt.beta == null || Math.abs(phoneTilt.beta) > MAX_TILT_ANGLE ||
        phoneTilt.gamma == null || Math.abs(phoneTilt.gamma) > MAX_TILT_ANGLE) {
        blockCompassUpdateTimeRef.current = currentTime;
        return; // Skip heading update when device is tilted too much
    }

    const HISTORY_SIZE = 10; // Number of past values to store
    const MAX_VARIATION = 5; // Maximum allowed deviation in heading
    const timeThreshold = 2000; // Milliseconds before updating

    updateCompassHeadingHistory.current = [...updateCompassHeadingHistory.current, compassHeading].slice(-HISTORY_SIZE);

    if (currentTime - blockCompassUpdateTimeRef.current > timeThreshold &&
        updateCompassHeadingHistory.current.length >= HISTORY_SIZE) {
        const isStable = updateCompassHeadingHistory.current.every((heading, index, array) => {
            return index === 0 || normalizeAngleDifference(array[index - 1], heading) <= MAX_VARIATION;
        });

        if (isStable) {
            const CameraRotationRad = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
            const cameraYaw = THREE.MathUtils.radToDeg(CameraRotationRad.y);
            updateReferenceCompassHeading({ heading: compassHeading, phoneYaw: cameraYaw });

            // Reset history after updating
            updateCompassHeadingHistory.current = [];

            blockCompassUpdateTimeRef.current = currentTime + 3000;
            blockLocationUpdateTimeRef.current = currentTime;
        }
    }
}
