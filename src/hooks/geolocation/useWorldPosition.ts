import { useEffect, useState } from "react";
import { Position } from "../../types/transform";
import { lerpPosition } from "../../utility/interpolation";

/**
 * A React hook that smoothly updates the world position based on a reference location,
 * ensuring natural movement while avoiding abrupt jumps.
 *
 * It tracks position changes and applies interpolation to create fluid transitions.
 *
 * @param {Object | null} referenceLocation - Object containing GPS coordinates and position data.
 * @param {number} interpolationThreshold - The distance threshold (in meters) for snapping position instantly. Default: 10m.
 * @returns {[Position, React.Dispatch<React.SetStateAction<Position>>]} - The current world position and setter function.
 *
 * ## Features:
 * - **Instant Snap:** If movement exceeds the interpolation threshold (default: 10m), position updates immediately.
 * - **Smooth Transition:** Uses linear interpolation (`lerpPosition`) for gradual movement below the threshold.
 * - **React Integration:** Automatically updates world position using `useState` and `useEffect`.
 *
 * ## Example Usage:
 * ```tsx
 * const [worldPosition] = useWorldPosition(referenceLocation, 5);
 * console.log(`World Position:`, worldPosition.toArray());
 * ```
 */
export default function useWorldPosition(
    referenceLocation: { coordinates: GeolocationCoordinates; position: Position } | null, interpolationTreshhold: number = 10
): [Position, React.Dispatch<React.SetStateAction<Position>>] {

    const [worldPosition, setWorldPosition] = useState<Position>(new Position());

    useEffect(() => {
        if (!referenceLocation) return;

        // Snap if difference exceeds threshold
        if (referenceLocation.position.distanceTo(worldPosition) > interpolationTreshhold) {
            setWorldPosition(referenceLocation.position);
        } else {
            lerpPosition(worldPosition, referenceLocation.position, 500, (value) => {
                setWorldPosition(value);
            });
        }

    }, [referenceLocation, worldPosition]); // Ensure reactivity

    return [worldPosition, setWorldPosition];
}
