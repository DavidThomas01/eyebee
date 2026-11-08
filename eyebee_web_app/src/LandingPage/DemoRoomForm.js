import React, { useEffect, useRef, useState } from "react";

import { Switch } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import RoomLinkGenerator from "../RoomLinkGenerator";
import crypto from "crypto-js";

const useStyles = makeStyles(theme => ({
    card: {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "var(--radius-card)",
        padding: theme.spacing(3),
        [theme.breakpoints.up("sm")]: {
            padding: theme.spacing(4),
        },
    },
    switchRow: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: theme.spacing(2),
    },
    switchCopy: {
        minWidth: 0,
    },
    switchLabel: {
        display: "block",
        fontSize: "1rem",
        fontWeight: 600,
        lineHeight: 1.4,
        color: theme.palette.text.primary,
        cursor: "pointer",
    },
    hint: {
        maxWidth: "36ch",
        marginTop: "var(--space-2xs)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        color: theme.palette.text.secondary,
    },
    linkBlock: {
        marginTop: theme.spacing(3),
    },
    fieldLabel: {
        display: "block",
        marginBottom: "var(--space-xs)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        lineHeight: 1.4,
        color: theme.palette.text.primary,
    },
    linkRow: {
        display: "flex",
        gap: "var(--space-xs)",
        alignItems: "stretch",
    },
    input: {
        flex: 1,
        minWidth: 0,
        height: "var(--control-height)",
        padding: "0 var(--space-sm)",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--color-field-border)",
        backgroundColor: "var(--color-field)",
        color: "var(--color-ink)",
        fontSize: "var(--text-md)",
        lineHeight: 1.4,
        "&::placeholder": {
            color: "var(--color-muted)",
            opacity: 1,
        },
        "&:hover": {
            borderColor: "var(--color-muted)",
        },
    },
    linkInput: {
        fontFamily: "var(--font-outlier)",
    },
    inputError: {
        borderColor: "var(--color-error)",
    },
    primaryBtn: {
        width: "100%",
        height: "var(--control-height)",
        marginTop: theme.spacing(3),
        border: 0,
        borderRadius: "var(--radius-control)",
        backgroundColor: "var(--color-accent)",
        color: "var(--color-accent-ink)",
        fontSize: "var(--text-md)",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "background-color var(--dur-micro) var(--ease-out)",
        "&:hover": {
            backgroundColor: "color-mix(in oklab, var(--color-accent) 90%, white)",
        },
        "&:active": {
            backgroundColor: "color-mix(in oklab, var(--color-accent) 86%, black)",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    secondaryBtn: {
        flexShrink: 0,
        minWidth: "96px",
        height: "var(--control-height)",
        padding: "0 var(--space-sm)",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--color-field-border)",
        backgroundColor: "transparent",
        color: "var(--color-ink)",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "border-color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out)",
        "&:hover": {
            borderColor: "var(--color-accent)",
        },
        "&:active": {
            backgroundColor: "var(--color-paper-3)",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-sm)",
        margin: `${theme.spacing(3)} 0`,
        color: theme.palette.text.secondary,
        fontSize: "var(--text-sm)",
        lineHeight: 1.4,
        "&::before": {
            content: '""',
            flex: 1,
            height: "1px",
            backgroundColor: theme.palette.divider,
        },
        "&::after": {
            content: '""',
            flex: 1,
            height: "1px",
            backgroundColor: theme.palette.divider,
        },
    },
    joinRow: {
        display: "flex",
        gap: "var(--space-xs)",
        alignItems: "stretch",
    },
    error: {
        marginTop: "var(--space-xs)",
        color: theme.palette.error.main,
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
    },
    readyTitle: {
        fontSize: "1.25rem",
        fontWeight: 700,
        lineHeight: 1.3,
        color: theme.palette.text.primary,
    },
    readyMeta: {
        marginTop: "var(--space-2xs)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        color: theme.palette.text.secondary,
    },
    textBtn: {
        marginTop: "var(--space-xs)",
        padding: 0,
        border: 0,
        backgroundColor: "transparent",
        color: theme.palette.text.secondary,
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        textDecoration: "underline",
        textUnderlineOffset: "0.16em",
        cursor: "pointer",
        transition: "color var(--dur-micro) var(--ease-out)",
        "&:hover": {
            color: theme.palette.text.primary,
        },
    },
    afterHint: {
        marginTop: "var(--space-xs)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        color: theme.palette.text.secondary,
    },
    readyIn: {
        animation: "rise 0.25s var(--ease-out) both",
    },
    visuallyHidden: {
        position: "absolute",
        width: "1px",
        height: "1px",
        overflow: "hidden",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
    },
}));

const DemoRoomForm = props => {
    const classes = useStyles();
    const [largeRoom, setLargeRoom] = useState(false);
    const [roomURL, setRoomURL] = useState("");
    const [created, setCreated] = useState(false);
    const [copyState, setCopyState] = useState("idle");
    const [joinValue, setJoinValue] = useState("");
    const [joinError, setJoinError] = useState("");
    const linkRef = useRef(null);
    const copyTimer = useRef(null);

    useEffect(() => {
        const generator = new RoomLinkGenerator(window, crypto);
        const links = generator.generateLinks(null, { demo: true, largeRoom });
        setRoomURL(links.presenters);
        setCreated(false);
        setCopyState("idle");
        setJoinError("");
    }, [largeRoom]);

    useEffect(() => () => clearTimeout(copyTimer.current), []);

    const copyLink = async () => {
        const copied = await props.onCopyLink(roomURL);
        clearTimeout(copyTimer.current);
        setCopyState(copied ? "copied" : "failed");
        if (copied) {
            copyTimer.current = setTimeout(() => setCopyState("idle"), 2000);
        } else if (linkRef.current) {
            linkRef.current.focus();
            linkRef.current.select();
        }
    };

    const joinRoom = event => {
        event.preventDefault();
        const raw = joinValue.trim();
        if (!raw) {
            return;
        }

        let candidate = raw;
        if (!/^https?:\/\//i.test(candidate) && /^[^\s/]+\.[^\s/]+/.test(candidate)) {
            candidate = `https://${candidate}`;
        }

        let target;
        try {
            target = new URL(candidate, window.location.origin);
        } catch (error) {
            setJoinError("Paste the full link you were sent.");
            return;
        }

        if (!target.pathname.startsWith("/videocall/") || !target.searchParams.get("p")) {
            setJoinError("Paste the full link you were sent.");
            return;
        }

        setJoinError("");
        props.onOpenLink(target.href);
    };

    const startRoom = () => {
        setCopyState("idle");
        setJoinError("");
        setCreated(true);
    };

    const changeRoomType = () => {
        setCopyState("idle");
        setCreated(false);
    };

    const enterRoom = () => {
        const link = document.createElement("a");
        link.href = roomURL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const copyLabel = copyState === "copied" ? "Copied" : copyState === "failed" ? "Select and copy" : "Copy";

    const linkBlock = (
        <div className={classes.linkBlock}>
            <label className={classes.fieldLabel} htmlFor="room-link">Room link</label>
            <div className={classes.linkRow}>
                <input
                    id="room-link"
                    ref={linkRef}
                    className={`${classes.input} ${classes.linkInput}`}
                    type="text"
                    value={roomURL}
                    readOnly
                    spellCheck={false}
                    onFocus={event => event.target.select()}
                    aria-describedby="room-link-hint"
                />
                <button type="button" className={classes.secondaryBtn} onClick={copyLink} disabled={!roomURL}>
                    {copyLabel}
                </button>
            </div>
            <p id="room-link-hint" className={classes.hint}>Anyone with this link can join.</p>
            <span className={classes.visuallyHidden} role="status" aria-live="polite">
                {copyState === "copied" ? "Link copied" : copyState === "failed" ? "Could not copy. The link is selected." : ""}
            </span>
        </div>
    );

    return (
        <section className={classes.card}>
            {created ? (
                <div className={classes.readyIn}>
                    <p className={classes.readyTitle}>Your room is ready</p>
                    <p className={classes.readyMeta}>{largeRoom ? "Large room." : "Small room, up to 7 people."}</p>
                    {linkBlock}
                    <button type="button" className={classes.primaryBtn} onClick={enterRoom}>
                        Enter room
                    </button>
                    <button type="button" className={classes.textBtn} onClick={changeRoomType}>
                        Change room type
                    </button>
                </div>
            ) : (
                <>
                    <div className={classes.switchRow}>
                        <div className={classes.switchCopy}>
                            <label className={classes.switchLabel} htmlFor="large-room">
                                {largeRoom ? "Large room" : "Small room"}
                            </label>
                            <p id="room-size-hint" className={classes.hint}>
                                {largeRoom
                                    ? "For bigger sessions. Best when a few people have strong connections."
                                    : "Up to 7 people. Works on any device."}
                            </p>
                        </div>
                        <Switch
                            checked={largeRoom}
                            onChange={event => setLargeRoom(event.target.checked)}
                            color="primary"
                            slotProps={{ input: { id: "large-room", "aria-describedby": "room-size-hint" } }}
                        />
                    </div>

                    <button type="button" className={classes.primaryBtn} onClick={startRoom} disabled={!roomURL}>
                        Start a room
                    </button>
                    <p className={classes.afterHint}>You will get a link to share.</p>

                    <div className={classes.divider}>or join a room</div>

                    <form className={classes.joinRow} onSubmit={joinRoom} noValidate>
                        <label className={classes.visuallyHidden} htmlFor="join-link">Room link to join</label>
                        <input
                            id="join-link"
                            className={`${classes.input} ${joinError ? classes.inputError : ""}`}
                            type="text"
                            value={joinValue}
                            onChange={event => {
                                setJoinValue(event.target.value);
                                if (joinError) {
                                    setJoinError("");
                                }
                            }}
                            placeholder="Paste a room link"
                            spellCheck={false}
                            aria-invalid={joinError ? "true" : "false"}
                            aria-describedby={joinError ? "join-error" : undefined}
                        />
                        <button type="submit" className={classes.secondaryBtn} disabled={!joinValue.trim()}>
                            Join
                        </button>
                    </form>
                    {joinError ? (
                        <p id="join-error" className={classes.error} role="alert">{joinError}</p>
                    ) : null}
                </>
            )}
        </section>
    );
};

export default DemoRoomForm;
