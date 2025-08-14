import React from "react";
import "./ArcHeader.css";

type ArcHeaderProps = {
  isHelpVisible: boolean;
  onToggleHelp: () => void;
  onLeave: () => void;
};

const ArcHeader: React.FC<ArcHeaderProps> = ({ isHelpVisible, onToggleHelp, onLeave }) => {
  return (
    <>
      <div id="arc-logo-header" className="py-1 px-2">
        <span className="border-0 fw-bold text-uppercase text-dark">ARPAS</span>
      </div>
      <div id="arc-header" className="py-1 px-2">
        <button className="border-0 fw-bold text-uppercase text-dark" onClick={onLeave}>
          <small>
            <i className="fas fa-arrow-left" aria-hidden="true"></i> Leave AR
          </small>
        </button>
        <button className="border-0 fw-bold text-uppercase text-dark" onClick={onToggleHelp}>
          <small>
            {isHelpVisible ? (
              <>
                <i className="fas fa-times" aria-hidden="true"></i> Close Help
              </>
            ) : (
              <>
                <i className="fas fa-info-circle"></i> Help
              </>
            )}
          </small>
        </button>
      </div>
    </>
  );
};

export default ArcHeader;