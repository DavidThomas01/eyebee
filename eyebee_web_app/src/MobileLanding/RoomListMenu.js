import React, { useEffect, useRef, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 520,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    card: {
        width: "100%",
        maxWidth: "340px",
        padding: "10px 0 4px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 18px 50px rgba(0, 0, 0, 0.28)",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        overflow: "hidden",
    },
    head: {
        display: "flex",
        justifyContent: "flex-end",
        padding: "0 10px",
    },
    close: {
        width: "36px",
        height: "36px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        cursor: "pointer",
    },
    action: {
        width: "100%",
        minHeight: "52px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "0 18px",
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "16px",
        textAlign: "left",
        cursor: "pointer",
        "& svg": {
            fontSize: "22px",
            flexShrink: 0,
        },
        "&:active": {
            backgroundColor: "var(--color-brand-surface)",
        },
        "&:disabled": {
            color: "#bdbdbd",
            cursor: "not-allowed",
        },
        "& + &": {
            borderTop: "1px solid var(--color-brand-line)",
        },
    },
    danger: {
        color: "#c62828",
        "&:active": {
            backgroundColor: "#fdecea",
        },
    },
    status: {
        minHeight: "20px",
        margin: "6px 18px 8px",
        fontSize: "13px",
        lineHeight: 1.4,
        color: "#616161",
    },
}));

const RoomListMenu = ({ room, onClose, onDelete }) => {
    const classes = useStyles();
    const [status, setStatus] = useState("");
    const closeRef = useRef(null);
    const statusTimer = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!room) {
            return undefined;
        }

        setStatus("");
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimer = window.setTimeout(() => {
            if (closeRef.current) {
                closeRef.current.focus();
            }
        }, 50);

        const closeOnEscape = event => {
            if (event.key === "Escape") {
                onCloseRef.current();
            }
        };
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            window.clearTimeout(focusTimer);
            window.clearTimeout(statusTimer.current);
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [room]);

    if (!room) {
        return null;
    }

    const announce = message => {
        setStatus(message);
        window.clearTimeout(statusTimer.current);
        statusTimer.current = window.setTimeout(() => setStatus(""), 2500);
    };

    const writeToClipboard = async text => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                // The async API can be blocked without a user gesture; fall back to the legacy path.
            }
        }

        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        let copied = false;
        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }
        document.body.removeChild(area);
        return copied;
    };

    const copyLink = async () => {
        const copied = await writeToClipboard(room.link);
        announce(copied ? "Enlace copiado." : "No se pudo copiar el enlace.");
    };

    const invite = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: room.name || "Eyebee",
                    text: "Únete a mi sala en Eyebee",
                    url: room.link,
                });
                return;
            } catch (error) {
                if (error && error.name === "AbortError") {
                    return;
                }
            }
        }
        await copyLink();
    };

    return (
        <div
            className={`${classes.overlay} backdrop-in`}
            role="presentation"
            onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className={classes.card} role="dialog" aria-modal="true" aria-label="Opciones de la sala">
                <div className={classes.head}>
                    <button ref={closeRef} type="button" className={classes.close} onClick={onClose} aria-label="Cerrar">
                        <CloseIcon />
                    </button>
                </div>

                {/* TODO(Juan): habilitar cuando el backend guarde el nombre de la sala. */}
                <button type="button" className={classes.action} disabled>
                    <EditIcon />
                    Cambiar nombre
                </button>

                {/* TODO(Juan): habilitar cuando el backend permita rotar el enlace de la sala. */}
                <button type="button" className={classes.action} disabled>
                    <RefreshIcon />
                    Resetear enlace
                </button>

                <button type="button" className={classes.action} onClick={invite}>
                    <PersonAddIcon />
                    Invitar a alguien
                </button>

                <button type="button" className={classes.action} onClick={copyLink}>
                    <ContentCopyIcon />
                    Copiar enlace
                </button>

                <button
                    type="button"
                    className={`${classes.action} ${classes.danger}`}
                    onClick={() => onDelete(room)}
                >
                    <DeleteIcon />
                    Eliminar
                </button>

                <p className={classes.status} role="status" aria-live="polite">{status}</p>
            </div>
        </div>
    );
};

export default RoomListMenu;
