import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store/store'
import {User} from '../../types/types'

const userProfilesInitialState: User[] = [];

export const userProfilesSlice = createSlice({
  name: 'userProfiles',
  initialState: userProfilesInitialState,
  reducers: {
    adduserProfile: (state, action: PayloadAction<User>) => {
      state.push(action.payload);
    },
  },
});

export const { adduserProfile } = userProfilesSlice.actions;

export default userProfilesSlice.reducer;