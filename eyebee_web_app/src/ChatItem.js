import React,{useEffect, useState} from "react";

import { ThemeProvider, StyledEngineProvider, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import {CssBaseline} from "@mui/material";
import HexagonalAvatarWidget from "./HexagonalAvatarWidget";

const useStyles = makeStyles(theme => ({
    mainBox:{
      display:"flex",
      alignItems:"center",
      justifyContent:"flex-start",
      backgroundColor: "transparent",
      width:"100%",
      borderRadius:"0.5em",
      padding:"0.5em"
    },
    label:{
        fontWeight:"bold",
        margin:"0 0.5em"
    },
    message:{
        textAlign:"justify",
        backgroundColor: theme.palette.background.default,
        padding: "0.5em",
        borderRadius:"0.5em",
        wordBreak:"break-all",
        margin:"0"
    }
  }));

const ChatItem = (props) => {
    const theme = useTheme();
    const classes = useStyles();
    const [user,setUser] = useState(null);

    useEffect(() => {
        if(props.user){
            setUser(props.user);
        }
    },[props.user]);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme} >
                <CssBaseline/>
                <div className={classes.mainBox}>
                    <div style={{
                        display:"flex",
                        alignItems:"center",
                        justifyContent:"center"
                    }}>
                        <HexagonalAvatarWidget background={user && user.presenter ? "primary": "secondary"} />
                    </div>
                    <div style={{
                        display:"flex",
                        flex:"2",
                        alignItems: "center",
                        justifyContent: "flex-start"
                    }}>
                        <p className={classes.label}>{user ? (user.userName ? user.userName : user.id): ""}</p><p className={classes.message}>{props.message}</p>

                    </div>
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default ChatItem;