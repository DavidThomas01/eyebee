import { createTheme, adaptV4Theme } from '@mui/material/styles';

const fontStack = [
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "'Fira Sans'",
    "'Droid Sans'",
    "'Helvetica Neue'",
    "sans-serif",
].join(", ");

const mainTheme = createTheme(adaptV4Theme({
    palette: {
        mode: "dark",
        background: {
            default: "#000",
            paper: "#141210",
        },
        primary: {
            main: "#F29F39",
            contrastText: "#171006"
        },
        secondary: {
            main: "#F5F1EC",
            contrastText: "#171006"
        },
        text: {
            primary: "#F5F1EC",
            secondary: "#A79F96",
            disabled: "#6F675F",
        },
        divider: "#332E29",
        error: {
            main: "#FF8A7A",
        },
        action: {
            backgroundColor: "#AAAAAA",
            selected: "#2D2D2D"
        },
        lighterBg: {
            main: "#292929"
        }
    },
    actionBtn: {
        backgroundColor: "#212121",
        margin: "0.5em",
    },
    defaultIcon: {
        fontSize: "1.5em"
    },
    typography: {
        fontFamily: fontStack,
        fontSize: 16,
    },
    shape: {
        borderRadius: 12,
    },
}));

export default mainTheme;
