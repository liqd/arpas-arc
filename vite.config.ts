import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/ARPAS_XR/',
    plugins: [react()],
    server: {
        port: 3000,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type'],
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
        },
        allowedHosts: [
            'akita-awake-oarfish.ngrok-free.app'
        ]
    }
});
