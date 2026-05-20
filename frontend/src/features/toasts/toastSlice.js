import { createSlice, nanoid } from "@reduxjs/toolkit";

const VALID_TOAST_TYPES = new Set(["success", "error", "info", "warning"]);
const DEFAULT_DURATION = 4000;
const MAX_TOASTS = 4;
const DUPLICATE_TOAST_WINDOW_MS = 1800;

const getToastKey = (toast) =>
  [toast.type, toast.title, toast.message].join("|");

const normalizeDuration = (duration) => {
  if (duration === 0) return 0;

  const numericDuration = Number(duration);

  if (!Number.isFinite(numericDuration)) {
    return DEFAULT_DURATION;
  }

  return Math.max(1200, numericDuration);
};

const normalizeToast = (payload = {}) => {
  const toast = typeof payload === "string" ? { message: payload } : payload;
  const type = VALID_TOAST_TYPES.has(toast.type) ? toast.type : "info";

  return {
    id: toast.id || nanoid(),
    type,
    title: toast.title || "",
    message: toast.message || "",
    duration: normalizeDuration(toast.duration),
    createdAt: Date.now(),
  };
};

const toastSlice = createSlice({
  name: "toasts",
  initialState: {
    items: [],
  },
  reducers: {
    showToast: {
      reducer: (state, action) => {
        const incomingToast = action.payload;
        const incomingKey = getToastKey(incomingToast);
        const hasRecentDuplicate = state.items.some((toast) => {
          return (
            getToastKey(toast) === incomingKey &&
            Math.abs(incomingToast.createdAt - toast.createdAt) <
              DUPLICATE_TOAST_WINDOW_MS
          );
        });

        if (hasRecentDuplicate) return;

        state.items.unshift(action.payload);
        state.items = state.items.slice(0, MAX_TOASTS);
      },
      prepare: (payload) => ({
        payload: normalizeToast(payload),
      }),
    },

    dismissToast: (state, action) => {
      state.items = state.items.filter((toast) => toast.id !== action.payload);
    },

    clearToasts: (state) => {
      state.items = [];
    },
  },
});

export const { clearToasts, dismissToast, showToast } = toastSlice.actions;

export default toastSlice.reducer;
