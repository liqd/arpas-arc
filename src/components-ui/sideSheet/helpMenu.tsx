import { useState } from "react";
import SideSheet from ".";

const Accordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="accordion">
            <a className={`accordion__title ${isExpanded && "collapsed"}`} 
            onClick={() => setIsExpanded((prev) => !prev)} 
            aria-haspopup="true" 
            aria-expanded={isExpanded} 
            data-bs-toggle="collapse">
                <h6>
                    {title}
                    <i className={"fas fa-chevron-down"} aria-hidden="true"></i>
                </h6>
            </a>
            <div className={`accordion__body collapse ${isExpanded && "show"}`} id="accordion-complib-body" aria-labelledby="accordion-complib-title">
                {children}
            </div>
        </div>
    );
};

const HelpMenu = ({
    isVisible,
    onClose,
    onLeave,
    headerHeight,
    fontSize,
}: {
    isVisible: boolean;
    onClose?: () => void;
    onLeave?: () => void;
    headerHeight: number;
    fontSize: string | number;
}) => {
    return (
        <SideSheet
            isVisible={isVisible}
            onClose={onClose}
            onLeave={onLeave}
            headerHeight={headerHeight}
        >
            <div className="d-flex flex-column" style={{ height: "100%" }}>
                {/* Sticky header */}
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "white",
                        padding: "0 0 0.5rem 0",
                        fontSize: fontSize,
                    }}
                >
                    <h3 style={{ marginBottom: 0 }}>AR Help Guide</h3>
                    <p style={{ marginBottom: 0 }}>
                        Welcome to the <strong>Augmented Reality experience on <a href="https://adhocracy.plus/" target="_blank" rel="noopener noreferrer">Adhocracy.plus</a>!</strong><br />
                    </p>
                </div>
                {/* Scrollable content */}
                <div
                    className="flex-grow-1"
                    style={{
                        fontSize: fontSize,
                        overflowY: "auto",
                        minHeight: 0,
                    }}
                >
                    <Accordion title="What is Adhocracy.plus AR Beta?">
                        <p>
                            <a href="https://adhocracy.plus/" target="_blank" rel="noopener noreferrer">Adhocracy.plus</a> AR Beta is an experimental feature that allows users to interact with Augmented Reality elements in their environment.
                            It is designed to enhance civic engagement by providing immersive experiences for exploring projects, proposals, and ideas in a spatial context.
                        </p>
                    </Accordion>
                    <Accordion title="What is Augmented Reality?">
                        <p>
                            Augmented Reality (AR) is a technology that overlays digital content onto the real world through devices like smartphones, tablets, or AR glasses.
                            Unlike virtual reality, AR enhances your physical surroundings by adding interactive elements, such as 3D models, animations, or information panels.
                        </p>
                    </Accordion>
                    <Accordion title="Why should I participate?">
                        <p>
                            Participating in AR experiences allows you to engage with projects and proposals in a more interactive and visual way.
                            It helps you better understand spatial relationships, visualize ideas, and contribute feedback in a meaningful manner.
                            Plus, it's a fun and innovative way to shape your community!
                        </p>
                    </Accordion>
                    <Accordion title="How do I use AR mode?">
                        <p>
                            To use AR mode:
                            <ul>
                                <li>Ensure your device supports AR (e.g., ARCore for Android).</li>
                                <li>Follow the on-screen instructions to explore AR elements in your environment.</li>
                                <li>Interact with objects by tapping or selecting them to view more details.</li>
                            </ul>
                        </p>
                    </Accordion>
                    <Accordion title="Tips">
                        <p>
                            Here are some tips for using AR mode effectively:
                            <ul>
                                <li>Use AR in a well-lit area for better visibility.</li>
                                <li>Move around to explore objects from different angles.</li>
                            </ul>
                        </p>
                    </Accordion>
                    <p className="mt-auto pt-3">
                        Still need help? Reach out at <a href="mailto:support@adhocracy.plus">support@adhocracy.plus</a><br />
                        Thanks for shaping your city with us!
                    </p>
                </div>
            </div>
        </SideSheet>
    );
};

export default HelpMenu;
