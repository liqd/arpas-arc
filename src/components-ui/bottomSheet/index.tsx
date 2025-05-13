import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import "./style.css";

const BottomSheet = ({
    isVisible,
    onClose,
    children,
}: {
    isVisible: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
}) => {
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const openY = screenHeight * 0.7;
    const closedY = screenHeight;

    const y = useMotionValue(closedY);
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            animate(y, openY, { duration: 0.2, ease: "easeOut" });
        } else {
            animate(y, closedY, {
                duration: 0.2,
                ease: "easeOut",
                onComplete: () => setShouldRender(false),
            });
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    return (
        <motion.div
            className="bottom-sheet"
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0, bottom: closedY }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(e, info) => {
                const currentY = y.get();
                if (currentY > openY + 100) {
                    animate(y, closedY, {
                        duration: 0.2,
                        ease: "easeOut",
                        onComplete: () => {
                            setShouldRender(false);
                            onClose?.();
                        },
                    });
                }
            }}
        >
            <div className="bottom-sheet-handle" />
            <div className="bottom-sheet-content">{children}</div>
        </motion.div>
    );
};

export default BottomSheet;
