import React, { useEffect, useRef } from "react";
import "./style.css";

const Compass = () => {
    const arrowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function updateCompass(event: DeviceOrientationEvent) {
            if (event.alpha !== null && arrowRef.current) {
                const heading = 360 - event.alpha;
                arrowRef.current.style.transform = `rotate(${heading}deg)`;
            }
        }

        window.addEventListener("deviceorientationabsolute", updateCompass, true);
        return () => window.removeEventListener("deviceorientationabsolute", updateCompass);
    }, []);

    return (
        <div id="compass-container">
            <div id="compass-arrow-container" ref={arrowRef}>
                <div id="compass-arrow-north" />
                <div id="compass-arrow-south" />
            </div>
        </div>
    );
};

export default Compass;
