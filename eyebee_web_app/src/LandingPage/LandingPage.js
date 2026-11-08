import React from "react";

import { CssBaseline, useMediaQuery } from "@mui/material";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import { useNavigate } from "react-router-dom";

import logoEyeBee from "./../img/logo_eyebee.png";
import mainTheme from "./../MainTheme";
import DemoRoomForm from "./DemoRoomForm";
import MobileLandingPage from "../MobileLanding/MobileLandingPage";

const useStyles = makeStyles(theme => ({
    page: {
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "24px 20px 40px",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        [theme.breakpoints.up("md")]: {
            padding: "40px 40px 48px",
        },
    },
    header: {
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto 32px",
        display: "flex",
        justifyContent: "flex-end",
    },
    logo: {
        width: "96px",
        height: "auto",
        [theme.breakpoints.down("sm")]: {
            width: "72px",
        },
    },
    shell: {
        width: "100%",
        maxWidth: "1120px",
        margin: "0 auto",
        flex: 1,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        alignContent: "center",
        gap: theme.spacing(4),
        [theme.breakpoints.up("md")]: {
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 480px)",
            gap: theme.spacing(8),
        },
    },
    intro: {
        minWidth: 0,
        alignSelf: "start",
    },
    title: {
        maxWidth: "14ch",
        fontSize: "var(--text-display)",
        color: theme.palette.text.primary,
    },
    manifesto: {
        maxWidth: "34ch",
        marginTop: theme.spacing(3),
        fontSize: "var(--text-lead)",
        lineHeight: 1.6,
        color: theme.palette.primary.main,
        fontStyle: "italic",
    },
    steps: {
        listStyle: "none",
        padding: 0,
        margin: `${theme.spacing(3)} 0 0`,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
    },
    step: {
        display: "flex",
        alignItems: "baseline",
        gap: "var(--space-sm)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
        color: theme.palette.text.secondary,
    },
    stepNumber: {
        minWidth: "16px",
        color: theme.palette.primary.main,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
    },
    formColumn: {
        minWidth: 0,
        width: "100%",
        alignSelf: "start",
    },
    footer: {
        width: "100%",
        maxWidth: "1120px",
        margin: `${theme.spacing(5)} auto 0`,
        paddingTop: theme.spacing(3),
        borderTop: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.secondary,
        fontSize: "var(--text-sm)",
        lineHeight: 1.5,
    },
}));

const LandingPage = () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const isMobile = useMediaQuery(mainTheme.breakpoints.down("md"), { noSsr: true });

    const openRoomURL = url => {
        try {
            const target = new URL(url, window.location.origin);
            if (target.origin === window.location.origin) {
                navigate(`${target.pathname}${target.search}${target.hash}`);
            } else {
                window.location.assign(target.href);
            }
        } catch (error) {
            window.location.assign(url);
        }
    };

    const copyLinkToClipboard = async url => {
        try {
            await navigator.clipboard.writeText(url);
            return true;
        } catch (error) {
            return false;
        }
    };

    if (isMobile) {
        return (
            <StyledEngineProvider injectFirst>
                <ThemeProvider theme={mainTheme}>
                    <CssBaseline />
                    <MobileLandingPage onOpenLink={openRoomURL} />
                </ThemeProvider>
            </StyledEngineProvider>
        );
    }

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={mainTheme}>
                <CssBaseline />
                <main className={classes.page}>
                    <header className={classes.header}>
                        <img className={classes.logo} src={logoEyeBee} alt="Eyebee" />
                    </header>

                    <div className={classes.shell}>
                        <section className={`${classes.intro} reveal`}>
                            <h1 className={classes.title}>Start a room</h1>
                            <p className={classes.manifesto}>
                                Our principles act as tools for thinking, communication, and decentralized decision making
                            </p>
                            <ol className={classes.steps}>
                                <li className={classes.step}><span className={classes.stepNumber}>1</span>Choose a room size.</li>
                                <li className={classes.step}><span className={classes.stepNumber}>2</span>Start the room and copy the link.</li>
                                <li className={classes.step}><span className={classes.stepNumber}>3</span>Meet in your browser.</li>
                            </ol>
                        </section>

                        <section className={`${classes.formColumn} reveal reveal-2`} aria-label="Room setup">
                            <DemoRoomForm onOpenLink={openRoomURL} onCopyLink={copyLinkToClipboard} />
                        </section>
                    </div>

                    <p className={classes.footer}>You will check your camera and microphone before joining.</p>
                </main>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default LandingPage;
