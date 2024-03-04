import { ThemeProvider } from 'styled-components';

export const lightTheme = {
    defaultBackgroundColor: '#c1c1c1',
    backgroundColor: '#fafafa',
    elementsBackgroundColor: '#d7d7d7',
    elementsHoverBackgroundColor: '#73a1cf',
    textColor: '#0a0a0a',
    titleTextColor: '#0a0a0a',
    borderColor: '#73a1cf',
};

export const darkTheme = {
    defaultBackgroundColor: '#1c1c1e',
    backgroundColor: '#39383e',
    elementsBackgroundColor: '#a3a3a3',
    elementsHoverBackgroundColor: '#ffb000d4',
    textColor: '#1c1c1c',
    titleTextColor: '#d7d7d7',
    borderColor: '#ffb000',
};

export const Theme = ({ children }) => {
    return (
        <ThemeProvider theme={lightTheme}>
            {children}
        </ThemeProvider>
    );
};