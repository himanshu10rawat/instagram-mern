import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    return savedTheme;
  }

  return "system";
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    return;
  }

  if (theme === "light") {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (prefersDark) {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
};

const initialState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      applyTheme(action.payload);
    },
    initializeTheme: (state) => {
      applyTheme(state.theme);
    },
  },
});

export const { initializeTheme, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
