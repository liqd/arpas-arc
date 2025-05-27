import * as THREE from "three";
import useCompassHeading from "./useCompassHeading";
import useCompassReference from "./useCompassReference";

export function useCombinedCompass(camera: THREE.Camera, snapAngle = Math.PI / 2, smoothingFactor = 1) {

    const [compassHeading, compassCardinal, phoneTilt] = useCompassHeading();
    const [referenceCompassHeading] = useCompassReference(compassHeading ?? 0, phoneTilt, camera);

    return {
        compassHeading,
        compassCardinal,
        phoneTilt,
        referenceCompassHeading
    };
}
