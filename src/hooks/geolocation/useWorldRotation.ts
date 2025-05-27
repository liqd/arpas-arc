import { useState, useEffect } from "react";
import * as THREE from "three";
import { lerpValue } from "../../utility/interpolation";
import useCompassHeading from "./useCompassHeading";
import useCompassReference from "./useCompassReference";

/**
 * React hook for smoothly updating the world's Y-axis rotation based on compass heading and device orientation.
 * Ensures seamless transitions while maintaining accurate scene alignment with the real-world heading.
 *
 * @param {Object | null} referenceCompassHeading - Contains compass heading and device yaw (rotation).
 * @param {THREE.Camera} camera - The Three.js camera used for orientation calculations.
 * @param {number} interpolationThreshold - Angle threshold (in radians) for instant snapping instead of interpolation (default: π/2 radians, 90°).
 * @param {number} interpolationTimeInSec - Duration (seconds) for gradual rotation transition (default: 1s).
 * @returns {[number]} - The world rotation angle in radians.
 *
 * ## Functionality:
 * - **Accurate Rotation Tracking:** Computes phone-relative rotation using quaternion transformations.
 * - **Smooth Interpolation:** Uses `lerpValue` for gradual rotation changes within the threshold.
 * - **Immediate Snapping:** If rotation exceeds the threshold (default: π/2 radians), it updates instantly.
 * - **North-Oriented Default:** Initializes world rotation facing **North** (π radians).
 *
 * ## Example Usage:
 * ```tsx   
 * const worldRotationY = useWorldRotation(referenceCompassHeading, camera, Math.PI / 4, 2);
 * console.log(`World Rotation: ${worldRotationY.toFixed(3)} radians`);
 * ```
 */
export default function useWorldRotation(camera: THREE.Camera,
    interpolationTreshhold: number = Math.PI / 2, intrepolationTimeInSec: number = 1
): [number] {
    const [referenceCompassHeading] = useCompassReference(camera);
    
    const [worldRotationEulerY, setWorldRotationEulerY] = useState<number>(Math.PI); // Start facing north (180° (π radians))

    useEffect(() => {
        if (!referenceCompassHeading) return;

        let currentWorldRotationEulerY = 0;

        const cameraUp = new THREE.Vector3().copy(camera.up).applyQuaternion(camera.quaternion);
        const phoneAngleRad = Math.atan2(cameraUp.x, cameraUp.z);
        const phoneAngleDeg = (THREE.MathUtils.radToDeg(phoneAngleRad) + 360) % 360;

        currentWorldRotationEulerY = THREE.MathUtils.degToRad((referenceCompassHeading.heading + phoneAngleDeg + 540) % 360);

        // Snap if difference exceeds threshold
        if (Math.abs(currentWorldRotationEulerY - worldRotationEulerY) > interpolationTreshhold) {
            setWorldRotationEulerY(currentWorldRotationEulerY);
        } else {
            lerpValue(worldRotationEulerY, currentWorldRotationEulerY, intrepolationTimeInSec * 1000, (value) => {
                setWorldRotationEulerY(value);
            });
        }
    }, [referenceCompassHeading]);

    return [worldRotationEulerY];
};
