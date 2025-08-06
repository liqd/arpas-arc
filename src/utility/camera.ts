import * as THREE from "three";

/**
 * Returns the yaw (rotation around world Y/up axis) in degrees,
 * independent of pitch and roll.
 */
export function getCameraYawWorldY(camera: THREE.Camera): number {
    // Camera's forward vector in world space
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    // Project onto XZ plane (ignore Y)
    forward.y = 0;
    forward.normalize();
    // atan2(x, z) gives yaw in radians
    const yawRad = Math.atan2(forward.x, forward.z);
    // Convert to degrees and normalize to [0, 360)
    return 360 - (THREE.MathUtils.radToDeg(yawRad) + 540) % 360;
}