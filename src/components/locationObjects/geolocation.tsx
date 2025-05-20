import * as THREE from "three";
import { Position, Rotation } from "../../types/transform";
import { gpsToMeters } from "../../utility/geolocation";

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

    placeAtWorldCoords(initialCoords: GeolocationCoordinates, initialPosition: Position,
        placeOnGround: boolean = false, groundMesh: THREE.Mesh | null = null): { position: Position, rotation: Rotation } {
        let position = this.toWorldPosition(initialCoords).add(initialPosition);

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
