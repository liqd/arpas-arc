import { GetObjectCommand } from "@aws-sdk/client-s3";
import minioClient from "./minioClient";

// Cache to store Blob URLs and instance counts for models
const modelCache = new Map<string, { blobUrl: string; instances: number }>();

export const fetchGLTFModel = async (modelId: string): Promise<string> => {
    try {
        // Generate a unique cache key
        const cacheKey = modelId;

        // Check if the model is already in the cache
        if (modelCache.has(cacheKey)) {
            const cachedEntry = modelCache.get(cacheKey)!;
            
            // Increment instance count
            cachedEntry.instances += 1;
            console.log(`Cache hit for model: ${cacheKey} with ${cachedEntry.instances} entry/ies.`);
            return cachedEntry.blobUrl; // Return the cached Blob URL
        }

        // Cache miss: Fetch the model from database
        console.log(`Cache miss for model: ${cacheKey}. Fetching from database...`);


        const {bucket, key} = getBucketAndKeyFromString(modelId);
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await minioClient.send(command);

        if (!response.Body) {
            throw new Error("Model not found!");
        }

        // Convert the response to a Blob and create a Blob URL
        const blob = await new Response(response.Body).blob();
        const blobUrl = URL.createObjectURL(blob);
        console.log(`Blob URL for ${key} file created:`, blobUrl);

        // Store the Blob URL and instance count in the cache
        modelCache.set(cacheKey, { blobUrl, instances: 1 });
        return blobUrl;
    } catch (error) {
        console.error("Error fetching .glb model:", error);
        throw error;
    }
};

// Decrement instance count and clean up if all instances are removed
export const releaseGLTFModel = (modelId: string): void => {
    const cacheKey = modelId;

    if (modelCache.has(cacheKey)) {
        const cachedEntry = modelCache.get(cacheKey)!;

        // Decrement instance count
        cachedEntry.instances -= 1;
        console.log(`Instance removed. Remaining instances: ${cachedEntry.instances}`);

        // If no more instances remain, clean up the cache
        if (cachedEntry.instances <= 0) {
            console.log(`No more instances for model: ${cacheKey}. Cleaning up...`);
            URL.revokeObjectURL(cachedEntry.blobUrl); // Free up memory
            modelCache.delete(cacheKey); // Remove from cache
        }
    }
};

export function getBucketAndKeyFromString(bucketAndKey: string): { bucket: string, key: string } {
    if (!bucketAndKey) {
        console.warn(`MeshId is empty. Could not extract bucket and key!`);
        return { bucket: "fallback", key: "meshObject" };
    }

    let bucket = "fallback"; // Default bucket
    let key = bucketAndKey; // Default key

    if (bucketAndKey.includes("/")) {
        const parts = bucketAndKey.split("/");
        bucket = parts[0]; // Get the first part as bucket
        key = parts.slice(1).join("/"); // Get the rest as key
    }

    return { bucket, key };
}