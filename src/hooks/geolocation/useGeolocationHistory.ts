import { useEffect, useState } from "react";

/**
 * A React hook that maintains a **history of geolocation updates**, storing the most recent coordinates.
 * It ensures efficient tracking of location changes while limiting historical entries.
 *
 * @param {GeolocationPosition | null} valideGeolocation - The latest valid geolocation position.
 * @returns {[GeolocationCoordinates[]]} - An array containing the last few recorded geolocation coordinates.
 *
 * ## Features:
 * - **Tracks a rolling history of last 5 locations**.
 * - **Ensures efficient memory usage** by automatically trimming older records.
 * - **Updates the history whenever new valid geolocation data is received.**
 *
 * ## Behavior:
 * - If `valideGeolocation` is `null`, it does nothing.
 * - Adds each new location to history while ensuring the history doesn't exceed `MAX_CURRENT_LOCATION_HISTORY`.
 * - Oldest entries are **removed dynamically** to maintain a **fixed-size history**.
 *
 * ## Example Usage:
 * ```tsx
 * const [locationHistory] = useLocationHistory(validGeolocation);
 * console.log("Location History:", locationHistory);
 * ```
 */
export default function useLocationHistory(valideGeolocation: GeolocationPosition | null
) : [GeolocationCoordinates[]] {
    
    const [locationHistory, setLocationHistory] = useState<GeolocationCoordinates[]>([]);

    const MAX_CURRENT_LOCATION_HISTORY = 5;
    useEffect(() => {
        if (!valideGeolocation) return;
        setLocationHistory(prevHistory => {
            const updatedHistory = [...prevHistory, valideGeolocation.coords];
            return updatedHistory.length > MAX_CURRENT_LOCATION_HISTORY ? updatedHistory.slice(1) : updatedHistory;
        });
    }, [valideGeolocation]);

    return [locationHistory];
}