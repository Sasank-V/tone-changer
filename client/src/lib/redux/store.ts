import { configureStore } from "@reduxjs/toolkit";
import { api } from "./services";
import { setupListeners } from "@reduxjs/toolkit/query";
import toneReducer from "./slices/toneSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    tone: toneReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
