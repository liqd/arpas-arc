import React from "react";
import ReactDOM from "react-dom/client";
import { IfInSessionMode, XR, createXRStore } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import { SceneData } from "./types/sceneObjectData";
import { BenchScene } from "./utility/mockData";
import AnnotationsPage from "./pages/annotations";
import "./style.css";

if (import.meta.env.DEV) {
    import("../dev/scss/style.scss");
}

const store = createXRStore({ controller: false });

const App = ({ data }: { data: SceneData }) => {
    return (<>
        <button id="start-button" onClick={() => store.enterAR()}>Enter AR</button>
        <Canvas style={{ width: "100%", height: "100%" }}>
            <XR store={store}>
                <IfInSessionMode allow="immersive-ar">
                    <AnnotationsPage data={data} />
                </IfInSessionMode>
            </XR>
        </Canvas>
    </>);
};

ReactDOM.createRoot(document.getElementById("arpas-root") as HTMLElement).render(
    <React.StrictMode>
        <App data={BenchScene} />
    </React.StrictMode>
);

export default App;
