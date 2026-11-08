import React, { useEffect, useRef, useState } from "react";

import PersonOutlined from "@mui/icons-material/PersonOutlined";
import MicNoneOutlined from "@mui/icons-material/MicNoneOutlined";
import MicOffOutlined from "@mui/icons-material/MicOffOutlined";
import HeadphonesOutlined from "@mui/icons-material/HeadphonesOutlined";
import VideocamOutlined from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlined from "@mui/icons-material/VideocamOffOutlined";

import "./prejoin.css";

// TODO(Juan): the backend does not support room names yet.
const ROOM_NAME = "[PLACEHOLDER]";

const MobilePreJoin = ({
    camera,
    cameraOn,
    micOn,
    onToggleCamera,
    onToggleMic,
    participantCount,
    primaryLabel,
    primaryDisabled,
    primaryHint,
    onPrimary,
    onCancel,
    error,
}) => {
    const videoRef = useRef(null);
    const hintTimer = useRef(null);
    const [audioHint, setAudioHint] = useState("");

    const stream = camera ? camera.getStream() : null;
    const count = participantCount === null || participantCount === undefined ? "—" : participantCount;

    useEffect(() => {
        const el = videoRef.current;
        if (!el || !stream) {
            return;
        }
        if (el.srcObject !== stream) {
            el.srcObject = stream;
        }
        const played = el.play();
        if (played && played.catch) {
            played.catch(() => {});
        }
    }, [stream, cameraOn]);

    useEffect(() => () => window.clearTimeout(hintTimer.current), []);

    const showAudioHint = () => {
        // TODO: audio output selection needs a device picker and setSinkId support.
        setAudioHint("La selección de salida de audio llegará pronto.");
        window.clearTimeout(hintTimer.current);
        hintTimer.current = window.setTimeout(() => setAudioHint(""), 2600);
    };

    const hint = audioHint || primaryHint || "";

    return (
        <main className="prejoin-page">
            <div className="prejoin-top">
                <div className="prejoin-hex-border">
                    <div className="prejoin-hex-inner">
                        {cameraOn && stream ? (
                            <video
                                ref={videoRef}
                                className="prejoin-video"
                                autoPlay
                                playsInline
                                muted
                            />
                        ) : (
                            <div className="prejoin-hex-empty">
                                <VideocamOffOutlined />
                                <span>Cámara apagada</span>
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="prejoin-title">{ROOM_NAME}</h1>

                <div className="prejoin-meta">
                    <svg className="prejoin-hex-badge" viewBox="0 0 43 48" aria-hidden="true">
                        <path
                            d="M21.5 2 41 13.2v21.6L21.5 46 2 34.8V13.2Z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span className="prejoin-count" aria-label={count === "—" ? "Participantes desconocidos" : `${count} participantes`}>
                        <PersonOutlined className="prejoin-count-icon" />
                        {count}
                    </span>
                </div>

                <div className="prejoin-controls">
                    <button
                        type="button"
                        className="prejoin-control"
                        onClick={onToggleMic}
                        aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
                        aria-pressed={micOn}
                    >
                        {micOn ? <MicNoneOutlined /> : <MicOffOutlined />}
                    </button>
                    <button
                        type="button"
                        className="prejoin-control"
                        onClick={showAudioHint}
                        aria-label="Seleccionar salida de audio"
                    >
                        <HeadphonesOutlined />
                    </button>
                    <button
                        type="button"
                        className="prejoin-control"
                        onClick={onToggleCamera}
                        aria-label={cameraOn ? "Apagar cámara" : "Encender cámara"}
                        aria-pressed={cameraOn}
                    >
                        {cameraOn ? <VideocamOutlined /> : <VideocamOffOutlined />}
                    </button>
                </div>
            </div>

            <div className="prejoin-bottom">
                {error ? <p className="prejoin-error" role="alert">{error}</p> : null}
                {hint ? <p className="prejoin-hint" role="status" aria-live="polite">{hint}</p> : null}
                <button
                    type="button"
                    className="prejoin-primary"
                    onClick={onPrimary}
                    disabled={primaryDisabled}
                >
                    {primaryLabel}
                </button>
                <button type="button" className="prejoin-cancel" onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </main>
    );
};

export default MobilePreJoin;
