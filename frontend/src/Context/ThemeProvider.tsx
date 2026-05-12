import { type PropsWithChildren, useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext.ts";

export default function ThemeProvider({ children }: PropsWithChildren) {
  // 1. Initialize from localStorage, defaulting to 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // 2. A helper function to apply the actual CSS class
    const applyTheme = (currentTheme: string) => {
      root.classList.remove("light", "dark");

      if (currentTheme === "system") {
        // Check what the OS prefers right now
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        root.classList.add(systemPrefersDark ? "dark" : "light");
      } else {
        // It's explicitly 'light' or 'dark'
        root.classList.add(currentTheme);
      }
    };

    // Apply the theme and save their choice
    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // 3. Pro Feature: Listen for OS changes IF "system" is selected
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleOSChange = () => applyTheme("system");

      // Listen for changes in the OS theme
      mediaQuery.addEventListener("change", handleOSChange);

      // Cleanup listener when component unmounts or theme state changes
      return () => mediaQuery.removeEventListener("change", handleOSChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
