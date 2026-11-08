import React, { useEffect, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MicNoneOutlined from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlined from "@mui/icons-material/MicOffOutlined";
import VideocamOutlined from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlined from "@mui/icons-material/VideocamOffOutlined";

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: "calc(76px + env(safe-area-inset-bottom))",
        zIndex: 450,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
    },
    panel: {
        width: "100%",
        maxWidth: "560px",
        maxHeight: "60dvh",
        overflowY: "auto",
        margin: "0 12px 8px",
        padding: "8px 0",
        backgroundColor: "#1c1c1c",
        border: "1px solid #2e2e2e",
        borderRadius: "18px",
        color: "#f5f1ec",
        fontFamily: "var(--font-brand)",
        boxShadow: "0 -12px 40px rgba(0, 0, 0, 0.35)",
    },
    head: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 16px 12px",
    },
    title: {
        margin: 0,
        fontSize: "20px",
        lineHeight: 1.2,
        fontWeight: 800,
        color: "#f5f1ec",
    },
    close: {
        width: "36px",
        height: "36px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
        border: 0,
        background: "transparent",
        color: "#f5f1ec",
        cursor: "pointer",
    },
    row: {
        width: "100%",
        minHeight: "54px",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        border: 0,
        borderTop: "1px solid #2e2e2e",
        background: "transparent",
        color: "#f5f1ec",
        fontFamily: "var(--font-brand)",
        fontSize: "17px",
        lineHeight: 1.3,
        textAlign: "left",
        cursor: "pointer",
        "& svg": {
            flexShrink: 0,
            fontSize: "22px",
        },
        "&:active": {
            backgroundColor: "#262626",
        },
    },
    rowDisabled: {
        color: "#6f6f6f",
        cursor: "not-allowed",
        "& svg": {
            color: "#6f6f6f",
        },
        "&:active": {
            backgroundColor: "transparent",
        },
    },
    status: {
        margin: 0,
        padding: "8px 18px 4px",
        fontSize: "13px",
        lineHeight: 1.4,
        color: "#bdbdbd",
    },
    back: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        margin: "0 16px 4px",
        padding: "6px 0",
        border: 0,
        background: "transparent",
        color: "#bdbdbd",
        fontFamily: "var(--font-brand)",
        fontSize: "14px",
        cursor: "pointer",
    },
    avRow: {
        width: "100%",
        minHeight: "58px",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        border: 0,
        borderTop: "1px solid #2e2e2e",
        background: "transparent",
        color: "#f5f1ec",
        fontFamily: "var(--font-brand)",
        fontSize: "17px",
        cursor: "pointer",
        "& svg": {
            fontSize: "22px",
        },
        "&:active": {
            backgroundColor: "#262626",
        },
    },
    note: {
        margin: 0,
        padding: "12px 18px 6px",
        fontSize: "13px",
        lineHeight: 1.45,
        color: "#9e9e9e",
    },
}));

const RoomOptionsSheet = ({ open, onClose, onInvite, roomUrl, cameraOn, micOn, onToggleCamera, onToggleMic }) => {
    const classes = useStyles();
    const [view, setView] = useState("main");
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (open) {
            setView("main");
            setStatus("");
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setStatus("Enlace copiado.");
        } catch (error) {
            setStatus("No se pudo copiar. Selecciona el enlace manualmente.");
        }
    };

    return (
        <div
            className={classes.overlay}
            role="presentation"
            onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className={classes.panel} role="dialog" aria-modal="true" aria-labelledby="room-options-title">
                <div className={classes.head}>
                    <h2 id="room-options-title" className={classes.title}>
                        {view === "av" ? "Audio y video" : "Opciones de la sala"}
                    </h2>
                    <button type="button" className={classes.close} onClick={onClose} aria-label="Cerrar">
                        <CloseIcon />
                    </button>
                </div>

                {view === "main" ? (
                    <>
                        {/* TODO(Juan): room settings need a backend endpoint. */}
                        <button type="button" className={`${classes.row} ${classes.rowDisabled}`} disabled>
                            Configuración de la sala
                            <SettingsOutlined />
                        </button>

                        {/* TODO(Juan): renaming a room needs backend support. */}
                        <button type="button" className={`${classes.row} ${classes.rowDisabled}`} disabled>
                            Cambiar nombre a la sala
                            <EditOutlined />
                        </button>

                        <button type="button" className={classes.row} onClick={onInvite}>
                            Invitar a alguien
                            <PersonAddOutlined />
                        </button>

                        <button type="button" className={classes.row} onClick={copyLink}>
                            Copiar enlace de la sala
                            <ContentCopyOutlined />
                        </button>

                        {/* TODO(Juan): rotating the room link needs backend support. */}
                        <button type="button" className={`${classes.row} ${classes.rowDisabled}`} disabled>
                            Restaurar enlace
                            <RefreshOutlined />
                        </button>

                        <button type="button" className={classes.row} onClick={() => setView("av")}>
                            Configuración de audio y video
                            <TuneOutlined />
                        </button>

                        {status ? <p className={classes.status} role="status">{status}</p> : null}
                    </>
                ) : (
                    <>
                        <button type="button" className={classes.back} onClick={() => setView("main")}>
                            <ArrowBackIcon fontSize="small" />
                            Volver
                        </button>

                        <button type="button" className={classes.avRow} onClick={onToggleCamera}>
                            Cámara
                            {cameraOn ? <VideocamOutlined /> : <VideocamOffOutlined />}
                        </button>

                        <button type="button" className={classes.avRow} onClick={onToggleMic}>
                            Micrófono
                            {micOn ? <MicNoneOutlined /> : <MicOffOutlined />}
                        </button>

                        <p className={classes.note}>Los dispositivos se eligen antes de entrar a la sala.</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default RoomOptionsSheet;
