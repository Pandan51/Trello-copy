import {createContext, type Dispatch, type SetStateAction} from 'react';

export const ThemeContext = createContext<{theme:string, setTheme: Dispatch<SetStateAction<string>>}>({theme: "light", setTheme: () => {}});



