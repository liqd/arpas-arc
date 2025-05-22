import { IfInSessionMode, XR, createXRStore } from "@react-three/xr"
import { Canvas } from "@react-three/fiber"
import { SceneData } from "./types/objectData";
import IndexPage from "./pages/index";
import { TopicData } from "./types/topicData";

interface AppProps {
    buttonClassName?: string,
    buttonText?: string | JSX.Element,
    view3dButtonText?: string | JSX.Element,
    scene: SceneData,
    topic: TopicData
}

const store = createXRStore({ controller: false });

const App = ({
    buttonClassName = "start-button",
    buttonText = "Enter AR",
    view3dButtonText = "View in 3D",
    scene,
    topic
}: AppProps) => {
    return (<div className="arc-app">
        <div className="button-group">
            <button className={buttonClassName} onClick={() => store.enterAR()}>{ buttonText }</button>
            <button className={buttonClassName}>{ view3dButtonText }</button>
        </div>
        <Canvas style={{ width: "100%", height: "100%" }}>
            <XR store={store}>
                <IfInSessionMode allow="immersive-ar">
                    <IndexPage data={scene} />
                </IfInSessionMode>
            </XR>
        </Canvas>
    </div>)
}

export default App
