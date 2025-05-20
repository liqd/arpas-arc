export default function useGeolocation(
    updateCurrentPosition: (currentPosition: GeolocationPosition | null) => void
) {
    const onSuccess = (position: GeolocationPosition) => {
        if (position.coords.accuracy > 20) {
            console.log("Received inaccurate geolocation:", position.coords.accuracy);
            return;
        }

        console.log("Received accurate and valid geolocation:", position);
        updateCurrentPosition(position);
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
}
