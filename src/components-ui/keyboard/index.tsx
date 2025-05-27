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
        if (button === "{shift}" && layout !== "special") {
            setLayout((prev) => prev === "shift" ? "default" : "shift");
        } else if (button === "{special}") {
            setLayout((prev) => prev === "special" ? "default" : "special");
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
                layout={{
                    'default': [
                        'q w e r t y u i o p',
                        'a s d f g h j k l',
                        '{shift} z x c v b n m {bksp}',
                        '{special} {space} {enter}'
                    ],
                    'shift': [
                        'Q W E R T Y U I O P',
                        'A S D F G H J K L',
                        '{shift} Z X C V B N M {bksp}',
                        '{special} {space} {enter}'
                    ],
                    'special': [
                        '1 2 3 4 5 6 7 8 9 0',
                        '@ # € _ & - + ( ) /',
                        '{shift} * " \' : ; ! ? {bksp}',
                        '{special} {space} {enter}'
                    ]
                }}
                buttonTheme={[
                    {
                        class: "fas fa-caret-square-up",
                        buttons: "{shift}"
                    },
                    {
                        class: "fas fa-backspace",
                        buttons: "{bksp}"
                    },
                    {
                        class: "fas fa-arrow-right",
                        buttons: "{enter}"
                    }
                ]}
                display={{
                    '{shift}': ' ',
                    '{space}': ' ',
                    '{bksp}': ' ',
                    '{enter}': ' ',
                    '{special}': '?123'
                }}
            />
        </div>
    );
};

export default Keyboard;
