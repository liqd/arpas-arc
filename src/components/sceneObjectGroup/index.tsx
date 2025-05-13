import React from "react";
import * as THREE from "three";
import SceneObject from "../sceneObject";
import ObjectButton, { ObjectButtonProps } from "../objectButton";
import { QuadraticBezierLine } from "@react-three/drei";

export interface SceneObjectGroupProps {
    id: number;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    text?: string;
    buttons?: ObjectButtonProps[]
}

const SceneObjectGroup: React.FC<SceneObjectGroupProps> = ({ 
    id, 
    position = new THREE.Vector3(), 
    rotation = new THREE.Euler(), 
    scale = new THREE.Vector3(1, 1, 1),
    buttons = [] 
}) => {
    return (
        <group position={position} rotation={rotation} scale={scale}>
            <SceneObject />
            {buttons?.map((btn, index) => (
                <>
                    <ObjectButton key={index} {...btn} />
                    <QuadraticBezierLine
                        key={`line-${index}`}
                        start={new THREE.Vector3()}
                        end={btn.position}
                        lineWidth={4}
                        color={btn.color}
                    />
                </>
            ))}
        </group>
    );
};

export default SceneObjectGroup;
