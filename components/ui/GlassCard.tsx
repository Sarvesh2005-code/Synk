import { View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { cn } from "../../lib/utils";

interface GlassCardProps extends ViewProps {
    intensity?: number;
    className?: string;
    tint?: "light" | "dark" | "default";
}

export function GlassCard({ children, intensity = 50, tint = "dark", className, style, ...props }: GlassCardProps) {
    return (
        <BlurView
            intensity={intensity}
            tint={tint}
            className={cn("overflow-hidden rounded-2xl border border-white/10", className)}
            style={style}
            {...props}
        >
            {children}
        </BlurView>
    );
}
