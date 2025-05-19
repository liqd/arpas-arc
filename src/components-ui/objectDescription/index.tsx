import { BottomSheet } from "../../components-ui";
import { FaAngry, FaEllipsisV, FaRegComment, FaThumbsDown, FaThumbsUp, FaTimes, FaTimesCircle } from "react-icons/fa";
import { ObjectData, VariantData } from "../../types/sceneObjectData";
import "./style.css";

const Comment = () => {
    return (
        <div className="a4-comments__box top-border pt-3">
            <div className="a4-comments__box--user row">
                <div className="col-2 col-lg-1">
                    <FaAngry size={50} />
                </div>
                <div className="col-7 col-md-8">
                    <div className="a4-comments__author">Gilly Admin Bewland</div>
                    <span className="a4-comments__moderator" style={{ fontSize: "0.8rem" }}>Moderator</span>
                    <time className="a4-comments__submission-date">Feb. 9, 2022, 5:54 p.m.</time>
                </div>
                <div className="col-1 col-md-1 ms-auto me-3">
                    <FaEllipsisV />
                </div>
            </div>
            <div className="row">
                <div className="col-12">
                    <div className="a4-comments__text"><p>this is a test of the modalare</p></div>
                </div>
            </div>
            <div className="row">
                <div className="col-12 a4-comments__action-bar-container">
                    <div className="rating">
                        <button className="rating-button rating-up"><FaThumbsUp />0</button>
                        <button className="rating-button rating-down"><FaThumbsDown />0</button>
                    </div>
                    <div className="a4-comments__action-bar">
                        <button className="btn btn--no-border a4-comments__action-bar__btn" type="button"><a href="#child-comment-form"><FaRegComment /> Reply</a></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ObjectDescription = ({
    object,
    variant,
    onSelectVariant,
    onClose,
}: {
    object: ObjectData | null,
    variant: VariantData | null,
    onSelectVariant: (variantId: number) => void;
    onClose: () => void,
}) => {
    if (!object || !variant) return <BottomSheet isVisible={false} />;
    const { id: variantId, title, description } = variant;

    return (
        <BottomSheet
            isVisible={true}
            onClose={onClose}
        >
            <div className="object-description">
                <div className="header">
                    <h3 style={{ margin: 0 }}>{title}</h3>
                    <FaTimes onClick={onClose} />
                </div>
                <div className="entry">
                    {description}
                </div>
                <div className="entry">
                    <h5>Variants</h5>
                    {object.variants.map(({ id: variantLinkId, title }) => {
                        const isActive = variantLinkId === variantId;
                        return (
                            <button
                                key={variantLinkId}
                                className={`variant-icon ${isActive ? "active" : ""}`}
                                onClick={() => onSelectVariant(variantLinkId)}
                                title={title}
                            >
                                <FaTimesCircle size={50} />
                            </button>
                        );
                    })}
                </div>
                <div className="entry reactions top-border">
                    <div><FaThumbsUp /> 99</div>
                    <div style={{ marginLeft: "30px" }}><FaThumbsDown /> 99</div>
                    <div style={{ marginLeft: "auto" }}><FaRegComment /> 99</div>
                </div>
                <div className="entry">
                    <Comment />
                    <Comment />
                </div>
            </div>
        </BottomSheet >
    );
};

export default ObjectDescription;