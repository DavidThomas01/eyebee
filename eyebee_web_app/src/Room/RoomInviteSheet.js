import React, { useEffect, useRef, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import IosShareOutlined from "@mui/icons-material/IosShareOutlined";
import QrCode2Outlined from "@mui/icons-material/QrCode2Outlined";

import QrCodeOverlay from "../QrCodeOverlay";

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 500,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
    },
    panel: {
        width: "100%",
        maxWidth: "560px",
        maxHeight: "92dvh",
        overflowY: "auto",
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
    shareButton: {
        width: "100%",
        minHeight: "52px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "0 18px",
        border: 0,
        borderRadius: "8px",
        backgroundColor: "#111111",
        color: "#ffffff",
        fontFamily: "var(--font-brand)",
        fontSize: "16px",
        fontWeight: 800,
        textDecoration: "none",
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#2b2b2b",
        },
    },


}));

const RoomInviteSheet = ({ open, onClose, roomUrl }) => {
    const classes = useStyles();
    const [qrOpen, setQrOpen] = useState(false);
    const closeRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        setQrOpen(false);

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
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) {
        return null;
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
        } catch (error) {
            // The native share sheet is the primary path; copy is only a fallback.
        }
    };

    const share = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Eyebee",
                    text: "Únete a mi sala en Eyebee",
                    url: roomUrl,
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
        <>
        <div
            className={`${classes.overlay} backdrop-in`}
            role="presentation"
            onMouseDown={event => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={`${classes.panel} slide-up`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="room-invite-title"
            >
                <div className={classes.head}>
                    <h2 id="room-invite-title" className={classes.title}>Invitar a alguien</h2>
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

                <p className={classes.subtitle}>Comparte el enlace o el código QR.</p>

                <button type="button" className={classes.shareButton} onClick={share}>
                    <IosShareOutlined fontSize="small" />
                    Compartir enlace
                </button>

            </div>
        </div>

        <QrCodeOverlay open={qrOpen} onClose={() => setQrOpen(false)} url={roomUrl} />
    </>
    );
};

export default RoomInviteSheet;
