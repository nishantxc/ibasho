import { configureStore } from '@reduxjs/toolkit'
import sharedPostsReducer from './slices/journalEntrySlice'
import userProfileReducer from './slices/userSlice'

export const store = configureStore({
  reducer: {
    sharedPosts: sharedPostsReducer,
    userProfile: userProfileReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch