import React from "react";
import ReactDOM from "react-dom/client";
import { IfInSessionMode, XR, createXRStore } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import { SceneData } from "./types/sceneObjectData";
import { BenchScene } from "./utility/mockData";
import IndexPage from "./pages/index";
import "./style.css";

if (import.meta.env.DEV) {
    import("../dev/scss/style.scss");
    import("@fortawesome/fontawesome-free/css/all.min.css");
}

const store = createXRStore({ controller: false });

const App = ({ data }: { data: SceneData }) => {
    return (<>
        <button id="start-button" onClick={() => store.enterAR()}>Enter AR</button>
        <Canvas style={{ width: "100%", height: "100%" }}>
            <XR store={store}>
                <IfInSessionMode allow="immersive-ar">
                    <IndexPage data={data} />
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
