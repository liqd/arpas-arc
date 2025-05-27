import { useCompassHeading } from "../../hooks";
import "./style.css";

const Compass2D = () => {
    const [compassHeading, compassCardinal, phoneTilt] = useCompassHeading();

    return (
        <div id="compass-container">
            <div id="compass-arrow-container" style={{ transform: `rotate(${-compassHeading}deg)` }}>
                <div id="compass-arrow-north" />
                <div id="compass-arrow-south" />
            </div>
            {compassCardinal && <p id="compass-cardinal">{compassCardinal}</p>}
        </div>
    );
};

export default Compass2D;
