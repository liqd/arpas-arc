import { useEffect, useRef, useState } from "react";
import KeyboardReact, { KeyboardOptions } from "react-simple-keyboard";
import 'react-simple-keyboard/build/css/index.css';
import './style.css'

type KeyboardProps = {
    visible: boolean;
    onChange?: (input: string) => void;
    onSubmit?: () => void;
    onKeyPress?: (key: string) => void;
    onRequestClose?: () => void;
    inputRef?: React.RefObject<HTMLElement>;
};

const Keyboard: React.FC<KeyboardProps> = ({
    visible,
    onChange,
    onSubmit,
    onKeyPress,
    onRequestClose,
    inputRef
}) => {
    const [layout, setLayout] = useState<KeyboardOptions['layoutName']>("default");  
    const keyboardRef = useRef<HTMLDivElement>(null);
    const repeatRef = useRef<number | null>(null);

    const [popupInfo, setPopupInfo] = useState<{ 
        key: string;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);

    const [pressedKey, setPressedKey] = useState<string | null>(null);

    const stopRepeat = () => {
        if (repeatRef.current !== null) {
            window.clearInterval(repeatRef.current);
            repeatRef.current = null;
        }
    };

    const startBackspaceRepeat = () => {
        // initial delay, then fast repeat
        setTimeout(() => {
            stopRepeat();
            repeatRef.current = window.setInterval(() => {
                onKeyPress?.("{bksp}");
            }, 50);
        }, 400);
    };

    const handleKeyPress = (button: string) => {
        //Jump to input field
        if(inputRef?.current){
            inputRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        let btnEl: HTMLElement | null = null;

        if(!button.startsWith("{") && button.length === 1){
            btnEl = keyboardRef.current?.querySelector(`[data-skbtn="${button}"]`) as HTMLElement | null;
        }

        if(btnEl && keyboardRef.current){
            const rect = btnEl.getBoundingClientRect();
            const parentRect = keyboardRef.current?.getBoundingClientRect();
            setPopupInfo({
                key: button,
                x: rect.left - parentRect.left + rect.width / 2,
                y: rect.top - parentRect.top - rect.height * 0.3,
                width: rect.width,
                height: rect.height
            });
            setTimeout(() => setPopupInfo(null), 300);
        }
        
        if (button === "{shift}" && layout !== "symbols") {
            setLayout((prev) => (prev === "shift" ? "default" : "shift"));
        } else if (button === "{special}") {
            setLayout("numbers"); // go to numbers first
        } else if (button === "{symbols}") {
            setLayout("symbols");
        } else if (button === "{abc}") {
            setLayout("default");
        } else if (button === "{emoji}") {
            setLayout("emoji");
        } else if (button === "{enter}") {
            onSubmit?.();
        } else if (button === "←" || button === "→") {
            onKeyPress?.(button);
        } else if (button === "{bksp}") {
            onKeyPress?.("{bksp}");
        } else {
            onKeyPress?.(button);
        }
    };

    useEffect(() => {
        if (!visible) return;

        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // If click is inside keyboard → ignore
            if (keyboardRef.current && keyboardRef.current.contains(target)) return;

            // If click hits a designated post button, submit first, then close
            if (target.closest("[data-post-comment]")) {
                onSubmit?.();
            }

            onRequestClose?.();
        };

        // Long-press backspace wiring
        const wireLongPress = () => {
            const bkspBtn = keyboardRef.current?.querySelector('[data-skbtn="{bksp}"]') as HTMLElement | null;
            if (!bkspBtn) return;
            const down = () => startBackspaceRepeat();
            const up = () => stopRepeat();
            bkspBtn.addEventListener("mousedown", down);
            bkspBtn.addEventListener("touchstart", down, { passive: true } as any);
            document.addEventListener("mouseup", up);
            document.addEventListener("touchend", up);
            document.addEventListener("touchcancel", up);
            return () => {
                bkspBtn.removeEventListener("mousedown", down);
                bkspBtn.removeEventListener("touchstart", down as any);
                document.removeEventListener("mouseup", up);
                document.removeEventListener("touchend", up);
                document.removeEventListener("touchcancel", up);
            };
        };

        document.addEventListener("mousedown", handleDocumentClick);
        const cleanupLongPress = wireLongPress();

        return () => {
            document.removeEventListener("mousedown", handleDocumentClick);
            cleanupLongPress && cleanupLongPress();
            stopRepeat();
        };
    }, [visible, onRequestClose, layout]);

    if (!visible) return null;

    return (
        <div ref={keyboardRef} className="arc-keyboard-container" role="dialog" aria-label="On-screen keyboard">
            <KeyboardReact
                theme="hg-theme-default keyboard-default"
                layoutName={layout}
                onChange={onChange}
                onKeyPress={handleKeyPress}
                layout={{
                    default: [
                        "q w e r t y u i o p",
                        "a s d f g h j k l",
                        "{shift} z x c v b n m {bksp}",
                        "{special} {emoji} , {space} . {enter}"
                    ],
                    shift: [
                        "Q W E R T Y U I O P",
                        "A S D F G H J K L",
                        "{shift} Z X C V B N M {bksp}",
                        "{special} {emoji} , {space} . {enter}"
                    ],
                    numbers: [
                        "1 2 3 4 5 6 7 8 9 0",
                        "@ # € _ & - + ( ) /",
                        "{symbols} * \" ' : ; ! ? {bksp}",
                        "{abc} {emoji} , {space} . {enter}"
                    ],
                    symbols: [
                        "~ ` | • √ π ÷ × ¶",
                        "£ $ ¢ ¥ ^ ° = { }",
                        "{special} [ ] < > % © ® ™ {bksp}",
                        "{abc} {emoji} , {space} . {enter}"
                    ],
                    emoji: [
                        "😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇",
                        "🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚",
                        "😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳",
                        "{abc} ❤️ 👍 👎 🙌 👏 🙏 🔥 💯"
                    ]
                }}
                buttonTheme={[
                    { class: "key-mod key-shift", buttons: "{shift}" },
                    { class: "key-mod key-bksp", buttons: "{bksp}" },
                    { class: "key-mod key-enter", buttons: "{enter}" },
                    { class: "key-wide key-space", buttons: "{space}" },
                    { class: "key-wide key-mode", buttons: "{special} {symbols} {abc} {emoji}" }
                ]}
                display={{
                    "{shift}": "⇧",
                    "{space}": " ",
                    "{bksp}": "⌫",
                    "{enter}": "↵",
                    "{special}": "123",
                    "{symbols}": "#+=",
                    "{abc}": "ABC",
                    "{emoji}": "❤️"
                }}
            />
            {popupInfo && (
                <div className="popup-key"
                    style={{
                        left: popupInfo.x,
                        top: popupInfo.y - popupInfo.height - 10,
                    }}
                >
                    {popupInfo.key}
                </div>
            )}
        </div>
    );
};

export default Keyboard;
