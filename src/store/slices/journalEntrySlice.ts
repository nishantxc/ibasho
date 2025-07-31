import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store/store'

// SharedPost type for MoodBoard
export interface SharedPost {
  id: number;
  caption: string;
  mood: string;
  reactions: number;
  photo?: string;
  timestamp?: string;
}

const sharedPostsInitialState: SharedPost[] = [];

export const sharedPostsSlice = createSlice({
  name: 'sharedPosts',
  initialState: sharedPostsInitialState,
  reducers: {
    addSharedPost: (state, action: PayloadAction<SharedPost>) => {
      state.push(action.payload);
    },
  },
});

export const { addSharedPost } = sharedPostsSlice.actions;

export default sharedPostsSlice.reducer;