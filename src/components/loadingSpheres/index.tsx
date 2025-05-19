import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { Position, Scale } from "../../types/transform";

const LoadingSpheres = ({ position, scale }:
    {
        position: Position,
        scale: Scale,
    }) => {
    const groupRef = useRef<THREE.Group>(null); // Reference for the entire group
    const spheresRef = useRef<THREE.Mesh[]>([]); // Array of refs for individual spheres
    const rotationRef = useRef(0); // Reference for frame-based animation timing

    // Update the animation on every frame
    useFrame(() => {
        rotationRef.current += 0.02; // Increment rotation for smoother animation
        if (spheresRef.current.length) {
            const time = rotationRef.current;

            spheresRef.current.forEach((sphere, index) => {
                const angle = time + (index * (Math.PI / 2)); // Offset each sphere's motion
                const radius = 0.6; // Distance of spheres from the center

                // Each sphere orbits in 3D space using sin/cos oscillations for all axes
                sphere.position.set(
                    Math.sin(angle) * radius, // X axis motion
                    Math.sin(angle * 1.5) * radius, // Y axis motion
                    Math.cos(angle) * radius // Z axis motion
                );
            });
        }

        if (groupRef.current) {
            groupRef.current.rotation.y += 0.01; // Gradually rotate the entire group around the Y-axis
        }
    });

    return (
        <group ref={groupRef} position={position.toArray()} scale={scale.toArray()}> {[0, 1, 2, 3].map((index) => (
            <mesh
                key={index}
                ref={(el) => (spheresRef.current[index] = el!)} // Assign each sphere to the array
            >
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color={getColor(index)} />
            </mesh>
        ))}
        </group>
    );
};

// Helper function to pick a color for each sphere
const getColor = (index: number): string => {
    const colors = ["red", "green", "blue", "yellow"];
    return colors[index % colors.length];
};

export default LoadingSpheres;
