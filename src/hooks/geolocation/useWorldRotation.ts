import { useState, useEffect } from "react";
import * as THREE from "three";
import { lerpValue } from "../../utility/interpolation";

/**
 * This hook calculates and smoothly updates the world rotation around the Y-axis
 * based on the device's compass heading and phone orientation.
 *
 * It returns the current rotation in radians, keeping the scene aligned correctly with North.
 *
 * @param {Object | null} referenceCompassHeading - Object containing heading (compass direction) and phoneYaw (device rotation).
 * @param {THREE.Camera} camera - The Three.js camera whose orientation influences scene alignment.
 * @returns {[number]} - The world rotation angle in radians.
 *
 * Features:
 * - Computes phone's relative rotation using quaternion transformations.
 * - Maintains smooth transitions with linear interpolation (`lerpValue`).
 * - Snaps rotation if the angle difference exceeds 20° (0.349 radians).
 * - Defaults to 180° (π radians), starting the scene facing North.
 *
 * Usage Example:
 * ```tsx
 * const worldRotationY = useWorldRotation(referenceCompassHeading, camera);
 * console.log(`World Rotation: ${worldRotationY} radians`);
 * ```
 */
export default function useWorldRotation(referenceCompassHeading: { heading: number; phoneYaw: number } | null, camera: THREE.Camera
): [number] {
    const [worldRotationEulerY, setWorldRotationEulerY] = useState<number>(Math.PI); // Start facing north (180° (π radians))

    useEffect(() => {
        if (!referenceCompassHeading) return;

        let currentWorldRotationEulerY = 0;

        const cameraUp = new THREE.Vector3().copy(camera.up).applyQuaternion(camera.quaternion);
        const phoneAngleRad = Math.atan2(cameraUp.x, cameraUp.z);
        const phoneAngleDeg = (THREE.MathUtils.radToDeg(phoneAngleRad) + 360) % 360;

        currentWorldRotationEulerY = THREE.MathUtils.degToRad((referenceCompassHeading.heading + phoneAngleDeg + 540) % 360);

        // Snap if difference exceeds threshold: 20° = 0.349 radians
        if (Math.abs(currentWorldRotationEulerY - worldRotationEulerY) > 0.349) {
            setWorldRotationEulerY(currentWorldRotationEulerY);
        } else {
            lerpValue(worldRotationEulerY, currentWorldRotationEulerY, 500, (value) => {
                setWorldRotationEulerY(value);
            });
        }
    }, [referenceCompassHeading]);

    return [worldRotationEulerY];
};
