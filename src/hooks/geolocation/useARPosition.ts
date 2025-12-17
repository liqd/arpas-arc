import { useEffect, useMemo, useState } from "react";
import { Position } from "../../types/transform";
import { useWorldPosition } from "../../hooks";
import { useObjectPositionStore } from "../../store/objectPositionStore";
import useLocationStore from "../../store/locationStore";
import * as THREE from "three";
import { ObjectData } from "../../types/objectData";

interface Params {
    scene: {
        objects: ObjectData[];
    };
    selectedObject: number | null;
    selectedVariants: Record<number, number>;
    camera: THREE.Camera;
    fixedWorldPosition: Position | null;
}

export default function useARPosition({
    scene,
    selectedObject,
    selectedVariants,
    camera,
    fixedWorldPosition
}: Params) {

    // GPS world position
    const [worldPosition] = useWorldPosition(20, 2);

    // Position store helpers
    const { computeAndSetObjectPosition, getStoredPosition } = useObjectPositionStore();
    const getPosition = useLocationStore(state => state.getPosition);

    // Compute world GPS positions of all objects
    useEffect(() => {
        if (!scene?.objects) return;

        scene.objects.forEach(obj => {
            const variantId = selectedVariants[obj.id];
            const variant = obj.variants.find(v => v.id === variantId) ?? obj.variants[0];
            
            if (!variant) return;
                
            computeAndSetObjectPosition(obj, variant, getPosition);
             
        });
    }, [scene.objects, selectedVariants, getPosition, computeAndSetObjectPosition]);

    // get selected object data
    const selectedObjectData = useMemo(() => {
        return selectedObject
            ? scene.objects?.find(obj => obj.id === selectedObject)
            : null;
    }, [selectedObject, scene.objects]);

    // World position of selected object
    const targetWorldPos = useMemo(() => {
        if (!selectedObjectData) return new Position(0, 0, 0);
        return getStoredPosition(selectedObjectData.id) ?? new Position(0, 0, 0);
    }, [selectedObjectData]);

    // Local AR-relative position
    const targetPos = useMemo(() => {
        if (!selectedObjectData) return new Position(0, 0, 0);

        if (worldPosition.x === 0 && worldPosition.z === 0)
            return new Position(0, 0, 0);

        const reference = fixedWorldPosition ?? worldPosition;
        return targetWorldPos.substractedPosition(reference);

    }, [
        selectedObjectData,
        fixedWorldPosition,
        worldPosition.x, worldPosition.z,
        targetWorldPos.x, targetWorldPos.z
    ]);

    // World Camera Position
    const cameraWorldPos = useMemo(() => {
        return worldPosition.clone().add(new Position(
            camera.position.x,
            camera.position.y,
            camera.position.z
        ));
    }, [camera.position.x, camera.position.y, camera.position.z, worldPosition]);


    return {
        worldPosition,
        cameraWorldPos,
        targetWorldPos,
        targetPos,
    };
}