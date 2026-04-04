import { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Theme is now permanently light
    const theme = 'light';
    const isDark = false;
    const isLight = true;
    const toggleTheme = () => {
        console.log('Theme toggle is disabled');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark, isLight }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
