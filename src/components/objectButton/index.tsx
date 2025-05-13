import React, { useMemo }  from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import RoundedPlane from "../roundedPlane";

export interface ObjectButtonProps {
    position: THREE.Vector3;
    rotation?: THREE.Euler;
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
    position = new THREE.Vector3(), 
    rotation = new THREE.Euler(), 
    width = 5, height = 1, radius = 5, 
    color = "#ffffff", hoverColor = "#ff5555", 
    alwaysFaceCamera = false,
    text = "Button", 
    onClick = () => console.log("Button clicked.")
}) => {

    // Compute rotation only if alwaysFaceCamera is true
    const { camera } = useThree();
    const adjustedRotation = useMemo(() => {
        if (!alwaysFaceCamera) return rotation;
        
        const dummy = new THREE.Object3D();
        dummy.position.copy(position);
        dummy.lookAt(new THREE.Vector3(camera.position.x, position.y, camera.position.z));
        
        return new THREE.Euler().setFromQuaternion(dummy.quaternion);
    }, [camera.position, position, alwaysFaceCamera]);

    return (
        <RoundedPlane
            position={position}
            rotation={adjustedRotation}
            width={width}
            height={height}
            radius={radius}
            color={color}
            hoverColor={hoverColor}
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
