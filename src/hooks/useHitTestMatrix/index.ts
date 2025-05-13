import { RefObject, useCallback, useRef, useState } from "react";
import { useXRHitTest } from "@react-three/xr";
import { Matrix4 } from "three";

export type HitTestResults = {
    none: Matrix4 | undefined;
    left: Matrix4 | undefined;
    right: Matrix4 | undefined;
};

export default function useHitTestMatrix(): [HitTestResults, RefObject<HitTestResults>] {
    const [hitTestMatrix, setHitTestMatrix] = useState<HitTestResults>({
        left: undefined,
        right: undefined,
        none: undefined,
    });

    const hitTestMatricesRef = useRef(hitTestMatrix);

    const onHitTestResult = useCallback((
        handedness: XRHandedness,
        results: XRHitTestResult[],
        getWorldMatrix: (target: Matrix4, hit: XRHitTestResult) => void
    ) => {
        if (results.length === 0) return;

        const matrix = hitTestMatricesRef.current[handedness] ?? new Matrix4();
        getWorldMatrix(matrix, results[0]);
        hitTestMatricesRef.current = { ...hitTestMatricesRef.current, [handedness]: matrix };
        setHitTestMatrix(hitTestMatricesRef.current);
    }, []);

    useXRHitTest(onHitTestResult.bind(null, "none"), "viewer");

    return [hitTestMatrix, hitTestMatricesRef] as const;
}
