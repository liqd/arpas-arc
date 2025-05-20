
export function normalizeAngleDifference(angle1: number, angle2: number): number {
    const diff = Math.abs(angle1 - angle2);
    return Math.min(diff, 360 - diff);
};

export function normalizeClockwise(heading: number): number {
    return (360 - ((heading + 360) % 360)) % 360;
}