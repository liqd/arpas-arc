import { useEffect, useState } from "react";
import { Position } from "../../types/transform";
import { lerpPosition } from "../../utility/interpolation";

/**
 * React hook for smoothly updating world position based on a reference location.
 * Ensures natural movement and prevents abrupt jumps by applying interpolation.
 *
 * @param {Object | null} referenceLocation - GPS coordinates and position data.
 * @param {number} interpolationThreshold - Distance threshold (in meters) for instant snapping (default: 15m).
 * @param {number} interpolationTimeInSec - Duration (seconds) for smooth interpolation (default: 1s).
 * @returns {[Position, React.Dispatch<React.SetStateAction<Position>>]} - Current world position and setter function.
 *
 * ## Functionality:
 * - **Instant Snapping:** If the movement exceeds the threshold (default: 15m), the position updates immediately.
 * - **Smooth Transition:** Applies linear interpolation (`lerpPosition`) for gradual movement within the threshold.
 * - **Automatic React Updates:** Utilizes `useState` and `useEffect` for real-time position tracking.
 *
 * ## Example Usage:
 * ```tsx
 * const [worldPosition] = useWorldPosition(referenceLocation, 10, 2);
 * console.log(`Current Position:`, worldPosition.toArray());
 * ```
 */
export default function useWorldPosition(
    referenceLocation: { coordinates: GeolocationCoordinates; position: Position } | null, 
    interpolationTreshhold: number = 15, intrepolationTimeInSec: number = 1
): [Position] {

    const [worldPosition, setWorldPosition] = useState<Position>(new Position());

    useEffect(() => {
        if (!referenceLocation?.position) return;

        // Snap if difference exceeds threshold
        if (referenceLocation.position.distanceTo(worldPosition) > interpolationTreshhold) {
            setWorldPosition(referenceLocation.position);
        } else {
            lerpPosition(worldPosition, referenceLocation.position, intrepolationTimeInSec * 1000, (value) => {
                setWorldPosition(value);
            });
        }

    }, [referenceLocation]);

    return [worldPosition];
}
