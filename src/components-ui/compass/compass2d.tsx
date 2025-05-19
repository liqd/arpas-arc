import "./style.css";

const Compass2D = ({ heading, cardinal }: { heading: number, cardinal?: string }) => {
    return (
        <div id="compass-container">
            <div id="compass-arrow-container" style={{ transform: `rotate(${-heading}deg)` }}>
                <div id="compass-arrow-north" />
                <div id="compass-arrow-south" />
            </div>
            {cardinal && <p id="compass-cardinal">{cardinal}</p>}
        </div>
    );
};

export default Compass2D;
