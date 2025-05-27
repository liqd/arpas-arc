import { useEffect, useState } from "react";
import * as THREE from "three";
import { normalizeAngleDifference } from "../../utility/angle";
import useCompassHeading from "./useCompassHeading";

/**
 * A React hook that stabilizes and tracks compass heading data, ensuring **consistent orientation** 
 * while avoiding erratic updates due to device tilt or sudden heading fluctuations.
 *
 * It continuously monitors compass heading, filters unstable changes, and maintains a reference direction.
 *
 * @param {any} phoneTilt - Object containing device tilt angles (`beta` and `gamma`).
 * @param {number} compassHeading - The current compass heading (degrees).
 * @param {THREE.Camera} camera - Three.js camera, used to compute phone yaw angle.
 * @param {(referenceCompassHeading: { heading: number, phoneYaw: number }) => void} [updateReferenceCompassHeading] - Optional callback to receive updated reference heading.
 * @returns [{ heading: number, phoneYaw: number } | null] - The computed stable compass reference.
 *
 * ## Features:
 * - **Filters extreme device tilts** (`beta` and `gamma` > 30°) to prevent unreliable heading updates.
 * - **Stores a history of compass readings** (`HISTORY_SIZE = 10`) for stability analysis.
 * - **Prevents excessive variations** (`MAX_VARIATION = 5°`) by normalizing heading differences.
 * - **Implements time-based drift correction**, updating reference heading **only after 5 seconds of stability**.
 * - **Computes phone yaw rotation** using the Three.js camera quaternion.
 *
 * ## Behavior:
 * - Ignores heading updates if the **device is tilted too much**.
 * - Updates reference heading **only when variations remain stable** for a sustained period.
 * - Calls `updateReferenceCompassHeading` if provided, allowing external components to react to compass updates.
 * - Resets heading history after successfully updating the reference.
 *
 * ## Example Usage:
 * ```tsx
 * const [referenceCompass] = useCompassReference(phoneTilt, compassHeading, camera, updateReferenceCompassHeading);
 * console.log("Reference Compass Heading:", referenceCompass);
 * ```
 */
export default function useCompassReference(camera: THREE.Camera,
    updateReferenceCompassHeading?: (referenceCompassHeading: { heading: number, phoneYaw: number }) => void
): [{ heading: number, phoneYaw: number } | null] {

    const [compassHeading, compassCardinal, phoneTilt] = useCompassHeading();

    const [blockCompassUpdateTime, setBlockCompassUpdateTime] = useState<number>(Date.now());
    const [compassHeadingHistory, setCompassHeadingHistory] = useState<number[]>([]);
    const [referenceCompassHeading, setReferenceCompassHeading] = useState<{ heading: number, phoneYaw: number } | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => { // Avoid excessive computations, by updating at most 3 times per second
            if (!phoneTilt || !compassHeading) return;

            const MAX_TILT_ANGLE = 30; // Threshold to prevent extreme angles from affecting heading updates
            const currentTime = Date.now();

            if (phoneTilt.beta == null || Math.abs(phoneTilt.beta) > MAX_TILT_ANGLE ||
                phoneTilt.gamma == null || Math.abs(phoneTilt.gamma) > MAX_TILT_ANGLE) {
                setBlockCompassUpdateTime(currentTime);
                return; // Skip heading update when device is tilted too much
            }

            const HISTORY_SIZE = 10; // Number of past values to store
            const MAX_VARIATION = 5; // Maximum allowed deviation in heading
            const timeThreshold = 5000; // Milliseconds before updating

            setCompassHeadingHistory([...compassHeadingHistory, compassHeading].slice(-HISTORY_SIZE));

            if (currentTime - blockCompassUpdateTime > timeThreshold
                && compassHeadingHistory.length >= HISTORY_SIZE) {
                const isStable = compassHeadingHistory.every((heading, index, array) => {
                    return index === 0 || normalizeAngleDifference(array[index - 1], heading) <= MAX_VARIATION;
                });

                if (isStable) {
                    const CameraRotationRad = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
                    const cameraYaw = THREE.MathUtils.radToDeg(CameraRotationRad.y);

                    setReferenceCompassHeading({ heading: compassHeading, phoneYaw: cameraYaw });
                    if (updateReferenceCompassHeading) updateReferenceCompassHeading({ heading: compassHeading, phoneYaw: cameraYaw });
                    // Reset history after updating
                    setCompassHeadingHistory([]);

                    setBlockCompassUpdateTime(currentTime);
                }
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [phoneTilt, compassHeading]);

    return [referenceCompassHeading];
}
