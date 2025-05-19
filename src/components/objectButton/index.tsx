import React, { useMemo }  from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import RoundedPlane from "../roundedPlane";
import { Position, Rotation } from "../../utility/transform";

export interface ObjectButtonProps {
    position: Position;
    rotation?: Rotation;
    width?: number;
    height?: number;
    radius?: number;
    color?: string;
    hoverColor?: string;
    alwaysFaceCamera? : boolean;
    text?: string;
    onClick: () => void;
};

const ObjectButton: React.FC<ObjectButtonProps> = ({
    position = new Position(), 
    rotation = new Rotation(), 
    width = 5, height = 1, radius = 5, 
    color = "#ffffff", hoverColor = "#ff5555", 
    alwaysFaceCamera = false,
    text = "Button", 
    onClick = () => console.log("Button clicked.")
}) => {

    return (
        <RoundedPlane
            position={position}
            rotation={rotation}
            width={width}
            height={height}
            radius={radius}
            color={color}
            hoverColor={hoverColor}
            alwaysFaceCamera={alwaysFaceCamera}
            onClick={onClick}
        >
            <Text fontSize={0.335} position={new THREE.Vector3(0, 0, 0.0001)}>
                {text}
                <meshStandardMaterial color="black" />
            </Text>
        </RoundedPlane>
    );
};

export default ObjectButton;
