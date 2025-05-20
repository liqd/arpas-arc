interface ImportMetaEnv {
    readonly BASE_URL: string;
    readonly VITE_MINIO_ENDPOINT: string;
    readonly VITE_MINIO_REGION: string;
    readonly VITE_MINIO_ACCESS_KEY: string;
    readonly VITE_MINIO_SECRET_KEY: string;
    readonly VITE_PUBLIC_NOAA_API_KEY: string;

    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly MODE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
