import { useEffect, useState } from "react";
import { motion, useMotionValue, useDragControls, animate, useTransform } from "framer-motion";
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

    const relativePositions = [
        1.0,                            // Closed
        0.91,                            // Minimized
        0.5,                            // Half screen
        (headerHeight) / screenHeight,  // Full screen
    ];

    const positions = relativePositions.map(p => p * screenHeight);

    const y = useMotionValue(screenHeight);
    const dragControls = useDragControls();
    const [shouldRender, setShouldRender] = useState(isVisible);
    const height = useTransform(y, (value) => `${screenHeight - value}px`);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            animate(y, positions[2], { duration: 0.2, ease: "easeOut" });
        } else {
            animate(y, positions[0], {
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
            style={{ y, height }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: positions[3], bottom: positions[1] }}
            dragElastic={0.2}
            dragMomentum={false}
            onDragEnd={(e, info) => {
                const currentY = y.get();
                const velocityY = info.velocity.y;

                const direction = Math.sign(velocityY); // -1 for up, 1 for down

                // get closest snap point in the swipe direction
                const closest = positions
                    .filter(pos => direction === -1 ? pos < currentY : pos > currentY)
                    .sort((a, b) => Math.abs(a - currentY) - Math.abs(b - currentY));

                const nextPosition = Math.max(positions[3], Math.min(positions[1], closest[0] ?? positions[3]));


                animate(y, nextPosition, { duration: 0.2, ease: "easeOut" });
            }}
        >
            <div
                className="bottom-sheet-handle"
                onPointerDown={(e) => dragControls.start(e)}
            >
                <div></div>
            </div>
            <div className="bottom-sheet-content">{children}</div>
        </motion.div>
    );
};

export default BottomSheet;
