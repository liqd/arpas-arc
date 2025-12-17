import * as THREE from "three";
import { Position } from "../types/transform";

export function lerpValue(start: number, end: number, duration: number, onUpdate: (value: number) => void) {
    const startTime = performance.now();

    function update() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const interpolatedValue = start + (end - start) * t;
        onUpdate(interpolatedValue);

        if (t < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Interpolates between two angles (radians) along the shortest arc and invokes
 * onUpdate with intermediate values. Handles wrap-around correctly.
 * @param start Angle in radians
 * @param end Angle in radians
 * @param duration Duration in milliseconds
 * @param onUpdate Callback invoked with interpolated angle (radians)
 */
export function lerpAngle(start: number, end: number, duration: number, onUpdate: (value: number) => void) {
    const startTime = performance.now();

    // compute shortest delta in radians in range [-PI, PI]
    const twoPi = Math.PI * 2;
    const rawDelta = end - start;
    let delta = ((rawDelta + Math.PI) % twoPi + twoPi) % twoPi - Math.PI;

    function update() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const interpolated = start + delta * t;
        // normalize to [0, 2PI)
        const normalized = (interpolated % twoPi + twoPi) % twoPi;
        onUpdate(normalized);

        if (t < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

export function lerpVector(start: THREE.Vector3, end: THREE.Vector3, duration: number, onUpdate: (value: THREE.Vector3) => void) {
    const startTime = performance.now();

    function update() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const interpolatedVector = new THREE.Vector3(
            start.x + (end.x - start.x) * t,
            start.y + (end.y - start.y) * t,
            start.z + (end.z - start.z) * t);

        onUpdate(interpolatedVector);

        if (t < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
export function lerpPosition(start: Position, end: Position, duration: number, onUpdate: (value: Position) => void
) {
    lerpVector(start, end, duration, (vector) => {
        onUpdate(new Position(...vector));
    });
}

