// src/store/hooks.ts

import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, RootState, AppStore } from "./store.js";

// .withTypes() was added in react-redux v9.1.0.
// It returns a new hook function pre-bound to your store types.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();