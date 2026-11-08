import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import logoEyeBee from "../img/logo_eyebee_fondo_negrov2.jpg";
import { Button, TextField, useMediaQuery } from "@mui/material";
import axios from "axios"

const theme = createTheme(adaptV4Theme({
    palette: {
        background: {
            default: "#000",
        },
        primary: {
            main: "#F29F39",
            contrastText: "#ffffff"
        },
        secondary: {
            main: "#fafafa",
            contrastText: "#8E8E8E"
        },
        action: {
            backgroundColor: "#aaaaaa",
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
        fontSize: "0.9em"
    }
}));


const useStyles = makeStyles(theme => ({

    mainBox: {
        display: "flex",
        flex: "2",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        background: "#000"
    },
    logoBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        margin: "1em 0"
    },
    mediaSelectionBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        margin: "1em 0"
    },
    [theme.breakpoints.up("md")]: {
        mediaSelectionBox: {
            margin: "2em 0"
        },
        userNameField: {
            maxWidth: "25em"
        }
    },
    [theme.breakpoints.down('md')]: {
        mediaSelectionBox: {
            margin: "1em 0"
        },
        userNameField: {
            maxWidth: "17em"
        }
    },
    roundedBtn: {
        textTransform: "none",
        borderRadius: "0.5em"
    },
    roomActionBtn: {
        margin: "0 1em",
        minWidth: "7em",
        fontSize: "1.2em"
    },
    userNameField: {
        width: "100%"
    }
}));

const darkFormField = createTheme(adaptV4Theme({
    palette: {
        background: {
            default: "#212121",
            paper: "#212121"
        },
        primary: {
            main: "#fafafa",

        },
        secondary: {
            main: "#fafafa",
            contrastText: "#fafafa"
        },
        text: {
            primary: "#fafafa",
            secondary: "#bdbdbd"
        },
        action: {
            disabled: "#ffe082",
            disabledBackground: "#ffe082"
        }
    }
}));

const lightButton = createTheme(adaptV4Theme({
    palette: {
        primary: {
            main: "#F29F39",
            contrastText: "#ffffff"

        },
        secondary: {
            main: "#fafafa",
            contrastText: "#212121"
        },
        text: {
            primary: "#fafafa",
            secondary: "#bdbdbd"
        },
        action: {
            disabled: "black",
            disabledBackground: "#292929"
        }
    }
}));


const NewUser = () => {

    const navigate = useNavigate();
    const xsScreen = useMediaQuery(theme.breakpoints.up("xs"));
    const mdScreen = useMediaQuery(theme.breakpoints.up("md"));
    const lgScreen = useMediaQuery(theme.breakpoints.up("lg"));
    const classes = useStyles();
    const [logoSize, setLogoSize] = useState(0);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(false);


    const usernameChanged = (e) => {
        setUserName(e.target.value);
    }

    const passwordChanged = (e) => {
        setPassword(e.target.value);
        setConfirmPassword(e.target.value === password2 ? true : false);
    }

    const confirmPasswordChanged = (e) => {
        setPassword2(e.target.value);
        setConfirmPassword(e.target.value === password ? true : false);
    }

    useEffect(() => {
        setLogoSize(lgScreen ? 12 : mdScreen ? 10 : 8);
    }, [xsScreen, mdScreen, lgScreen]);

    const login = () => {
        const payload = { name: userName, password: password, active: true, create_date: new Date() }
        axios.post("/api/v1/user/", payload).then(result => {
            if (result.status === 201) {
                alert("User created")
                navigate('/admin/rooms');
            }
        }).catch(error => alert("Server error"));

    }



    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>

                <div className={classes.mainBox}>
                    <div className={classes.logoBox}>
                        <img style={{
                            height: logoSize + "em",
                            width: "auto"
                        }} src={logoEyeBee} alt="Eyebee" />
                    </div>


                    <StyledEngineProvider injectFirst>
                        <ThemeProvider theme={darkFormField} >

                            <form autoComplete="on" >
                                <div className={classes.mediaSelectionBox}>
                                    <TextField
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        className={classes.userNameField}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                        value={userName}
                                        variant="filled" label="User" placeholder="bee"
                                        onChange={usernameChanged} />

                                    <TextField
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        className={classes.userNameField}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                        value={password}
                                        variant="filled"
                                        type="password" label="Password" placeholder="****"
                                        onChange={passwordChanged} />

                                    <TextField
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        className={classes.userNameField}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                        value={password2}
                                        variant="filled"
                                        type="password" label="Confirm Password" placeholder="****"
                                        onChange={confirmPasswordChanged} />
                                </div>
                            </form>

                            <ThemeProvider theme={lightButton} >
                                <Button disabled={!confirmPassword} onClick={login} variant="contained"
                                    color="primary" className={`${classes.roundedBtn} ${classes.roomActionBtn}`}
                                >Register</Button>
                            </ThemeProvider>

                        </ThemeProvider>
                    </StyledEngineProvider>


                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
}

export default NewUser;