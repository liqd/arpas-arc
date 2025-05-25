import { useEffect, useState } from "react";
import { BottomSheet } from "..";
import { CommentData, VariantData } from "../../types/objectData";
import { formatTimestamp } from "../../utility/conversion";
import "./style.css";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { addCommentToObject, toggleCommentDislike, toggleCommentLike, toggleVariantDislike, toggleVariantLike } from "../../store/sceneSlice";

const Comment = ({ objectId, commentId, setIsNewReplyFocus }: {
    objectId: number,
    commentId: number,
    setIsNewReplyFocus: (focus: boolean) => void
}) => {
    const [isShowingReplies, setIsShowingReplies] = useState(false);
    const [replyText, setReplyText] = useState("");

    const sceneObject = useSelector((state: RootState) =>
        state.scene.objects.find(obj => obj.id === objectId)
    );

    if (!sceneObject) return null;

    const comment = useSelector((state: RootState) =>
        state.scene.objects.find(obj => obj.id === objectId)
            ?.comments.find(c => c.id === commentId)
    );

    if (!comment) return;

    const isComment = 'replies' in comment;

    const dispatch = useDispatch();

    const toggleLike = () => {
        dispatch(toggleCommentLike({
            objectId: sceneObject?.id ?? 0,
            commentId: comment.id
        }));
    };

    const toggleDislike = () => {
        dispatch(toggleCommentDislike({
            objectId: sceneObject?.id ?? 0,
            commentId: comment.id
        }));
    };


    /*
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
    */

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
                            <button className={`rating-button rating-up ${comment.isLiked && "liked"}`} onClick={toggleLike}>
                                <i className="far fa-thumbs-up"></i>{comment.likes}
                            </button>
                            <button className={`rating-button rating-down ${comment.isDisliked && "disliked"}`} onClick={toggleDislike}>
                                <i className="far fa-thumbs-down"></i>{comment.dislikes}
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

        {/*
        {isComment && isShowingReplies && <>
            {comment.replies.map((reply) => (
                <Comment key={reply.id} objectId={objectId} commentId={reply.id} updateComment={updateComment} setIsNewReplyFocus={setIsNewReplyFocus} />
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
        */}
    </>);
};

const ObjectDescription = ({
    objectId,
    variantId,
    headerHeight,
    setCurrentVariant,
    onClose,
}: {
    objectId: number,
    variantId: number,
    headerHeight: number,
    setCurrentVariant: (objectId: number, variantId: number) => void,
    onClose: () => void,
}) => {
    const [commentText, setCurrentNewCommentText] = useState("");
    const [isNewCommentFocus, setIsNewCommentFocus] = useState(false);
    const [isNewReplyFocus, setIsNewReplyFocus] = useState(false);

    const dispatch = useDispatch();

    const sceneObject = useSelector((state: RootState) =>
        state.scene.objects.find(obj => obj.id === objectId)
    );

    if (!sceneObject) return null;

    const variant = useSelector((state: RootState) =>
        state.scene.objects
            .find(obj => obj.id === sceneObject.id)
            ?.variants.find(v => v.id === variantId)
    );


    if (!variant) return <BottomSheet isVisible={false} headerHeight={headerHeight} variantName="" />;

    const toggleLike = () => {
        dispatch(toggleVariantLike({ objectId: sceneObject.id, variantId: variant.id }));
    };

    const toggleDislike = () => {
        dispatch(toggleVariantDislike({ objectId: sceneObject.id, variantId: variant.id }));
    };

    const comments = useSelector((state: RootState) =>
        state.scene.objects.find(obj => obj.id === sceneObject.id)?.comments || []
    );

    const postNewComment = () => {
        const trimmed = commentText.trim();
        if (!trimmed) return;

        const newComment: CommentData = {
            id: Date.now(), // simple unique ID
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

        dispatch(addCommentToObject({
            objectId: sceneObject.id,
            comment: newComment,
        }));
    };

    return (
        <BottomSheet
            isVisible={true}
            headerHeight={headerHeight}
            variantName={variant.name}
            onClose={onClose}
            isNewCommentFocus={isNewCommentFocus}
            isNewReplyFocus={isNewReplyFocus}
        >
            <div className="minh-100 d-flex flex-column" style={{ fontSize: "0.8rem" }}>

                {!isNewCommentFocus &&
                    <div id="scrollableContentSection" className="row">
                        <p>{variant.description}</p>
                    </div>
                }
                {!isNewCommentFocus &&
                    <div className="mb-3">
                        <h6 className="mb-2">Variants</h6>
                        <div className="d-flex flex-wrap gap-2">
                            {sceneObject.variants.map((variantData: VariantData) => {
                                const isActive = variantData.id === variant.id;
                                return (
                                    <button
                                        key={variantData.id}
                                        className={`variant-icon ${isActive ? "active" : ""}`}
                                        onClick={() => {
                                            if (variantData.id !== variant.id) {
                                                setCurrentVariant(objectId, variantData.id);
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
                                <button className={`rating-button rating-up ${variant?.isLiked && "liked"}`} onClick={toggleLike}>
                                    <i className="far fa-thumbs-up"></i>{variant?.likes}
                                </button>
                                <button className={`rating-button rating-down ${variant?.isDisliked && "disliked"}`} onClick={toggleDislike}>
                                    <i className="far fa-thumbs-down"></i>{variant?.dislikes}
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
                    <Comment
                        key={comment.id}
                        objectId={objectId}
                        commentId={comment.id}
                        setIsNewReplyFocus={setIsNewReplyFocus}
                    />))}
            </div>
        </BottomSheet >
    );
};

export default ObjectDescription;
