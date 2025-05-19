import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Euler, Vector3 } from "three";
import * as THREE from "three";

const Compass3D = ({ heading }: { heading: number }) => {
    const compassRef = useRef<THREE.Mesh>(null);

    useFrame(({ camera }) => {
        if (compassRef.current) {
            // Position the compass slightly below the camera
            const offset = new Vector3(0, -0.5, 0); // Adjust height as needed
            const worldPosition = camera.position.clone().add(offset);
            compassRef.current.position.copy(worldPosition);

            // Rotate the compass to face upwards (parallel to the ground)
            compassRef.current.rotation.set(Math.PI / 2, 0, 0);

            // Rotate to face north
            compassRef.current.rotation.z = -heading * (Math.PI / 180); // Convert degrees to radians
        }
    });

    return (
        <mesh ref={compassRef}>
            <circleGeometry args={[0.2, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>
    );
};

export default Compass3D;
