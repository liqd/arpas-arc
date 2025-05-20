import { IfInSessionMode, XR, createXRStore } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import { SceneData } from "./types/objectData";
import IndexPage from "./pages/index";

if (import.meta.env.DEV) {
    import("../dev/scss/style.scss");
    import("@fortawesome/fontawesome-free/css/all.min.css");
}

interface AppProps {
    buttonClassName?: string,
    buttonText?: string,
    data: SceneData
}

const store = createXRStore({ controller: false });

const App = ({
    buttonClassName = "start-button",
    buttonText = "Enter AR",
    data
}: AppProps) => {
    return (<div className="arc-app">
        <button className={buttonClassName} onClick={() => store.enterAR()}>{ buttonText }</button>
        <Canvas style={{ width: "100%", height: "100%" }}>
            <XR store={store}>
                <IfInSessionMode allow="immersive-ar">
                    <IndexPage data={data} />
                </IfInSessionMode>
            </XR>
        </Canvas>
    </div>)
}

export default App
