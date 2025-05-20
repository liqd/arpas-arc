import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import "./style.css";

const screenWidth = typeof window !== "undefined" ? window.innerWidth : 800;
const openX = 0;
const closedX = screenWidth;

const SideSheet = ({
    isVisible,
    onClose,
    onLeave,
    children,
}: {
    isVisible: boolean;
    onClose?: () => void;
    onLeave?: () => void;
    children?: React.ReactNode;
}) => {
    const x = useMotionValue(closedX);
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            animate(x, openX, { duration: 0.3, ease: "easeOut" });
        } else {
            animate(x, closedX, {
                duration: 0.3,
                ease: "easeOut",
                onComplete: () => setShouldRender(false),
            });
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    return (
        <motion.div
            className="side-sheet d-flex flex-column vh-100"
            style={{ x }}
            initial={false}
        >
            <div id="arc-header" className="py-1 px-2">
                <button className="border-0 fw-bold text-uppercase text-dark" onClick={onLeave}>
                    <small><i className="fa fa-arrow-left" aria-hidden="true"></i> Leave AR</small>
                </button>
                <button className="border-0 fw-bold text-uppercase text-dark" onClick={onClose}>
                    <small><i className="fa-solid fa-xmark"></i></small>
                </button>
            </div>

            <div className="flex-grow-1 overflow-auto px-3 pt-3 d-flex flex-column">
                {children}
            </div>
        </motion.div>
    );
};

export default SideSheet;
