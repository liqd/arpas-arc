import { useState, useEffect } from "react";
import * as THREE from "three";
import { lerpAngle } from "../../utility/interpolation";
import { useCombinedCompass } from "./useCombinedCompass";
import useMessageStore from "../../store/messagesStore";

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
export default function useWorldRotation(
    camera: THREE.Camera,
    interpolationTreshhold: number = Math.PI / 2, intrepolationTimeInSec: number = 1
): [number] {

    const {
        compassHeading,
        smoothedHeading,
        compassCardinal,
        phoneTilt,
        currentRotation,
        rotationReference } = useCombinedCompass(camera);

    const [worldRotation, setWorldRotation] = useState<number | null>(null);
    const { addScreenMessage } = useMessageStore();

    useEffect(() => {
        if (!rotationReference) return;
        
        if (!worldRotation) {
            addScreenMessage(`Compass initialized.`, "compass_initialized", 3000, "green");

            setWorldRotation(rotationReference);
            return;
        }
        
        // compute shortest signed delta in radians (range [-PI, PI])
        const rawDelta = rotationReference - worldRotation;
        const twoPi = Math.PI * 2;
        const delta = ((rawDelta + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;

        // Snap if difference exceeds threshold (use shortest arc magnitude)
        if (Math.abs(delta) > interpolationTreshhold) {
            addScreenMessage(`The compass seems very unstable.`, "compass_very_unstable", 3000, "red");
            setWorldRotation(rotationReference);

        } else {
            if (Math.abs(delta) > 2) {
                addScreenMessage(`The compass seems a litte unstable.`, "compass_little_unstable", 3000, "orange");
            }
            lerpAngle(worldRotation, rotationReference, intrepolationTimeInSec * 1000, (value) => {
                setWorldRotation(value);
            });
        }
    }, [rotationReference]);

    return [worldRotation ?? 0];
};
