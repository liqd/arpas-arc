import React, { useMemo, useState, JSX } from "react";
import * as THREE from "three";

interface RoundedPlaneProps {
    position?: THREE.Vector3 | [x: number, y: number, z: number] | undefined,
    rotation?: THREE.Euler | [x: number, y: number, z: number] | undefined,
    scale?: THREE.Vector3 | [x: number, y: number, z: number] | undefined,
    width?: number;
    height?: number;
    radius?: number;
    segments?: number;
    color?: string;
    hoverColor?: string;
    opacity?: number;
    transparent?: boolean;
    depthWrite?: boolean;
    onClick?: (event: THREE.Event) => void;
    children?: string | JSX.Element | JSX.Element[];
}

const RoundedPlane: React.FC<RoundedPlaneProps> = ({
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
    scale = new THREE.Vector3(1, 1, 1),
    width = 1,
    height = 1,
    radius = 0.1,
    segments = 8,
    color = "white",
    hoverColor,
    opacity = 1,
    transparent = false,
    depthWrite = true,
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

    return (
        <mesh
            geometry={geometry}
            position={position}
            rotation={rotation}
            scale={scale}
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
