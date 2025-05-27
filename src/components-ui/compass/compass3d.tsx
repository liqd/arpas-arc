import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Compass3D = ({ headingInRad, camera }: { headingInRad: number, camera: THREE.Camera }) => {
    const compassRef = useRef<THREE.Group>(null);
    const needleRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (needleRef.current) {
            needleRef.current.rotation.z = -headingInRad;
        }
    });

    return (
        <group ref={compassRef} position={[camera.position.x, 0, camera.position.z]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh>
                <torusGeometry args={[0.125, 0.005, 8, 30]} />
                <meshStandardMaterial color="gray" metalness={1} roughness={0.7} />
            </mesh>

            <group ref={needleRef}>
                <mesh position={[0, -0.05, 0]}>
                    <cylinderGeometry args={[0.04, 0, 0.1, 8]} />
                    <meshStandardMaterial color="red" metalness={1} roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.05, 0]}>
                    <cylinderGeometry args={[0, 0.04, 0.1, 8]} />
                    <meshStandardMaterial color="blue" metalness={1} roughness={0.8} />
                </mesh>
            </group>
        </group>
    );
};

export default Compass3D;
