import { useState } from "react";
import SideSheet from ".";

const Accordion = ({ title, children }: { title: string, children: React.ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="accordion">
            <a className={`accordion__title ${isExpanded && "collapsed"}`} onClick={() => setIsExpanded((prev) => !prev)} aria-haspopup="true" aria-expanded="false" data-bs-toggle="collapse">
                <h6>
                    {title}
                    <i className="fa fa-chevron-down" aria-hidden="true"></i>
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
}: {
    isVisible: boolean;
    onClose?: () => void;
    onLeave?: () => void;
}) => {
    return (
        <SideSheet
            isVisible={isVisible}
            onClose={onClose}
            onLeave={onLeave}
        >
            <div className="d-flex flex-column flex-grow-1" style={{ fontSize: "0.8rem" }}>
                <h3>AR Help Guide</h3>
                <p>
                    Welcome to the <strong>AR experience on adhocracy.plus!</strong><br />Here's how to explore and participate using AR:
                </p>
                <Accordion title="What is adhocracy.plus AR Beta?">
                    <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras laoreet mi vel lacus mollis, nec imperdiet ligula molestie. Vestibulum convallis sodales leo non fermentum. In felis enim, dignissim pharetra luctus quis, interdum vitae augue. Etiam vel varius quam. Maecenas semper nisl vestibulum turpis sagittis vestibulum. Donec lacinia, libero quis cursus hendrerit, ex tellus dictum enim, in posuere diam sapien nec eros. Nunc ultricies pulvinar nisi vestibulum convallis. Pellentesque in varius leo. Sed eget libero tincidunt, rhoncus est vitae, rhoncus dui. Duis nec massa orci. </p>
                </Accordion>
                <Accordion title="What is Augmented Reality?">
                    <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras laoreet mi vel lacus mollis, nec imperdiet ligula molestie. Vestibulum convallis sodales leo non fermentum. In felis enim, dignissim pharetra luctus quis, interdum vitae augue. Etiam vel varius quam. Maecenas semper nisl vestibulum turpis sagittis vestibulum. Donec lacinia, libero quis cursus hendrerit, ex tellus dictum enim, in posuere diam sapien nec eros. Nunc ultricies pulvinar nisi vestibulum convallis. Pellentesque in varius leo. Sed eget libero tincidunt, rhoncus est vitae, rhoncus dui. Duis nec massa orci. </p>
                </Accordion>
                <Accordion title="Why should I participate?">
                    <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras laoreet mi vel lacus mollis, nec imperdiet ligula molestie. Vestibulum convallis sodales leo non fermentum. In felis enim, dignissim pharetra luctus quis, interdum vitae augue. Etiam vel varius quam. Maecenas semper nisl vestibulum turpis sagittis vestibulum. Donec lacinia, libero quis cursus hendrerit, ex tellus dictum enim, in posuere diam sapien nec eros. Nunc ultricies pulvinar nisi vestibulum convallis. Pellentesque in varius leo. Sed eget libero tincidunt, rhoncus est vitae, rhoncus dui. Duis nec massa orci. </p>
                </Accordion>
                <Accordion title="How do I use AR mode?">
                    <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras laoreet mi vel lacus mollis, nec imperdiet ligula molestie. Vestibulum convallis sodales leo non fermentum. In felis enim, dignissim pharetra luctus quis, interdum vitae augue. Etiam vel varius quam. Maecenas semper nisl vestibulum turpis sagittis vestibulum. Donec lacinia, libero quis cursus hendrerit, ex tellus dictum enim, in posuere diam sapien nec eros. Nunc ultricies pulvinar nisi vestibulum convallis. Pellentesque in varius leo. Sed eget libero tincidunt, rhoncus est vitae, rhoncus dui. Duis nec massa orci. </p>
                </Accordion>
                <Accordion title="Tips">
                    <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras laoreet mi vel lacus mollis, nec imperdiet ligula molestie. Vestibulum convallis sodales leo non fermentum. In felis enim, dignissim pharetra luctus quis, interdum vitae augue. Etiam vel varius quam. Maecenas semper nisl vestibulum turpis sagittis vestibulum. Donec lacinia, libero quis cursus hendrerit, ex tellus dictum enim, in posuere diam sapien nec eros. Nunc ultricies pulvinar nisi vestibulum convallis. Pellentesque in varius leo. Sed eget libero tincidunt, rhoncus est vitae, rhoncus dui. Duis nec massa orci. </p>
                </Accordion>
                <p className="mt-auto pt-3">
                    Still need help? Reach out at <a href="mailto:support@adhocracy.plus">support@adhocracy.plus</a><br />
                    Thanks for shaping your city with us!
                </p>
            </div>
        </SideSheet>
    );
};

export default HelpMenu;
