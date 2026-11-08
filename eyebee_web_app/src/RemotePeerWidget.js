import React from "react";
import MediaPlayerWidget from "./MediaPlayerWidget";
import { IconButton, CssBaseline, SvgIcon } from "@mui/material";
import { ThemeProvider, StyledEngineProvider, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { ReactComponent as ScreenShareOnSVG } from './img/screen-share-on2.svg';
import { ReactComponent as HandOnSVG } from './img/hand-on.svg';


const useStyles = makeStyles(() => ({
    mainBox: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.5em",
        borderRadius: "0.3em",
        position: "relative"
    }
}));

const ScreenShareIcon = ({ compact, ...props }) => (
    <SvgIcon {...props} component={ScreenShareOnSVG} viewBox="0 0 47.32 36.15" style={{ fontSize: compact ? "20px" : "300%" }} />
)

const HandIcon = ({ compact, ...props }) => (
    <SvgIcon {...props} component={HandOnSVG} viewBox="0 0 47.32 36.15" style={{ fontSize: compact ? "20px" : "300%" }} />
)

const RemotePeerWidget = (props) => {
    const classes = useStyles();
    const theme = useTheme();

    const grantPresentation = () => {
        props.onPresentationGranted(props.peerId);
    }

    const widgetClicked = () => {
        if(props.clickable && props.onClick){
            props.onClick();
        }
       
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <div className={classes.mainBox} onClick={widgetClicked} >

                    {
                        props.presentationRequested ?
                            (
                                <div style={{
                                    position: "absolute",
                                    left: props.compact ? "6px" : "17px",
                                    zIndex: "3"
                                }}>
                                    <IconButton
                                        style={{
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={grantPresentation}
                                        size={props.compact ? "small" : "large"}>
                                        <HandIcon compact={props.compact} color="primary" />

                                    </IconButton>

                                </div>


                            )
                            :
                            (
                                <div />
                            )
                    }

                    {
                        props.showScreenIcon && props.localStreams && Object.keys(props.localStreams).find(l => { return props.localStreams[l].label === "screen" }) ?
                            (
                                <div style={{
                                    position: "absolute",
                                    right: props.compact ? "6px" : "17px",
                                    zIndex: "3"
                                }}>
                                    <IconButton
                                        style={{
                                            backgroundColor: "transparent"
                                        }}
                                        onClick={props.goToScreen}
                                        size={props.compact ? "small" : "large"}>
                                        <ScreenShareIcon compact={props.compact} color="primary" />

                                    </IconButton>

                                </div>

                            )
                            :
                            (
                                <div />
                            )
                    }

                        <MediaPlayerWidget
                                    nomedia={props.nomedia}
                                    isCameraEnable={props.isCameraEnable}
                                    avatar={props.avatar}
                                    playerSize={props.playerSize || "8em"}
                                    background={props.presenter ? "primary" : "secondary"}
                                    label={props.label} volume={1}
                                    stream={props.streams ? props.streams["camera"] : null}
                                    />

                </div>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default RemotePeerWidget;