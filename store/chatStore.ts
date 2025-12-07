import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message } from '../types/chat';

interface ChatState {
    messages: Message[];
    addMessage: (msg: Message) => void;
    setMessages: (msgs: Message[]) => void;
    sendMessage: (content: string, userId: string, type?: 'text' | 'image', mediaUrl?: string) => Promise<void>;
    inputText: string;
    setInputText: (text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    inputText: '',
    setInputText: (text) => set({ inputText: text }),
    addMessage: (msg) => set((state) => ({ messages: [msg, ...state.messages] })),
    setMessages: (msgs) => set({ messages: msgs }),
    sendMessage: async (content, userId, type = 'text', mediaUrl) => {
        // Optimistic Update
        const optimisticMsg: Message = {
            id: Math.random().toString(),
            content,
            user_id: userId,
            created_at: new Date().toISOString(),
            is_optimistic: true,
            type,
            media_url: mediaUrl
        };

        set((state) => ({ messages: [optimisticMsg, ...state.messages], inputText: '' }));

        // Send to Supabase (Hardcoded 'general' channel for MVP)
        const { data: channel } = await supabase.from('channels').select('id').eq('slug', 'general').single();
        if (!channel) return;

        const { error } = await supabase.from('messages').insert({
            content,
            user_id: userId,
            channel_id: channel.id,
            type,
            media_url: mediaUrl
        });

        if (error) {
            console.error("Message send failed:", error);
        }
    },
}));
