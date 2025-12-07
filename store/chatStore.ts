import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Message } from '../types/chat';

interface ChatState {
    messages: Message[];
    addMessage: (msg: Message) => void;
    setMessages: (msgs: Message[]) => void;
    sendMessage: (content: string, userId: string, type?: 'text' | 'image', mediaUrl?: string, parentId?: string | null) => Promise<void>;
    inputText: string;
    setInputText: (text: string) => void;
    replyingTo: Message | null;
    setReplyingTo: (msg: Message | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    inputText: '',
    replyingTo: null,

    setInputText: (text) => set({ inputText: text }),
    setReplyingTo: (msg) => set({ replyingTo: msg }),
    addMessage: (msg) => set((state) => ({ messages: [msg, ...state.messages] })),
    setMessages: (msgs) => set({ messages: msgs }),

    sendMessage: async (content, userId, type = 'text', mediaUrl, parentId) => {
        // Optimistic Update
        const optimisticMsg: Message = {
            id: Math.random().toString(),
            content,
            user_id: userId,
            created_at: new Date().toISOString(),
            is_optimistic: true,
            type,
            media_url: mediaUrl,
            parent_id: parentId,
            reply_to: get().replyingTo
        };

        set((state) => ({
            messages: [optimisticMsg, ...state.messages],
            inputText: '',
            replyingTo: null // Clear reply state
        }));

        // Send to Supabase (Hardcoded 'general' channel for MVP)
        const { data: channel } = await supabase.from('channels').select('id').eq('slug', 'general').single();
        if (!channel) return;

        const { error } = await supabase.from('messages').insert({
            content,
            user_id: userId,
            channel_id: channel.id,
            type,
            media_url: mediaUrl,
            parent_id: parentId
        });

        if (error) {
            console.error("Message send failed:", error);
        }
    },
}));
