import * as THREE from "three";
import { Position, Rotation } from "../../types/transform";
import { gpsToMeters } from "../../utility/geolocation";

class QRCodeLocationObject {
    latitude: number;
    longitude: number;
    altitude: number | undefined;
    heading: number = 0;

    constructor(latitude: number, longitude: number, altitude?: number, heading?: number) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.altitude = altitude ?? 0;
        this.heading = heading ?? 0;
    }
}

export default QRCodeLocationObject;
