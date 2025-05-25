import { useEffect, useState } from "react";
import { BottomSheet } from "..";
import { CommentData, ObjectData, ReplyData, VariantData } from "../../types/objectData";
import { formatTimestamp } from "../../utility/conversion";
import "./style.css";
import SceneObject from "../../components/sceneObject";
import { ObjectSessionData } from "../../types/sessionData";

const Comment = ({ comment, updateComment, setIsNewReplyFocus }: {
    comment: CommentData | ReplyData,
    updateComment: (comment: CommentData) => void,
    setIsNewReplyFocus: (focus: boolean) => void
}) => {
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
        setCommentState(prev => {
            const updatedComment: CommentData = {
                ...comment,
                replies: prev.replies,
                likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
                dislikes: prev.isLiked ? prev.dislikes : prev.isDisliked ? prev.dislikes - 1 : prev.dislikes,
                isLiked: !prev.isLiked,
                isDisliked: false,
            };

            // updateComment(updatedComment);
            return updatedComment;
        });
    };

    const toggleDislike = () => {
        setCommentState(prev => {
            const updatedComment: CommentData = {
                ...comment,
                replies: prev.replies,
                likes: prev.isDisliked ? prev.likes : prev.isLiked ? prev.likes - 1 : prev.likes,
                dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
                isDisliked: !prev.isDisliked,
                isLiked: false,
            };

            // updateComment(updatedComment);
            return updatedComment;
        });
    };

    const postReply = () => {
        if (!isComment) return;
        const trimmed = replyText.trim();
        if (!trimmed) return;

        const newReply: ReplyData = {
            id: 400 + Math.random(),
            commentId: comment.id,
            username: "RepublicaUser",
            isModerator: false,
            text: trimmed,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
        };

        setReplyText("");
        setCommentState(prev => {
            const updatedComment: CommentData = {
                ...comment,
                replies: [...prev.replies, newReply],
                likes: prev.likes,
                dislikes: prev.dislikes,
                isLiked: prev.isLiked,
                isDisliked: prev.isDisliked,
            };

            // updateComment(updatedComment);
            return updatedComment;
        });
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
                    {/* <div className="col-1 col-md-1 ms-auto a4-comments__dropdown-container">
                        <div className="dropdown a4-comments__dropdown">
                            <button type="button" className="dropdown-toggle btn btn--link">
                                <i className="fas fa-ellipsis-h" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div> */}
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
                                {/* <button className="btn btn--no-border a4-comments__action-bar__btn" type="button" onClick={() => setIsShowingReplies(prev => !prev)}>
                                    {isShowingReplies
                                        ? <><i className="fas fa-minus"></i> Hide Replies</>
                                        : <><i className="far fa-comment"></i>{commentState.replies.length} Reply</>
                                    }
                                </button> */}
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>

        {isComment && isShowingReplies && <>
            {commentState.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} updateComment={updateComment} setIsNewReplyFocus={setIsNewReplyFocus} />
            ))}

            <div className="commenting my-0 py-2 ps-3">
                <h6>Join the discussion</h6>
                <div className="form-group commenting__content mb-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            postReply();
                            setTimeout(() => {
                                if (document.activeElement instanceof HTMLElement) {
                                    document.activeElement.blur();
                                }
                            }, 100);
                        }}
                    >
                        <label>
                            Your reply
                            <input
                                type="text"
                                enterKeyHint="send"
                                value={replyText}
                                onFocus={() => setIsNewReplyFocus(true)}
                                onBlur={() => setIsNewReplyFocus(false)}
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
    sceneObject,
    headerHeight,
    onClose,
}: {
    sceneObject: SceneObject;
    headerHeight: number;
    onClose: () => void,
}) => {
    const [commentText, setCurrentNewCommentText] = useState("");
    const [currentVariant, setCurrentCurrentVariant] = useState(sceneObject.getCurrentVariantData());
    const [comments, setComments] = useState<CommentData[]>(sceneObject.getComments() || []);
    const [commentState, setCommentState] = useState({
        likes: sceneObject.getCurrentVariantData().likes,
        dislikes: sceneObject.getCurrentVariantData().dislikes,
        isLiked: sceneObject.getCurrentVariantData().isLiked,
        isDisliked: sceneObject.getCurrentVariantData().isDisliked,
    });
    const [isNewCommentFocus, setIsNewCommentFocus] = useState(false);
    const [isNewReplyFocus, setIsNewReplyFocus] = useState(false);
    if (!sceneObject?.getCurrentVariantData()) return <BottomSheet isVisible={false} headerHeight={headerHeight} variantName="" />;

    useEffect(() => {
        // ✅ Ensure `currentVariant` updates when `sceneObject` changes
        setCurrentCurrentVariant(sceneObject.getCurrentVariantData());

        // ✅ Ensure `comments` update when `sceneObject` changes
        setComments(sceneObject.getComments() || []);
    }, [sceneObject]); // ✅ Runs when `sceneObject` changes

    const [forceUpdate, setForceUpdate] = useState(false); // setForceUpdate(prev => !prev);

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

    const postNewComment = () => {
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

        setCurrentNewCommentText("");
        setComments(prev => [...prev, newComment]);

        sceneObject.addComment(newComment);
    };

    return (
        <BottomSheet
            isVisible={true}
            headerHeight={headerHeight}
            variantName={currentVariant.name}
            onClose={onClose}
            isNewCommentFocus={isNewCommentFocus}
            isNewReplyFocus={isNewReplyFocus}
        >
            <div className="minh-100 d-flex flex-column" style={{ fontSize: "0.8rem" }}>

                {!isNewCommentFocus &&
                    <div id="scrollableContentSection" className="row">
                        <p>{currentVariant.description}</p>
                    </div>
                }
                {!isNewCommentFocus &&
                    <div className="mb-3">
                        <h6 className="mb-2">Variants</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {sceneObject.getVariantsData().map((variantData: VariantData) => {
                                const isActive = variantData.id === currentVariant.id;
                                return (
                                    <button
                                        key={variantData.id}
                                        className={`variant-icon ${isActive ? "active" : ""}`}
                                        onClick={() => {
                                            if (variantData.id !== currentVariant.id) {
                                                setCurrentCurrentVariant(variantData);
                                                sceneObject.changeVariant(variantData.id);
                                            }
                                        }}
                                    >
                                        <i className="fas fa-circle fa-3x"></i>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                }
                {!isNewCommentFocus &&
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
                }

                <div id="discussionSection" className="commenting my-0">
                    <h6>Join the discussion</h6>
                    <div className="form-group commenting__content mb-0">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                postNewComment();
                                setTimeout(() => {
                                    if (document.activeElement instanceof HTMLElement) {
                                        document.activeElement.blur();
                                    }
                                }, 100);
                            }}
                        >
                            <label>
                                Your comment
                                <input
                                    type="text"
                                    enterKeyHint="send"
                                    value={commentText}
                                    onFocus={() => setIsNewCommentFocus(true)}
                                    onBlur={() => {
                                        setIsNewCommentFocus(false);
                                    }}
                                    onChange={(e) => setCurrentNewCommentText(e.target.value)}
                                />
                            </label>
                            {!isNewCommentFocus && commentText.length > 0 && (
                                <button className="btn btn--default btn--full mb-0" type="submit">
                                    Post
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                <h6 className="my-4">Discussion</h6>
                {comments.slice().reverse().map((comment) => (
                    <Comment key={comment.id}
                        comment={comment}
                        updateComment={sceneObject.updateComment}
                        setIsNewReplyFocus={setIsNewReplyFocus} />))}
            </div>
        </BottomSheet >
    );
};

export default ObjectDescription;
