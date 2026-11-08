import React, { useState, useEffect, useRef } from "react";
import Camera from "./Camera";
import TestCamera from "./TestCamera";
import {
    CssBaseline,
    ThemeProvider,
    StyledEngineProvider,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from '@mui/material/styles';

import makeStyles from "@mui/styles/makeStyles";

import { Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import MediaPlayerWidget from "./MediaPlayerWidget";
import DeviceSelect from "./DeviceSelect";
import logoEyeBee from "./img/logo-eyebee-new-dark.svg";
import PeerTestWidget from "./peerTest/PeerTestWidget";
import MobilePreJoin from "./PreJoin/MobilePreJoin";
import PreRoomLoading from "./PreJoin/PreRoomLoading";

const useStyles = makeStyles(theme => ({
    page: {
        minHeight: "100dvh",
        width: "100%",
        backgroundColor: "var(--color-paper)",
        color: "var(--color-ink)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 20px 40px",
        [theme.breakpoints.up("md")]: {
            padding: "32px 40px 48px",
        },
    },
    header: {
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    logo: {
        width: "120px",
        height: "auto",
    },
    grid: {
        width: "100%",
        maxWidth: "1008px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "24px",
        alignItems: "stretch",
        [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: "48px",
        },
    },
    previewColumn: {
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-paper-2)",
        border: "1px solid var(--color-rule)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
        [theme.breakpoints.up("sm")]: {
            padding: "32px",
        },
    },
    previewLabel: {
        marginBottom: "var(--space-md)",
        fontSize: "var(--text-md)",
        fontWeight: 600,
        lineHeight: 1.4,
        color: "var(--color-ink)",
    },
    previewFrame: {
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    toggles: {
        marginTop: "var(--space-md)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "var(--space-xs)",
    },
    toggleBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-xs)",
        minHeight: "44px",
        padding: "0 var(--space-md)",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--color-field-border)",
        backgroundColor: "transparent",
        color: "var(--color-ink)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        lineHeight: 1,
        cursor: "pointer",
        transition: "border-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out)",
        "&:hover": {
            borderColor: "var(--color-accent)",
        },
        "&:active": {
            backgroundColor: "var(--color-paper-3)",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    toggleBtnOn: {
        borderColor: "var(--color-accent)",
        color: "var(--color-accent)",
    },
    panel: {
        minWidth: 0,
        backgroundColor: "var(--color-paper-2)",
        border: "1px solid var(--color-rule)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
        [theme.breakpoints.up("sm")]: {
            padding: "32px",
        },
    },
    title: {
        fontSize: "clamp(1.75rem, 2.4vw + 1rem, 2.25rem)",
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: "var(--color-ink)",
    },
    subtitle: {
        marginTop: "var(--space-xs)",
        marginBottom: "var(--space-lg)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.55,
        color: "var(--color-muted)",
    },
    testBox: {
        marginBottom: "var(--space-lg)",
    },
    field: {
        marginBottom: "var(--space-md)",
    },
    label: {
        display: "block",
        marginBottom: "6px",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        lineHeight: 1.4,
        color: "var(--color-ink)",
    },
    input: {
        width: "100%",
        height: "var(--control-height)",
        padding: "0 var(--space-sm)",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--color-field-border)",
        backgroundColor: "var(--color-field)",
        color: "var(--color-ink)",
        fontSize: "var(--text-md)",
        lineHeight: 1.4,
        "&::placeholder": {
            color: "var(--color-muted)",
            opacity: 1,
        },
        "&:hover": {
            borderColor: "var(--color-muted)",
        },
    },
    fieldError: {
        marginTop: "6px",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        color: "var(--color-error)",
    },
    joinBtn: {
        width: "100%",
        height: "var(--control-height)",
        marginTop: "var(--space-xs)",
        border: 0,
        borderRadius: "var(--radius-control)",
        backgroundColor: "var(--color-accent)",
        color: "var(--color-accent-ink)",
        fontSize: "var(--text-md)",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "background-color var(--dur-micro) var(--ease-out)",
        "&:hover": {
            backgroundColor: "color-mix(in oklab, var(--color-accent) 90%, white)",
        },
        "&:active": {
            backgroundColor: "color-mix(in oklab, var(--color-accent) 86%, black)",
        },
        "&:disabled": {
            backgroundColor: "var(--color-paper-3)",
            color: "var(--color-muted)",
            cursor: "not-allowed",
        },
    },
    status: {
        marginTop: "var(--space-sm)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        color: "var(--color-muted)",
    },
    statusError: {
        color: "var(--color-error)",
    },
}));

const JoinRoomView = (props) => {
    const classes = useStyles();
    const theme = useTheme();

    const [cameraEnable, setCameraEnable] = useState(false);

    const smScreen = useMediaQuery(theme.breakpoints.up("sm"));
    const mdScreen = useMediaQuery(theme.breakpoints.up("md"));
    const previewSize = mdScreen ? 300 : smScreen ? 280 : 200;
    const [userName, setUserName] = useState("");
    const [mobileJoinError, setMobileJoinError] = useState("");
    const mobileCameraSetup = useRef(false);
    const mobileJoinInFlight = useRef(false);

    const [streamsStatus, setStreamsStatus] = useState({
        camera: false,
        mic: false
    });

    const [cameraConfig, setCameraConfig] = useState({
        audio: {
            echoCancellation: {
                ideal: true
            },
            noiseSuppression: {
                ideal: true
            }
        },
        video: {
            height: {
                ideal: 240,
                max: 480
            },
            width: {
                ideal: 320,
                max: 640
            },
            frameRate: {
                min: 5,
                ideal: 15,
                max: 20
            }
        }
    });

    const [camera, setCamera] = useState(null);

    const [roomInfo] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([
        {
            deviceId: 1,
            label: "No cameras found"
        }
    ]);
    const [availableMics, setAvailableMics] = useState([
        {
            deviceId: 1,
            label: "No microphones found"
        }
    ]);
    const [selectedCamera, setSelectedCamera] = useState("");
    const [selectedMic, setSelectedMic] = useState("");

    const [defaultVideoConstraints] = useState({
        height: {
            ideal: 240,
            max: 480
        },
        width: {
            ideal: 320,
            max: 640
        },
        frameRate: {
            ideal: 15,
            max: 20
        }
    });

    const [lowVideoConstraints] = useState({
        height: {
            ideal: 240,
            max: 480
        },
        width: {
            ideal: 320,
            max: 640
        },
        frameRate: {
            ideal: 2,
            max: 5
        }
    });

    const [peerTestHasFinished, setPeerTestHasFinished] = useState(false);
    const [peerTestResults, setPeerTestResults] = useState(null);
    const [cameraLoaded, setCameraLoaded] = useState(false);
    const [joinDisabled, setJoinDisabled] = useState(true);
    const [peerScore] = useState(null);
    const [userNameTimeout, setUserNameTimeout] = useState(null);
    const [usNameFieldStatus, setUsNameFieldStatus] = useState(null);

    useEffect(() => {
        let disableJoin = false;
        if ((!props.userData.isOwner && !roomInfo) || (!peerTestHasFinished && !props.testDisabled)) {
            disableJoin = true;
        } else {
            disableJoin = false;
        }

        if (cameraLoaded) {
            disableJoin = false;
        } else {
            disableJoin = true;
        }

        if(!roomInfo&&!props.userData.isOwner){
            disableJoin = true;
        }

        if(!peerScore){
            disableJoin = true;
        }else if(peerScore.sfu){
            if(!roomInfo&&!props.userData.isOwner){
                disableJoin = true;
            }
          
        }else if(roomInfo&&roomInfo.numOfSFUs < 2){
            disableJoin = true;
        }


        if(props.userData.smallRoom && props.userData.isPresenter){
            disableJoin = false;
        }


        setJoinDisabled(disableJoin);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.userData.isOwner, roomInfo, peerTestHasFinished, props.testDisabled, cameraLoaded,peerScore]);

    const showError = err => {
        console.error("JoinRoomView - Error", { error: err });
    }

    const setupCamera = async () => {
        let camera ;
        if(props.userData.testStream){
            camera = new TestCamera(props.testCanvasEl);
        }else{
         
            camera = new Camera(navigator)

        }

            let hasPermission = await camera.hasPermission();
           
            if (hasPermission) {
    
                let devList = await camera.listDevices();
                let camList = devList.filter(e => {
                    return e.kind === "videoinput";
                });
    
                let micList = devList.filter(e => {
                    return e.kind === "audioinput";
                });
    
                if (camList.length > 0) {
    
                    setSelectedCamera(camList[0].deviceId);
                    setAvailableCameras(camList);
    
                    if (props.userData.isPresenter) {
                        cameraConfig.video = defaultVideoConstraints;
                    } else {
                        cameraConfig.video = lowVideoConstraints;
                    }
    
                    cameraConfig.video.deviceId = camList[0].deviceId;
    
                } else {
                    cameraConfig.video = false;
    
                }
    
                if (micList.length > 0) {
    
                    setSelectedMic(micList[0].deviceId);
                    setAvailableMics(micList);
    
                    cameraConfig.audio.deviceId = micList[0].deviceId;
                } else {
                    cameraConfig.audio = false;
                }
    
                setCameraConfig({
                    ...cameraConfig
                });
    
                if (cameraConfig.audio || cameraConfig.video) {
                    await camera.start({
                        ...cameraConfig
                    });
    
                    if ((!props.userData.isOwner && !props.userData.isPresenter) || window.location.origin.indexOf("localhost") !== -1) {
                        camera.mute();
                    }
    
                    streamsStatus["camera"] = camera.isVideoEnabled();
                    streamsStatus["mic"] = camera.isAudioEnabled();
    
                    setCameraEnable(camera.isVideoEnabled());
                    setStreamsStatus({
                        ...streamsStatus
                    });
    
                    setCamera(camera);
        
                    props.onCamera(camera);
                }
    
                setCameraLoaded(true);
            }else{
                //does not have permission to list devices, 
                setSelectedCamera(0);
                setAvailableCameras([{
                    deviceId:0,
                    label:"<no camera>"
                }]);
                
                setSelectedMic(0);
                setAvailableMics([{
                    deviceId:0,
                    label:"<no microphone>"
                }]);
               

                setCameraEnable(false);
                setStreamsStatus({
                    camera:false,
                    mic:false
                });

                setCameraConfig({
                    audio:false,
                    video:false
                });

                setCameraLoaded(true);

            }

        return camera;
    }

    useEffect(() => {

        if(props.testCanvasEl){
            setupCamera().then(() => {
                setUserName(props.userData.name || "");
    
            }).catch(err => {
                showError(err);
            });
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.testCanvasEl]);

    useEffect(() => {
        if (mdScreen || camera || mobileCameraSetup.current) {
            return;
        }
        mobileCameraSetup.current = true;
        setupCamera().catch(err => {
            showError(err);
            setCameraLoaded(true);
            setStreamsStatus({
                camera: false,
                mic: false
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mdScreen]);


    const toggleCamera = async () => {
        if (!camera) {
            return;
        }
        if (!camera.getStream()) {

            await camera.start();

        } else {

            if (camera.isVideoEnabled()) {
                setCameraEnable(false);
                camera.disableVideo();

            } else {
                setCameraEnable(true);
                camera.enableVideo();
            }

        }

        streamsStatus["camera"] = camera.isVideoEnabled();

        props.onCamera(camera);

        setStreamsStatus({
            ...streamsStatus
        });

    }

    const toggleMic = async () => {

        if (!camera) {
            return;
        }

        if (camera.isAudioEnabled()) {
            streamsStatus["mic"] = false;
            camera.mute();
        } else {
            streamsStatus["mic"] = true;
            camera.unmute();
        }

        streamsStatus["mic"] = camera.isAudioEnabled();


        props.onCamera(camera);

        setStreamsStatus({
            ...streamsStatus
        });

    }

    const joinBtnClicked = async e => {

        if(!userName){
            setUsNameFieldStatus({
                type:"error",
                message:"USERNAME_FIELD_EMPTY",
                longMessage:"Please, specify a user name."

            });
            return false;
        }

        try{
            await props.joinRoom(userName, streamsStatus, peerTestResults, '');
            return true;
        }catch(err){

            let status = {
                type:"error",
                message:err.error,
            };

            switch(err.error){
                case "MAX_SESSION_PEERS_REACHED":
                    status.longMessage = "This room reached its maximum number of participants.";
                    setJoinDisabled(true);
                break;
                default: break;
            }
            setUsNameFieldStatus(status);
        }
    }

    const mobileJoinClicked = async () => {
        if (mobileJoinInFlight.current || props.joining || !cameraLoaded || !props.roomManager) {
            return;
        }

        const trimmedName = userName.trim();
        if (!trimmedName) {
            setUsNameFieldStatus({
                type: "error",
                message: "USERNAME_FIELD_EMPTY",
                longMessage: "Escribe tu nombre para continuar."
            });
            return;
        }

        if (usNameFieldStatus && usNameFieldStatus.type === "error") {
            return;
        }

        mobileJoinInFlight.current = true;
        setMobileJoinError("");
        if (props.onJoinStart) {
            props.onJoinStart();
        }

        try {
            await props.joinRoom(trimmedName, streamsStatus, peerTestResults, '');
        } catch (err) {
            if (props.onJoinCancel) {
                props.onJoinCancel();
            }
            setMobileJoinError(
                err && err.error === "MAX_SESSION_PEERS_REACHED"
                    ? "Esta sala está llena."
                    : "No se pudo entrar a la sala. Inténtalo de nuevo."
            );
        } finally {
            mobileJoinInFlight.current = false;
        }
    }

    const mobileCancel = () => {
        window.location.assign("/");
    }

    const usernameChanged = async e => {
        clearTimeout(userNameTimeout);
        if(usNameFieldStatus && usNameFieldStatus.message === "MAX_SESSION_PEERS_REACHED"){
           return false;
        }
       
        if (e.target.value.length <= 14){
            setUserName(e.target.value);
            let unTO = setTimeout(async () => {
                let result ;
                try{
                    result = await props.roomManager.checkUsernameAvailability(e.target.value);
                    if (result && result.type === "error" && !result.longMessage) {
                        result = {
                            ...result,
                            longMessage: result.message === "USERNAME_TAKEN"
                                ? "Ese nombre ya está en uso."
                                : "No se pudo comprobar el nombre."
                        };
                    }
                    setUsNameFieldStatus(result);
                }catch(err){
                    setUsNameFieldStatus(result);
                }  

            },300); 

            setUserNameTimeout(unTO);
            
        }
            
    }

    const selectedCameraChanged = async deviceId => {

        setSelectedCamera(deviceId);
        cameraConfig.video.deviceId = deviceId;

        await camera.start({
            ...cameraConfig
        });

        if ((!props.userData.isOwner && !props.userData.isPresenter) || window.location.origin.indexOf("localhost") !== -1) {
            camera.mute();
        }

        setCameraConfig({
            ...cameraConfig
        });

    }

    const selectedMicChanged = async deviceId => {

        setSelectedMic(deviceId);
        cameraConfig.audio.deviceId = deviceId;

        await camera.start({
            ...cameraConfig
        });

        if ((!props.userData.isOwner && !props.userData.isPresenter) || window.location.origin.indexOf("localhost") !== -1) {
            camera.mute();
        }

        setCameraConfig({
            ...cameraConfig
        });

    }

    const peerTestFinished = results => {
        setPeerTestResults(results);
        setPeerTestHasFinished(true);
    }

    if (!mdScreen) {
        if (props.joining) {
            return <PreRoomLoading participantCount={props.joinParticipantCount} />;
        }

        const mobileNameError = usNameFieldStatus && usNameFieldStatus.type === "error"
            ? usNameFieldStatus.longMessage || "No se pudo usar ese nombre."
            : "";
        const mobilePrimaryHint = !userName.trim()
            ? "Escribe tu nombre para continuar."
            : !cameraLoaded
                ? "Preparando la cámara…"
                : !props.roomManager
                    ? "Preparando la sala…"
                    : "";

        return (
            <MobilePreJoin
                camera={camera}
                cameraOn={streamsStatus.camera}
                micOn={streamsStatus.mic}
                onToggleCamera={toggleCamera}
                onToggleMic={toggleMic}
                participantCount={null}
                primaryLabel={props.userData.create ? "Crear" : "Unirme"}
                primaryDisabled={!userName.trim() || Boolean(mobileNameError) || !cameraLoaded || !props.roomManager || props.joining}
                primaryHint={mobilePrimaryHint}
                onPrimary={mobileJoinClicked}
                onCancel={mobileCancel}
                error={mobileJoinError}
                userName={userName}
                onUserNameChange={usernameChanged}
                nameError={mobileNameError}
            />
        );
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <main className={classes.page}>
                    <header className={classes.header}>
                        <img className={classes.logo} src={logoEyeBee} alt="Eyebee" />
                    </header>

                    <div className={classes.grid}>
                        <section className={classes.previewColumn} aria-label="Camera preview">
                            <p className={classes.previewLabel}>Camera preview</p>
                            <div className={classes.previewFrame}>
                                <MediaPlayerWidget
                                    isCameraEnable={cameraEnable}
                                    nomedia={!cameraEnable}
                                    avatar=""
                                    playerSize={previewSize}
                                    background={props.userData && props.userData.isPresenter ? "primary" : "secondary"}
                                    volume={0}
                                    stream={camera && camera.getStream()}
                                />
                            </div>
                            <div className={classes.toggles}>
                                <button
                                    type="button"
                                    className={`${classes.toggleBtn} ${streamsStatus.camera ? classes.toggleBtnOn : ""}`}
                                    onClick={toggleCamera}
                                >
                                    {streamsStatus.camera ? <Videocam fontSize="small" /> : <VideocamOff fontSize="small" />}
                                    <span>{streamsStatus.camera ? "Camera on" : "Camera off"}</span>
                                </button>
                                {props.userData.isOwner || props.userData.isPresenter ? (
                                    <button
                                        type="button"
                                        className={`${classes.toggleBtn} ${streamsStatus.mic ? classes.toggleBtnOn : ""}`}
                                        onClick={toggleMic}
                                    >
                                        {streamsStatus.mic ? <Mic fontSize="small" /> : <MicOff fontSize="small" />}
                                        <span>{streamsStatus.mic ? "Microphone on" : "Microphone off"}</span>
                                    </button>
                                ) : null}
                            </div>
                        </section>

                        <section className={classes.panel} aria-label="Join the room">
                            <h1 className={classes.title}>Ready to join?</h1>
                            <p className={classes.subtitle}>Check your camera and microphone, then enter the room.</p>

                            {!props.testDisabled ? (
                                <div className={classes.testBox}>
                                    <PeerTestWidget
                                        showStats={props.showPeerTestStats}
                                        disabled={props.testDisabled}
                                        forcedScores={props.userData.forcedScores}
                                        onTestFinished={peerTestFinished}
                                    />
                                </div>
                            ) : null}

                            <div className={classes.field}>
                                <label className={classes.label} htmlFor="user-name">Your name</label>
                                <input
                                    id="user-name"
                                    className={classes.input}
                                    type="text"
                                    value={userName}
                                    onChange={usernameChanged}
                                    placeholder="e.g. David"
                                    autoComplete="username"
                                    aria-invalid={usNameFieldStatus && usNameFieldStatus.type === "error" ? "true" : "false"}
                                    aria-describedby={usNameFieldStatus && usNameFieldStatus.type === "error" ? "name-error" : undefined}
                                />
                                {usNameFieldStatus && usNameFieldStatus.type === "error" ? (
                                    <p id="name-error" className={classes.fieldError} role="alert">{usNameFieldStatus.longMessage}</p>
                                ) : null}
                            </div>

                            <DeviceSelect
                                id="camera-select"
                                label="Camera"
                                value={selectedCamera}
                                options={availableCameras}
                                onSelect={selectedCameraChanged}
                                disabled={availableCameras.length === 0}
                                emptyLabel="No camera found"
                            />

                            <DeviceSelect
                                id="mic-select"
                                label="Microphone"
                                value={selectedMic}
                                options={availableMics}
                                onSelect={selectedMicChanged}
                                disabled={availableMics.length === 0}
                                emptyLabel="No microphone found"
                            />

                            <button
                                id="joinBtn"
                                type="button"
                                className={classes.joinBtn}
                                disabled={joinDisabled || !userName.trim() || (usNameFieldStatus && usNameFieldStatus.type === "error")}
                                onClick={joinBtnClicked}
                            >
                                Join room
                            </button>

                            {!props.userData.isOwner ? (
                                usNameFieldStatus && usNameFieldStatus.message === "MAX_SESSION_PEERS_REACHED" ? (
                                    <p className={`${classes.status} ${classes.statusError}`}>This room is full.</p>
                                ) : !userName.trim() ? (
                                    <p className={classes.status}>Enter your name to continue.</p>
                                ) : joinDisabled ? (
                                    <p className={classes.status}>Waiting for the room. This can take a moment.</p>
                                ) : (
                                    <p className={classes.status}>The room is open. Enter when you are ready.</p>
                                )
                            ) : null}
                        </section>
                    </div>
                </main>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default JoinRoomView;
