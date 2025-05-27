import { MinioData } from "../types/databaseData";

export const MinioMockData: MinioData = {
    endpoint: import.meta.env.VITE_MINIO_ENDPOINT,
    region: import.meta.env.VITE_MINIO_REGION,
    accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY,
    secretKey: import.meta.env.VITE_MINIO_SECRET_KEY
}