import React from "react";
import { Route, Routes } from "react-router-dom";
import { IfInSessionMode, XR, createXRStore } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import IndexPage from "./pages/index";
import AnnotationsPage from "./pages/annotations";

interface AppProps {
    buttonClassName?: string
}

const store = createXRStore({ controller: false });

const App = ({ buttonClassName = "start-button" }: AppProps) => {
    return (<div className="arc-app">
        <button className={buttonClassName} onClick={() => store.enterAR()}>Enter AR</button>
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
    </div>)
}

export default App
