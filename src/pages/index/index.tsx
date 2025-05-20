import { useEffect, useState } from "react";
import { useXRStore, XRDomOverlay } from "@react-three/xr";
import { ObjectDescription } from "../../components-ui";
import { ObjectData, SceneData } from "../../types/objectData";
import "./style.css";

const IndexPage = ({ data }: { data: SceneData }) => {
    const store = useXRStore();
    const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
    const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
    const [headerHeight, setHeaderHeight] = useState(0);

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

    useEffect(() => {
        const updateHeaderHeight = () => {
            const header = document.querySelector(".arc-header") as HTMLElement;
            if (header) {
                setHeaderHeight(header.offsetTop + header.offsetHeight);
            }
        };

        updateHeaderHeight();
        window.addEventListener("resize", updateHeaderHeight); // Update on resize

        return () => window.removeEventListener("resize", updateHeaderHeight);
    }, []);

    return (<>
        <XRDomOverlay style={{ width: "100%", height: "100%" }}>
            <div className="arc-logo-header">
                <span className="arc-text">ARPAS</span>
            </div>

            <div className="arc-header">
                <button onClick={() => store.getState().session?.end()}>
                    <i className="fa fa-arrow-left" aria-hidden="true"></i> Leave AR
                </button>
                <button>
                    <i className="fa-solid fa-circle-info"></i> Help
                </button>
            </div>


            <ObjectDescription
                object={selectedObject}
                variant={selectedObject ? getCurrentVariant(selectedObject) : null}
                headerHeight={headerHeight}
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
