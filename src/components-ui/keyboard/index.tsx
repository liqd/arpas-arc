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
};

const Keyboard: React.FC<KeyboardProps> = ({
    visible,
    onChange,
    onSubmit,
    onKeyPress,
    onRequestClose,
}) => {
    const [layout, setLayout] = useState<KeyboardOptions['layoutName']>("default");
    const keyboardRef = useRef<HTMLDivElement>(null);

    const handleKeyPress = (button: string) => {
        if (button === "{shift}" || button === "{lock}") {
            setLayout(prev => (prev === "default" ? "shift" : "default"));
        } else if (button === "{enter}") {
            onSubmit?.();
        } else {
            onKeyPress?.(button);
        }
    };

    useEffect(() => {
        if (!visible) return;

        const handleDocumentClick = (event: MouseEvent) => {
            if (
                keyboardRef.current &&
                !keyboardRef.current.contains(event.target as Node)
            ) {
                onRequestClose?.();
            }
        };

        document.addEventListener("mousedown", handleDocumentClick);

        return () => {
            document.removeEventListener("mousedown", handleDocumentClick);
        };
    }, [visible, onRequestClose]);

    if (!visible) return null;

    return (
        <div ref={keyboardRef}>
            <KeyboardReact
                theme="hg-theme-default keyboard-default"
                layoutName={layout}
                onChange={onChange}
                onKeyPress={handleKeyPress}
            />
        </div>
    );
};

export default Keyboard;
