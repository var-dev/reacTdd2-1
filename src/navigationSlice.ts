import { createSlice, createAction, type PayloadAction } from '@reduxjs/toolkit';

export const navigateRequest1 = createAction<string>('navigation/navigateRequest');

export type NavigationState = {
  navigateTo: string;
}

const initialState: NavigationState = {
  navigateTo: '',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigateRequest: (state: NavigationState, action: PayloadAction<string>) => {
      state.navigateTo = action.payload;
    },
    navigationSuccessful: (state: NavigationState) => {
      state.navigateTo = '';
    },
  },
});

export const {
  navigateRequest,
  navigationSuccessful,
} = navigationSlice.actions;

export default navigationSlice.reducer;