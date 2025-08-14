import React from "react";
import "./ArcFooter.css";

type ArcFooterProps = {
  children?: React.ReactNode;
};

const ArcFooter: React.FC<ArcFooterProps> = ({ children }) => {
  return (
    <div id="arc-footer" className="py-1 px-2">
      {children ?? (
        <small className="text-dark fw-bold" aria-live="polite">
          Ready
        </small>
      )}
    </div>
  );
};

export default ArcFooter;