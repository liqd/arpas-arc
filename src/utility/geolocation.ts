import * as THREE from "three";

const earthRadius = 6378137;

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
 * Converts two sets of GPS coordinates (latitude and longitude) to a 2D cartesian coordinate system in meters.
 * This function calculates the displacement between two GPS coordinates in meters and returns it as x (east-west) and z (north-south) displacements.
 * 
 * @param originCoords - The starting GPS coordinates (latitude, longitude).
 * @param targetCoords - The target GPS coordinates (latitude, longitude).
 * @returns - An object with x and z properties representing the displacement in meters.
 */
export function gpsToMeters(
    originCoords: GeolocationCoordinates,
    targetCoords: GeolocationCoordinates
): { x: number, z: number } {
    const lat1 = (originCoords.latitude * Math.PI) / 180;
    const lat2 = (targetCoords.latitude * Math.PI) / 180;
    const dLat = lat2 - lat1;
    const dLon = (targetCoords.longitude - originCoords.longitude) * (Math.PI / 180);

    let x = dLon * earthRadius * Math.cos((lat1 + lat2) / 2);
    let z = dLat * earthRadius;

    return { x, z };
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