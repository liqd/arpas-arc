import { useEffect, useState } from "react";
import { gpsToPosition } from "../../utility/geolocation";
import { Position } from "../../types/transform";
import { nullCoordinates } from "../../components/locationObjects/geolocation";
import { getMedian, getWeightedAverage, removeOutliers } from "../../utility/filtering";

/**
 * A React hook that processes real-time geolocation data to determine a stable reference location.
 *
 * This hook applies **advanced filtering** (moving averages, outlier detection) and **adaptive thresholding**
 * to ensure smooth and **accurate position tracking**, while avoiding sudden, unnecessary reference updates.
 *
 * @param {GeolocationCoordinates[]} coordinatesHistory - Array of recent GPS coordinates.
 * @param {Function} [updateCurrentLocation] - Callback to update the latest filtered coordinates.
 * @param {Function} [updateReferenceLocation] - Callback to update the stable reference location.
 * @returns {[GeolocationCoordinates | null, { coordinates: GeolocationCoordinates; position: Position } | null]} - The latest filtered coordinates and the computed reference location.
 *
 * ## Features:
 * - **Data Smoothing:** Uses Weighted Moving Average (WMA) for latitude/longitude & Exponential Moving Average (EMA) for altitude.
 * - **Outlier Detection:** Applies **Interquartile Range (IQR) filtering** to remove extreme values.
 * - **Adaptive Drift Detection:** Dynamically adjusts thresholds based on **GPS accuracy and movement speed**.
 * - **Debounced Processing:** Updates **at most once per second** to optimize performance.
 * - **Smart Reference Updates:** Prevents unnecessary updates when movement stabilizes, avoiding sudden position shifts.
 *
 * ## Example Usage:
 * ```tsx
 * const [currentCoordinates, referenceLocation] = useLocationReference(
 *     gpsHistory, 
 *     setCurrentCoords, 
 *     setReferenceLocation
 * );
 * console.log(`Current Coordinates:`, currentCoordinates);
 * console.log(`Reference Location:`, referenceLocation);
 * ```
 */
export default function useWorldPositionReference(
    coordinatesHistory: GeolocationCoordinates[], maxHistoryLength: number,
    updateCurrentLocation?: (currentLocation: { coordinates: GeolocationCoordinates; position: Position }) => void,
    updateReferenceLocation?: (referenceLocation: { coordinates: GeolocationCoordinates; position: Position }) => void
): [{ coordinates: GeolocationCoordinates; position: Position } | null, { coordinates: GeolocationCoordinates; position: Position } | null] {

    const [blockLocationUpdateTime, setBlockLocationUpdateTime] = useState<number>(Date.now());
    const [currentLocation, setCurrentLocation] = useState<{ coordinates: GeolocationCoordinates; position: Position } | null>(null);
    const [locationReference, setLocationReference] = useState<{ coordinates: GeolocationCoordinates; position: Position } | null>(null);
    const [referenceHistory, setReferenceHistory] = useState<{ coordinates: GeolocationCoordinates; position: Position }[]>([]);
    const [prevCoordinates, setPrevCoordinates] = useState<GeolocationCoordinates | null>(null);
    const [lastCalculationTime, setLastCalculationTime] = useState<number>(0);

    useEffect(() => {
        if (!coordinatesHistory || coordinatesHistory.length === 0) {
            console.warn("No coordinate history available.");
            return;
        }

        const currentTime = Date.now();

        if (currentTime - lastCalculationTime < 1000) return; // Reduce calculation frequency
        setLastCalculationTime(currentTime);

        const filteredLatitudes = removeOutliers(coordinatesHistory.map(loc => loc.latitude));
        const filteredLongitudes = removeOutliers(coordinatesHistory.map(loc => loc.longitude));
        // const filteredAltitudes = removeOutliers(coordinatesHistory.map(loc => loc.altitude ?? 0));

        const avgAccuracy = coordinatesHistory.reduce((sum, loc) => sum + loc.accuracy, 0) / coordinatesHistory.length;
        const avgAltitudeAccuracy = coordinatesHistory.reduce((sum, loc) => sum + (loc.altitudeAccuracy ?? avgAccuracy), 0) / coordinatesHistory.length;

        const lastCoords = coordinatesHistory[coordinatesHistory.length - 1];

        const coordinates =
            coordinatesHistory.length < maxHistoryLength / 3
                ? lastCoords // Use latest value if history is not full
                : {
                    latitude: getWeightedAverage(filteredLatitudes),
                    longitude: getWeightedAverage(filteredLongitudes),
                    altitude: 0, //getExponentialMovingAverage(filteredAltitudes),
                    heading: lastCoords.heading ?? 0,
                    accuracy: avgAccuracy,
                    altitudeAccuracy: avgAltitudeAccuracy,
                    speed: lastCoords.speed ?? 0,
                    toJSON: lastCoords.toJSON
                };

        // Skip unnecessary processing if minimal movement detected
        if (prevCoordinates &&
            Math.abs(prevCoordinates.latitude - coordinates.latitude) < 0.00001 &&
            Math.abs(prevCoordinates.longitude - coordinates.longitude) < 0.00001 &&
            Math.abs((prevCoordinates.altitude ?? 0) - (coordinates.altitude ?? 0)) < 0.1) {
            // console.log("Minimal movement detected; skipping unnecessary calculations.");
            return;
        }
        setPrevCoordinates(coordinates);

        const position = gpsToPosition(nullCoordinates, coordinates);

        position.y = 0; // set altitute: 0
        setCurrentLocation({ coordinates, position });
        if (updateCurrentLocation) updateCurrentLocation({ coordinates, position });

        if (coordinatesHistory.length < maxHistoryLength) return; // Don't update reference location if there is not enough data

        // Adaptive Thresholds: Dynamically adjusts based on accuracy and movement speed
        const velocityFactor = Math.max(1, coordinates.speed ?? 1);
        const dynamicThreshold = Math.max(3, avgAccuracy / 2, velocityFactor * 3);
        // const dynamicAltitudeThreshold = Math.max(3, avgAltitudeAccuracy, velocityFactor * 1.5);

        // If reference location is not yet set, update instantly
        if (!locationReference) {
            setLocationReference({ coordinates, position });
            if (updateReferenceLocation) updateReferenceLocation({ coordinates, position });
        } else { // Otherwise, wait for significant changes before updating
            const distanceVector = locationReference.position.substractedPosition(position);

            const positionDriftDetected = Math.sqrt(distanceVector.x ** 2 + distanceVector.z ** 2) > dynamicThreshold;
            // const altitudeDriftDetected = Math.abs(distanceVector.y) > dynamicAltitudeThreshold;

            const currentTime = Date.now();
            if (positionDriftDetected) { // || altitudeDriftDetected) {
                const timeThreshold = 10000;
                console.log(`Large geolocation drift detected! Waiting ${timeThreshold / 1000} seconds for updating reference location...`);

                const updatedHistory = [...referenceHistory, { coordinates, position }].slice(-7)
                    .sort((a, b) => {
                        const distA = Math.sqrt(a.position.x ** 2 + a.position.z ** 2);
                        const distB = Math.sqrt(b.position.x ** 2 + b.position.z ** 2);
                        return distA - distB;
                    });
                if (updatedHistory.length < 3 || currentTime - blockLocationUpdateTime > timeThreshold) {
                    console.log("Updating reference coordinates due to sustained drift:", coordinates);
                    // const tempLocationReference = locationReference;
                    const newLocationReference = updatedHistory[Math.floor(updatedHistory.length / 2)];
                    setReferenceHistory(updatedHistory);
                    
                    setLocationReference(newLocationReference);
                    if (updateReferenceLocation) updateReferenceLocation(newLocationReference);
                    setBlockLocationUpdateTime(currentTime);
                }
            } else {
                console.log("Drift has stabilized; stopping reference updates.");
                setBlockLocationUpdateTime(currentTime);
            }
        }
    }, [coordinatesHistory]);

    return [currentLocation, locationReference];
}
