import { useState } from "react";
import { BottomSheet } from "..";
import { CommentData, ObjectData, VariantData } from "../../types/objectData";
import { formatTimestamp } from "../../utility/conversion";
import "./style.css";

const Comment = ({ comment }: { comment: CommentData }) => {
    const [isShowingReplies, setIsShowingReplies] = useState(false);

    return (<>
        <div className="row top-border">
            <div className="a4-comments__box pt-3">
                <div className="a4-comments__box--user row">
                    <div className="col-2 col-lg-1 a4-comments__user-img">
                        <i className="fas fa-user-circle fa-3x"></i>
                    </div>
                    <div className="col-7 col-md-8">
                        <div className="a4-comments__author">{comment.username}</div>
                        <span className="a4-comments__moderator" style={{ fontSize: "0.8rem" }}>{comment.isModerator}</span>
                        <time className="a4-comments__submission-date">{formatTimestamp(comment.timestamp)}</time>
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
                        <div className="a4-comments__text"><p>{comment.text}</p></div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 a4-comments__action-bar-container">
                        <div className="rating">
                            <button className="rating-button rating-up"><i className="far fa-thumbs-up"></i>{comment.likes}</button>
                            <button className="rating-button rating-down"><i className="far fa-thumbs-down"></i>{comment.dislikes}</button>
                        </div>
                        <div className="a4-comments__action-bar">
                            <button className="btn btn--no-border a4-comments__action-bar__btn" type="button" onClick={() => setIsShowingReplies((prev) => !prev)}>
                                <i className="far fa-comment"></i>Reply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {isShowingReplies && <>
            {comment.replies.map((reply) => {
                return (
                    <Comment key={reply.id} comment={reply} />
                );
            })}
            
            <div className="commenting my-0">
                <h6>Join the discussion</h6>
                <div className="form-group commenting__content mb-0">
                    <label>
                        Your comment
                        <input type="text" />
                    </label>
                    <button className="btn btn--default mb-0 btn--full" type="button">Post</button>
                </div>
            </div>
        </>}
    </>);
};

const ObjectDescription = ({
    object,
    variant,
    headerHeight,
    onSelectVariant,
    onClose,
}: {
    object: ObjectData | null;
    variant: VariantData | null;
    headerHeight: number;
    onSelectVariant: (variantId: number) => void;
    onClose: () => void,
}) => {
    if (!object || !variant) return <BottomSheet isVisible={false} headerHeight={headerHeight} />;
    const { id: variantId, name, description } = variant;

    return (
        <BottomSheet
            isVisible={true}
            onClose={onClose}
            headerHeight={headerHeight}
        >
            <div className="minh-100 d-flex flex-column" style={{ fontSize: "0.8rem" }}>
                <div className="row align-items-center">
                    <div className="col-10">
                        <h3>{name}</h3>
                    </div>
                    <div className="col-2 d-flex justify-content-end align-items-center">
                        <i
                            className="fas fa-times"
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
                        {object.variants.map(({ id: variantLinkId }) => {
                            const isActive = variantLinkId === variantId;
                            return (
                                <button
                                    key={variantLinkId}
                                    className={`variant-icon ${isActive ? "active" : ""}`}
                                    onClick={() => onSelectVariant(variantLinkId)}
                                >
                                    <i className="fas fa-circle fa-3x"></i>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="row top-border">
                    <div className="col-12 a4-comments__action-bar-container">
                        <div className="rating">
                            <button className="rating-button rating-up"><i className="far fa-thumbs-up"></i>0</button>
                            <button className="rating-button rating-down"><i className="far fa-thumbs-down"></i>0</button>
                        </div>
                        <div className="a4-comments__action-bar">
                            <button className="btn btn--no-border a4-comments__action-bar__btn" type="button">
                                <a href="#child-comment-form"><i className="far fa-comment"></i>Reply</a>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="commenting my-0">
                    <h6>Join the discussion</h6>
                    <div className="form-group commenting__content mb-0">
                        <label>
                            Your comment
                            <input id="id_chapters-local_1-name" name="chapters-local_1-name" type="text" />
                        </label>
                        <button className="btn btn--default btn--full mb-0" type="button">Post</button>
                    </div>
                </div>

                <h6 className="my-4">Discussion</h6>
                {object.comments.map((comment) => {
                    return (
                        <Comment key={comment.id} comment={comment} />
                    );
                })}
            </div>
        </BottomSheet >
    );
};

export default ObjectDescription;