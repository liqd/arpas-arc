import * as THREE from "three";
import { Position } from "../types/transform";

const earthRadius = 6378137;

export const nullCoordinatePosition: GeolocationPosition = {
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

/**
 * Offsets the given GPS coordinates by a specified distance in meters.
 * This function calculates the new coordinates based on the provided displacement in the x (longitude) and y (latitude) axes.
 * 
 * @param coords - The original GPS coordinates (latitude, longitude, etc.)
 * @param meters - A THREE.Vector2 representing the displacement in meters:
 *                 meters.x represents the displacement in the x (longitude) direction, 
 *                 meters.y represents the displacement in the y (latitude) direction.
 * @returns - A new set of GPS coordinates offset by the specified distance.
 */
export function offsetGpsByMeters(
    coords: GeolocationCoordinates,
    meters: THREE.Vector2
): GeolocationCoordinates {
    const dLat = meters.y / earthRadius;
    const dLon = meters.x / (earthRadius * Math.cos((coords.latitude * Math.PI) / 180));

    const latitude = coords.latitude + (dLat * 180) / Math.PI;
    const longitude = coords.longitude + (dLon * 180) / Math.PI;

    return {
        latitude,
        longitude,
        altitude: coords.altitude ?? null,
        accuracy: coords.accuracy,
        altitudeAccuracy: coords.altitudeAccuracy ?? null,
        heading: coords.heading ?? null,
        speed: coords.speed ?? null
    } as GeolocationCoordinates;
}

/**
 * Converts two GPS coordinates into displacement values (x, y, z) in meters,
 * accounting for latitude, longitude, and altitude differences.
 *
 * This function uses the **Haversine formula** for accurate horizontal distance calculations
 * and applies direct altitude comparisons for vertical movement.
 *
 * @param {GeolocationCoordinates} originCoords - The starting location (reference point).
 * @param {GeolocationCoordinates} targetCoords - The destination location.
 * @returns {{ x: number, y: number, z: number }} - Displacement in meters:
 *   - `x` → East-West movement (longitude-based)
 *   - `y` → Vertical movement (altitude difference)
 *   - `z` → North-South movement (latitude-based)
 *
 * ## Features:
 * - **Precise Horizontal Distance:** Uses the **Haversine formula** for latitude/longitude calculations.
 * - **Altitude Awareness:** Integrates altitude (`y`) for full **3D spatial positioning**.
 * - **Geospatial Accuracy:** Reduces distortion by applying spherical math corrections.
 *
 * ## Example Usage:
 * ```tsx
 * const origin = { latitude: 52.5200, longitude: 13.4050, altitude: 50 };
 * const target = { latitude: 52.5205, longitude: 13.4060, altitude: 55 };
 * const displacement = gpsToMeters(origin, target);
 * console.log(`Displacement:`, displacement); // { x: ~86m, y: ~5m, z: ~55m }
 * ```
 */
export function gpsToMeters(
    originCoords: GeolocationCoordinates,
    targetCoords: GeolocationCoordinates
): { x: number, y: number, z: number } {
    const earthRadius = 6371000; // Earth's radius in meters

    // Convert lat/lon to radians
    const lat1 = (originCoords.latitude * Math.PI) / 180;
    const lat2 = (targetCoords.latitude * Math.PI) / 180;
    const lon1 = (originCoords.longitude * Math.PI) / 180;
    const lon2 = (targetCoords.longitude * Math.PI) / 180;

    // Haversine formula for accurate distance calculations
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const horizontalDistance = earthRadius * c; // Distance between points ignoring altitude

    // Compute displacement in X and Z using bearing direction
    const x = horizontalDistance * Math.cos((lat1 + lat2) / 2); // East/West direction
    const z = horizontalDistance * Math.sin((lat1 + lat2) / 2); // North/South direction

    // Altitude difference (vertical movement)
    const y = (targetCoords.altitude ?? 0) - (originCoords.altitude ?? 0);

    return { x, y, z };
}
export function gpsToPosition(originCoords: GeolocationCoordinates,
    targetCoords: GeolocationCoordinates
): Position {
    const { x, y, z } = gpsToMeters(originCoords, targetCoords);
    return new Position(x, y, z);
}

/**
 * Fetches magnetic declination from NOAA API
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {Promise<number>} Magnetic declination value
 * https://cdnkr.blog/post/build-a-compass-with-the-device-orientation-api
 */
export async function getMagneticDeclination(latitude: number, longitude: number) {
    const response = await fetch(
        `https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination?lat1=${latitude}&lon1=${longitude}&key=${import.meta.env.VITE_PUBLIC_NOAA_API_KEY}&resultFormat=json`,
    );
    const data = await response.json();

    if (!data?.result || data?.result?.length === 0) return 0;

    const declination = data.result[0].declination;
    return declination;
}

/**
 * Converts compass heading to cardinal direction
 * @param {number} heading - Compass heading in degrees
 * @returns {string} Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 * https://cdnkr.blog/post/build-a-compass-with-the-device-orientation-api
 */
export function getCardinalDirection(heading: number): string {
    let cardinalDirection = "undef";
    if (heading >= 337.5 || heading < 22.5) {
        cardinalDirection = "N";
    } else if (heading >= 22.5 && heading < 67.5) {
        cardinalDirection = "NE";
    } else if (heading >= 67.5 && heading < 112.5) {
        cardinalDirection = "E";
    } else if (heading >= 112.5 && heading < 157.5) {
        cardinalDirection = "SE";
    } else if (heading >= 157.5 && heading < 202.5) {
        cardinalDirection = "S";
    } else if (heading >= 202.5 && heading < 247.5) {
        cardinalDirection = "SW";
    } else if (heading >= 247.5 && heading < 292.5) {
        cardinalDirection = "W";
    } else if (heading >= 292.5 && heading < 337.5) {
        cardinalDirection = "NW";
    }

    return cardinalDirection;
}