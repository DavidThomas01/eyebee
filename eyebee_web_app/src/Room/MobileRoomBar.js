import React from "react";

import makeStyles from "@mui/styles/makeStyles";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import MicNoneOutlined from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlined from "@mui/icons-material/MicOffOutlined";
import VideocamOutlined from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlined from "@mui/icons-material/VideocamOffOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import IosShareOutlined from "@mui/icons-material/IosShareOutlined";
import PanToolOutlined from "@mui/icons-material/PanToolOutlined";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";

const useStyles = makeStyles(() => ({
    bar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "5px",
        width: "fit-content",
        maxWidth: "calc(100% - 24px)",
        margin: "8px auto calc(8px + env(safe-area-inset-bottom))",
        padding: "6px",
        borderRadius: "20px",
        backgroundColor: "#1c1c1c",
        border: "1px solid #2e2e2e",
        "@media (max-width: 360px)": {
            gap: "3px",
            padding: "5px",
        },
    },
    button: {
        flex: "0 0 auto",
        width: "40px",
        height: "40px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        borderRadius: "12px",
        backgroundColor: "#2a2a2a",
        color: "#f5f1ec",
        cursor: "pointer",
        "& svg": {
            fontSize: "22px",
        },
        "&:active": {
            backgroundColor: "#3a3a3a",
        },
        "@media (max-width: 360px)": {
            width: "36px",
        },
    },
    settings: {
        backgroundColor: "#2ecc71",
        color: "#0b1f12",
        "&:active": {
            backgroundColor: "#27ae60",
        },
    },
    settingsIdle: {
        backgroundColor: "#000000",
        color: "#f5f1ec",
        "&:active": {
            backgroundColor: "#111111",
        },
    },
    leave: {
        backgroundColor: "#e5484d",
        color: "#ffffff",
        "&:active": {
            backgroundColor: "#c93c41",
        },
    },
}));

const MobileRoomBar = ({
    cameraOn,
    micOn,
    optionsOpen,
    onToggleCamera,
    onToggleMic,
    onOpenOptions,
    onOpenPeople,
    onOpenChat,
    canShareScreen,
    presentationRequested,
    onToggleScreen,
    onTogglePresentation,
    onLeave,
}) => {
    const classes = useStyles();

    return (
        <div className={classes.bar}>
            <button
                type="button"
                className={`${classes.button} ${optionsOpen ? classes.settings : classes.settingsIdle}`}
                onClick={onOpenOptions}
                aria-label="Opciones de la sala"
                aria-pressed={optionsOpen}
            >
                <TuneOutlined />
            </button>
            <button
                type="button"
                className={classes.button}
                onClick={onToggleMic}
                aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
            >
                {micOn ? <MicNoneOutlined /> : <MicOffOutlined />}
            </button>
            <button
                type="button"
                className={classes.button}
                onClick={onToggleCamera}
                aria-label={cameraOn ? "Apagar cámara" : "Encender cámara"}
            >
                {cameraOn ? <VideocamOutlined /> : <VideocamOffOutlined />}
            </button>
            <button type="button" className={classes.button} onClick={onOpenPeople} aria-label="Participantes">
                <PeopleAltOutlined />
            </button>
            <button type="button" className={classes.button} onClick={onOpenChat} aria-label="Chat">
                <ChatOutlined />
            </button>
            {canShareScreen ? (
                <button type="button" className={classes.button} onClick={onToggleScreen} aria-label="Compartir pantalla">
                    <IosShareOutlined />
                </button>
            ) : (
                <button
                    type="button"
                    className={`${classes.button} ${presentationRequested ? classes.settings : ""}`}
                    onClick={onTogglePresentation}
                    aria-label={presentationRequested ? "Bajar la mano" : "Levantar la mano"}
                    aria-pressed={presentationRequested}
                >
                    <PanToolOutlined />
                </button>
            )}
            <button
                type="button"
                className={`${classes.button} ${classes.leave}`}
                onClick={onLeave}
                aria-label="Salir de la sala"
            >
                <LogoutOutlined />
            </button>
        </div>
    );
};

export default MobileRoomBar;
