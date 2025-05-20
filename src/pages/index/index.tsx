import { useState } from "react";
import { useXRStore, XRDomOverlay } from "@react-three/xr";
import { HelpMenu, ObjectDescription } from "../../components-ui";
import { ObjectData, SceneData } from "../../types/objectData";
import "./style.css";

const IndexPage = ({ data }: { data: SceneData }) => {
    const store = useXRStore();
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});

    const getCurrentVariant = (object: ObjectData) => {
        const index = selectedVariants[object.id] ?? 0;
        return object.variants[index];
    };

    const changeVariant = (objectId: number, variantIndex: number) => {
        const object = data.objects.find((obj) => obj.id === objectId);
        if (!object || variantIndex < 0 || variantIndex >= object.variants.length) return;

        setSelectedVariants((prev) => ({
            ...prev,
            [objectId]: variantIndex,
        }));
    };

    return (<>
        <XRDomOverlay style={{ width: "100%", height: "100%" }}>
            <div className="position-absolute top-0 start-0 w-100 py-1 px-2 d-flex justify-content-between align-items-center bg-white">
                <button className="border-0 fw-bold text-uppercase text-dark" onClick={() => store.getState().session?.end()}>
                    <small><i className="fa fa-arrow-left" aria-hidden="true"></i> Leave AR</small>
                </button>
                <button className="border-0 fw-bold text-uppercase text-dark" onClick={() => setIsHelpVisible(true)}>
                    <small><i className="fa-solid fa-circle-info"></i> Help</small>
                </button>
            </div>

            <HelpMenu
                isVisible={isHelpVisible}
                onClose={() => setIsHelpVisible(false)}
                onLeave={() => store.getState().session?.end()}
            />

            <ObjectDescription
                object={selectedObject}
                variant={selectedObject ? getCurrentVariant(selectedObject) : null}
                onClose={() => setSelectedObject(null)}
                onSelectVariant={(variantId) => {
                    if (!selectedObject) return;
                    const index = selectedObject.variants.findIndex(v => v.id === variantId);
                    if (index !== -1) changeVariant(selectedObject.id, index);
                }}
            />
        </XRDomOverlay>

        <ambientLight intensity={5} />
        <directionalLight intensity={10} />

        {data.objects.map((sceneObject) => {
            const variant = getCurrentVariant(sceneObject);
            if (!variant) return null;

            const { offsetPosition, offsetRotation, offsetScale } = variant;

            return (
                <mesh
                    key={sceneObject.id}
                    position={offsetPosition.toArray()}
                    rotation={offsetRotation.toArray()}
                    scale={offsetScale.toArray()}
                    onClick={() => setSelectedObject(sceneObject)}
                >
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#248cb5" />
                </mesh>
            );
        })}
    </>);
};

export default IndexPage;
