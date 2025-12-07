export interface Message {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    channel_id?: string;
    is_optimistic?: boolean;
    type?: 'text' | 'image';
    media_url?: string;
    parent_id?: string | null;
    reply_to?: Message | null; // For optimistic UI context
}

export interface Channel {
    id: string;
    slug: string;
    created_at: string;
}
