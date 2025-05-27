import * as THREE from "three";
import { Position, Rotation } from "../../types/transform";
import { gpsToMeters } from "../../utility/geolocation";

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

export const nullCoordinates: GeolocationCoordinates = {
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
};

class GeolocationObject {
    latitude: number;
    longitude: number;
    altitude: number | undefined;
    heading: number = 0;
    previousPosition: Position | null = null;
    previousHeading: number | null = null;

    constructor(latitude: number, longitude: number, altitude?: number, heading?: number) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude ?? 0;
        this.heading = heading ?? 0;
    }

    getGpsCoordinates(): GeolocationCoordinates {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            altitude: this.altitude ?? 0,
            heading: this.heading,
            accuracy: 0,
            altitudeAccuracy: null,
            speed: 0,
            toJSON: () => this.getGpsCoordinates()
        };
    }

    placeAtWorldCoords(referenceCoordinates: GeolocationCoordinates, relativeWorldPosition: Position = new Position(),
        placeOnGround: boolean = false, groundMesh: THREE.Mesh | null = null): { position: Position, rotation: Rotation } {
        let position = this.toWorldPosition(referenceCoordinates).add(relativeWorldPosition);

        if (placeOnGround && groundMesh) {
            const groundHeight = this.getGroundHeight(position.addY(1), groundMesh);
            position.y = groundHeight + 0.03; // Adjust height above ground
        }

        const rotation = new Rotation(0, this.heading, 0);
        return { position, rotation };
    }

    toWorldPosition(referenceCoords: GeolocationCoordinates): Position {
        const { x, z } = gpsToMeters(referenceCoords, this.getGpsCoordinates());

        const worldPosition = new Position(x, this.altitude ?? 0, z);
        return worldPosition;
    }

    getGroundHeight(objectPosition: THREE.Vector3, groundMesh: THREE.Mesh): number {
        const raycaster = new THREE.Raycaster();
        const downVector = new THREE.Vector3(0, -1, 0);
        raycaster.set(objectPosition, downVector);
        const intersects = raycaster.intersectObject(groundMesh);

        if (intersects.length > 0) {
            return intersects[0].point.y;
        }
        return 0;
    }
}

export default GeolocationObject;
