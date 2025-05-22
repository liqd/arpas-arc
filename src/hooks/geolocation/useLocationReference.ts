import { useEffect, useState } from "react";
import { Position } from "../../types/transform";
import { gpsToMeters } from "../../utility/geolocation";

/**
 * A React hook that calculates and updates the **reference geolocation** based on a history of coordinates.
 * It determines a stable reference point while smoothing out positional drift caused by GPS inaccuracies.
 *
 * @param {GeolocationCoordinates[]} coordinatesHistory - Array of recorded GPS coordinates.
 * @param {(coordinates: GeolocationCoordinates) => void} [updateCurrentCoordinates] - Optional callback to update current coordinates externally.
 * @param {(referenceLocation: { coordinates: GeolocationCoordinates; position: Position }) => void} [updateReferenceLocation] - Optional callback to update reference location externally.
 * @returns {[GeolocationCoordinates | null, { coordinates: GeolocationCoordinates; position: Position } | null]} - The computed current coordinates and reference location.
 *
 * ## Features:
 * - **Computes a stable geolocation reference** using median filtering on past coordinates.
 * - **Improves positional accuracy** by averaging measurement errors.
 * - **Prevents abrupt location updates** using a **distance threshold** (default: 5 meters).
 * - **Implements drift detection**, updating reference position if movement remains outside the threshold for a sustained period.
 *
 * ## Behavior:
 * - If `coordinatesHistory` is empty, it logs a warning and does nothing.
 * - Determines the **median latitude and longitude** for stability.
 * - Initializes a reference position when none exists.
 * - If **drift exceeds 5 meters**, it waits **5 seconds** before updating the reference location.
 *
 * ## Example Usage:
 * ```tsx
 * const [currentCoordinates, referenceLocation] = useLocationReference(coordinatesHistory, updateCurrentCoordinates, updateReferenceLocation);
 * console.log(`Reference Location:`, referenceLocation?.coordinates);
 * ```
 */
export default function useLocationReference (
    coordinatesHistory: GeolocationCoordinates[],
    updateCurrentCoordinates?: (coordinates: GeolocationCoordinates) => void,
    updateReferenceLocation?: (referenceLocation: { coordinates: GeolocationCoordinates; position: Position }) => void
) : [GeolocationCoordinates | null, { coordinates: GeolocationCoordinates; position: Position } | null] {
    
    const [blockLocationUpdateTime, setBlockLocationUpdateTime] = useState<number>(Date.now());
    const [currentCoordinates, setCurrentCoordinates] = useState<GeolocationCoordinates | null>(null);
    const [referenceLocation, setReferenceLocation] = useState<{ coordinates: GeolocationCoordinates; position: Position } | null>(null);

    useEffect(() => {
        if (!coordinatesHistory || coordinatesHistory.length === 0) {
            console.warn("No coordinate history available.");
            return;
        }

        const lastCoords = coordinatesHistory[coordinatesHistory.length - 1];

        const getMedian = (values: number[]) => {
            if (values.length === 0) return 0;
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
        };

        const medianLatitude = getMedian(coordinatesHistory.map(loc => loc.latitude));
        const medianLongitude = getMedian(coordinatesHistory.map(loc => loc.longitude));
        const avgAccuracy = coordinatesHistory.reduce((sum, loc) => sum + loc.accuracy, 0) / coordinatesHistory.length;

        const coordinates: GeolocationCoordinates = {
            latitude: medianLatitude,
            longitude: medianLongitude,
            altitude: 0,
            heading: 0,
            accuracy: avgAccuracy,
            altitudeAccuracy: lastCoords.altitudeAccuracy,
            speed: lastCoords.speed,
            toJSON: lastCoords.toJSON
        };

        setCurrentCoordinates(coordinates);
        if (updateCurrentCoordinates) updateCurrentCoordinates(coordinates);

        if (!referenceLocation) {
            const position = new Position();
            setReferenceLocation({ coordinates, position });
            if (updateReferenceLocation) updateReferenceLocation({ coordinates, position });
        } else {
            const distanceThreshold = 5;
            const timeThreshold = 5000;

            const distance = gpsToMeters(referenceLocation.coordinates, coordinates);
            const positionDriftDetected = Math.sqrt(distance.x ** 2 + distance.z ** 2) > distanceThreshold;

            if (positionDriftDetected) {
                console.log("Large geolocation drift detected! Waiting...");

                const currentTime = Date.now();
                if (currentTime - blockLocationUpdateTime > timeThreshold) {
                    console.log("Updating reference coordinates due to sustained drift:", coordinates);

                    const position = new Position(distance.x, 0, distance.z);
                    setReferenceLocation({coordinates, position});
                    if (updateReferenceLocation) updateReferenceLocation({ coordinates, position });

                    setBlockLocationUpdateTime(currentTime);
                }
            }
        }
    }, [coordinatesHistory]);

    return [currentCoordinates, referenceLocation];
}