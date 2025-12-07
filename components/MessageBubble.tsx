import { View, Text, Image, useWindowDimensions } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { cn } from "../lib/utils";
import dayjs from "dayjs";
import { Message } from "../types/chat";

interface MessageBubbleProps {
    content: string;
    isOwn: boolean;
    createdAt: string;
    type?: 'text' | 'image';
    mediaUrl?: string;
}

export function MessageBubble({ content, isOwn, createdAt, type, mediaUrl }: MessageBubbleProps) {
    const { width } = useWindowDimensions();
    const maxWidth = width * 0.7;

    return (
        <Animated.View
            layout={Layout.springify()}
            entering={FadeInUp.springify().damping(20).stiffness(300)}
            className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 mb-2",
                isOwn ? "bg-blue-600 self-end rounded-br-none" : "bg-zinc-800 self-start rounded-bl-none",
                type === 'image' && "p-0 overflow-hidden" // Remove padding for images
            )}
        >
            {type === 'image' && mediaUrl ? (
                <Image
                    source={{ uri: mediaUrl }}
                    style={{ width: 250, height: 250 }}
                    className="rounded-2xl"
                    resizeMode="cover"
                />
            ) : (
                <Text className="text-white text-[16px] leading-[22px]">{content}</Text>
            )}

            <Text className={cn("text-white/40 text-[10px] self-end mt-1", type === 'image' && "absolute bottom-2 right-2 bg-black/40 px-1 rounded")}>
                {dayjs(createdAt).format("HH:mm")}
            </Text>
        </Animated.View>
    );
}
