import { DEFAULT_SETTINGS } from "../data";

const STORAGE_KEYS = {
  THEME: "theme",
  FORMAT: "format",
  HIGHLIGHT_COLOR: "highlightColor",
  HIDE_NOTES: "hideNotes",
  COLOR_PICKED: "pickedColor",
};

export const DEFAULTS = {
  THEME: DEFAULT_SETTINGS.THEME,
  FORMAT: DEFAULT_SETTINGS.FORMAT,
  HIGHLIGHT_COLOR: DEFAULT_SETTINGS.HIGHLIGHT_COLOR,
  HIDE_NOTES: DEFAULT_SETTINGS.HIDE_NOTES,
};

export function restoreDefaults(): void {
  localStorage.removeItem(STORAGE_KEYS.THEME);
  localStorage.removeItem(STORAGE_KEYS.FORMAT);
  localStorage.removeItem(STORAGE_KEYS.HIGHLIGHT_COLOR);
  localStorage.removeItem(STORAGE_KEYS.HIDE_NOTES);
}

export const getTheme = async (): Promise<"dark" | "light"> => {
  return new Promise((resolve) => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as
      | "dark"
      | "light";
    if (savedTheme) {
      resolve(savedTheme);
    } else {
      resolve(DEFAULTS.THEME);
    }
  });
};

export const setTheme = (theme: "dark" | "light"): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const setFormat = (format: string): void => {
  localStorage.setItem(STORAGE_KEYS.FORMAT, format);
};

export const getFormat = async (): Promise<string> => {
  return new Promise((resolve) => {
    const savedFormat = localStorage.getItem(STORAGE_KEYS.FORMAT) as string;
    if (savedFormat) {
      resolve(savedFormat);
    } else {
      resolve(DEFAULTS.FORMAT);
    }
  });
};

export const setHighlightColor = (color: string): void => {
  localStorage.setItem(STORAGE_KEYS.HIGHLIGHT_COLOR, color);
};

export const getHighlightColor = async (): Promise<string> => {
  return new Promise((resolve) => {
    const savedColor = localStorage.getItem(
      STORAGE_KEYS.HIGHLIGHT_COLOR
    ) as string;
    if (savedColor) {
      resolve(savedColor);
    } else {
      resolve(DEFAULTS.HIGHLIGHT_COLOR);
    }
  });
};

export const getHideNotes = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const savedHideNotes = localStorage.getItem(
      STORAGE_KEYS.HIDE_NOTES
    ) as string;
    if (savedHideNotes) {
      resolve(savedHideNotes === "true");
    } else {
      resolve(false);
    }
  });
};

export const setHideNotes = (hideNotes: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.HIDE_NOTES, String(hideNotes));
};
