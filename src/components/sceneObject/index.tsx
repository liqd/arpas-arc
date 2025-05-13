import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

const modelPath = import.meta.env.BASE_URL + "/gltfModels/bench/scene.gltf";
useGLTF.preload(modelPath);

interface SceneObjectProps {
    position?: THREE.Vector3;
    rotation?: THREE.Euler;
    scale?: THREE.Vector3;
}

const SceneObject: React.FC<SceneObjectProps> = ({
    position = new THREE.Vector3(),
    rotation = new THREE.Euler(),
    scale = new THREE.Vector3(1, 1, 1),
    ...props
}) => {
    const { nodes, materials } = useGLTF(modelPath);
    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.polySurface38_lambert1_0.geometry}
                material={materials.lambert1}
            />
        </group>
    );
};

export default SceneObject;
