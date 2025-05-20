import { getCardinalDirection, getMagneticDeclination } from "../../utility/geolocation";

export default function useCompassHeading(
    updateHeading: (heading: number) => void,
    updateCardinal?: (cardinal: string) => void,
    updateTilt?: (tilt: { alpha: number, beta: number, gamma: number }) => void,
    geoPosition?: GeolocationPosition | null) {

    /**
     * Checks if the device supports orientation events
     * Sets hasSupport state and default direction if not supported
     */
    const checkSupport = () => {
        if (typeof window === "undefined") return false;

        if (!window.DeviceOrientationEvent) {
            alert("Your device does not support compass functionality.");
            // setHasSupport(false);
            updateHeading(0);
            if (updateCardinal) updateCardinal("N");
            return false;
        }
        return true;
    };

    /**
     * Handles device orientation events
     * Calculates heading based on device type (iOS vs Android)
     * Applies magnetic declination and manual offset corrections
     */
    const handleOrientation = (event: DeviceOrientationEvent) => {
        let heading = 0;

        // For iOS devices - uses native compass heading
        // if (event?.webkitCompassHeading) {
        //     heading = event.webkitCompassHeading;
        // }
        // For Android devices - uses alpha value and screen orientation
        // else
        if (event.alpha !== null) {
            const screenOrientation = window.screen.orientation?.angle || 0;
            heading = (360 - event.alpha + screenOrientation) % 360;
        } else {
            updateHeading(0);
            if (updateCardinal) updateCardinal("N");
            return;
        }

        const magneticDeclination = 0;
        if (heading !== undefined) {
            // Apply magnetic declination and manual offset corrections
            const adjustedHeading =
                (heading + magneticDeclination + 360) % // + offsetRef.current) %
                360;

            let cardinalDirection = getCardinalDirection(adjustedHeading);

            updateHeading(adjustedHeading);
            if (updateCardinal) updateCardinal(cardinalDirection);
            if (updateTilt) updateTilt({
                alpha: event.alpha ?? 0,
                beta: event.beta ?? 0,
                gamma: event.gamma ?? 0
            });
        }
    };

    const DEVICE_ORIENTATION_EVENT = "deviceorientationabsolute";
    /**
     * Requests permission to use device orientation
     * Handles different permission models for iOS and other devices
     */
    const requestPermission = async () => {
        if (!checkSupport()) return;

        // iOS requires explicit permission request
        if (
            typeof DeviceOrientationEvent !== "undefined" &&
            // @ts-expect-error requestPermission is supported in iOS
            typeof DeviceOrientationEvent.requestPermission === "function"
        ) {
            try {
                // @ts-expect-error requestPermission is supported in iOS
                const response = await DeviceOrientationEvent.requestPermission();

                if (response === "granted") {
                    window.addEventListener(DEVICE_ORIENTATION_EVENT, handleOrientation);

                }
            } catch (error) {
                console.error("Error requesting orientation permission:", error);
            }
        } else {
            // Non-iOS devices - add listener directly
            window.addEventListener(DEVICE_ORIENTATION_EVENT, handleOrientation);
            return () => window.removeEventListener(DEVICE_ORIENTATION_EVENT, handleOrientation);
        }
    };

    // Fetch magnetic declination when user position changes
    const fetchMagneticDeclination = (geoCoords: GeolocationCoordinates | undefined) => {
        if (!geoCoords) return 0;

        getMagneticDeclination(
            geoCoords.latitude,
            geoCoords.longitude,
        ).then((declination) => {
            return declination;
        });
    };

    requestPermission();
}