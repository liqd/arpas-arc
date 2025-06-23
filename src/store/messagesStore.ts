import { create } from "zustand";

type ScreenMessage = {
    id: string;
    text: string;
    duration?: number;
    color?: string;
};

type ScreenMessageState = {
    messages: ScreenMessage[];
    addScreenMessage: (text: string, id?: string, duration?: number, color?: string) => string;
    removeScreenMessage: (id: string) => void;
};

export const useMessageStore = create<ScreenMessageState>((set, get) => ({
    messages: [],
    addScreenMessage: (text, id, duration = undefined, color = "#fff") => {
        id = id ?? text + Math.random().toString(5);
        set((state) => ({
            messages: [...state.messages, { id, text, duration, color: color ?? "#fff"}]
        }));
        if (duration) {
            setTimeout(() => get().removeScreenMessage(id), duration);
        }
        return id;
    },
    removeScreenMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id)
    })),
}));

export default useMessageStore;