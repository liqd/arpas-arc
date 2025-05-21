import { useEffect, useState } from "react";

export default function useValideGeolocation(valideGeolocation: GeolocationPosition | null
) : [GeolocationCoordinates[]] {
    
    const [locationHistory, setLocationHistory] = useState<GeolocationCoordinates[]>([]);

    const MAX_CURRENT_LOCATION_HISTORY = 5;
    useEffect(() => {
        if (!valideGeolocation) return;
        setLocationHistory(prevHistory => {
            const updatedHistory = [...prevHistory, valideGeolocation.coords];
            return updatedHistory.length > MAX_CURRENT_LOCATION_HISTORY ? updatedHistory.slice(1) : updatedHistory;
        });
    }, [valideGeolocation]);

    return [locationHistory];
}