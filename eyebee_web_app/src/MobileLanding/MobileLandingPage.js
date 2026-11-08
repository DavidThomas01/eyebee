import React, { useEffect, useMemo, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";

import logoEyeBee from "../img/logo-eyebee-new-dark.svg";
import logoEyeBeeLight from "../img/logo-eyebee-new-light.png";
import CreateRoomSheet from "./CreateRoomSheet";
import RoomListMenu from "./RoomListMenu";

const STORAGE_KEY = "eyebee.rooms.v1";

const useStyles = makeStyles(() => ({
    page: {
        "--color-focus": "var(--color-brand-focus)",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        paddingTop: "env(safe-area-inset-top)",
        "@media (prefers-color-scheme: light)": {
            backgroundColor: "#f2f2f2",
        },
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
        padding: "14px 18px",
        backgroundColor: "#000",
        "@media (prefers-color-scheme: light)": {
            backgroundColor: "#f2f2f2",
        },
        "@media (max-width: 360px)": {
            padding: "12px 14px",
        },
    },
    logoWrap: {
        display: "block",
        flexShrink: 0,
    },
    logo: {
        width: "132px",
        height: "auto",
        display: "block",
        flexShrink: 0,
        "@media (max-width: 360px)": {
            width: "108px",
        },
    },
    newRoom: {
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "#bdbdbd",
        fontFamily: "var(--font-brand)",
        fontSize: "13px",
        fontWeight: 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
        "&:active": {
            color: "#ffffff",
        },
        "@media (prefers-color-scheme: light)": {
            color: "var(--color-brand-ink)",
            "&:active": {
                color: "#000000",
            },
        },
    },
    plus: {
        width: "38px",
        height: "38px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "10px",
        backgroundColor: "var(--color-brand-yellow)",
        color: "var(--color-brand-ink)",
        "& svg": {
            fontSize: "20px",
        },
        "&:active": {
            backgroundColor: "var(--color-brand-yellow-dark)",
        },
        "@media (max-width: 360px)": {
            width: "34px",
            height: "34px",
        },
    },
    sheet: {
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        borderTopLeftRadius: "24px",
        borderTopRightRadius: "24px",
        overflow: "hidden",
    },
    searchRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        margin: "0 24px",
        padding: "18px 0 16px",
        borderBottom: "1px solid var(--color-brand-line)",
    },
    searchIcon: {
        flexShrink: 0,
        color: "var(--color-brand-ink)",
        fontSize: "22px",
    },
    search: {
        flex: 1,
        minWidth: 0,
        padding: 0,
        border: 0,
        outline: "none",
        background: "transparent",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "17px",
        "&::placeholder": {
            color: "#757575",
            opacity: 1,
        },
    },
    content: {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        padding: "28px 24px 16px",
    },
    empty: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "8px 4px 24px",
    },
    emptyTitle: {
        margin: "0 0 18px",
        fontSize: "28px",
        lineHeight: 1.2,
        fontWeight: 800,
        color: "var(--color-brand-ink)",
    },
    privacy: {
        maxWidth: "30ch",
        margin: 0,
        fontSize: "16px",
        lineHeight: 1.6,
        color: "var(--color-brand-muted)",
    },
    privacyStrong: {
        fontWeight: 800,
        color: "#424242",
    },
    privacyLines: {
        margin: "22px 0 0",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        fontSize: "16px",
        lineHeight: 1.55,
        color: "var(--color-brand-muted)",
    },
    list: {
        display: "flex",
        flexDirection: "column",
    },
    room: {
        width: "100%",
        padding: "12px 0",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        textAlign: "left",
        borderBottom: "1px solid var(--color-brand-line)",
        backgroundColor: "transparent",
        cursor: "pointer",
        "&:last-child": {
            borderBottom: 0,
        },
        "&:active": {
            backgroundColor: "var(--color-brand-surface)",
        },
        "&:has(button:active)": {
            backgroundColor: "transparent",
        },
    },
    roomBody: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
    },
    hexCluster: {
        width: "38px",
        height: "17px",
        flexShrink: 0,
        display: "block",
        color: "#bdbdbd",
    },
    roomName: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "16px",
        lineHeight: 1.2,
        fontWeight: 800,
        color: "var(--color-brand-ink)",
    },
    roomMeta: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        minWidth: 0,
    },
    countPill: {
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        height: "22px",
        padding: "0 8px",
        flexShrink: 0,
        borderRadius: "999px",
        backgroundColor: "#ececec",
        color: "#424242",
        fontSize: "11px",
        fontWeight: 800,
    },
    countIcon: {
        fontSize: "14px",
    },
    moreBtn: {
        width: "30px",
        height: "30px",
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
        "&:active": {
            opacity: 1,
        },
    },
    dots: {
        width: "22px",
        height: "22px",
        display: "block",
        fill: "currentColor",
    },
    noResults: {
        padding: "32px 0",
        textAlign: "center",
        fontSize: "16px",
        color: "var(--color-brand-muted)",
    },
    clearBtn: {
        marginTop: "10px",
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "15px",
        fontWeight: 800,
        textDecoration: "underline",
        cursor: "pointer",
    },
    joinArea: {
        padding: "12px 16px",
        backgroundColor: "var(--color-brand-surface)",
        borderTopLeftRadius: "18px",
        borderTopRightRadius: "18px",
    },
    joinForm: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        height: "50px",
        padding: "0 12px",
        backgroundColor: "#ffffff",
        border: "1px solid var(--color-brand-field-border)",
        borderRadius: "8px",
    },
    joinInput: {
        flex: 1,
        minWidth: 0,
        padding: 0,
        border: 0,
        outline: "none",
        background: "transparent",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "16px",
        "&::placeholder": {
            color: "#757575",
            opacity: 1,
        },
    },
    joinBtn: {
        width: "34px",
        height: "34px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        padding: 0,
        border: 0,
        background: "transparent",
        color: "var(--color-brand-ink)",
        cursor: "pointer",
        "&:disabled": {
            color: "#bdbdbd",
            cursor: "not-allowed",
        },
    },
    joinError: {
        margin: "6px 4px 0",
        fontSize: "13px",
        lineHeight: 1.4,
        color: "#c62828",
    },
    createBar: {
        height: "calc(56px + env(safe-area-inset-bottom))",
        padding: "0 0 env(safe-area-inset-bottom)",
        border: 0,
        backgroundColor: "var(--color-brand-yellow)",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-brand)",
        fontSize: "15px",
        fontWeight: 800,
        cursor: "pointer",
        "&:active": {
            backgroundColor: "var(--color-brand-yellow-dark)",
        },
    },
}));

const loadRooms = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
};

const MobileLandingPage = ({ onOpenLink }) => {
    const classes = useStyles();
    const [rooms, setRooms] = useState(loadRooms);
    const [query, setQuery] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [joinValue, setJoinValue] = useState("");
    const [joinError, setJoinError] = useState("");
    const [menuRoom, setMenuRoom] = useState(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
        } catch (error) {
            // Private browsing can refuse storage; the room list is a convenience.
        }
    }, [rooms]);

    const filteredRooms = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) {
            return rooms;
        }
        return rooms.filter(room =>
            `${room.name || ""} ${room.link || ""}`.toLowerCase().includes(needle)
        );
    }, [rooms, query]);

    const saveRoom = room => {
        const next = [room, ...rooms.filter(item => item.id !== room.id)].slice(0, 20);
        setRooms(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            // Private browsing can refuse storage; the room list is a convenience.
        }
    };

    const enterCreatedRoom = room => {
        saveRoom(room);
        setSheetOpen(false);
        onOpenLink(room.link);
    };

    const deleteRoom = room => {
        setRooms(current => current.filter(item => item.id !== room.id));
        setMenuRoom(null);
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
            setJoinError("Pega el enlace completo de la sala.");
            return;
        }

        if (!target.pathname.startsWith("/videocall/") || !target.searchParams.get("p")) {
            setJoinError("Pega el enlace completo de la sala.");
            return;
        }

        setJoinError("");
        onOpenLink(target.href);
    };

    return (
        <main className={classes.page}>
            <header className={classes.header}>
                <picture className={classes.logoWrap}>
                    <source media="(prefers-color-scheme: light)" srcSet={logoEyeBeeLight} />
                    <img className={classes.logo} src={logoEyeBee} alt="Eyebee" />
                </picture>
                <button type="button" className={classes.newRoom} onClick={() => setSheetOpen(true)}>
                    Iniciar nueva sala
                    <span className={classes.plus}><AddIcon /></span>
                </button>
            </header>

            <section className={classes.sheet}>
                <div className={classes.searchRow}>
                    <SearchIcon className={classes.searchIcon} />
                    <input
                        className={classes.search}
                        type="search"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        placeholder="Buscar salas"
                        aria-label="Buscar salas"
                    />
                </div>

                <div className={classes.content}>
                    {rooms.length === 0 ? (
                        <div className={classes.empty}>
                            <h1 className={classes.emptyTitle}>No tienes ninguna sala.</h1>
                            <p className={classes.privacy}>
                                Una sala es un espacio de colaboración <strong className={classes.privacyStrong}>completamente privado.</strong>{" "}
                                EyeBee no deja rastro de tu información porque sólo está en tu dispositivo.
                            </p>
                            <div className={classes.privacyLines}>
                                <span>No almacenamos tu información.</span>
                                <span>No rastreamos tu IP.</span>
                                <span>No guardamos registros de actividad.</span>
                            </div>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className={classes.noResults}>
                            <p>No se encontraron salas.</p>
                            <button type="button" className={classes.clearBtn} onClick={() => setQuery("")}>
                                Limpiar búsqueda
                            </button>
                        </div>
                    ) : (
                        <div className={classes.list}>
                            {filteredRooms.map(room => (
                                <div
                                    key={room.id}
                                    className={classes.room}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onOpenLink(room.link)}
                                    onKeyDown={event => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            onOpenLink(room.link);
                                        }
                                    }}
                                >
                                    <span className={classes.roomBody}>
                                        <span className={classes.roomName}>{room.name || "Sala sin nombre"}</span>
                                        <span className={classes.roomMeta}>
                                            <svg className={classes.hexCluster} viewBox="0 0 40 18" aria-hidden="true">
                                                {[0, 9, 18, 27].map(offset => (
                                                    <path
                                                        key={offset}
                                                        transform={`translate(${offset} 1)`}
                                                        d="M7 0 13.5 4V12L7 16 .5 12V4Z"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.4"
                                                        strokeLinejoin="round"
                                                    />
                                                ))}
                                            </svg>
                                            <span className={classes.countPill} aria-label="1 participante">
                                                <PersonIcon className={classes.countIcon} />
                                                1
                                            </span>
                                        </span>
                                    </span>
                                    <button
                                        type="button"
                                        className={classes.moreBtn}
                                        aria-label={`Opciones de ${room.name || "la sala"}`}
                                        onClick={event => {
                                            event.stopPropagation();
                                            setMenuRoom(room);
                                        }}
                                    >
                                        <svg className={classes.dots} viewBox="0 0 24 24" aria-hidden="true">
                                            <circle cx="4.5" cy="12" r="1.9" />
                                            <circle cx="12" cy="12" r="1.9" />
                                            <circle cx="19.5" cy="12" r="1.9" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={classes.joinArea}>
                    <form className={classes.joinForm} onSubmit={joinRoom} noValidate>
                        <input
                            className={classes.joinInput}
                            type="text"
                            value={joinValue}
                            onChange={event => {
                                setJoinValue(event.target.value);
                                if (joinError) {
                                    setJoinError("");
                                }
                            }}
                            placeholder="Pega el enlace de tu sala"
                            aria-label="Enlace de la sala"
                            aria-invalid={joinError ? "true" : "false"}
                        />
                        <button
                            type="submit"
                            className={classes.joinBtn}
                            aria-label="Entrar a la sala"
                            disabled={!joinValue.trim()}
                        >
                            <ArrowForwardIcon />
                        </button>
                    </form>
                    {joinError ? <p className={classes.joinError} role="alert">{joinError}</p> : null}
                </div>
            </section>

            <button type="button" className={classes.createBar} onClick={() => setSheetOpen(true)}>
                Crea una nueva sala
            </button>

            <RoomListMenu
                room={menuRoom}
                onClose={() => setMenuRoom(null)}
                onDelete={deleteRoom}
            />

            <CreateRoomSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onEnter={enterCreatedRoom}
            />
        </main>
    );
};

export default MobileLandingPage;
