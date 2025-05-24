import { useEffect, useState } from "react";

/**
 * A React hook for **real-time geolocation tracking**, using the browser's Geolocation API.
 * It continuously monitors position updates while filtering out inaccurate readings.
 *
 * @param {GeolocationPosition | null} defaultGeolocation - Initial geolocation value (optional).
 * @param {number} minAccuracy - The minimum acceptable accuracy (in meters) for a valid geolocation update. Default: 20m.
 * @param {(currentPosition: GeolocationPosition | null) => void} [updateValideGeoposition] - Optional callback function to receive updated valid geolocation.
 * @returns {[GeolocationPosition | null]} - The latest valid geolocation position.
 *
 * ## Features:
 * - **Real-time geolocation tracking** using `navigator.geolocation.watchPosition()`.
 * - **Accuracy filtering:** Ignores location updates if `accuracy > minAccuracy`.
 * - **Error handling:** Logs geolocation errors to the console.
 * - **Optimized tracking:** Uses high accuracy, a max age of 10 seconds, and a timeout of 5 seconds.
 * - **Automatic cleanup:** Ensures the watcher stops when the component unmounts.
 *
 * ## Behavior:
 * - If position accuracy **exceeds `minAccuracy`**, the update is ignored.
 * - The hook starts tracking location immediately and updates `valideGeolocation` upon valid position reception.
 * - Calls `updateValideGeoposition` if provided, allowing external components to react to geolocation changes.
 *
 * ## Example Usage:
 * ```tsx
 * const [currentGeolocation] = useGeolocation(null, 10, updateValideGeoposition);
 * console.log("Current Geolocation:", currentGeolocation?.coords);
 * ```
 */
export default function useGeolocation(
    defaultGeolocation: GeolocationPosition | null = null, minAccuracy: number = 20,
    updateStableGeoposition?: (currentPosition: GeolocationPosition | null) => void
): [GeolocationPosition | null, GeolocationPosition | null] {

    const nullCoordinatePosition: GeolocationPosition = {
        coords: {
            longitude: 0,
            latitude: 0,
            altitude: 0,
            heading: 0,
            accuracy: 0,
            altitudeAccuracy: null,
            speed: 0,
            toJSON: function () {
                return {
                    longitude: this.longitude,
                    latitude: this.latitude,
                    altitude: this.altitude,
                    heading: this.heading,
                    accuracy: this.accuracy,
                    altitudeAccuracy: this.altitudeAccuracy,
                    speed: this.speed
                };
            }
        },
        timestamp: Date.now(),
        toJSON: function () {
            return {
                coords: this.coords,
                timestamp: this.timestamp
            };
        }
    };

    const [currentGeolocation, setCurrentGeolocation] = useState<GeolocationPosition | null>(nullCoordinatePosition);
    const [accurateGeolocation, setAccurateGeolocation] = useState<GeolocationPosition | null>(defaultGeolocation);

    useEffect(() => {
        const onSuccess = (position: GeolocationPosition) => {
            if (!position.coords.latitude && !position.coords.longitude) return;
            setCurrentGeolocation(position);

            if (position.coords.accuracy > minAccuracy) {
                console.log("Received inaccurate geolocation:", position.coords.accuracy);
                return null;
            }

            console.log("Received accurate and valid geolocation:", position);
            setAccurateGeolocation(position);
            if (updateStableGeoposition) updateStableGeoposition(position);
        };

        const onError = (error: GeolocationPositionError) => {
            console.error("Geolocation error:", error);
        };

        const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return [currentGeolocation, accurateGeolocation];
}
