import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store/store'
import { Post } from '@/types/types';


const sharedPostsInitialState: Post[] = [];

export const sharedPostsSlice = createSlice({
  name: 'sharedPosts',
  initialState: sharedPostsInitialState,
  reducers: {
    addSharedPost: (state, action: PayloadAction<Post>) => {
      state.push(action.payload);
    },
  },
});

export const { addSharedPost } = sharedPostsSlice.actions;

export default sharedPostsSlice.reducer;