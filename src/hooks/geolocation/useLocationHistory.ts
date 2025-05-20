import { useRef } from "react";
import { Position } from "../../types/transform";
import { gpsToMeters } from "../../utility/geolocation";

export default function useLocationHistory(coordinatesHistory: GeolocationCoordinates[], referenceCoordinates: GeolocationCoordinates,
    updateCurrentCoordinates: (coordinates: GeolocationCoordinates) => void,
    updateReferenceLocation: (referenceLocation: { coordinates: GeolocationCoordinates; position: Position }) => void
) {
    const blockLocationUpdateTimeRef = useRef<number>(0);

    if (!coordinatesHistory || coordinatesHistory.length === 0) return;

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

    updateCurrentCoordinates(coordinates);

    if (!referenceCoordinates) {
        updateReferenceLocation({ coordinates, position: new Position() });
    } else {
        const distanceThreshold = 5;
        const timeThreshold = 5000;

        const distance = gpsToMeters(referenceCoordinates, coordinates);
        const positionDriftDetected = Math.sqrt(distance.x ** 2 + distance.z ** 2) > distanceThreshold;

        if (positionDriftDetected) {
            console.log("Large geolocation drift detected! Waiting...");

            const currentTime = Date.now();
            if (currentTime - blockLocationUpdateTimeRef.current > timeThreshold) {
                console.log("Updating reference coordinates due to sustained drift:", coordinates);
                updateReferenceLocation({ coordinates, position: new Position(distance.x, 0, distance.z) });

                blockLocationUpdateTimeRef.current = currentTime;
            }
        }
    }
}
