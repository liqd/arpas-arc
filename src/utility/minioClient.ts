import { S3Client } from "@aws-sdk/client-s3";

const minioClient = new S3Client({
  endpoint: import.meta.env.VITE_MINIO_ENDPOINT,
  region: import.meta.env.VITE_MINIO_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_MINIO_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // Required for MinIO
});

export default minioClient;
