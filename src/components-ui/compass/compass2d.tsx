import { useCompassHeading } from "../../hooks";
import "./style.css";
import React, { useState } from "react";

const Compass2D = ({ showCardinal = true }: { showCardinal?: boolean }) => {
    const [compassHeading, smoothedHeading, compassCardinal, phoneTilt] = useCompassHeading();

    return (
        <div id="compass-container">
            <div id="compass-arrow-container" style={{ transform: `rotate(${-(smoothedHeading ?? compassHeading)}deg)` }}>
                <div id="compass-arrow-north" />
                <div id="compass-arrow-south" />
            </div>
            {showCardinal && compassCardinal && <p id="compass-cardinal">{compassCardinal}</p>}
        </div>
    );
};

export default Compass2D;
