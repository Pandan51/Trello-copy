import {type PropsWithChildren, type ReactNode, useEffect, useState} from "react";
import {ThemeContext} from "./ThemeContext.ts";

export default function ThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState(() => {
        // Did the user manually save a preference before?
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }

        // If no saved preference, check what their Operating System prefers
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // Default fallback
        return 'light';
    });

    // 2. Every time the theme changes, update the HTML class AND save to localStorage
    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove('light', 'dark');
        root.classList.add(theme);

        // Save their choice so they don't lose it on refresh!
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{theme,setTheme}}>
            <div data-theme={theme}>
            {children}
            </div>
        </ThemeContext.Provider>
    )
}