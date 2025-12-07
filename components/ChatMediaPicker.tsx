import { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface ChatMediaPickerProps {
    onImageSelected: (url: string) => void;
    userId: string;
}

export function ChatMediaPicker({ onImageSelected, userId }: ChatMediaPickerProps) {
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.5,
                base64: true, // Use base64 for simpler upload in this MVP
            });

            if (!result.canceled && result.assets[0].base64) {
                uploadImage(result.assets[0].base64, result.assets[0].uri);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error picking image");
        }
    };

    const uploadImage = async (base64: string, uri: string) => {
        setUploading(true);
        try {
            const ext = uri.split('.').pop()?.toLowerCase() || 'jpeg';
            const fileName = `${userId}/${Date.now()}.${ext}`;
            const filePath = `${fileName}`;

            // Upload base64 to Supabase Storage
            const { data, error } = await supabase.storage
                .from('chat-media')
                .upload(filePath, decode(base64), {
                    contentType: `image/${ext}`,
                });

            if (error) throw error;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat-media')
                .getPublicUrl(filePath);

            onImageSelected(publicUrl);
        } catch (error: any) {
            Alert.alert("Upload Failed", error.message);
        } finally {
            setUploading(false);
        }
    };

    // Helper to decode base64 to ArrayBuffer (if needed) or just import 'base64-arraybuffer'
    // For now, let's assume standard supabase upload works with Blob/File or ArrayBuffer.
    // We need `decode` from base64-arraybuffer ideally.
    function decode(base64: string) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const lookup = new Uint8Array(256);
        for (let i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }

        let bufferLength = base64.length * 0.75;
        let len = base64.length;
        let i;
        let p = 0;
        let encoded1, encoded2, encoded3, encoded4;

        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }

        const arraybuffer = new ArrayBuffer(bufferLength),
            bytes = new Uint8Array(arraybuffer);

        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];

            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }

        return arraybuffer;
    }

    return (
        <TouchableOpacity onPress={pickImage} disabled={uploading} className="mr-3">
            {uploading ? (
                <ActivityIndicator color="#3b82f6" />
            ) : (
                <ImagePlus color="#3b82f6" size={24} />
            )}
        </TouchableOpacity>
    );
}
