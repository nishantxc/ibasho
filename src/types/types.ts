export type JournalEntry = {
    caption:string,
    id:number,
    mood:string,
    images:string,
    rotation:number,
    mood_score:number,
    timestamp:string,
}

export type Message = {
    id: string;
    sender_id: string;
    receiver_id?: string;
    content: string;
    created_at: string;
    mood: string;
    likes: number;
    post_reference?: {
        id: number;
        caption: string;
        photo: string;
        mood: string;
    };
    sender_name: string;
    is_own_message: boolean;
}

export type User = {
    id: string;
    username: string;
    mood?: string;
    avatar?: string;
}