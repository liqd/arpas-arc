import { MinioData } from "../types/databaseData";

export const MinioMockData: MinioData = {
    endpoint: import.meta.env.VITE_MINIO_ENDPOINT,
    region: import.meta.env.VITE_MINIO_REGION,
    allowed_buckets: import.meta.env.VITE_MINIO_ALLOWED_BUCKETS,
    accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY,
    secretKey: import.meta.env.VITE_MINIO_SECRET_KEY
}