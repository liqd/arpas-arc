import { forwardRef, memo, useRef } from "react"
import { ThreeElements, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Mesh } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/Addons.js"

interface ReticleMeshProps extends Omit<ThreeElements["mesh"], "color"> {
    color?: THREE.Color | string;
}

const ReticleMesh = forwardRef<Mesh, ReticleMeshProps>((props, ref) => {
    const geometry_merged = BufferGeometryUtils.mergeGeometries([
        new THREE.RingGeometry(0.05, 0.06, 30),
        new THREE.CircleGeometry(0.007, 12),
    ]).rotateX(-Math.PI * 0.5);

    return (
        <mesh ref={ref} geometry={geometry_merged} {...props}>
            <meshBasicMaterial side={THREE.DoubleSide} color={props.color} />
        </mesh>
    );
});

const Reticle = memo(({ hitTestMatrix }: { hitTestMatrix: THREE.Matrix4 | undefined }) => {
    const ref = useRef<Mesh>(null);

    useFrame(() => {
        if (ref.current == null)
            return;

        if (hitTestMatrix != null) {
            ref.current.visible = true;
            ref.current.position.setFromMatrixPosition(hitTestMatrix);
            ref.current.quaternion.setFromRotationMatrix(hitTestMatrix);
        } else {
            ref.current.visible = false;
        }
    });

    return <ReticleMesh ref={ref} visible={false} />
});

export default Reticle;