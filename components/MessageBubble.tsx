import { View, Text, Image, useWindowDimensions } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { cn } from "../lib/utils";
import dayjs from "dayjs";
import { Message } from "../types/chat";
import { useChatStore } from "../store/chatStore";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    const { setReplyingTo } = useChatStore();
    const { content, created_at, type, media_url, reply_to } = message;

    const renderRightActions = () => {
        if (isOwn) return null;
        return (
            <View className="justify-center items-center w-16 h-full bg-blue-600/20 rounded-r-2xl">
                <Text className="text-white text-xs font-bold">Reply</Text>
            </View>
        );
    };

    const onSwipeableOpen = () => {
        setReplyingTo(message);
    };

    return (
        <Swipeable
            renderLeftActions={isOwn ? undefined : renderRightActions}
            onSwipeableOpen={onSwipeableOpen}
        >
            <Animated.View
                layout={Layout.springify()}
                entering={FadeInUp.springify().damping(20).stiffness(300)}
                className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 mb-2",
                    isOwn ? "bg-blue-600 self-end rounded-br-none" : "bg-zinc-800 self-start rounded-bl-none",
                    type === 'image' && "p-0 overflow-hidden"
                )}
            >
                {/* Reply Context */}
                {reply_to && (
                    <View className="mb-2 pl-2 border-l-2 border-white/50 bg-black/10 rounded p-1 opacity-80">
                        <Text className="text-white/60 text-[10px] font-bold">Replied to</Text>
                        <Text numberOfLines={1} className="text-white/80 text-xs text-ellipsis">
                            {reply_to.type === 'image' ? 'Image' : reply_to.content}
                        </Text>
                    </View>
                )}

                {type === 'image' && media_url ? (
                    <Image
                        source={{ uri: media_url }}
                        style={{ width: 250, height: 250 }}
                        className="rounded-2xl"
                        resizeMode="cover"
                    />
                ) : (
                    <Text className="text-white text-[16px] leading-[22px]">{content}</Text>
                )}

                <Text className={cn("text-white/40 text-[10px] self-end mt-1", type === 'image' && "absolute bottom-2 right-2 bg-black/40 px-1 rounded")}>
                    {dayjs(created_at).format("HH:mm")}
                </Text>
            </Animated.View>
        </Swipeable>
    );
}
