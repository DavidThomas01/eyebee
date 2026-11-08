import React, { useEffect, useState } from "react";

import { Button, useMediaQuery, SvgIcon, Badge, Tooltip } from "@mui/material";
import { Mic, MicOff, Videocam, VideocamOff, Chat, CallEnd, PanTool, PeopleAlt } from "@mui/icons-material";
import { ThemeProvider, StyledEngineProvider, useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';

import { ReactComponent as ScreenShareSVG } from '../img/screen-share.svg';
import { ReactComponent as ScreenShareOnSVG } from '../img/screen-share-on.svg';

const useStyles = makeStyles(theme => ({
    mainBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%"
    },
    roomActionsBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "2",
        flexWrap: "wrap",
        [theme.breakpoints.down('sm')]: {
            flexDirection: "column",
        }
    },

    actionBtn: {
        minWidth: "52px",
        padding: "1em 0",
        textTransform: "none",
        [theme.breakpoints.up('md')]: {
            fontSize: "1em"
        },
        [theme.breakpoints.down('md')]: {
            fontSize: "0.7em"
        }
    },
    leaveBtn: {
        minWidth: "52px",
        borderRadius: "0.2em",
        padding: "1em 0",
        margin: "0.5em",
        textTransform: "none",
        backgroundColor: "#D73939",
        [theme.breakpoints.down('md')]: {
            fontSize: "0.7em"
        },
        [theme.breakpoints.up('md')]: {
            fontSize: "1em",
        }

    },

    upperBtnBox: {
        flex: "2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

    }
}));

const ScreenShareIcon = props => (
    <SvgIcon {...props} component={props.color === "primary" ? ScreenShareOnSVG : ScreenShareSVG} viewBox="0 0 32 23" />
)

const RoomActionsWidget = props => {


    const classes = useStyles();
    const theme = useTheme();
    const [camera, setCamera] = useState(null);
    const [sideBoxState, setSideBoxState] = useState({
        opened: false,
        section: ""
    });
    const [streamsStatus, setStreamsStatus] = useState({
        camera: false,
        mic: false,
        screen: false
    });
    const [showHand, setShowHand] = useState(props.owner && !props.presenter);
    const [showMic, setShowMic] = useState(props.presenter);
    const [handRaised, setHandRaised] = useState(false);
    const [showScreen, setShowScreen] = useState(props.presenter);

    const smScreen = useMediaQuery(theme.breakpoints.up("sm"));

    useEffect(() => {
        if (props.camera) {
            setCamera(props.camera);
            setStreamsStatus({
                camera: props.camera.isVideoEnabled(),
                mic: props.camera.isAudioEnabled(),
                screen: false
            });

        }

    }, [props.camera]);

    useEffect(() => {
        if (props.screen) {
            let streams = {
                ...streamsStatus
            }
            streams.screen = props.screen.getStream() ? true : false;
            setStreamsStatus(streams);

        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.screen]);

    const toggleCamera = async () => {
        if (!camera.getStream()) {

            await camera.start();



        } else {

            if (camera.isVideoEnabled()) {
                camera.disableVideo();
            } else {
                camera.enableVideo();
            }

        }

        streamsStatus["camera"] = camera.isVideoEnabled();

        setStreamsStatus({
            ...streamsStatus
        });
        props.onCameraStateChanged(camera.isVideoEnabled());

    }

    const toggleMic = async () => {

        if (camera.isAudioEnabled()) {
            streamsStatus["mic"] = false;
            camera.mute();
        } else {
            streamsStatus["mic"] = true;
            camera.unmute();
        }

        streamsStatus["mic"] = camera.isAudioEnabled();

        setStreamsStatus({
            ...streamsStatus
        });

        props.onMicStateChanged(camera.isAudioEnabled());

    }

    const onScreenVideoEnded = () => {
        toggleScreen();
    }

    const toggleScreen = async () => {
        await props.toggleScreen();
        let streams = {
            ...streamsStatus
        }

        if (props.screen.getStream()) {
            props.screen.getStream().getVideoTracks()[0].addEventListener("ended", onScreenVideoEnded);
        }

        streams.screen = props.screen.getStream() ? true : false;
        setStreamsStatus(streams);

    }

    const toggleSideBox = (section) => {

        let sbState = {
            opened: !sideBoxState.opened,
            section: section
        }

        setSideBoxState(sbState);
    }

    useEffect(() => {

        if (props.camera) {
            let streams = {
                ...streamsStatus
            }
            streams.mic = props.camera && props.camera.isAudioEnabled();
            streams.camera = props.camera && props.camera.isVideoEnabled();


            setStreamsStatus(streams);
        }


        setShowHand(!props.owner && !props.presenter);
        setShowMic(props.presenter);
        setShowScreen(props.presenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.presenter, props.owner]);

    useEffect(() => {
        props.toggleSideBox(sideBoxState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sideBoxState])

    useEffect(() => {
        setHandRaised(props.presentationRequested);
    }, [props.presentationRequested])


    const togglePresentation = () => {
        if (props.presentationRequested) {
            props.cancelPresentation();
        } else {
            props.requestPresentation();
        }
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme} >
                <div className={classes.mainBox}>
                    <div className={classes.roomActionsBox}>
                        <div className={classes.upperBtnBox}>
                            <div style={{

                                flex: smScreen ? "2" : "1",
                            }}>
                                {
                                    showHand ?
                                        (
                                            <Tooltip title="Raise your hand">
                                                <Button color="secondary"
                                                    className={classes.actionBtn}
                                                    style={{
                                                        ...theme.actionBtn,
                                                        color: handRaised ? "#4FC16F" : "white"
                                                    }}

                                                    onClick={togglePresentation}>
                                                    <PanTool style={theme.defaultIcon} />

                                                </Button>
                                            </Tooltip>
                                        )
                                        :
                                        (
                                            <div />
                                        )
                                }
                            </div>


                            {
                                showScreen ?
                                    (
                                        <Tooltip title="Share screen">
                                            <Button color={props.screen && props.screen.isVideoEnabled() ? "primary" : "secondary"}
                                                className={classes.actionBtn}
                                                style={theme.actionBtn}
                                                onClick={toggleScreen}>
                                                {
                                                    streamsStatus.screen ?
                                                        (
                                                            <ScreenShareIcon style={{ ...theme.defaultIcon }} color="primary" />
                                                        )
                                                        :
                                                        (
                                                            <ScreenShareIcon style={{ ...theme.defaultIcon }} color="secondary" />
                                                        )
                                                }

                                            </Button>
                                        </Tooltip>
                                    )
                                    :
                                    (
                                        <div />
                                    )
                            }
                            <Tooltip title={streamsStatus.camera ? "Disable camera" : "Enable camera"}>
                                <Button color={camera && camera.isVideoEnabled() ? "primary" : "secondary"}
                                    className={classes.actionBtn}

                                    style={{
                                        ...theme.actionBtn,
                                        color: "white",
                                        backgroundColor: streamsStatus.camera ? "#4FC16F" : theme.actionBtn.backgroundColor
                                    }}

                                    onClick={toggleCamera}>
                                    {
                                        streamsStatus.camera ?
                                            (
                                                <Videocam style={theme.defaultIcon} />
                                            )
                                            :
                                            (
                                                <VideocamOff style={theme.defaultIcon} />
                                            )
                                    }

                                </Button>
                            </Tooltip>
                            {
                                showMic ?
                                    (
                                        <Tooltip title={streamsStatus.mic ? "Disable microphone" : "Enable microphone"}>
                                            <Button color={camera && camera.isAudioEnabled() ? "primary" : "secondary"}
                                                className={classes.actionBtn}
                                                style={{
                                                    ...theme.actionBtn,
                                                    color: "white",
                                                    backgroundColor: streamsStatus.mic ? "#4FC16F" : theme.actionBtn.backgroundColor
                                                }}

                                                onClick={toggleMic}>
                                                {
                                                    streamsStatus.mic ?
                                                        (
                                                            <Mic style={theme.defaultIcon} />
                                                        )
                                                        :
                                                        (
                                                            <MicOff style={theme.defaultIcon} />
                                                        )
                                                }

                                            </Button>
                                        </Tooltip>
                                    )
                                    :
                                    (
                                        <div />
                                    )
                            }

                            {
                                smScreen ?
                                    (
                                        <Tooltip title="Exit">
                                            <Button variant="contained" color="primary" className={`${classes.leaveBtn} ${classes.actionBtn}`} onClick={props.onLeave}>
                                                <CallEnd style={theme.defaultIcon} />
                                            </Button>
                                        </Tooltip>
                                    )
                                    :
                                    (
                                        <div />
                                    )
                            }

                            {!smScreen &&
                                <Tooltip title="Show users">
                                    <Button color="secondary"
                                        className={classes.actionBtn}
                                        style={{
                                            ...theme.actionBtn,
                                            color: "white",
                                        }}

                                        onClick={() => toggleSideBox("participants")}>
                                        <PeopleAlt style={theme.defaultIcon} />

                                    </Button>
                                </Tooltip>
                            }

                            {!smScreen &&
                                <Tooltip title="Show chat">
                                    <Button color="secondary"
                                        className={classes.actionBtn}
                                        style={{
                                            ...theme.actionBtn,
                                            color: "white",
                                        }}

                                        onClick={e => toggleSideBox("chat")}>
                                        <Badge invisible={!props.newMessages} color="primary" variant="dot">
                                            <Chat style={theme.defaultIcon} />
                                        </Badge>
                                    </Button>
                                </Tooltip>}

                            {!smScreen &&
                                <Tooltip title="Exit">
                                    <Button variant="contained" color="primary" className={`${classes.leaveBtn} ${classes.actionBtn}`} onClick={props.onLeave}>
                                        <CallEnd style={theme.defaultIcon} />
                                    </Button>
                                </Tooltip>}

                            {smScreen &&
                                <div style={{
                                    display: "flex",
                                    flex: smScreen ? "2" : "1",
                                    justifyContent: "flex-end"
                                }}>
                                    <Tooltip title="Show users">
                                        <Button color="secondary"
                                            className={classes.actionBtn}
                                            style={{
                                                ...theme.actionBtn,
                                                color: "white",
                                            }}

                                            onClick={e => toggleSideBox("participants")}>
                                            <PeopleAlt style={theme.defaultIcon} />

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="Show chat">
                                        <Button color="secondary"
                                            className={classes.actionBtn}
                                            style={{
                                                ...theme.actionBtn,
                                                color: "white",
                                            }}

                                            onClick={e => toggleSideBox("chat")}>
                                            <Badge invisible={!props.newMessages} color="primary" variant="dot">
                                                <Chat style={theme.defaultIcon} />
                                            </Badge>
                                        </Button>
                                    </Tooltip>

                                </div>
                            }

                        </div>

                    </div>
                </div >
            </ThemeProvider>
        </StyledEngineProvider>
    );

}

export default RoomActionsWidget;