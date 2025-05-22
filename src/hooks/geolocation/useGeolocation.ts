import { useEffect, useState } from "react";

export default function useGeolocation(
    defaultGeolocation: GeolocationPosition | null = null,
    updateValideGeoposition?: (currentPosition: GeolocationPosition | null) => void
): [GeolocationPosition | null] {
    
    const [valideGeolocation, setValideGeolocation] = useState<GeolocationPosition | null>(defaultGeolocation);

    useEffect(() => {
        const onSuccess = (position: GeolocationPosition) => {
            if (position.coords.accuracy > 20) {
                console.log("Received inaccurate geolocation:", position.coords.accuracy);
                return null;
            }

            console.log("Received accurate and valid geolocation:", position);
            setValideGeolocation(position);
            if (updateValideGeoposition) updateValideGeoposition(position);
        };

        const onError = (error: GeolocationPositionError) => {
            console.error("Geolocation error:", error);
        };

        const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return [valideGeolocation];
}
