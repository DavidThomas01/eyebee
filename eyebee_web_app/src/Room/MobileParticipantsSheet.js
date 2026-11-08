import React, { useEffect, useRef } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
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
        backgroundColor: "color-mix(in oklab, var(--color-paper) 55%, transparent)",
    },
    panel: {
        position: "fixed",
        left: "12px",
        right: "12px",
        bottom: "calc(84px + env(safe-area-inset-bottom))",
        maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom))",
        zIndex: 460,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-brand-surface)",
        borderRadius: "24px",
        overflow: "hidden",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        boxShadow: "0 18px 50px color-mix(in oklab, var(--color-paper) 35%, transparent)",
    },
    head: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        padding: "18px 18px 14px",
    },
    headText: {
        minWidth: 0,
    },
    title: {
        margin: 0,
        fontSize: "22px",
        lineHeight: 1.1,
        fontWeight: 800,
        letterSpacing: "-0.01em",
        color: "var(--color-brand-ink)",
    },
    subtitle: {
        margin: "4px 0 0",
        fontSize: "13px",
        lineHeight: 1.3,
        color: "var(--color-brand-muted)",
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
        color: "var(--color-brand-ink)",
        cursor: "pointer",
        "&:focus-visible": {
            outline: "2px solid var(--color-brand-focus)",
            outlineOffset: "2px",
        },
    },
    list: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "0 18px 18px",
    },
    row: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "12px",
        backgroundColor: "var(--color-brand-white)",
        border: "1px solid var(--color-brand-line)",
        borderRadius: "14px",
    },
    avatar: {
        width: "40px",
        height: "40px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        borderRadius: "50%",
        backgroundColor: "var(--color-brand-yellow)",
        color: "var(--color-brand-ink)",
        fontSize: "13px",
        lineHeight: 1,
        fontWeight: 800,
        letterSpacing: "0.02em",
    },
    body: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        flex: 1,
        minWidth: 0,
    },
    nameRow: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        minWidth: 0,
    },
    name: {
        margin: 0,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "15px",
        lineHeight: 1.2,
        fontWeight: 700,
        color: "var(--color-brand-ink)",
    },
    you: {
        flexShrink: 0,
        padding: "2px 6px",
        borderRadius: "999px",
        backgroundColor: "var(--color-brand-yellow)",
        color: "var(--color-brand-ink)",
        fontSize: "10px",
        lineHeight: 1.2,
        fontWeight: 800,
    },
    role: {
        margin: 0,
        fontSize: "12px",
        lineHeight: 1.2,
        color: "var(--color-brand-muted)",
    },
    status: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexShrink: 0,
        color: "var(--color-brand-muted)",
    },
    statusOn: {
        color: "var(--color-brand-ink)",
    },
    statusIcon: {
        display: "block",
        fontSize: "18px",
    },
    empty: {
        margin: 0,
        padding: "18px",
        backgroundColor: "var(--color-brand-white)",
        border: "1px solid var(--color-brand-line)",
        borderRadius: "14px",
        color: "var(--color-brand-muted)",
        fontSize: "14px",
        lineHeight: 1.4,
        textAlign: "center",
    },
}));

const initials = name => {
    const parts = String(name || "Invitado").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return "?";
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const roleFor = peer => {
    if (peer.owner) {
        return "Moderador";
    }
    if (peer.presenter) {
        return "Presentador";
    }
    return "Participante";
};

const MobileParticipantsSheet = ({ open, onClose, roomUsers, userData }) => {
    const classes = useStyles();
    const closeRef = useRef(null);

    useEffect(() => {
        if (open && closeRef.current) {
            closeRef.current.focus();
        }
    }, [open]);

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

    const peers = Object.values(roomUsers || {})
        .filter(Boolean)
        .sort((a, b) => {
            const rank = peer => (peer.owner ? 0 : peer.presenter ? 1 : 2);
            return rank(a) - rank(b) || String(a.userName || "").localeCompare(String(b.userName || ""), "es", { numeric: true });
        });
    const count = peers.length;

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
                aria-labelledby="mobile-participants-title"
            >
                <div className={classes.head}>
                    <div className={classes.headText}>
                        <h2 id="mobile-participants-title" className={classes.title}>Participantes</h2>
                        <p className={classes.subtitle}>
                            {count === 1 ? "1 persona en la sala" : `${count} personas en la sala`}
                        </p>
                    </div>
                    <button
                        ref={closeRef}
                        type="button"
                        className={classes.close}
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div className={classes.list}>
                    {peers.length === 0 ? (
                        <p className={classes.empty}>Todavía no hay nadie en la sala.</p>
                    ) : peers.map(peer => {
                        const name = peer.userName || "Invitado";
                        const isYou = peer.id === (userData && userData.peerId);

                        return (
                            <div key={peer.id || name} className={classes.row}>
                                <span className={classes.avatar} aria-hidden="true">{initials(name)}</span>
                                <div className={classes.body}>
                                    <div className={classes.nameRow}>
                                        <p className={classes.name}>{name}</p>
                                        {isYou ? <span className={classes.you}>Tú</span> : null}
                                    </div>
                                    <p className={classes.role}>{roleFor(peer)}</p>
                                </div>
                                <div className={classes.status}>
                                    {peer.mic ? (
                                        <MicNoneOutlined
                                            className={`${classes.statusIcon} ${classes.statusOn}`}
                                            titleAccess="Micrófono activado"
                                        />
                                    ) : (
                                        <MicOffOutlined
                                            className={classes.statusIcon}
                                            titleAccess="Micrófono desactivado"
                                        />
                                    )}
                                    {peer.camera ? (
                                        <VideocamOutlined
                                            className={`${classes.statusIcon} ${classes.statusOn}`}
                                            titleAccess="Cámara activada"
                                        />
                                    ) : (
                                        <VideocamOffOutlined
                                            className={classes.statusIcon}
                                            titleAccess="Cámara desactivada"
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileParticipantsSheet;
