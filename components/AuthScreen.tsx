import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { GlassCard } from "../components/ui/GlassCard";
import { StatusBar } from "expo-status-bar";

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);

    async function handleAuth() {
        setLoading(true);
        const { error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });

        if (error) Alert.alert(error.message);
        else if (!isLogin) Alert.alert("Success", "Please check your email for confirmation!");

        setLoading(false);
    }

    return (
        <View className="flex-1 items-center justify-center bg-black p-6">
            <GlassCard intensity={80} className="w-full max-w-sm p-6 gap-4">
                <Text className="text-3xl font-bold text-white text-center mb-2">
                    {isLogin ? "Welcome Back" : "Join Synk"}
                </Text>

                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#666"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    className="bg-white/10 text-white p-4 rounded-xl border border-white/5"
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#666"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="bg-white/10 text-white p-4 rounded-xl border border-white/5"
                />

                <TouchableOpacity
                    onPress={handleAuth}
                    disabled={loading}
                    className="bg-blue-600 p-4 rounded-xl items-center mt-2"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">
                            {isLogin ? "Sign In" : "Sign Up"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsLogin(!isLogin)} className="mt-4">
                    <Text className="text-zinc-400 text-center text-sm">
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </Text>
                </TouchableOpacity>
            </GlassCard>
            <StatusBar style="light" />
        </View>
    );
}
