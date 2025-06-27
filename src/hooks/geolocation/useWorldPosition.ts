import { useEffect, useState } from "react";
import * as THREE from "three";
import { Position } from "../../types/transform";
import { lerpPosition } from "../../utility/interpolation";
import { useCombinedLocation } from "./useCombinedLocation";
import useMessageStore from "../../store/messagesStore";

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
export default function useWorldPosition(interpolationTreshhold: number = 15, interpolationTimeInSec: number = 1
): [Position] {

    const {
        currentGeolocation,
        locationHistory,
        currentWorldPosition,
        referenceWorldPosition,
    } = useCombinedLocation(35, 10);

    const [worldPosition, setWorldPosition] = useState<Position | null>(null);
    const { addScreenMessage } = useMessageStore();

    useEffect(() => {
        if (!referenceWorldPosition?.position) return;

        if (!worldPosition) {
            setWorldPosition(referenceWorldPosition.position);
            return;
        }

        // Snap if difference exceeds threshold
        if (referenceWorldPosition.position.distanceTo(worldPosition) > interpolationTreshhold) {
            addScreenMessage(`The GPS position seems very unstable.`, "compass_very_unstable", 3000, "red");

            setWorldPosition(referenceWorldPosition.position);
        } else {
            addScreenMessage(`The GPS position seems a litte unstable.`, "compass_little_unstable", 3000, "orange");

            lerpPosition(worldPosition, referenceWorldPosition.position, interpolationTimeInSec * 1000, (value) => {
                setWorldPosition(value);
            });
        }

    }, [referenceWorldPosition]);

    return [worldPosition ?? currentWorldPosition?.position ?? new Position()];
}
