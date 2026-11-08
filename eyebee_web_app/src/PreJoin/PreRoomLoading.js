import React, { useEffect, useRef, useState } from "react";

import PersonOutlined from "@mui/icons-material/PersonOutlined";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";

import ConnectionHexes from "./ConnectionHexes";
import "./prejoin.css";

// TODO(Juan): the backend does not support room names yet.
const ROOM_NAME = "[PLACEHOLDER]";

const HEX_PATTERN_ID = "preload-hex-pattern";

const PreRoomLoading = ({ participantCount }) => {
    const [status, setStatus] = useState("");
    const statusTimer = useRef(null);
    const count = participantCount === null || participantCount === undefined ? "—" : participantCount;

    useEffect(() => () => window.clearTimeout(statusTimer.current), []);

    const showStatus = message => {
        setStatus(message);
        window.clearTimeout(statusTimer.current);
        statusTimer.current = window.setTimeout(() => setStatus(""), 2400);
    };

    const shareRoom = async () => {
        let shareUrl = window.location.href;
        try {
            const url = new URL(shareUrl);
            url.searchParams.delete("create");
            shareUrl = url.toString();
        } catch (error) {
            shareUrl = window.location.href;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Eyebee",
                    text: "Únete a mi sala en Eyebee",
                    url: shareUrl,
                });
                showStatus("Enlace compartido.");
                return;
            } catch (error) {
                if (error && error.name === "AbortError") {
                    return;
                }
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            showStatus("Enlace copiado.");
        } catch (error) {
            showStatus("No se pudo copiar el enlace.");
        }
    };

    return (
        <main className="preload-page">
            <header className="preload-header">
                <div className="preload-left">
                    <p className="preload-title">{ROOM_NAME}</p>
                    <ConnectionHexes className="preload-mark" level={2} title="Conectando a la sala" />
                </div>
                <div className="preload-right">
                    <span className="preload-count" aria-label={count === "—" ? "Participantes desconocidos" : `${count} participantes`}>
                        <PersonOutlined />
                        {count}
                    </span>
                    <button
                        type="button"
                        className="preload-invite"
                        onClick={shareRoom}
                        aria-label="Invitar a alguien"
                    >
                        <PersonAddOutlined />
                    </button>
                </div>
            </header>

            <div className="preload-body">
                <svg className="preload-grid" aria-hidden="true">
                    <defs>
                        <pattern id={HEX_PATTERN_ID} width="76.21" height="132" patternUnits="userSpaceOnUse">
                            <path
                                d="M38.1 1.6 74.6 22.7v42.2L38.1 86 1.6 64.9V22.7Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M0 67.6 36.5 88.7v42.2L0 152-36.5 130.9V88.7Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M76.2 67.6 112.7 88.7v42.2L76.2 152 39.7 130.9V88.7Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M0-64.4 36.5-43.3v42.2L0 20-36.5-1.1V-43.3Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M76.2-64.4 112.7-43.3v42.2L76.2 20 39.7-1.1V-43.3Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${HEX_PATTERN_ID})`} />
                </svg>
                <p className="preload-sr" role="status" aria-live="polite">Conectando a la sala…</p>
                {status ? <p className="preload-toast" role="status" aria-live="polite">{status}</p> : null}
            </div>
        </main>
    );
};

export default PreRoomLoading;
