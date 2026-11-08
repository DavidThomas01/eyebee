import React, { useEffect, useState, useRef } from "react";

import { ThemeProvider, StyledEngineProvider, useTheme, createTheme, adaptV4Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { CssBaseline } from "@mui/material";
import testImg from "./img/default-avatar.png";

const secondaryTheme = createTheme(adaptV4Theme({
    palette: {
        background: {
            default: "#000",
        },
        primary: {
            main: "#212121"
        }
    }
}));

const useStyles = makeStyles(() => ({
    mainBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5em",
        borderRadius: "0.3em",
        height: "100%"
    },
    userNameBoxCentered: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8%",
        zIndex: "3",
        pointerEvents: "none",
        textAlign: "center"
    },
    userNameBoxCorner: {
        position: "absolute",
        inset: 0,
        zIndex: "3",
        pointerEvents: "none",
        backgroundColor: "#141414",
        clipPath: "polygon(100% 75%, 50% 100%, 34.35% 92.18%, 100% 59.35%)"
    },
    cornerText: {
        position: "absolute",
        left: "71.1%",
        top: "81.6%",
        width: "52%",
        transform: "translate(-50%, -50%) rotate(-30deg)",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap"
    },
    userNameText: {
        margin: 0,
        maxWidth: "100%",
        color: "#ffffff",
        fontWeight: 800,
        lineHeight: 1.2,
        textShadow: "0 2px 8px rgba(0, 0, 0, 0.7)",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    userNameTextCentered: {
        whiteSpace: "normal",
        overflowWrap: "anywhere"
    },
    hexFrame: {
        position: "relative",
        overflow: "hidden",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    hex: {
        position: "relative",
        overflow: "hidden",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    labelClip: {
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        zIndex: "3",
        pointerEvents: "none"
    }
}));

const MediaPlayerWidget = (props) => {
    const theme = useTheme();
    const classes = useStyles();
    const [mediaStream, setMediaStream] = useState(null);
    const [showPlayer, setShowPlayer] = useState(false);
    const [vidHeight, setVidHeight] = useState(150);
    const [vidWidth, setVidWidth] = useState(150);
    const videoEl = useRef();
    const [showLabel, setShowLabel] = useState(true);

    useEffect(() => {
        if (mediaStream) {
            
            videoEl.current.muted = props.volume === 0;
            videoEl.current.srcObject = mediaStream;
            videoEl.current.volume = props.volume && props.volume !== 0 ? props.volume : 0;

        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaStream]);

    useEffect(() => {
        if (videoEl && videoEl.current) {
            videoEl.current.onloadedmetadata = () => {
                if(videoEl.current){

                    setVidHeight(videoEl.current.videoHeight);
                    setVidWidth(videoEl.current.videoWidth);
                    setShowPlayer(true);
                }
                
            }

        }
    }, [videoEl]);

    useEffect(() => {

        if (props.stream) {
            setMediaStream(props.stream);



        }
    }, [props.stream]);

    useEffect(() => {
        if (props.playerSize < 36) {
           
            setShowLabel(false);
        } else {
            
            setShowLabel(true);
        }
    }, [props.playerSize]);

    useEffect(() => {

        if (props.nomedia) {
           
            setShowPlayer(true);
        }
    }, [props.nomedia]);


    const labelSize = typeof props.playerSize === "number" ? props.playerSize : 150;
    const cornerFontSize = Math.max(8, Math.round(labelSize * 0.055));
    const centeredFontSize = Math.max(11, Math.round(labelSize * 0.12));
    const hexWidth = props.playerSize ? props.playerSize * 0.866 : 100;
    const hexHeight = props.playerSize ? props.playerSize : 100;
    const hexColor = props.background === "primary" ? theme.palette.primary.main : secondaryTheme.palette.primary.main;

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={props.background === "primary" ? theme : secondaryTheme} >
                <CssBaseline />
                <div className={classes.mainBox} style={{ position: "relative" }}>
                    <div
                        className={classes.hexFrame}
                        style={{
                            width: (hexWidth + 8) + "px",
                            height: (hexHeight + 8) + "px",
                            backgroundColor: hexColor,
                            visibility: showPlayer ? "visible" : "hidden"
                        }}
                    >
                    <div
                        className={classes.hex}
                        style={{
                            width: hexWidth + "px",
                            height: hexHeight + "px",
                            backgroundColor: hexColor
                        }}
                    >
                        <img
                            alt=""
                            src={props.avatar !== '' ? props.avatar : testImg}
                            style={{
                                height: props.playerSize ? props.playerSize + "px" : "150px",
                                width: "auto",
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                backgroundColor: "black",
                                visibility: !props.isCameraEnable && !(props.label && showLabel) ? "visible" : "hidden"
                            }}
                        />
                        <video
                            playsInline
                            style={{
                                visibility: props.isCameraEnable ? "visible" : "hidden",
                                width: "auto",
                                height: props.playerSize ? props.playerSize + "px" : "150px",
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                backgroundColor: "black",
                                transform: "translate(-50%, -50%) rotateY(180deg) scale(" + (vidHeight > vidWidth ? "1.5)" : "1)")
                            }}
                            ref={videoEl}
                            autoPlay
                        />

                        {
                            props.label && showLabel ?
                                (
                                    <div className={classes.labelClip}>
                                        <div
                                            id="label"
                                            className={props.isCameraEnable ? classes.userNameBoxCorner : classes.userNameBoxCentered}
                                        >
                                            <p
                                                className={`${classes.userNameText} ${props.isCameraEnable ? classes.cornerText : classes.userNameTextCentered}`}
                                                style={{
                                                    fontSize: props.isCameraEnable ? cornerFontSize + "px" : centeredFontSize + "px"
                                                }}
                                            >
                                                {props.label}
                                            </p>
                                        </div>
                                    </div>
                                )
                                :
                                (
                                    <div />
                                )
                        }
                    </div>
                    </div>
                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default MediaPlayerWidget;