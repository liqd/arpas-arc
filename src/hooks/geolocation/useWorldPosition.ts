import { useEffect, useState } from "react";
import { Position } from "../../types/transform";
import { lerpPosition } from "../../utility/interpolation";
import useGeolocation from "./useGeolocation";
import useLocationReference from "./useLocationReference";
import useGeolocationHistory from "./useGeolocationHistory";

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
    interpolationTreshhold: number = 15, intrepolationTimeInSec: number = 1
): [Position] {

    const MAX_LOCATION_HISTORY_LENGTH = 10;
    const [currentLocation, referenceLocation] = useLocationReference(MAX_LOCATION_HISTORY_LENGTH);

    const [worldPosition, setWorldPosition] = useState<Position>(new Position());

    useEffect(() => {
        const usedLocation = (referenceLocation ?? currentLocation);
        if (!usedLocation?.position) return;

        // Snap if difference exceeds threshold
        if (usedLocation.position.distanceTo(worldPosition) > interpolationTreshhold) {
            setWorldPosition(usedLocation.position);
        } else {
            lerpPosition(worldPosition, usedLocation.position, intrepolationTimeInSec * 1000, (value) => {
                setWorldPosition(value);
            });
        }

    }, [currentLocation, referenceLocation]);

    return [worldPosition];
}
