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
    addScreenMessage: (text, id, duration = undefined, color = "white") => {
        id = id ?? text + Math.random().toString(5);
        set((state) => {
            // Only add if id does not yet exist
            if (state.messages.some((m) => m.id === id)) return state;
            
            if (duration) {
                setTimeout(() => get().removeScreenMessage(id), duration);
            }
            
            return {
                messages: [...state.messages, { id, text, duration, color: color ?? "white" }]
            };
        });
        return id;
    },
    removeScreenMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id)
    })),
}));

export default useMessageStore;