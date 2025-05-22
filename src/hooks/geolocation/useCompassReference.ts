import { useEffect, useState } from "react";
import * as THREE from "three";
import { normalizeAngleDifference } from "../../utility/angle";

export default function useCompassReference(
    phoneTilt: any, compassHeading: number, camera: THREE.Camera,
    updateReferenceCompassHeading?: (referenceCompassHeading: { heading: number, phoneYaw: number }) => void
) : [{ heading: number, phoneYaw: number } | null] {

    const [blockCompassUpdateTime, setBlockCompassUpdateTime] = useState<number>(Date.now());
    const [compassHeadingHistory, setCompassHeadingHistory] = useState<number[]>([]);
    const [referenceCompassHeading, setReferenceCompassHeading] = useState<{ heading: number, phoneYaw: number } | null>(null);

    useEffect(() => {
        if (!phoneTilt) return;

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
    }, [phoneTilt]);

    return [referenceCompassHeading];
}
