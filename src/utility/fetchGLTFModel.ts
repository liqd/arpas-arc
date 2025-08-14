import { GetObjectCommand } from "@aws-sdk/client-s3";
import minioClient from "./minioClient";
import { MinioData } from "../types/databaseData";

// Cache to store Blob URLs and instance counts for models
const modelCache = new Map<string, { blobUrl: string; instances: number }>();
const loadingModels = new Map<string, Promise<string>>(); // Track models currently being loaded

export const fetchGLTFModel = async (modelId: string, presignedUrl: string): Promise<{ wasCached: boolean; }> => {
    const cacheKey = modelId;

    const cachedOrLoading = await getCachedOrLoadingModel(modelId, cacheKey);
    if (cachedOrLoading) return { wasCached: true };

    // Create a promise for the loading process and store it in loadingModels
    const loadPromise = (async () => {
        try {
            if (!presignedUrl) {
                throw new Error("Presigned URL not found!");
            }

            // Fetch the GLTF file from the presigned URL
            const response = await fetch(presignedUrl);
            if (!response.ok) {
                throw new Error("Failed to fetch model from presigned URL!");
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            modelCache.set(cacheKey, { blobUrl, instances: 1 }); // Add to cache
            return blobUrl;
        } finally {
            // Remove the modelId from loadingModels once loading is complete
            loadingModels.delete(modelId);
        }
    })();

    loadingModels.set(modelId, loadPromise); // Store the promise in loadingModels
    return { wasCached: false };
};

export const fetchGLTFModelFromMinio = async (modelId: string, minioData: MinioData): Promise<{ blobUrl: Promise<string>; wasCached: boolean }> => {
    const cacheKey = modelId;

    const cachedOrLoading = await getCachedOrLoadingModel(modelId, cacheKey);
    if (cachedOrLoading) return { blobUrl: Promise.resolve(cachedOrLoading), wasCached: true };

    // Create a promise for the loading process and store it in loadingModels
    const loadPromise = (async () => {
        try {
            const { bucket, key } = getBucketAndKeyFromString(modelId);
            const command = new GetObjectCommand({ Bucket: bucket, Key: key });
            const response = await minioClient(minioData).send(command);

            if (!response.Body) {
                throw new Error("Model not found!");
            }

            const blob = await new Response(response.Body).blob();
            const blobUrl = URL.createObjectURL(blob);
            console.log(`Blob URL for ${key} file created:`, blobUrl);

            modelCache.set(cacheKey, { blobUrl, instances: 1 }); // Add to cache
            return blobUrl;
        } finally {
            // Remove the modelId from loadingModels once loading is complete
            loadingModels.delete(modelId);
        }
    })();

    loadingModels.set(modelId, loadPromise); // Store the promise in loadingModels
    return { blobUrl: loadPromise, wasCached: false };
};

const getCachedOrLoadingModel = async (modelId: string, cacheKey: string) => {
    // Check if the model is currently being loaded or cached
    if (loadingModels.has(modelId)) {
        console.log(`Model ${modelId} is already being loaded. Waiting for existing promise.`);
        const blobUrl = await loadingModels.get(modelId)!;
        console.log(`Model ${modelId} was successfully loaded and found in the cache after waiting for existing promise.`);
        return blobUrl;
    }

    // Check if the model is already cached
    if (modelCache.has(cacheKey)) {
        const cachedEntry = modelCache.get(cacheKey)!;
        cachedEntry.instances += 1;
        console.log(`Cache hit for model: ${cacheKey}. Active instances: ${cachedEntry.instances}`);
        return cachedEntry.blobUrl;
    }

    // Cache miss: Fetch the model from the database
    console.log(`Cache miss for model: ${cacheKey}.`);

    return null;
};

// Decrement instance count and clean up if all instances are removed
export const releaseGLTFModel = (modelId: string): void => {
    const cacheKey = modelId;

    if (modelCache.has(cacheKey)) {
        const cachedEntry = modelCache.get(cacheKey)!;
        cachedEntry.instances -= 1; // Decrement instance count
        console.log(`Instance removed for model: ${cacheKey}. Remaining instances: ${cachedEntry.instances}`);

        // If no more instances remain, clean up the cache
        if (cachedEntry.instances <= 0) {
            console.log(`No more instances for model: ${cacheKey}. Cleaning up...`);
            URL.revokeObjectURL(cachedEntry.blobUrl); // Free up memory
            modelCache.delete(cacheKey); // Remove from cache
        }
    } else {
        console.warn(`Attempted to release model ${cacheKey}, but it was not found in the cache.`);
    }
};

// Utility function to extract bucket and key from a string
export function getBucketAndKeyFromString(bucketAndKey: string): { bucket: string; key: string } {
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