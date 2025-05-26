import { create } from "zustand";
import { Position } from "../types/transform";
import { nullCoordinates } from "../components/locationObjects/geolocation";
import { gpsToMeters } from "../utility/geolocation";

interface LocationState {
    locations: Record<string, Position>;
    getPosition: (latitude: number, longitude: number) => Position;
}

const useLocationStore = create<LocationState>((set, get) => ({
    locations: {},

    getPosition: (latitude, longitude) => {
        const key = `${latitude},${longitude}`; // Unique key for caching

        // Return cached position if it exists
        if (get().locations[key]) {
            return get().locations[key];
        }

        // Create a valid GeolocationCoordinates instance
        const coordinates: GeolocationCoordinates = {
            latitude,
            longitude,
            altitude: 0,
            heading: 0,
            accuracy: 0,
            altitudeAccuracy: null,
            speed: 0,
            toJSON: () => ({ latitude, longitude }),
        };

        // Convert GPS coordinates to meters
        const { x, z } = gpsToMeters(nullCoordinates, coordinates);
        const newPosition = new Position(x, 0, z);

        // Store the calculated position
        setTimeout(() => {
            set((state) => ({
                locations: { ...state.locations, [key]: newPosition },
            }));
        }, 0);

        return newPosition;
    },
}));

export default useLocationStore;
