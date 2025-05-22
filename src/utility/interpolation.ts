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

