import { S3Client } from "@aws-sdk/client-s3";
import { MinioData } from "../types/databaseData";

const minioClient = (minioData: MinioData) => new S3Client({
  endpoint: minioData.endpoint,
  region: minioData.region,
  credentials: {
    accessKeyId: minioData.accessKey,
    secretAccessKey: minioData.accessKey,
  },
  forcePathStyle: true, // Required for MinIO
});

export default minioClient;
