import { useEffect, useRef, useState } from "react";
import { BottomSheet, Keyboard } from "..";
import { CommentData, ReplyData, VariantData } from "../../types/objectData";
import useSceneStore from "../../store/sceneStore";
import "./style.css";

const Comment: React.FC<{ objectId: number; commentId: number; forceCloseKeyboard: boolean }> = ({
    objectId,
    commentId,
    forceCloseKeyboard = false,
}) => {
    const [isShowingReplies, setIsShowingReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);
    const { scene, toggleCommentLike, toggleCommentDislike, postCommentReply } = useSceneStore();

    const sceneObject = scene.objects.find((obj) => obj.id === objectId);
    if (!sceneObject) return null;

    const getCommentOrReply = (commentId: number): CommentData | ReplyData | null => {
        for (const c of sceneObject.comments) {
            if (c.id === commentId) return c;
            const reply = c.replies.find((r) => r.id === commentId);
            if (reply) return reply;
        }
        return null;
    };

    const comment = getCommentOrReply(commentId);
    if (!comment) return null;

    const isReply = !("replies" in comment);

    const handleLike = () => toggleCommentLike(objectId, commentId);
    const handleDislike = () => toggleCommentDislike(objectId, commentId);

    const handleKeyboardOpen = () => {
        setIsKeyboardVisible(true);

        // Scroll the reply input into view above the keyboard only if it is below the keyboard
        if (inputRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const snapToKeyboardHeight = window.innerHeight * 0.35;

            if (inputRect.bottom > window.innerHeight - snapToKeyboardHeight) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
            }
        }
    };

    const handleKeyboardClose = () => {
        setIsKeyboardVisible(false);
    };

    useEffect(() => {
        if (forceCloseKeyboard) {
            handleKeyboardClose();
        }
    }, [forceCloseKeyboard]);

    const handleKeyboardKeyPress = (key: string) => {
        if (key === "{bksp}") {
            setReplyText(prev => prev.slice(0, -1));
        } else if (key === "{space}") {
            setReplyText(prev => prev + " ");
        } else if (!key.startsWith("{")) {
            setReplyText(prev => prev + key);
        }
    };

    const handlePostReply = () => {
        if (isReply) return;
        const trimmed = replyText.trim();
        if (!trimmed) return;

        const newReply: ReplyData = {
            id: Date.now(),
            commentId: commentId,
            username: "Republica",
            isModerator: false,
            text: trimmed,
            timestamp: Date.now(),
            likes: 0,
            dislikes: 0,
            isLiked: false,
            isDisliked: false,
        };

        setReplyText("");
        postCommentReply(objectId, commentId, newReply);
        setIsKeyboardVisible(false);
    };

    return (<>
        <div className={`row top-border ${isReply && "ps-3 pb-2"}`}>
            <div className="a4-comments__box pt-3">
                <div className="a4-comments__box--user row">
                    <div className="col-2 col-lg-1 a4-comments__user-img">
                        <i className="fas fa-user-circle fa-3x"></i>
                    </div>
                    <div className="col-7 col-md-8">
                        <div className="a4-comments__author">{comment.username}</div>
                        <span className="a4-comments__moderator" style={{ fontSize: "0.8rem" }}>{comment.isModerator}</span>
                        <time className="a4-comments__submission-date">{new Date(comment.timestamp).toLocaleString()}</time>
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
                            <button className={`rating-button rating-up${comment?.isLiked && " liked"}`} onClick={handleLike}>
                                <i className="far fa-thumbs-up"></i>{comment.likes}
                            </button>
                            <button className={`rating-button rating-down${comment?.isDisliked && " disliked"}`} onClick={handleDislike}>
                                <i className="far fa-thumbs-down"></i>{comment?.dislikes}
                            </button>
                        </div>
                        {!isReply && (
                            <div className="a4-comments__action-bar">
                                <button className="btn btn--no-border a4-comments__action-bar__btn" type="button" onClick={() => setIsShowingReplies((prev) => !prev)}>
                                    {isShowingReplies ? <> <i className="fas fa-minus"></i> Hide Replies </> : <> <i className="far fa-comment"></i>{comment.replies.length} Replies </>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {!isReply && isShowingReplies && (<>
            {comment.replies.map((reply) => (
                <Comment key={reply.id} objectId={objectId} commentId={reply.id} forceCloseKeyboard={forceCloseKeyboard} />
            ))}
            <div className="commenting my-0 py-2 ps-3">
                <h6>Join the discussion</h6>
                <div className="form-group commenting__content mb-0">
                    <label>
                        Your reply
                        <div
                            className="input-div"
                            role="textbox"
                            tabIndex={0}
                            onClick={handleKeyboardOpen}
                        >
                            {replyText}
                            {isKeyboardVisible && (
                                <span style={{ display: "inline-block", width: "1px", backgroundColor: "black", height: "1em" }} />
                            )}
                        </div>
                    </label>
                    <div ref={inputRef}>
                        <button className="btn btn--default btn--full mb-0" onClick={handlePostReply}>
                            Post
                        </button>
                    </div>
                </div>
            </div>

            {isKeyboardVisible && <div style={{ height: "15vh" }} />}
        </>)
        }

        <Keyboard
            visible={isKeyboardVisible}
            onSubmit={handlePostReply}
            onKeyPress={handleKeyboardKeyPress}
            onRequestClose={handleKeyboardClose}
        />
    </>);
};

const ObjectDescription: React.FC<{
    objectId: number;
    variantId: number;
    headerHeight: number;
    setCurrentVariant: (objectId: number, variantId: number) => void;
    onClose: () => void;
}> = ({ objectId, variantId, headerHeight, setCurrentVariant, onClose }) => {
    const [isSheetMinimized, setIsSheetMinimized] = useState(false);
    const [commentText, setCommentText] = useState<string>("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    const { scene, toggleVariantLike, toggleVariantDislike, postComment } = useSceneStore();
    const sceneObject = scene.objects.find((obj) => obj.id === objectId);
    if (!sceneObject) return null;
    const comments = sceneObject?.comments || [];

    const variant = sceneObject.variants.find((v) => v.id === variantId);
    if (!variant) return <BottomSheet isVisible={false} headerHeight={headerHeight} variantName="" />;

    const handleVariantLike = () => toggleVariantLike(objectId, variantId);
    const handleVariantDislike = () => toggleVariantDislike(objectId, variantId);

    const handleKeyboardKeyPress = (key: string) => {
        if (key === "{bksp}") {
            setCommentText(prev => prev.slice(0, -1));
        } else if (key === "{space}") {
            setCommentText(prev => prev + " ");
        } else if (!key.startsWith("{")) {
            setCommentText(prev => prev + key);
        }
    };

    const handlePostComment = () => {
        const trimmed = commentText.trim();
        if (!trimmed) return;

        const newComment: CommentData = {
            id: Date.now(),
            username: "Republica",
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
        postComment(sceneObject.id, newComment);
        setIsKeyboardVisible(false);
    };

    const handleKeyboardOpen = () => {
        setIsKeyboardVisible(true);

        // Scroll the textbox into view above the keyboard only if it is below the keyboard
        if (inputRef.current) {
            const inputRect = inputRef.current.getBoundingClientRect();
            const snapToKeyboardHeight = window.innerHeight * 0.35;

            if (inputRect.bottom > window.innerHeight - snapToKeyboardHeight) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
            }
        }
    };

    const handleKeyboardClose = () => {
        setIsKeyboardVisible(false);
    };

    return (<>
        <BottomSheet
            isVisible={true}
            headerHeight={headerHeight}
            variantName={variant.name}
            onClose={onClose}
            onMinimize={(minimized) => {
                setIsSheetMinimized(minimized);
                if (minimized) handleKeyboardClose();
            }}
        >
            <div className="minh-100 d-flex flex-column" style={{ fontSize: "0.8rem" }}>

                <div id="scrollableContentSection" className="row">
                    <p>{variant.description}</p>
                </div>
                {sceneObject.variants.length > 1 && (
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
                                        <span
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: ".75em",
                                            }}
                                        >
                                            {variantData.name.length > 10 ? variantData.name.slice(0, 8) + "…" : variantData.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                <div className="row top-border">
                    <div className="col-12 a4-comments__action-bar-container">
                        <div className="rating">
                            <button className={`rating-button rating-up${variant?.isLiked && " liked"}`} onClick={handleVariantLike}>
                                <i className="far fa-thumbs-up"></i>{variant?.likes}
                            </button>
                            <button className={`rating-button rating-down${variant?.isDisliked && " disliked"}`} onClick={handleVariantDislike}>
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

                <div id="discussionSection" className="commenting my-0">
                    <h6>Join the discussion</h6>
                    <div className="form-group commenting__content mb-0">
                        <label>
                            Your comment
                            <div
                                className="input-div"
                                role="textbox"
                                tabIndex={0}
                                onClick={handleKeyboardOpen}
                                style={{ caretColor: "black", whiteSpace: "pre-wrap" }}
                            >
                                {commentText}
                                {isKeyboardVisible && (
                                    <span style={{ display: "inline-block", width: "1px", backgroundColor: "black", height: "1em" }} />
                                )}
                            </div>
                        </label>
                        <div ref={inputRef}>
                            <button className="btn btn--default btn--full mb-0" onClick={handlePostComment}>
                                Post
                            </button>
                        </div>
                    </div>
                </div>

                <h6 className="my-4">Discussion</h6>
                {comments.length > 0 ? (
                    comments.slice().reverse().map((comment) => (
                        <Comment
                            key={comment.id}
                            objectId={objectId}
                            commentId={comment.id}
                            forceCloseKeyboard={isSheetMinimized}
                        />
                    ))
                ) : (
                    <p>No comments yet. Be the first to comment!</p>
                )}
            </div>

            {isKeyboardVisible && <div style={{ height: "15vh" }} />}
        </BottomSheet>

        <Keyboard
            visible={isKeyboardVisible}
            onSubmit={handlePostComment}
            onKeyPress={handleKeyboardKeyPress}
            onRequestClose={handleKeyboardClose}
        />
    </>);
};

export default ObjectDescription;
