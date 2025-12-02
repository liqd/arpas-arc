import { useEffect, useRef, useState } from "react";
import { BottomSheet, Keyboard } from "..";
import { VariantData } from "../../types/objectData";
import useSceneStore from "../../store/sceneStore";
import { useCommentsStore } from "../../store/commentsStore";
import { useRatingStore } from "../../store/ratingStore";
import "./style.css";

const Comment: React.FC<{
    objectPk: number;
    commentId: number;
    forceCloseKeyboard: boolean;
}> = ({ objectPk, commentId, forceCloseKeyboard }) => {
    const [isShowingReplies, setIsShowingReplies] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    const comment = useCommentsStore(s => s.byId[commentId]);
    const replys = useCommentsStore(s => s.getReplyComments(commentId));
    const commentRating = useRatingStore(s => s.getCommentRating(objectPk, commentId));
    const addComment = useCommentsStore(s => s.addComment);
    const toggleLike = useRatingStore(s => s.toggleCommentLike);
    const toggleDislike = useRatingStore(s => s.toggleCommentDislike);

    if (!comment) return null;
    const isReply = comment.parentId !== null;

    const handleKeyboardOpen = () => {
        setIsKeyboardVisible(true);
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
    const handleKeyboardClose = () => setIsKeyboardVisible(false);

    useEffect(() => {
        if (forceCloseKeyboard) handleKeyboardClose();
    }, [forceCloseKeyboard]);

    const handleKeyboardKeyPress = (key: string) => {
        if (key === "{bksp}") setReplyText(p => p.slice(0, -1));
        else if (key === "{space}") setReplyText(p => p + " ");
        else if (!key.startsWith("{")) setReplyText(p => p + key);
    };

    const handlePostReply = () => {
        if (isReply) return;
        const trimmed = replyText.trim();
        if (!trimmed) return;
        addComment(objectPk, trimmed, commentId);
        setReplyText("");
        setIsKeyboardVisible(false);
    };

    return (
        <>
            <div className={`row top-border ${isReply && "ps-4 pb-2"}`}>
                <div className="a4-comments__box pt-3">
                    <div className="a4-comments__box--user row">
                        <div className="col-2 col-lg-1 a4-comments__user-img">
                            <i className="fas fa-user-circle fa-3x"></i>
                        </div>
                        <div className="col-7 col-md-8">
                            <div className="a4-comments__author">{comment.userName || "User"}</div>
                            <span className="a4-comments__moderator" style={{ fontSize: "0.8rem" }}>
                                {false /* placeholder moderator flag */}
                            </span>
                            <time className="a4-comments__submission-date">
                                {comment.created
                                    ? comment.created
                                    : ""}
                            </time>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div className="a4-comments__text">
                                <p style={{ opacity: comment._pending ? 0.5 : 1 }}>{comment.text}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12 a4-comments__action-bar-container">
                            <div className="rating">
                                <button
                                    className={`rating-button rating-up${commentRating?.isLiked ? " liked" : ""}`}
                                    onClick={() => toggleLike(objectPk, comment.id)}
                                >
                                    <i className="far fa-thumbs-up"></i>
                                    {commentRating?.likes ?? 0}
                                </button>
                                <button
                                    className={`rating-button rating-down${commentRating?.isDisliked ? " disliked" : ""}`}
                                    onClick={() => toggleDislike(objectPk, comment.id)}
                                >
                                    <i className="far fa-thumbs-down"></i>
                                    {commentRating?.dislikes ?? 0}
                                </button>
                            </div>
                            {!isReply && (
                                <div className="a4-comments__action-bar">
                                    <button
                                        className="btn btn--no-border a4-comments__action-bar__btn"
                                        type="button"
                                        onClick={() => setIsShowingReplies(p => !p)}
                                    >
                                        {isShowingReplies ? (
                                            <>
                                                <i className="fas fa-minus"></i> Hide Replies
                                            </>
                                        ) : (
                                            <>
                                                <i className="far fa-comment"></i> {replys.length} Replies
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!isReply && isShowingReplies && (
                <>
                    {replys.map(r => (
                        <Comment
                            key={r.id}
                            objectPk={objectPk}
                            commentId={r.id}
                            forceCloseKeyboard={forceCloseKeyboard}
                        />
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
                                        <span
                                            style={{
                                                display: "inline-block",
                                                width: "1px",
                                                backgroundColor: "black",
                                                height: "1em"
                                            }}
                                        />
                                    )}
                                </div>
                            </label>
                            <div ref={inputRef}>
                                <button
                                    className="btn btn--default btn--full mb-0"
                                    data-post-comment
                                    onClick={handlePostReply}
                                >
                                    Reply
                                </button>
                            </div>
                        </div>
                    </div>
                    {isKeyboardVisible && <div style={{ height: "15vh" }} />}
                </>
            )}

            <Keyboard
                visible={isKeyboardVisible}
                onSubmit={handlePostReply}
                onKeyPress={handleKeyboardKeyPress}
                onRequestClose={handleKeyboardClose}
                inputRef={inputRef}
            />
        </>
    );
};

const ObjectDescription: React.FC<{
    objectId: number;
    variantId: number;
    headerHeight: number;
    setCurrentVariant: (objectId: number, variantId: number) => void;
    onClose: () => void;
    fontSize: number;
}> = ({ objectId, variantId, headerHeight, setCurrentVariant, onClose, fontSize }) => {
    const [isSheetMinimized, setIsSheetMinimized] = useState(false);
    const [commentText, setCommentText] = useState<string>("");
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [hasHardwareKeyboard, setHasHardwareKeyboard] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    // Test: Tastatur automatisch öffnen
    useEffect(() => {
        setIsKeyboardVisible(true);  
    }, []);

    const { scene } = useSceneStore();

    const addComment = useCommentsStore(s => s.addComment);
    const ensureLoaded = useCommentsStore(s => s.ensureObjectLoaded);
    const roots = useCommentsStore(s => s.getCommentRoots(objectId));

    const variantRating = useRatingStore(s => s.getVariantRating(objectId, variantId));
    const likeVariant = useRatingStore(s => s.toggleVariantLike);
    const dislikeVariant = useRatingStore(s => s.toggleVariantDislike);

    const sceneObject = scene.objects.find(o => o.id === objectId);
    if (!sceneObject)
        return <BottomSheet isVisible={false} headerHeight={headerHeight} variantName="" fontSize={fontSize} />;

    const variant = sceneObject.variants.find(v => v.id === variantId);
    if (!variant)
        return <BottomSheet isVisible={false} headerHeight={headerHeight} variantName="" fontSize={fontSize} />;

    useEffect(() => {
        ensureLoaded(objectId);
    }, [ensureLoaded, objectId]);

    // Detect hardware keyboard by listening for physical keydown events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore modifier keys, but if a real key is pressed, assume hardware keyboard
            if (e.key.length === 1 || e.key === "Enter" || e.key === "Backspace") {
                setHasHardwareKeyboard(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    

    const handleVariantLike = () => likeVariant(objectId, variantId);
    const handleVariantDislike = () => dislikeVariant(objectId, variantId);

    const handleKeyboardKeyPress = (key: string) => {
        if (key === "{bksp}") setCommentText(p => p.slice(0, -1));
        else if (key === "{space}") setCommentText(p => p + " ");
        else if (!key.startsWith("{")) setCommentText(p => p + key);
    };

    const handlePostComment = () => {
        const trimmed = commentText.trim();
        if (!trimmed) return;
        addComment(objectId, trimmed);
        setCommentText("");
        handleKeyboardClose();
    };

    const handleKeyboardOpen = () => {
        setIsKeyboardVisible(true);
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const snap = window.innerHeight * 0.35;
            if (rect.bottom > window.innerHeight - snap) {
                setTimeout(() => {
                    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 50);
            }
        }
    };
    const handleKeyboardClose = () => setIsKeyboardVisible(false);

    return (
        <>
            <BottomSheet
                isVisible={true}
                headerHeight={headerHeight}
                variantName={variant.name}
                onClose={onClose}
                onMinimize={minimized => {
                    setIsSheetMinimized(minimized);
                    if (minimized) handleKeyboardClose();
                }}
                fontSize={fontSize}
            >
                <div className="minh-100 d-flex flex-column" style={{ fontSize: `${fontSize * 0.8}px` }}>
                    <div id="scrollableContentSection" className="row">
                        <p>{variant.description}</p>
                    </div>

                    {sceneObject.variants.length > 1 && (
                        <div className="mb-3">
                            <h4>Variants</h4>
                            <div className="d-flex flex-wrap gap-3">
                                {sceneObject.variants.map((variantData: VariantData) => {
                                    const isActive = variantData.id === variant.id;
                                    return (
                                        <button
                                            key={variantData.id}
                                            className={`variant-icon ${isActive ? "active" : ""}`}
                                            onClick={() => {
                                                if (!isActive) setCurrentVariant(objectId, variantData.id);
                                            }}
                                        >
                                            <span className="variant-circle">
                                                <i className="fas fa-circle fa-3x"></i>
                                                <span className="variant-circle__label" style={{ fontSize: `${fontSize}px` }}>{variantData.id}</span>
                                            </span>
                                            <span className="variant-name">{variantData.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="row top-border">
                        <div className="col-12 a4-comments__action-bar-container">
                            <div className="rating">
                                <button
                                    className={`rating-button rating-up${variantRating?.isLiked ? " liked" : ""}`}
                                    onClick={handleVariantLike}
                                >
                                    <i className="far fa-thumbs-up"></i>
                                    {variantRating?.likes ?? variant?.likes ?? 0}
                                </button>
                                <button
                                    className={`rating-button rating-down${variantRating?.isDisliked ? " disliked" : ""}`}
                                    onClick={handleVariantDislike}
                                >
                                    <i className="far fa-thumbs-down"></i>
                                    {variantRating?.dislikes ?? variant?.dislikes ?? 0}
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
                        <h4>Join the discussion</h4>
                        <div className="form-group commenting__content mb-0">
                            <label>
                                Your comment
                                {hasHardwareKeyboard ? (
                                    <textarea
                                        className="input-div"
                                        role="textbox"
                                        value={commentText}
                                        onChange={e => setCommentText(e.target.value)}
                                        style={{ caretColor: "black", whiteSpace: "pre-wrap", width: "100%" }}
                                        rows={2}
                                    />
                                ) : (
                                    <div
                                        className="input-div"
                                        role="textbox"
                                        tabIndex={0}
                                        onClick={handleKeyboardOpen}
                                        style={{ caretColor: "black", whiteSpace: "pre-wrap" }}
                                    >
                                        {commentText}
                                        {isKeyboardVisible && (
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: "1px",
                                                    backgroundColor: "black",
                                                    height: "1em"
                                                }}
                                            />
                                        )}
                                    </div>
                                )}
                            </label>
                            <div ref={inputRef}>
                                <button
                                    className="btn btn--default btn--full mb-0"
                                    data-post-comment
                                    onClick={handlePostComment}
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>

                    <h4>Discussion</h4>
                    {roots.length > 0 ? (
                        roots
                            .slice()
                            .reverse()
                            .map(r => (
                                <Comment
                                    key={r.id}
                                    objectPk={objectId}
                                    commentId={r.id}
                                    forceCloseKeyboard={isSheetMinimized}
                                />
                            ))
                    ) : (
                        <p>No comments yet. Be the first to comment!</p>
                    )}
                </div>

                {!hasHardwareKeyboard && isKeyboardVisible && <div style={{ height: "15vh" }} />}
            </BottomSheet>

            <Keyboard
                visible={!hasHardwareKeyboard && isKeyboardVisible}
                onSubmit={handlePostComment}
                onKeyPress={handleKeyboardKeyPress}
                onRequestClose={handleKeyboardClose}
                inputRef={inputRef}
            />
        </>
    );
};

export default ObjectDescription;
