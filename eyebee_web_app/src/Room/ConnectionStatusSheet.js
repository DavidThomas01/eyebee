import React, { useEffect } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import Wifi from "@mui/icons-material/Wifi";
import Bluetooth from "@mui/icons-material/Bluetooth";
import LanOutlined from "@mui/icons-material/LanOutlined";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import SettingsInputAntenna from "@mui/icons-material/SettingsInputAntenna";

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
    },
    panel: {
        width: "100%",
        maxWidth: "560px",
        maxHeight: "88dvh",
        overflowY: "auto",
        padding: "18px 18px calc(22px + env(safe-area-inset-bottom))",
        backgroundColor: "#F5F5F5",
        borderRadius: "24px 24px 0 0",
        color: "#17130A",
        fontFamily: "var(--font-brand)",
        boxShadow: "0 -12px 40px rgba(0, 0, 0, 0.35)",
    },
    head: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "16px",
    },
    headLeft: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
    },
    mark: {
        width: "26px",
        height: "26px",
        display: "block",
        flexShrink: 0,
    },
    headLabel: {
        margin: 0,
        fontSize: "15px",
        lineHeight: 1.2,
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: "#17130A",
    },
    ownerChip: {
        display: "inline-flex",
        alignItems: "center",
        height: "22px",
        padding: "0 9px",
        borderRadius: "999px",
        backgroundColor: "#F2C600",
        color: "#17130A",
        fontSize: "11px",
        lineHeight: 1,
        fontWeight: 800,
        letterSpacing: "0.06em",
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
        borderRadius: "50%",
        background: "transparent",
        color: "#17130A",
        cursor: "pointer",
    },
    card: {
        margin: "0 0 18px",
        padding: "14px 16px",
        backgroundColor: "#FFF8E1",
        border: "1px solid #F2C600",
        borderRadius: "16px",
    },
    greeting: {
        margin: "0 0 6px",
        fontSize: "16px",
        lineHeight: 1.3,
        fontWeight: 500,
        color: "#17130A",
    },
    message: {
        margin: 0,
        fontSize: "14px",
        lineHeight: 1.5,
        color: "#3A3428",
    },
    options: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    row: {
        width: "100%",
        minHeight: "56px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "0 16px",
        border: "1px solid #ECECEC",
        borderRadius: "14px",
        backgroundColor: "#FFFFFF",
        color: "#9A9A9A",
        fontFamily: "var(--font-brand)",
        fontSize: "16px",
        lineHeight: 1.3,
        fontWeight: 500,
        textAlign: "left",
        cursor: "not-allowed",
        "& svg": {
            flexShrink: 0,
            fontSize: "22px",
            color: "#9A9A9A",
        },
    },
    rowSelected: {
        border: "1px solid #F2C600",
        color: "#17130A",
        "& svg": {
            color: "#B99A00",
        },
    },
    radio: {
        width: "20px",
        height: "20px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginLeft: "auto",
        border: "2px solid #C9C9C9",
        borderRadius: "50%",
    },
    radioSelected: {
        borderColor: "#F2C600",
        "&::after": {
            content: '""',
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#F2C600",
        },
    },
}));

const STATUS_COPY = {
    buena: "Todo listo para la reunión.",
    regular: "Si notas cortes, prueba otra red.",
    deficiente: "Te sugerimos cambiar de conexión para mejorar tu acceso.",
};

const readCapability = (capabilities, key) => {
    const raw = capabilities && capabilities[key];
    if (raw && typeof raw === "object") {
        return raw.value;
    }
    return raw;
};

export const getConnectionStatus = capabilities => {
    const rawScore = Number(readCapability(capabilities, "score"));
    const score = Number.isFinite(rawScore) ? rawScore : 1;
    const rawType = readCapability(capabilities, "connectionType");
    const connectionType = typeof rawType === "string" ? rawType.toUpperCase() : "STUN";
    const stun = capabilities && typeof capabilities.stun === "boolean"
        ? capabilities.stun
        : connectionType !== "TURN";

    // TURN maps to "regular" before the no-STUN fallback; score 3 always wins.
    let key = "regular";
    if (score >= 3 || (!stun && connectionType !== "TURN")) {
        key = "deficiente";
    } else if (score <= 1 && stun) {
        key = "buena";
    }

    return {
        key: key,
        word: key,
        message: STATUS_COPY[key],
        stun: stun,
        connectionType: connectionType,
    };
};

const WifiHexMark = () => (
    <svg width="26" height="26" viewBox="0 0 26 26" role="img" aria-label="Wifi">
        <path
            d="M13 1.5 23 7.25v11.5L13 24.5 3 18.75V7.25Z"
            fill="none"
            stroke="#F2C600"
            strokeWidth="2"
            strokeLinejoin="round"
        />
        <path d="M8.5 12.5a6.2 6.2 0 0 1 9 0" fill="none" stroke="#F2C600" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.6 15.6a3.4 3.4 0 0 1 4.8 0" fill="none" stroke="#F2C600" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="13" cy="18.4" r="1.2" fill="#F2C600" />
    </svg>
);

// TODO(Juan): switching connection options is not supported yet; every row stays disabled until the WebRTC switch lands.
const OPTIONS = [
    { id: "wifi", label: "Wifi", Icon: Wifi },
    { id: "bluetooth", label: "Bluetooth", Icon: Bluetooth },
    { id: "local", label: "Local Network", Icon: LanOutlined },
    { id: "smart", label: "Inteligente", Icon: AutoAwesomeOutlined },
    { id: "lora", label: "Radio LORA", Icon: SettingsInputAntenna },
];

const ConnectionStatusSheet = ({ open, onClose, userName, isOwner, capabilities }) => {
    const classes = useStyles();
    const status = getConnectionStatus(capabilities);
    const selectedOption = status.connectionType === "TURN" ? "smart" : "wifi";

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onKeyDown = event => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

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
            <div
                className={classes.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="connection-status-title"
            >
                <div className={classes.head}>
                    <div className={classes.headLeft}>
                        <span className={classes.mark}>
                            <WifiHexMark />
                        </span>
                        <h2 id="connection-status-title" className={classes.headLabel}>WIFI</h2>
                        {isOwner ? <span className={classes.ownerChip}>OWNER</span> : null}
                    </div>
                    <button type="button" className={classes.close} onClick={onClose} aria-label="Cerrar">
                        <CloseIcon />
                    </button>
                </div>

                <div className={classes.card}>
                    <p className={classes.greeting}>
                        Hola <strong>{userName || "Invitado"}</strong>
                    </p>
                    <p className={classes.message}>
                        Tu estado de conexión para esta sala es <strong>{status.word}</strong>. {status.message}
                    </p>
                </div>

                <div className={classes.options} role="radiogroup" aria-label="Tipo de conexión">
                    {OPTIONS.map(option => {
                        const selected = option.id === selectedOption;
                        const Icon = option.Icon;

                        return (
                            <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                className={`${classes.row} ${selected ? classes.rowSelected : ""}`}
                                disabled
                            >
                                <Icon />
                                {option.label}
                                <span className={`${classes.radio} ${selected ? classes.radioSelected : ""}`} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ConnectionStatusSheet;
