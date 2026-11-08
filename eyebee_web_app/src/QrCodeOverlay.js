import React, { useEffect, useRef, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import QRCode from "qrcode";

const useStyles = makeStyles(() => ({
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    card: {
        position: "relative",
        width: "min(340px, 92vw)",
        padding: "24px 20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
    },
    close: {
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "40px",
        height: "40px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        cursor: "pointer",
    },
    title: {
        margin: "0 0 16px",
        fontSize: "16px",
        lineHeight: 1.2,
        fontWeight: 800,
        color: "var(--color-brand-ink)",
    },
    qr: {
        width: "240px",
        height: "240px",
        display: "block",
        borderRadius: "8px",
    },
    placeholder: {
        width: "240px",
        height: "240px",
        backgroundColor: "var(--color-brand-surface)",
        borderRadius: "8px",
    },
    hint: {
        margin: "16px 0 0",
        fontSize: "14px",
        lineHeight: 1.4,
        color: "var(--color-brand-muted)",
        textAlign: "center",
    },
}));

const QrCodeOverlay = ({ open, onClose, url, title = "Código QR" }) => {
    const classes = useStyles();
    const [qr, setQr] = useState("");
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        let cancelled = false;
        setQr("");
        QRCode.toDataURL(url, {
            margin: 1,
            width: 480,
            color: { dark: "#000000", light: "#ffffff" },
        })
            .then(dataUrl => {
                if (!cancelled) {
                    setQr(dataUrl);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setQr("");
                }
            });

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const closeOnEscape = event => {
            if (event.key === "Escape") {
                onCloseRef.current();
            }
        };
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            cancelled = true;
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, url]);

    if (!open) {
        return null;
    }

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
            <div className={`${classes.card} backdrop-in`} role="dialog" aria-modal="true" aria-label={title}>
                <button type="button" className={classes.close} onClick={onClose} aria-label="Cerrar">
                    <CloseIcon />
                </button>
                <h2 className={classes.title}>{title}</h2>
                {qr ? (
                    <img className={classes.qr} src={qr} alt="Código QR de la sala" />
                ) : (
                    <div className={classes.placeholder} />
                )}
                <p className={classes.hint}>Escanea para unirte</p>
            </div>
        </div>
    );
};

export default QrCodeOverlay;
