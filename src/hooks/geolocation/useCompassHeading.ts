import { useEffect, useState, useRef } from "react";
import { getCardinalDirection, getMagneticDeclination } from "../../utility/geolocation";

/**
 * useCompassHeading
 * ------------------
 * Lightweight React hook that subscribes to the DeviceOrientation sensor and
 * derives a usable compass heading for AR or mapping features.
 *
 * Returns a tuple: [compassHeading, smoothedHeading, compassCardinal, phoneTilt]
 *  - compassHeading: number — adjusted heading in degrees in the range [0, 360).
 *  - smoothedHeading: number | null — short-term smoothed heading (null until initialized).
 *  - compassCardinal: string — human-friendly cardinal (N, NE, E, ...).
 *  - phoneTilt: { alpha, beta, gamma } — last raw orientation angles from the device.
 *
 * Parameters:
 * @param geoPosition? GeolocationPosition | null — optional. When provided the hook
 *        will fetch and apply magnetic declination (NOAA) to compute a truer heading.
 * @param updateCompassHeading? (heading: number) => void — optional callback invoked
 *        with each adjusted heading update (useful to mirror into stores).
 * @param updateCompassCardinal? (cardinal: string) => void — optional callback invoked
 *        when the computed cardinal changes.
 * @param updatePhoneTilt? (tilt) => void — optional callback invoked with raw alpha/beta/gamma.
 *
 * Behavior & caveats:
 *  - On iOS, browsers require an explicit permission via DeviceOrientationEvent.requestPermission().
 *    The hook attempts that automatically and only adds listeners when permitted.
 *  - The hook listens to both `deviceorientationabsolute` and `deviceorientation` as
 *    fallbacks; `event.alpha` is used to compute heading when available.
 *  - Magnetic declination is fetched (when `geoPosition` is provided) and applied.
 *  - The hook exposes both an immediate `compassHeading` and a `smoothedHeading` which
 *    uses a light interpolation to reduce jitter — prefer the smoothed value for UI.
 *  - Tilt handling: the hook always reports raw tilt via `phoneTilt`; higher-level
 *    consumers (e.g. `useWorldRotationReference`) may choose to ignore heading updates
 *    when the device tilt is extreme to avoid noisy/reliable readings.
 *  - Cleanup: listeners are removed on unmount (even after iOS permission flows).
 *
 * Example usage — read-only
 * ```tsx
 * const [heading, smoothed, cardinal, tilt] = useCompassHeading();
 * console.log(`Heading ${heading.toFixed(1)}° (${cardinal})`);
 * ```
 *
 * Example usage — mirroring to parent/store
 * ```tsx
 * const onHeading = (h:number) => dispatch({ type: 'compass:update', payload: h });
 * const [heading] = useCompassHeading(undefined, onHeading);
 * ```
 *
 * Notes:
 *  - Test on real mobile devices; desktop browsers typically don't expose orientation sensors.
 *  - If headings appear unstable at high tilt angles, tune the tilt-gating logic in
 *    `useWorldRotationReference` or pass a `geoPosition` so declination can be applied.
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
    const magneticDeclinationRef = useRef<number>(0);

    useEffect(() => {
        if (compassHeading == null || !phoneTilt) {
            console.warn("Invalid compass heading.");
            return;
        }

        if (smoothedHeading == null) {
            if (compassHeading !== 0) setSmoothedHeading(compassHeading);
            return;
        }

        if (Math.abs(smoothedHeading - compassHeading) < 0.1) {
            // console.warn("Skipping update due to minimal heading change");
            return;
        }

        // Calculate shortest angular difference to handle wrap-around at 0/360
        let delta = ((compassHeading - smoothedHeading + 540) % 360) - 180;
        const newSmoothed = (smoothedHeading + delta * 0.1 + 360) % 360;
        setSmoothedHeading(newSmoothed);

        // Derive cardinal direction from the newly computed smoothed heading
        const cardinalDirection = getCardinalDirection(newSmoothed);
        setCompassCardinal(cardinalDirection);
        if (updateCompassCardinal) updateCompassCardinal(cardinalDirection);
    }, [compassHeading, phoneTilt]);

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

            const magneticDeclination = magneticDeclinationRef.current ?? 0;
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

        const ABS_EVENT = "deviceorientationabsolute";
        const EVENT = "deviceorientation";

        let listenersAdded = false;
        const addListeners = () => {
            if (listenersAdded) return;
            try {
                window.addEventListener(ABS_EVENT, handleOrientation as EventListener);
            } catch (e) {
                // ignore: some browsers may not support this event
            }
            try {
                window.addEventListener(EVENT, handleOrientation as EventListener);
            } catch (e) {
                // ignore
            }
            listenersAdded = true;
        };

        const removeListeners = () => {
            if (!listenersAdded) return;
            try {
                window.removeEventListener(ABS_EVENT, handleOrientation as EventListener);
            } catch (e) { }
            try {
                window.removeEventListener(EVENT, handleOrientation as EventListener);
            } catch (e) { }
            listenersAdded = false;
        };

        /**
         * Requests permission to use device orientation (iOS) and adds listeners where supported.
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
                        addListeners();
                    }
                } catch (error) {
                    console.error("Error requesting orientation permission:", error);
                }
            } else {
                // Non-iOS devices - add listeners directly
                addListeners();
            }
        };

        // Fetch magnetic declination when user position changes
        const fetchMagneticDeclination = (geoCoords: GeolocationCoordinates | undefined) => {
            if (!geoCoords) return;

            getMagneticDeclination(
                geoCoords.latitude,
                geoCoords.longitude,
            ).then((declination) => {
                magneticDeclinationRef.current = declination ?? 0;
            }).catch(() => {
                magneticDeclinationRef.current = 0;
            });
        };

        requestPermission();

        // update declination immediately if geoPosition present
        fetchMagneticDeclination(geoPosition?.coords);

        return () => {
            removeListeners();
        };
    }, []);

    // Keep magnetic declination up-to-date whenever geoPosition changes
    useEffect(() => {
        if (!geoPosition?.coords) return;
        getMagneticDeclination(geoPosition.coords.latitude, geoPosition.coords.longitude)
            .then((declination) => { magneticDeclinationRef.current = declination ?? 0; })
            .catch(() => { magneticDeclinationRef.current = 0; });
    }, [geoPosition]);

    return [compassHeading, smoothedHeading, compassCardinal, phoneTilt];
}