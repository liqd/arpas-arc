import React, { useMemo, useState, JSX } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Position, Rotation, Scale } from "../../types/transform";

interface RoundedPlaneProps {
    position?: Position;
    rotation?: Rotation;
    scale?: Scale;
    width?: number;
    height?: number;
    radius?: number;
    segments?: number;
    color?: string;
    hoverColor?: string;
    opacity?: number;
    transparent?: boolean;
    depthWrite?: boolean;
    alwaysFaceCamera?: boolean;
    onlyFaceCameraAroundY?: boolean;
    onClick?: (event: THREE.Event) => void;
    children?: string | JSX.Element | JSX.Element[];
}

const RoundedPlane: React.FC<RoundedPlaneProps> = ({
    position = new Position(),
    rotation = new Rotation(),
    scale = new Scale(),
    width = 1,
    height = 1,
    radius = 0.1,
    segments = 8,
    color = "white",
    hoverColor,
    opacity = 1,
    transparent = false,
    depthWrite = true,
    alwaysFaceCamera = false,
    onlyFaceCameraAroundY = true,
    onClick,
    children,
    ...props
}) => {
    const [hovered, setHovered] = useState(false);

    const shape = useMemo(() => {
        const r = Math.min(radius, width / 2, height / 2);
        const shape = new THREE.Shape();

        shape.moveTo(-width / 2 + r, -height / 2);
        shape.lineTo(width / 2 - r, -height / 2);
        shape.quadraticCurveTo(width / 2, -height / 2, width / 2, -height / 2 + r);
        shape.lineTo(width / 2, height / 2 - r);
        shape.quadraticCurveTo(width / 2, height / 2, width / 2 - r, height / 2);
        shape.lineTo(-width / 2 + r, height / 2);
        shape.quadraticCurveTo(-width / 2, height / 2, -width / 2, height / 2 - r);
        shape.lineTo(-width / 2, -height / 2 + r);
        shape.quadraticCurveTo(-width / 2, -height / 2, -width / 2 + r, -height / 2);

        return shape;
    }, [width, height, radius]);

    const geometry = useMemo(() => new THREE.ShapeGeometry(shape, segments), [shape, segments]);

    const { camera } = useThree();
    const planeRef = React.useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (planeRef.current) {
            if (alwaysFaceCamera) {
                if (onlyFaceCameraAroundY) {
                    const cameraPosition = camera.position.clone();
                    cameraPosition.y = planeRef.current.position.y;
                    planeRef.current.lookAt(cameraPosition);
                } else {
                    planeRef.current.lookAt(camera.position);
                }
            } else {
                // Apply manual rotation
                planeRef.current.rotation.set(
                    THREE.MathUtils.degToRad(rotation.x + 90),
                    THREE.MathUtils.degToRad(rotation.y),
                    THREE.MathUtils.degToRad(rotation.z)
                );
            }
        }
    });


    return (
        <mesh
            ref={planeRef}
            geometry={geometry}
            position={position.toArray()}
            scale={scale.toArray()}
            onClick={onClick}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <meshStandardMaterial
                color={hovered && hoverColor ? hoverColor : color}
                transparent={transparent || opacity < 1}
                opacity={opacity}
                depthWrite={depthWrite}
                side={THREE.DoubleSide}
            />
            {children}
        </mesh>
    );
};

export default RoundedPlane;
