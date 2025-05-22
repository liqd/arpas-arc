import { useState, useEffect } from "react";
import * as THREE from "three";
import { lerpValue } from "../../utility/interpolation";

/**
 * A React hook that calculates and smoothly updates the world's Y-axis rotation 
 * based on the device's compass heading and orientation.
 *
 * It ensures smooth transitions while keeping the scene properly aligned with the real-world heading.
 *
 * @param {Object | null} referenceCompassHeading - Object containing heading (compass direction) and phoneYaw (device rotation).
 * @param {THREE.Camera} camera - The Three.js camera whose orientation influences scene alignment.
 * @param {number} interpolationThreshold - The rotation threshold (in radians) for snapping instead of interpolating. Default: 20° (~0.349 radians).
 * @returns {[number]} - The world rotation angle in radians.
 *
 * ## Features:
 * - **Accurate Rotation Tracking:** Computes phone-relative rotation using quaternion transformations.
 * - **Smooth Transitioning:** Uses linear interpolation (`lerpValue`) to avoid abrupt rotational changes.
 * - **Adaptive Snapping:** If the rotation difference exceeds the threshold (default: **0.349 radians**, ~20°), it snaps immediately.
 * - **North-Oriented Default:** Initializes scene facing **North** (`180°` or `π radians`).
 *
 * ## Example Usage:
 * ```tsx   
 * const worldRotationY = useWorldRotation(referenceCompassHeading, camera, 0.349);
 * console.log(`World Rotation: ${worldRotationY} radians`);
 * ```
 */
export default function useWorldRotation(referenceCompassHeading: { heading: number; phoneYaw: number } | null, camera: THREE.Camera, interpolationTreshhold: number = 0.349
): [number] {
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
            lerpValue(worldRotationEulerY, currentWorldRotationEulerY, 500, (value) => {
                setWorldRotationEulerY(value);
            });
        }
    }, [referenceCompassHeading]);

    return [worldRotationEulerY];
};
