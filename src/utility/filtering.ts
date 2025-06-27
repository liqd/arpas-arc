/**
 * Removes outliers from a numeric array using the Interquartile Range (IQR) method.
 * Values outside 1.5 * IQR from the first and third quartiles are excluded.
 * @param values Array of numbers to filter.
 * @returns Filtered array with outliers removed.
 */
export function removeOutliers(values: number[]): number[] {
    if (values.length < 4) return values;
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    return values.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr);
}

/**
 * Calculates the weighted moving average of a numeric array.
 * More recent values are given higher weights.
 * @param values Array of numbers to average.
 * @returns Weighted average of the input values.
 */
export function getWeightedAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const weights = values.map((_, i) => i + 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    return values.reduce((sum, v, i) => sum + v * weights[i], 0) / totalWeight;
}

/**
 * Calculates the exponential moving average (EMA) of a numeric array.
 * The EMA gives more weight to recent values, controlled by the smoothing factor.
 * @param values Array of numbers to smooth.
 * @param smoothingFactor Value between 0 and 1; higher values give more weight to recent data (default: 0.2).
 * @returns The exponential moving average of the input values.
 */
export const getExponentialMovingAverage = (values: number[], smoothingFactor = 0.2): number => {
    if (values.length === 0) return 0;
    return values.reduce((ema, v) => (smoothingFactor * v) + ((1 - smoothingFactor) * ema), values[0]);
};

/**
 * Calculates the median value of a numeric array.
 *
 * The median is the middle number in a sorted, ascending or descending, list of numbers.
 * If the array has an even number of elements, the median is the average of the two middle numbers.
 * If the array is empty, the function returns 0.
 *
 * @param values - An array of numbers to compute the median from.
 * @returns The median value of the input array, or 0 if the array is empty.
 */
export function getMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}