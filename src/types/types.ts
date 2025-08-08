export type JournalEntry = {
    caption:string,
    id:number,
    mood:string,
    images:string,
    rotation:number,
    mood_score:number,
    created_at:string,
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
    bio?: string;
    user_id: string;
}


export type Post = {
  id: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  visibility: "private" | "public" | "friends-only" | "scheduled";
  caption: string;
  photo: string;
  mood?: string;
}