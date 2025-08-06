import useGeolocation from "./useGeolocation";
import useGeolocationHistory from "./useGeolocationHistory";
import useWorldPositionReference from "./useWorldPositionReference";

export function useCombinedLocation(minAccuracy = 35, maxHistoryLength = 10) {

    const [currentGeolocation, accurateGeolocation] = useGeolocation(minAccuracy);
    const [locationHistory] = useGeolocationHistory(accurateGeolocation ?? currentGeolocation, maxHistoryLength);
    const [currentWorldPosition, referenceWorldPosition] = useWorldPositionReference(locationHistory, maxHistoryLength);

    return {
        currentGeolocation,
        locationHistory,
        currentWorldPosition,
        referenceWorldPosition
    };
}
