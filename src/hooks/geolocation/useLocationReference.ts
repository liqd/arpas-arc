import { useEffect, useState } from "react";
import { gpsToPosition } from "../../utility/geolocation";
import { Position } from "../../types/transform";
import { nullCoordinates } from "../../components/locationObjects/geolocation";
import useGeolocationHistory from "./useGeolocationHistory";

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
export default function useLocationReference(maxHistoryLength: number,
    updateCurrentLocation?: (currentLocation: { coordinates: GeolocationCoordinates; position: Position }) => void,
    updateReferenceLocation?: (referenceLocation: { coordinates: GeolocationCoordinates; position: Position }) => void
): [{ coordinates: GeolocationCoordinates; position: Position } | null, { coordinates: GeolocationCoordinates; position: Position } | null] {

    const [locationHistory] = useGeolocationHistory(maxHistoryLength);

    const [blockLocationUpdateTime, setBlockLocationUpdateTime] = useState<number>(Date.now());
    const [currentLocation, setCurrentLocation] = useState<{ coordinates: GeolocationCoordinates; position: Position } | null>(null);
    const [referenceLocation, setReferenceLocation] = useState<{ coordinates: GeolocationCoordinates; position: Position } | null>(null);
    const [prevCoordinates, setPrevCoordinates] = useState<GeolocationCoordinates | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => { // Avoid excessive computations, by updating at most once per second
            if (!locationHistory || locationHistory.length === 0) {
                console.warn("No coordinate history available.");
                return;
            }

            const lastCoords = locationHistory[locationHistory.length - 1];

            // Weighted Moving Average for latitude/longitude
            const getWeightedAverage = (values: number[]) => {
                const weights = values.map((_, i) => i + 1); // Increasing weight over time (lower impact of older values)
                const totalWeight = weights.reduce((sum, w) => sum + w, 0);
                return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
            };

            // Exponential Moving Average for altitude (stronger filtering)
            const getExponentialMovingAverage = (values: number[], smoothingFactor = 0.2) => {
                if (values.length === 0) return 0;
                return values.reduce((ema, v) => (smoothingFactor * v) + ((1 - smoothingFactor) * ema), values[0]);
            };

            // Outlier Detection using Interquartile Range (IQR)
            const removeOutliers = (values: number[]) => {
                if (values.length < 4) return values; // Skip filtering for small datasets
                const sorted = [...values].sort((a, b) => a - b);
                const q1 = sorted[Math.floor(sorted.length * 0.25)];
                const q3 = sorted[Math.floor(sorted.length * 0.75)];
                const iqr = q3 - q1;
                return values.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
            };

            const filteredLatitudes = removeOutliers(locationHistory.map(loc => loc.latitude));
            const filteredLongitudes = removeOutliers(locationHistory.map(loc => loc.longitude));
            // const filteredAltitudes = removeOutliers(coordinatesHistory.map(loc => loc.altitude ?? 0));

            const avgAccuracy = locationHistory.reduce((sum, loc) => sum + loc.accuracy, 0) / locationHistory.length;
            const avgAltitudeAccuracy = locationHistory.reduce((sum, loc) => sum + (loc.altitudeAccuracy ?? avgAccuracy), 0) / locationHistory.length;

            const coordinates =
            locationHistory.length < maxHistoryLength / 3
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
                console.log("Minimal movement detected; skipping unnecessary calculations.");
                return;
            }
            setPrevCoordinates(coordinates);

            const position = gpsToPosition(nullCoordinates, coordinates);
            position.y = 0; // set altitute: 0
            setCurrentLocation({ coordinates, position });
            if (updateCurrentLocation) updateCurrentLocation({ coordinates, position });

            if (locationHistory.length < maxHistoryLength) return; // Don't set reference location if there is not enough data

            // Adaptive Thresholds: Dynamically adjusts based on accuracy and movement speed
            const velocityFactor = Math.max(1, coordinates.speed ?? 1);
            const dynamicThreshold = Math.max(5, avgAccuracy / 2, velocityFactor * 3);
            // const dynamicAltitudeThreshold = Math.max(3, avgAltitudeAccuracy, velocityFactor * 1.5);

            // If reference location is not yet set, update instantly
            if (!referenceLocation) {
                setReferenceLocation({ coordinates, position });
                if (updateReferenceLocation) updateReferenceLocation({ coordinates, position });
            } else { // Otherwise, wait for significant changes before updating
                const distanceVector = referenceLocation.position.substractedPosition(position);

                const positionDriftDetected = Math.sqrt(distanceVector.x ** 2 + distanceVector.z ** 2) > dynamicThreshold;
                // const altitudeDriftDetected = Math.abs(distanceVector.y) > dynamicAltitudeThreshold;

                const currentTime = Date.now();
                if (positionDriftDetected) { // || altitudeDriftDetected) {
                    const timeThreshold = 10000;
                    console.log(`Large geolocation drift detected! Waiting ${timeThreshold / 1000} seconds for updating reference location...`);

                    if (currentTime - blockLocationUpdateTime > timeThreshold) {
                        console.log("Updating reference coordinates due to sustained drift:", coordinates);
                        setReferenceLocation({ coordinates, position });
                        if (updateReferenceLocation) updateReferenceLocation({ coordinates, position });
                        setBlockLocationUpdateTime(currentTime);
                    }
                } else {
                    console.log("Drift has stabilized; stopping reference updates.");
                    setBlockLocationUpdateTime(currentTime);
                }
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [locationHistory]);

    return [currentLocation, referenceLocation];
}
