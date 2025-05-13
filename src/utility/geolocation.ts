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
    const dLat = (targetCoords.latitude - originCoords.latitude) * Math.PI / 180;
    const dLon = (targetCoords.longitude - originCoords.longitude) * Math.PI / 180;

    const x = dLon * earthRadius * Math.cos((originCoords.latitude + targetCoords.latitude) * Math.PI / 360);
    const z = dLat * earthRadius;

    return { x, z };
}

