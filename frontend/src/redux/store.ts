import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { setAuthTokenGetter, setUnauthorizedCallback } from '../services/apiConfig';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Configure the API's auth token getter after store is created
setAuthTokenGetter(() => {
  return store.getState().auth.token;
});

// Set up the unauthorized callback to dispatch logout action
setUnauthorizedCallback(() => {
  store.dispatch({ type: 'auth/logout' });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
