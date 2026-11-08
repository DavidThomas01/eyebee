import React, { useCallback, useEffect, useRef, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import IosShareOutlined from "@mui/icons-material/IosShareOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import QrCode2Outlined from "@mui/icons-material/QrCode2Outlined";
import crypto from "crypto-js";

import RoomLinkGenerator from "../RoomLinkGenerator";
import QrCodeOverlay from "../QrCodeOverlay";

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    backdrop: {
        position: "absolute",
        inset: 0,
        touchAction: "none",
    },
    panel: {
        position: "relative",
        width: "100%",
        maxWidth: "560px",
        maxHeight: "92dvh",
        overflowY: "auto",
        overscrollBehavior: "contain",
        touchAction: "pan-y",
        padding: "22px 20px calc(22px + env(safe-area-inset-bottom))",
        backgroundColor: "var(--color-brand-surface)",
        borderTopLeftRadius: "24px",
        borderTopRightRadius: "24px",
        boxShadow: "0 -12px 40px rgba(0, 0, 0, 0.25)",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
    },
    head: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: "4px",
    },
    title: {
        margin: 0,
        fontSize: "22px",
        lineHeight: 1.2,
        fontWeight: 800,
        color: "var(--color-brand-ink)",
    },
    close: {
        width: "40px",
        height: "40px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        cursor: "pointer",
    },
    field: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        padding: "10px 12px",
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-brand-field-border)",
        borderRadius: "8px",
        "&:focus-within": {
            borderColor: "var(--color-brand-focus)",
            boxShadow: "0 0 0 2px rgba(138, 109, 0, 0.28)",
        },
    },
    fieldLabel: {
        fontSize: "12px",
        lineHeight: 1.3,
        color: "var(--color-brand-muted)",
    },
    fieldDisabled: {
        backgroundColor: "#ececec",
        borderColor: "#bdbdbd",
    },
    fieldInput: {
        padding: "2px 0",
        border: 0,
        outline: "none",
        background: "transparent",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "16px",
        lineHeight: 1.4,
        "&:disabled": {
            color: "#757575",
            cursor: "not-allowed",
        },
    },
    fieldHint: {
        marginTop: "6px",
        fontSize: "12px",
        lineHeight: 1.4,
        color: "#757575",
    },
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        flexShrink: 0,
    },
    headerIcon: {
        width: "40px",
        height: "40px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        cursor: "pointer",
    },
    subtitle: {
        margin: "0 0 20px",
        fontSize: "14px",
        lineHeight: 1.5,
        color: "var(--color-brand-muted)",
    },
    sectionLabel: {
        margin: "20px 0 8px",
        fontSize: "12px",
        lineHeight: 1.4,
        color: "var(--color-brand-muted)",
    },
    shareButton: {
        width: "100%",
        minHeight: "48px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "0 18px",
        border: "1px solid #bdbdbd",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "15px",
        fontWeight: 800,
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#ececec",
        },
    },

    enter: {
        width: "100%",
        minHeight: "56px",
        marginTop: "16px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        border: 0,
        borderRadius: "8px",
        backgroundColor: "var(--color-brand-yellow)",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "18px",
        fontWeight: 800,
        cursor: "pointer",
        "&:active": {
            backgroundColor: "var(--color-brand-yellow-dark)",
        },
    },
    toast: {
        position: "fixed",
        left: "50%",
        bottom: "calc(20px + env(safe-area-inset-bottom))",
        zIndex: 600,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "calc(100% - 32px)",
        padding: "10px 16px",
        border: 0,
        borderRadius: "999px",
        backgroundColor: "#111111",
        color: "#ffffff",
        fontFamily: "var(--font-brand)",
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: 1.4,
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
        cursor: "pointer",
        opacity: 0,
        pointerEvents: "none",
        transform: "translate(-50%, 120%)",
        transition: "transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)",
    },
    toastVisible: {
        opacity: 1,
        pointerEvents: "auto",
        transform: "translate(-50%, 0)",
    },
}));

const copyToClipboard = async text => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        const copied = await navigator.clipboard.writeText(text).then(() => true).catch(() => false);
        if (copied) {
            return true;
        }
    }

    try {
        const field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.top = "-1000px";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(field);
        return copied;
    } catch (error) {
        return false;
    }
};

const CreateRoomSheet = ({ open, onClose, onEnter }) => {
    const classes = useStyles();
    // TODO(Juan): the backend does not support room names yet.
    const [name, setName] = useState("[PLACEHOLDER]");
    const [link, setLink] = useState("");
    const [qrOpen, setQrOpen] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const closeRef = useRef(null);
    const toastTimer = useRef(null);
    const onCloseRef = useRef(onClose);

    const showToast = useCallback((message, duration = 2600) => {
        setToastMessage(message);
        setToastVisible(true);
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToastVisible(false), duration);
    }, []);

    const dismissToast = () => {
        window.clearTimeout(toastTimer.current);
        setToastVisible(false);
    };

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const generator = new RoomLinkGenerator(window, crypto);
        const generated = generator.generateLinks(null, { demo: true, largeRoom: false }).presenters;
        setLink(generated);
        setName("[PLACEHOLDER]");
        setQrOpen(false);
        setToastVisible(false);
        setToastMessage("");
        window.clearTimeout(toastTimer.current);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const focusTimer = window.setTimeout(() => {
            if (closeRef.current) {
                closeRef.current.focus();
            }
        }, 350);

        const closeOnEscape = event => {
            if (event.key === "Escape") {
                onCloseRef.current();
            }
        };
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            window.clearTimeout(focusTimer);
            window.clearTimeout(toastTimer.current);
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) {
        return null;
    }

    const copyLink = async () => {
        const copiedOk = await copyToClipboard(link);
        showToast(copiedOk ? "Enlace copiado." : "No se pudo copiar el enlace.");
    };

    const invite = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: name.trim() || "Eyebee",
                    text: "Únete a mi sala en Eyebee",
                    url: link,
                });
                showToast("Enlace compartido.");
                return;
            } catch (error) {
                if (error && error.name === "AbortError") {
                    return;
                }
            }
        }
        await copyLink();
    };

    const enter = () => {
        const match = link.match(/\/videocall\/([^?]+)/);
        const createLink = link + (link.includes("?") ? "&" : "?") + "create=1";
        onEnter({
            id: match ? match[1] : String(Date.now()),
            name: name.trim() || "[PLACEHOLDER]",
            link: createLink,
            createdAt: Date.now(),
        });
    };

    return (
        <>
            <div
                className={`${classes.overlay} backdrop-in`}
                role="presentation"
            >
            <div className={classes.backdrop} aria-hidden="true" onMouseDown={onClose} />
            <div
                className={`${classes.panel} slide-up`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-room-title"
            >
                <div className={classes.head}>
                    <h2 id="create-room-title" className={classes.title}>Iniciando una nueva sala</h2>
                    <div className={classes.headerActions}>
                        <button
                            type="button"
                            className={classes.headerIcon}
                            onClick={() => setQrOpen(true)}
                            aria-label="Mostrar código QR"
                        >
                            <QrCode2Outlined />
                        </button>
                        <button ref={closeRef} type="button" className={classes.close} onClick={onClose} aria-label="Cerrar">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <p className={classes.subtitle}>Invita a quien quieras o entra directamente.</p>

                <div className={`${classes.field} ${classes.fieldDisabled}`}>
                    <label className={classes.fieldLabel} htmlFor="new-room-name">Nombre de la sala</label>
                    <input
                        id="new-room-name"
                        className={classes.fieldInput}
                        type="text"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        autoComplete="off"
                        disabled
                        aria-describedby="name-hint"
                    />
                </div>
                <p id="name-hint" className={classes.fieldHint}>Próximamente</p>

                <p className={classes.sectionLabel}>Comparte la sala</p>

                <button type="button" className={classes.shareButton} onClick={invite}>
                    <IosShareOutlined fontSize="small" />
                    Compartir enlace
                </button>

                <button type="button" className={classes.enter} onClick={enter}>
                    Entrar
                    <ArrowForwardIcon />
                </button>
            </div>
        </div>

        <QrCodeOverlay open={qrOpen} onClose={() => setQrOpen(false)} url={link} />

        <button
            type="button"
            className={`${classes.toast} ${toastVisible ? classes.toastVisible : ""}`}
            onClick={dismissToast}
            aria-live="polite"
            aria-hidden={!toastVisible}
            tabIndex={toastVisible ? 0 : -1}
        >
            {toastMessage}
        </button>
        </>
    );
};

export default CreateRoomSheet;
