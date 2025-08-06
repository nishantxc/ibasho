import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store/store'
import { User } from '../../types/types'

const initialState: User = { id: '', username: '', mood: '', avatar: '', bio: '' };

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    adduserProfile: (state, action: PayloadAction<User>) => {
      return action.payload;
    },
  },
});

export const { adduserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;