import { BottomSheet } from "../../components-ui";
import { ObjectData, VariantData } from "../../types/sceneObjectData";
import "./style.css";

const Comment = () => {
    return (
        <div className="row top-border">
            <div className="a4-comments__box pt-3">
                <div className="a4-comments__box--user row">
                    <div className="col-2 col-lg-1 a4-comments__user-img">
                        <i className="fa-solid fa-circle-user fa-2xl"></i>
                    </div>
                    <div className="col-7 col-md-8">
                        <div className="a4-comments__author">Max Müller</div>
                        <span className="a4-comments__moderator" style={{ fontSize: "0.8rem" }}>Moderator</span>
                        <time className="a4-comments__submission-date">Feb. 9, 2022, 5:54 p.m.</time>
                    </div>
                    <div className="col-1 col-md-1 ms-auto a4-comments__dropdown-container">
                        <div className="dropdown a4-comments__dropdown"><button type="button" className="dropdown-toggle btn btn--link" aria-haspopup="true" aria-expanded="false" data-bs-toggle="dropdown"><i className="fas fa-ellipsis-h" aria-hidden="true"></i></button>
                            <div className="dropdown-menu dropdown-menu-end"><button className="dropdown-item" type="button">Edit</button>
                                <div className="divider"></div><a className="dropdown-item" href="#comment_delete_25" data-bs-toggle="modal" data-bs-target="#delete_modal">Delete</a>
                                <div className="divider"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="a4-comments__text"><p>This is a test comment</p></div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 a4-comments__action-bar-container">
                        <div className="rating">
                            <button className="rating-button rating-up"><i className="fa-regular fa-thumbs-up"></i>0</button>
                            <button className="rating-button rating-down"><i className="fa-regular fa-thumbs-down"></i>0</button>
                        </div>
                        <div className="a4-comments__action-bar">
                            <button className="btn btn--no-border a4-comments__action-bar__btn" type="button">
                                <a href="#child-comment-form"><i className="fa-regular fa-comment"></i>Reply</a>
                            </button>
                        </div>
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
            <div style={{ fontSize: "0.8rem" }}>
                <div className="row align-items-center">
                    <div className="col-10">
                        <h3>{title}</h3>
                    </div>
                    <div className="col-2 d-flex justify-content-end align-items-center">
                        <i
                            className="fa-solid fa-xmark"
                            onClick={onClose}
                            style={{ cursor: "pointer", fontSize: "0.8rem" }}
                        ></i>
                    </div>
                </div>
                <div className="row">
                    <p>{description}</p>
                </div>

                <div className="mb-3">
                    <h6 className="mb-2">Variants</h6>
                    <div className="d-flex flex-wrap gap-2">
                        {object.variants.map(({ id: variantLinkId, title }) => {
                            const isActive = variantLinkId === variantId;
                            return (
                                <button
                                    key={variantLinkId}
                                    className={`variant-icon ${isActive ? "active" : ""}`}
                                    onClick={() => onSelectVariant(variantLinkId)}
                                    title={title}
                                >
                                    <i className="fa-solid fa-circle fa-2xl"></i>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="row top-border">
                    <div className="col-12 a4-comments__action-bar-container">
                        <div className="rating">
                            <button className="rating-button rating-up"><i className="fa-regular fa-thumbs-up"></i>0</button>
                            <button className="rating-button rating-down"><i className="fa-regular fa-thumbs-down"></i>0</button>
                        </div>
                        <div className="a4-comments__action-bar">
                            <button className="btn btn--no-border a4-comments__action-bar__btn" type="button">
                                <a href="#child-comment-form"><i className="fa-regular fa-comment"></i>Reply</a>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="commenting my-0">
                    <h6>Join the discussion</h6>
                    <div className="form-group commenting__content mb-0">
                        <label for="id_chapters-local_1-name">
                            Your comment
                            <input id="id_chapters-local_1-name" name="chapters-local_1-name" type="text" value="" />
                        </label>
                        <button className="btn btn--default btn--full mb-0" type="button">Post</button>
                    </div>
                </div>

                <h6 className="my-4">Discussion</h6>
                <Comment />
                <Comment />
            </div>
        </BottomSheet >
    );
};

export default ObjectDescription;