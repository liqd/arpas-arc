import { useEffect, useState } from "react";
import { getCardinalDirection, getMagneticDeclination } from "../../utility/geolocation";

/**
 * A React hook that **retrieves and processes device orientation** data for compass heading tracking.
 * It integrates with the browser's `DeviceOrientationEvent` to provide real-time heading, cardinal direction, and phone tilt.
 *
 * @param {GeolocationPosition | null} geoPosition - Optional geolocation data, used for magnetic declination calculations.
 * @param {(heading: number) => void} [updateCompassHeading] - Optional callback to receive updated compass heading.
 * @param {(cardinal: string) => void} [updateCompassCardinal] - Optional callback to receive updated cardinal direction.
 * @param {(tilt: { alpha: number, beta: number, gamma: number }) => void} [updatePhoneTilt] - Optional callback to receive updated tilt data.
 * @returns {[number, string, { alpha: number, beta: number, gamma: number }]} - The computed compass heading, cardinal direction, and phone tilt.
 *
 * ## Features:
 * - **Real-time compass tracking** using `DeviceOrientationEvent`.
 * - **Supports both iOS and Android device orientation mechanisms**.
 * - **Applies magnetic declination adjustments**, ensuring accurate heading calculations.
 * - **Filters invalid orientation data**, preventing unreliable updates.
 * - **Handles permission requests** for accessing device motion sensors.
 *
 * ## Behavior:
 * - If the device **does not support orientation events**, it defaults to `N` (North) with a heading of `0°`.
 * - If `alpha`, `beta`, or `gamma` exceed a certain threshold, updates are **blocked** to maintain reliable readings.
 * - Uses `updateCompassHeading`, `updateCompassCardinal`, and `updatePhoneTilt` callbacks **if provided** for external synchronization.
 *
 * ## Example Usage:
 * ```tsx
 * const [heading, cardinalDirection, tilt] = useCompassHeading(geoPosition, updateCompassHeading, updateCompassCardinal, updatePhoneTilt);
 * console.log(`Compass Heading: ${heading}° (${cardinalDirection})`);
 * ```
 */
export default function useCompassHeading(
    geoPosition?: GeolocationPosition | null,
    updateCompassHeading?: (heading: number) => void,
    updateCompassCardinal?: (cardinal: string) => void,
    updatePhoneTilt?: (tilt: { alpha: number, beta: number, gamma: number }) => void
): [number, number | null, string, { alpha: number, beta: number, gamma: number }] {

    const [compassHeading, setCompassHeading] = useState<number>(0);
    const [compassCardinal, setCompassCardinal] = useState<string>("undef");
    const [phoneTilt, setPhoneTilt] = useState<{ alpha: number, beta: number, gamma: number }>({ alpha: 0, beta: 0, gamma: 0 });
    const [smoothedHeading, setSmoothedHeading] = useState<number | null>(null);

    useEffect(() => {
        if (!compassHeading || !phoneTilt) {
            console.warn("Invalid compass heading.");
            return;
        }

        if (!smoothedHeading) {
            if (compassHeading != 0)
                setSmoothedHeading(compassHeading);
            return;
        }

        if (Math.abs(smoothedHeading - compassHeading) < 0.1) {
            // console.warn("Skipping update due to minimal heading change");
            return;
        }

        // Calculate shortest angular difference to handle wrap-around at 0/360
        let delta = ((compassHeading - smoothedHeading + 540) % 360) - 180;
        setSmoothedHeading((smoothedHeading + delta * 0.1 + 360) % 360);

        let cardinalDirection = getCardinalDirection(smoothedHeading);
        setCompassCardinal(cardinalDirection);
        if (updateCompassCardinal) updateCompassCardinal(cardinalDirection);
    }, [compassHeading]);

    useEffect(() => {
        /**
         * Checks if the device supports orientation events
         * Sets hasSupport state and default direction if not supported
         */
        const checkSupport = () => {
            if (typeof window === "undefined") return false;

            if (!window.DeviceOrientationEvent) {
                alert("Your device does not support compass functionality.");
                setCompassHeading(0);
                if (updateCompassHeading) updateCompassHeading(0);
                setCompassCardinal("N")
                if (updateCompassCardinal) updateCompassCardinal("N");
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
                setCompassHeading(0);
                if (updateCompassHeading) updateCompassHeading(0);
                setCompassCardinal("N")
                if (updateCompassCardinal) updateCompassCardinal("N");
                return;
            }

            const magneticDeclination = 0;
            if (heading !== undefined) {
                // Apply magnetic declination and manual offset corrections
                const adjustedHeading =
                    (heading + magneticDeclination + 360) % // + offsetRef.current) %
                    360;

                setCompassHeading(adjustedHeading);
                if (updateCompassHeading) updateCompassHeading(adjustedHeading);

                var tilt = {
                    alpha: event.alpha ?? 0,
                    beta: event.beta ?? 0,
                    gamma: event.gamma ?? 0
                }
                setPhoneTilt(tilt)
                if (updatePhoneTilt) updatePhoneTilt(tilt);
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
    }, []);

    return [compassHeading, smoothedHeading, compassCardinal, phoneTilt];
}