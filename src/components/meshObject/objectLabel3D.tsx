import { useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Position } from "../../types/transform";
import { RoundedPlane } from "..";

interface ObjectLabel3DProps {
  text: string;
  position: Position;
  cameraOffset?: number; 
}

const ObjectLabel3D = ({ text, position, cameraOffset = 0 }: ObjectLabel3DProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    // Adjust label scale based on camera distance
    useFrame(() => {
        if (!groupRef.current) return;

        const labelWorldPos = new THREE.Vector3(
            position.x,
            position.y,
            position.z
        );

        const distance = camera.position.distanceTo(labelWorldPos);

        // Scale between 1.8 and 4.5 based on distance (adjust factors as needed)
        const scale = THREE.MathUtils.clamp(distance * 0.8, 3.5, 8);
        groupRef.current.scale.setScalar(scale);
    });

    return (
        <group ref={groupRef} position={position.toArray()}>
        <RoundedPlane
            width={Math.max(2.5, text.length * 0.3)}
            height={0.9}
            radius={0.3}
            color="black"
            opacity={0.85}
            alwaysFaceCamera
        >
            <Text
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
            position={[0, 0, 0.002]}
            maxWidth={2.2}
            textAlign="center"
            >
            {text}
            </Text>
        </RoundedPlane>
        </group>
    );
};

export default ObjectLabel3D;