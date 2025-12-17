import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Position } from "../../types/transform";

const DirectionalArrow = ({
    camera,
    targetPos,
    hideArrowAngle = 0,
    fixedPosition = false,
    color = "red",
    size = 40,
    headerOffset = 0  
}: {
    camera: THREE.Camera,
    targetPos: Position,
    hideArrowAngle?: number,
    fixedPosition?: boolean,
    color?: string
    size?: string | number
    headerOffset?: number
}) => {
    const deviceOrientationAlpha = useRef(0);
    const [isVisible, setIsVisible] = useState(true);

    const [angle, setAngle] = useState(0);
    const [screenPosition, setScreenPosition] = useState({ top: 0, left: 0 });

    const cameraRef = useRef(camera);
    const targetPosRef = useRef(targetPos);
    const hideAngleRef = useRef(hideArrowAngle);    //wichtig
    const fixedPositionRef = useRef(fixedPosition);

    const lastTargetRef = useRef(targetPos.clone());
    const jumpThreshold = 3; 

    const [arrowOpacity, setArrowOpacity] = useState(0.9);

    useEffect(() => {
        // NOTE : save as refs refer than use effect deps to prevent interval resets
        cameraRef.current = camera;
        targetPosRef.current = targetPos;
        hideAngleRef.current = hideArrowAngle;
        fixedPositionRef.current = fixedPosition;
    }, [camera, targetPos, hideArrowAngle, fixedPosition]);

    useEffect(() => {
        // NOTE: must be retrieved through event as alpha cant be read directly 
        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                deviceOrientationAlpha.current = event.alpha;
            }
        };

        window.addEventListener("deviceorientation", handleOrientation);
        return () => window.removeEventListener("deviceorientation", handleOrientation);
    }, []);

    useEffect(() => {
        // calculates the angle between two 3D points in the XZ plane
        const getBearingToTarget = (from: THREE.Vector3, to: THREE.Vector3): number => {
            const dx = to.x - from.x;
            const dz = to.z - from.z;
            return THREE.MathUtils.radToDeg(Math.atan2(dx, dz));
        };

        // calculates the corrected angle based on device orientation
        const getCorrectedAngle = (bearing: number, alpha: number): number => {
            const yaw = (alpha + 360) % 360; // normalize the alpha (yaw)
            return (yaw - bearing + 90 + 360) % 360;
        };

        // prevents angle wraparounds causing visible jitter
        const getSmoothedAngle = (current: number, target: number): number => {
            let delta = target - current;
            if (delta > 180) delta -= 360;
            else if (delta < -180) delta += 360;
            return current + delta * 0.15;
        };

         // calculate the screen position for the arrow based on the angle
        const getScreenPosition = (angleDeg: number): { top: number; left: number } => {
            const margin = 5;
            const screenLength = 100 - 2 * margin;
            // convert angle to radians and adjust for the arrow position
            const angleRad = (THREE.MathUtils.degToRad(angleDeg) + Math.PI / 4 + 2 * Math.PI) % (2 * Math.PI);
            const norm = angleRad / (2 * Math.PI); // normalize the angle
            // calculate distance around the screen edge using the screen length
            const perimeter = 2 * (screenLength * 2);
            const dist = norm * perimeter;

            // determine top and left relative positions based on distance
            if (dist < screenLength)
                return { top: margin, left: margin + dist }; // top
            else if (dist < screenLength * 2)
                return { top: margin + (dist - screenLength), left: 100 - margin }; // right
            else if (dist < screenLength * 3)
                return { top: 100 - margin, left: 100 - margin - (dist - (screenLength * 2)) }; // bottom
            return { top: 100 - margin - (dist - (screenLength * 3)), left: margin }; // left
        };

        const cameraPos = new THREE.Vector3();

        const update = () => {
            const currentTarget = targetPosRef.current;
            const currentCamera = cameraRef.current;

            if (!currentTarget || !currentCamera) {
                setIsVisible(false);
                return;
            }

            currentCamera.getWorldPosition(cameraPos);

            // get camera world position
            const distJump = lastTargetRef.current.distanceTo(currentTarget);
            if (distJump > jumpThreshold) {
                setAngle((prev) => prev * 0.3);
            }
            lastTargetRef.current = currentTarget.clone();

            const bearing = getBearingToTarget(cameraPos, currentTarget);
            const corrected = getCorrectedAngle(bearing, deviceOrientationAlpha.current);

            if (hideAngleRef.current > 0) {
                let delta = corrected % 360;
                if (delta > 180) delta -= 360;
                else if (delta < -180) delta += 360;
                setIsVisible(Math.abs(delta) > hideAngleRef.current);
            } else {
                setIsVisible(true);
            }

            setAngle((prevAngle) => getSmoothedAngle(prevAngle, corrected));

            if (fixedPositionRef.current) {
                setScreenPosition({ top: 95, left: 50 });
            } else {
                setScreenPosition(getScreenPosition(corrected));
            }

            // Calculate distance to target object
            const dist = cameraPos.distanceTo(new THREE.Vector3(
                currentTarget.x, cameraPos.y, currentTarget.z   
            ));

            // Adjust opacity based on distance
            let opacity = 0.6;
            if (dist < 3) opacity = 0.2;
            else if (dist > 30) opacity = 1.0;
            setArrowOpacity(prev => prev + (opacity - prev) * 0.15);
        };

        const id = setInterval(update, 100);
        return () => clearInterval(id);
    }, []);

    // convert percentage position to pixels
    const computedTopPx = (screenPosition.top / 100) * window.innerHeight + headerOffset;

    // Clamp so arrow never leaves the screen
    const finalTopPx = Math.min(
        window.innerHeight - 60,  
        Math.max(headerOffset + 10, computedTopPx)
    );

    return (
        <div
            style={{
                position: "absolute",
                top: `${finalTopPx}px`,
                left: `${screenPosition.left}%`,
                transform: `translate(-50%, -50%) rotate(${angle - 45}deg)`,
                transition: "transform 0.1s linear, top 0.1s linear, left 0.1s linear",
                zIndex: 2147483647, 
                pointerEvents: "none",
                opacity: arrowOpacity,
                display: isVisible ? "block" : "none"
            }}
        >
            <i 
                className="fas fa-location-arrow"
                style={{
                    color,
                    opacity: arrowOpacity,
                    transition: "opacity 0.25s ease-in-out"
                }}
            ></i>
        </div>
    );
};

export default DirectionalArrow;