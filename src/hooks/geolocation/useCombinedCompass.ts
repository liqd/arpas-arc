import * as THREE from "three";
import useCompassHeading from "./useCompassHeading";
import useWorldRotationReference from "./useWorldRotationReference";

export function useCombinedCompass(camera: THREE.Camera) {

    const [compassHeading, smoothedHeading, compassCardinal, phoneTilt] = useCompassHeading();
    const [currentRotation, rotationReference] = useWorldRotationReference(compassHeading, smoothedHeading, phoneTilt, camera);

    return {
        compassHeading,
        smoothedHeading,
        compassCardinal,
        phoneTilt,
        currentRotation,
        rotationReference
    };
}
