import React from "react"
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { IfInSessionMode, XR, createXRStore } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import IndexPage from "./pages/index";
import AnnotationsPage from "./pages/annotations";
import "./style.css"

const store = createXRStore({ controller: false });

const App = () => {
    return (<>
        <button id="start-button" onClick={() => store.enterAR()}>Enter AR</button>
        <Canvas style={{ width: "100%", height: "100%" }}>
            <XR store={store}>
                <IfInSessionMode allow="immersive-ar">
                    <Routes>
                        <Route path="/" element={<IndexPage />} />
                        <Route path="/annotations" element={<AnnotationsPage />} />
                    </Routes>
                </IfInSessionMode>
            </XR>
        </Canvas>
    </>)
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </React.StrictMode>
);
