import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import "./style.css";

const BottomSheet = ({
    isVisible,
    headerHeight,
    onClose,
    children,
}: {
    isVisible: boolean;
    headerHeight: number;
    onClose?: () => void;
    children?: React.ReactNode;
}) => {
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    // Define snapping positions
    const positions = [
        screenHeight, // Closed
        100, // Default (Short info)
        screenHeight - 80, // Minimized
        screenHeight / 2, // Half screen
        headerHeight + 25, // Full Screen
    ];

    const y = useMotionValue(positions[0]);
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            animate(y, positions[1], { duration: 0.2, ease: "easeOut" });
        } else {
            animate(y, positions[0], {
                duration: 0.2,
                ease: "easeOut",
                onComplete: () => setShouldRender(false),
            });
        }
    }, [isVisible]);


    if (!shouldRender) return null;

    // TODO: Only detect dragging on the handle, not on the content to move the sheet
    return (
        <motion.div className="bottom-sheet"
            style={{ y }}
            drag="y"
            dragConstraints={{ bottom: positions[2], top: positions[4] }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(e, info) => {
                const currentY = y.get();
                const velocityY = info.velocity.y;

                const direction = Math.sign(velocityY); // -1 for up, 1 for down

                // Get possible next positions based on swipe direction
                const closestPossiblePositions = positions
                    .filter(pos => direction === -1 ? pos < currentY : pos > currentY) // Filter based on direction
                    .sort((a, b) => Math.abs(a - currentY) - Math.abs(b - currentY)); // Sort by closest distance

                // Pick next position or default to the closest one
                const nextPosition = Math.max(positions[4], Math.min(closestPossiblePositions[0], positions[2]));

                animate(y, nextPosition, { duration: 0.2, ease: "easeOut" });
            }}
        >
            <div className="bottom-sheet-handle" />
            <div className="bottom-sheet-content">{children}</div>
        </motion.div>
    );
};

export default BottomSheet;
