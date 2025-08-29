import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface HistoryState {
  id: string;
  inputText: string;
  tones: string[];
  toneState: { x: number; y: number };
  output: string;
  timestamp: number;
  tryAgainCount: number;
}

interface ToneSliceState {
  history: HistoryState[];
  currentHistoryIndex: number;
  undoStack: number[]; // Stack of history indices for undo
  redoStack: number[]; // Stack of history indices for redo
}

const initialState: ToneSliceState = {
  history: [],
  currentHistoryIndex: -1,
  undoStack: [],
  redoStack: [],
};

const toneSlice = createSlice({
  name: "tone",
  initialState,
  reducers: {
    addHistory: (
      state,
      action: PayloadAction<Omit<HistoryState, "id" | "timestamp">>
    ) => {
      const newHistoryItem: HistoryState = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      // Add current index to undo stack if we have a current selection
      if (state.currentHistoryIndex >= 0) {
        state.undoStack.push(state.currentHistoryIndex);
        // Limit undo stack to 50 items
        if (state.undoStack.length > 50) {
          state.undoStack.shift();
        }
      }

      state.history.push(newHistoryItem);
      state.currentHistoryIndex = state.history.length - 1;
      // Clear redo stack when new action is performed
      state.redoStack = [];
    },
    selectHistoryItem: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.history.length) {
        // Add current index to undo stack before changing
        if (state.currentHistoryIndex >= 0) {
          state.undoStack.push(state.currentHistoryIndex);
          if (state.undoStack.length > 50) {
            state.undoStack.shift();
          }
        }

        state.currentHistoryIndex = action.payload;
        state.redoStack = [];
      }
    },
    incrementTryAgain: (state, action: PayloadAction<string>) => {
      const item = state.history.find((h) => h.id === action.payload);
      if (item) {
        item.tryAgainCount += 1;
      }
    },
    clearHistory: (state) => {
      state.history = [];
      state.currentHistoryIndex = -1;
      state.undoStack = [];
      state.redoStack = [];
    },
    resetSelection: (state) => {
      state.currentHistoryIndex = -1;
    },
    undo: (state) => {
      if (state.undoStack.length > 0) {
        const previousIndex = state.undoStack.pop()!;

        // Add current index to redo stack
        if (state.currentHistoryIndex >= 0) {
          state.redoStack.push(state.currentHistoryIndex);
        }

        state.currentHistoryIndex = previousIndex;
      }
    },
    redo: (state) => {
      if (state.redoStack.length > 0) {
        const nextIndex = state.redoStack.pop()!;

        // Add current index to undo stack
        if (state.currentHistoryIndex >= 0) {
          state.undoStack.push(state.currentHistoryIndex);
        }

        state.currentHistoryIndex = nextIndex;
      }
    },
  },
});

export const {
  addHistory,
  selectHistoryItem,
  incrementTryAgain,
  clearHistory,
  resetSelection,
  undo,
  redo,
} = toneSlice.actions;

// Selectors
export const selectHistory = (state: RootState) => state.tone.history;
export const selectCurrentHistoryIndex = (state: RootState) =>
  state.tone.currentHistoryIndex;
export const selectCurrentHistoryState = (state: RootState) => {
  const { history, currentHistoryIndex } = state.tone;
  return currentHistoryIndex >= 0 ? history[currentHistoryIndex] : null;
};
export const selectCurrentState = (state: RootState) => {
  const { history, currentHistoryIndex } = state.tone;
  return currentHistoryIndex >= 0 ? history[currentHistoryIndex] : null;
};
export const selectCanUndo = (state: RootState) =>
  state.tone.undoStack.length > 0;
export const selectCanRedo = (state: RootState) =>
  state.tone.redoStack.length > 0;

export default toneSlice.reducer;
