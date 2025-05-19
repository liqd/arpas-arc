import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    base: "/static/",
    plugins: [react()],
    server: {
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
            'akita-awake-oarfish.ngrok-free.app',
            'allowed-normal-flea.ngrok-free.app'
        ]
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "ArpasArc",
            formats: ["es", "umd", "cjs"],
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: [
                "react",
                "react-dom",
                "three",
                "@react-three/drei",
                "@react-three/fiber",
                "@react-three/xr",
                "framer-motion",
                "react-icons",
                "react-router-dom",
                "zustand",
            ],
            output: {
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    "react": "React",
                    "react-dom": "ReactDOM",
                    "three": "THREE",
                    "@react-three/drei": "ReactThreeDrei",
                    "@react-three/fiber": "ReactThreeFiber",
                    "@react-three/xr": "ReactThreeXR",
                    "framer-motion": "FramerMotion",
                    "react-icons": "ReactIcons",
                    "react-router-dom": "ReactRouterDOM",
                    "zustand": "Zustand"
                },
            },
        },
    },
});
