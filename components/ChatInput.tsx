import { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Send } from "lucide-react-native";
import { GlassCard } from "./ui/GlassCard";
import { useChatStore } from "../store/chatStore";
import { useAuth } from "../hooks/useAuth";
import { ChatMediaPicker } from "./ChatMediaPicker";

export function ChatInput() {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const { sendMessage } = useChatStore();
    const { session } = useAuth();

    const handleSend = async () => {
        if (!text.trim() || !session?.user) return;

        const content = text.trim();
        setText("");
        setSending(true);

        await sendMessage(content, session.user.id);
        setSending(false);
    };

    const handleImageSelected = async (url: string) => {
        if (!session?.user) return;
        await sendMessage("Sent an image", session.user.id, 'image', url);
    };

    return (
        <GlassCard intensity={40} className="mx-4 mb-8 p-2 flex-row items-center border-t border-white/10 rounded-full">
            {session?.user && <ChatMediaPicker userId={session.user.id} onImageSelected={handleImageSelected} />}

            <TextInput
                value={text}
                onChangeText={setText}
                placeholder="iMessage..."
                placeholderTextColor="#666"
                className="flex-1 text-white px-4 py-2 text-lg"
                multiline
            />
            <TouchableOpacity
                onPress={handleSend}
                disabled={!text.trim() || sending}
                className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-1"
            >
                {sending ? <ActivityIndicator size="small" color="white" /> : <Send size={20} color="white" />}
            </TouchableOpacity>
        </GlassCard>
    );
}
