import useGeolocation from "./useGeolocation";
import useGeolocationHistory from "./useGeolocationHistory";
import useLocationReference from "./useLocationReference";
import useWorldPosition from "./useWorldPosition";

export function useCombinedLocation(minAccuracy = 35, maxHistoryLength = 10) {

    const [currentGeolocation, accurateGeolocation] = useGeolocation(minAccuracy);
    const [locationHistory] = useGeolocationHistory(accurateGeolocation ?? currentGeolocation, maxHistoryLength);
    const [currentLocation, referenceLocation] = useLocationReference(locationHistory, maxHistoryLength);

    return {
        currentGeolocation,
        locationHistory,
        currentLocation,
        referenceLocation
    };
}
