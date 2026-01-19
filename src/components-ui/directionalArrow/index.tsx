import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Position } from "../../types/transform";

const DirectionalArrow = ({
    worldRotationRad = 0,
    worldPosition,
    camera,
    targetPosition,
    distanceToPosition = 0,
    hideArrowAngle = 15,
    nearDistance = 6,
    fixedPosition = false,
    color = "red",
    size = 40,
    headerOffset = 0  
}: {
    worldRotationRad?: number,
    worldPosition?: Position,
    camera: THREE.Camera,
    targetPosition: Position,
    distanceToPosition?: number | null,
    hideArrowAngle?: number,
    nearDistance: number,
    fixedPosition: boolean,
    color?: string
    size?: string | number
    headerOffset?: number
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [angle, setAngle] = useState(0);
    const [screenPosition, setScreenPosition] = useState({ top: 0, left: 0 });
    const [arrowOpacity, setArrowOpacity] = useState(0.9);

    const worldRotRef = useRef(worldRotationRad);
    const worldPosRef = useRef<Position | undefined>(worldPosition);
    const distanceRef = useRef<number | null | undefined>(distanceToPosition);
    const cameraRef = useRef(camera);
    const targetPosRef = useRef(targetPosition);
    const hideAngleRef = useRef(hideArrowAngle);
    const fixedPositionRef = useRef(fixedPosition);

    const lastTargetRef = useRef(targetPosition.clone());
    const jumpThreshold = 3; 

    useEffect(() => {
        // NOTE : save as refs refer than use effect deps to prevent interval resets
        cameraRef.current = camera;
        targetPosRef.current = targetPosition;
        hideAngleRef.current = hideArrowAngle;
        fixedPositionRef.current = fixedPosition;
    }, [camera, targetPosition, hideArrowAngle, fixedPosition]);

    useEffect(() => {
        worldRotRef.current = worldRotationRad ?? 0;
        worldPosRef.current = worldPosition;
    }, [worldRotationRad, worldPosition]);

    useEffect(() => {
        distanceRef.current = distanceToPosition;
    }, [distanceToPosition]);

    useEffect(() => {
        // calculates the angle between two 3D points in the XZ plane
        const getBearingToTarget = (from: THREE.Vector3, to: THREE.Vector3) => {
            const dx = to.x - from.x;
            const dz = to.z - from.z;

            // ARCamera looks down -Z, also bearing = angle in XZ-plane
            const rad = Math.atan2(dx, dz); // wichtig!
            let deg = THREE.MathUtils.radToDeg(rad);

            // Normalize 0–360
            return deg;
        };

        // calculates the angle based on camera rotation
        const getCameraYaw = (camera: THREE.Camera) => {
            // Extract camera's world rotation
            const quaternion = new THREE.Quaternion();
            camera.getWorldQuaternion(quaternion);
            
            // Convert to Euler angles to get yaw (Y-axis rotation)
            const euler = new THREE.Euler();
            euler.setFromQuaternion(quaternion, 'YXZ');
            
            // Convert yaw to degrees and normalize to 0-360
            let yawDeg = THREE.MathUtils.radToDeg(euler.y);
            return (yawDeg + 360) % 360;
        };

        // calculates the arrow rotation based on camera yaw and target bearing
        const getArrowRotation = (bearing: number, cameraYaw: number) => {
            // Arrow rotation = difference between camera direction and target direction
            const rotation = (cameraYaw - bearing + 90 + 360) % 360;
            return rotation;
        };

        // prevents angle wraparounds causing visible jitter
        const smoothAngle = (prev: number, next: number) => {
            let delta = next - prev;
            if (delta > 180) delta -= 360;
            else if (delta < -180) delta += 360;
            return prev + delta * 0.12;
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
        const applyWorldTransform = (local: Position): THREE.Vector3 => {
            const theta = worldRotRef.current ?? 0;
            const c = Math.cos(theta);
            const s = Math.sin(theta);
            const rx = local.x * c - local.z * s;
            const rz = local.x * s + local.z * c;
            const tx = (worldPosRef.current?.x ?? 0) + rx;
            const ty = (worldPosRef.current?.y ?? 0) + local.y;
            const tz = (worldPosRef.current?.z ?? 0) + rz;
            return new THREE.Vector3(tx, ty, tz);
        };

        const update = () => {
            const currentTarget = targetPosRef.current;
            const currentCamera = cameraRef.current;

            if (!currentTarget || !currentCamera) {
                setIsVisible(false);
                return;
            }

            currentCamera.getWorldPosition(cameraPos);

            // Transform target into scene/world coordinates to match ObjectScene root transform
            const targetWorld = applyWorldTransform(currentTarget);

            // Calculate distance to target object (flatten Y for distance gating) unless provided externally
            const computedDist = cameraPos.distanceTo(new THREE.Vector3(targetWorld.x, cameraPos.y, targetWorld.z));
            const dist = typeof distanceRef.current === 'number' ? distanceRef.current : computedDist;

            if (dist < nearDistance) {
                setIsVisible(false);
                return;
            }

            const bearing = getBearingToTarget(cameraPos, targetWorld);
            const cameraYaw = getCameraYaw(currentCamera);
            const arrowRotation = getArrowRotation(bearing, cameraYaw);

            if (hideAngleRef.current > 0) {
                let delta = arrowRotation % 360;
                if (delta > 180) delta -= 360;
                else if (delta < -180) delta += 360;
                setIsVisible(Math.abs(delta) > hideAngleRef.current);
            } else {
                setIsVisible(true);
            }

            setAngle(prev => smoothAngle(prev, arrowRotation));

            // Screen position
            if (fixedPositionRef.current) {
                setScreenPosition({ top: 95, left: 50 });
            } else {
                setScreenPosition(getScreenPosition(arrowRotation));
            }

            // Adjust opacity based on distance
            let opacity = 0.6;
            if (dist < 3) opacity = 0.2;
            else if (dist > 30) opacity = 1.0;
            setArrowOpacity(prev => prev + (opacity - prev) * 0.1);

            const distJump = lastTargetRef.current.distanceTo(currentTarget);
            if (distJump > jumpThreshold) {
                setAngle(prev => prev * 0.3);
            }
            lastTargetRef.current = currentTarget.clone();
        };

        const id = setInterval(update, 60);
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