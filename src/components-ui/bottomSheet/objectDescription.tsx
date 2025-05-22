import { useState } from "react";
import { BottomSheet } from "..";
import { CommentData, ObjectData, ReplyData, VariantData } from "../../types/objectData";
import { formatTimestamp } from "../../utility/conversion";
import "./style.css";

const Comment = ({ comment }: { comment: CommentData | ReplyData }) => {
    const isComment = 'replies' in comment;
    const [isShowingReplies, setIsShowingReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [commentState, setCommentState] = useState(() => ({
        likes: comment.likes,
        dislikes: comment.dislikes,
        isLiked: comment.isLiked,
        isDisliked: comment.isDisliked,
        replies: isComment ? comment.replies : [],
    }));

    const toggleLike = () => {
        setCommentState(prev => ({
            ...prev,
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            dislikes: prev.isLiked ? prev.dislikes : prev.isDisliked ? prev.dislikes - 1 : prev.dislikes,
            isLiked: !prev.isLiked,
            isDisliked: false,
        }));
    };

    const toggleDislike = () => {
        setCommentState(prev => ({
            ...prev,
            dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
            likes: prev.isDisliked ? prev.likes : prev.isLiked ? prev.likes - 1 : prev.likes,
            isDisliked: !prev.isDisliked,
            isLiked: false,
        }));
    };

    const postReply = () => {
        if (!isComment) return;
        const trimmed = replyText.trim();
        if (!trimmed) return;

        const newReply: ReplyData = {
            id: 400 + Math.random(),
            commentId: comment.id,
            username: "Republica6",
            isModerator: true,
            text: trimmed,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
        };

        setReplyText("");
        setCommentState(prev => ({
            ...prev,
            replies: [...prev.replies, newReply],
        }));
    };

    return (<>
        <div className={`row top-border ${!isComment && "ps-3 pb-2"}`}>
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
                        <div className="dropdown a4-comments__dropdown">
                            <button type="button" className="dropdown-toggle btn btn--link">
                                <i className="fas fa-ellipsis-h" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="a4-comments__text">
                            <p>{comment.text}</p>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 a4-comments__action-bar-container">
                        <div className="rating">
                            <button className={`rating-button rating-up ${commentState.isLiked && "liked"}`} onClick={toggleLike}>
                                <i className="far fa-thumbs-up"></i>{commentState.likes}
                            </button>
                            <button className={`rating-button rating-down ${commentState.isDisliked && "disliked"}`} onClick={toggleDislike}>
                                <i className="far fa-thumbs-down"></i>{commentState.dislikes}
                            </button>
                        </div>
                        {isComment &&
                            <div className="a4-comments__action-bar">
                                <button className="btn btn--no-border a4-comments__action-bar__btn" type="button" onClick={() => setIsShowingReplies(prev => !prev)}>
                                    {isShowingReplies
                                        ? <><i className="fas fa-minus"></i> Hide Replies</>
                                        : <><i className="far fa-comment"></i>{commentState.replies.length} Reply</>
                                    }
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

        {isComment && isShowingReplies && <>
            {commentState.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} />
            ))}

            <div className="commenting my-0 py-2 ps-3">
                <h6>Join the discussion</h6>
                <div className="form-group commenting__content mb-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            postReply();
                        }}
                    >
                        <label>
                            Your comment
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                        </label>
                        <button className="btn btn--default btn--full mb-0" type="submit">
                            Post
                        </button>
                    </form>
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
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<CommentData[]>(object.comments || []);
    const [commentState, setCommentState] = useState({
        likes: variant.likes,
        dislikes: variant.dislikes,
        isLiked: variant.isLiked,
        isDisliked: variant.isDisliked,
    });

    const toggleLike = () => {
        setCommentState(prev => ({
            likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
            dislikes: prev.isLiked ? prev.dislikes : prev.isDisliked ? prev.dislikes - 1 : prev.dislikes,
            isLiked: !prev.isLiked,
            isDisliked: false,
        }));
    };

    const toggleDislike = () => {
        setCommentState(prev => ({
            dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
            likes: prev.isDisliked ? prev.likes : prev.isLiked ? prev.likes - 1 : prev.likes,
            isDisliked: !prev.isDisliked,
            isLiked: false,
        }));
    };

    const postComment = () => {
        const trimmed = commentText.trim();
        if (!trimmed) return;

        const newComment: CommentData = {
            id: 400 + Math.random(),
            username: "Republica6",
            isModerator: true,
            text: trimmed,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
            replies: [],
        };

        setCommentText("");
        setComments(prev => [...prev, newComment]);
    };


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
                            <button className={`rating-button rating-up ${commentState.isLiked && "liked"}`} onClick={toggleLike}>
                                <i className="far fa-thumbs-up"></i>{commentState.likes}
                            </button>
                            <button className={`rating-button rating-down ${commentState.isDisliked && "disliked"}`} onClick={toggleDislike}>
                                <i className="far fa-thumbs-down"></i>{commentState.dislikes}
                            </button>
                        </div>
                        <div className="a4-comments__action-bar">
                            <button className="btn btn--no-border a4-comments__action-bar__btn" type="button">
                                <i className="far fa-comment"></i>Reply
                            </button>
                        </div>
                    </div>
                </div>

                <div className="commenting my-0">
                    <h6>Join the discussion</h6>
                    <div className="form-group commenting__content mb-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                postComment();
                            }}
                        >
                            <label>
                                Your comment
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                            </label>
                            <button className="btn btn--default btn--full mb-0" type="submit">
                                Post
                            </button>
                        </form>
                    </div>
                </div>

                <h6 className="my-4">Discussion</h6>
                {comments.map((comment) => (<Comment key={comment.id} comment={comment} />))}

            </div>
        </BottomSheet >
    );
};

export default ObjectDescription;
