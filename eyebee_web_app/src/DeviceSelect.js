import React, { useEffect, useRef, useState } from "react";

import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";

const useStyles = makeStyles(() => ({
    field: {
        marginBottom: "var(--space-md)",
    },
    label: {
        display: "block",
        marginBottom: "6px",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        lineHeight: 1.4,
        color: "var(--color-ink)",
    },
    wrap: {
        position: "relative",
    },
    button: {
        width: "100%",
        height: "var(--control-height)",
        padding: "0 var(--space-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-xs)",
        borderRadius: "var(--radius-control)",
        border: "1px solid var(--color-field-border)",
        backgroundColor: "var(--color-field)",
        color: "var(--color-ink)",
        fontSize: "var(--text-md)",
        lineHeight: 1.4,
        textAlign: "left",
        cursor: "pointer",
        transition: "border-color var(--dur-micro) var(--ease-out)",
        "&:hover": {
            borderColor: "var(--color-muted)",
        },
        "&:active": {
            backgroundColor: "var(--color-paper-3)",
        },
        "&:disabled": {
            color: "var(--color-muted)",
            borderColor: "var(--color-rule)",
            cursor: "not-allowed",
        },
        "&[aria-expanded='true']": {
            borderColor: "var(--color-accent)",
        },
    },
    value: {
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    menu: {
        position: "absolute",
        top: "calc(100% + 4px)",
        left: 0,
        right: 0,
        zIndex: 100,
        margin: 0,
        padding: "var(--space-2xs)",
        listStyle: "none",
        backgroundColor: "var(--color-paper-2)",
        border: "1px solid var(--color-rule)",
        borderRadius: "var(--radius-control)",
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.45)",
        maxHeight: "280px",
        overflowY: "auto",
    },
    option: {
        width: "100%",
        padding: "10px var(--space-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-xs)",
        borderRadius: "6px",
        color: "var(--color-ink)",
        fontSize: "var(--text-sm)",
        lineHeight: 1.4,
        textAlign: "left",
        cursor: "pointer",
        outlineOffset: "-2px",
        "&:hover": {
            backgroundColor: "var(--color-paper-3)",
        },
        "&:active": {
            backgroundColor: "var(--color-paper-3)",
        },
    },
    optionSelected: {
        color: "var(--color-accent)",
    },
    check: {
        flexShrink: 0,
        fontSize: "18px",
    },
}));

const DeviceSelect = ({ id, label, value, options, onSelect, disabled, emptyLabel }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const labelId = `${id}-label`;
    const selected = options.find(option => option.deviceId === value);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const closeOnOutside = event => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const closeOnEscape = event => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [open]);

    const choose = deviceId => {
        onSelect(deviceId);
        setOpen(false);
    };

    return (
        <div className={classes.field}>
            <label className={classes.label} id={labelId} htmlFor={id}>{label}</label>
            <div className={classes.wrap} ref={wrapRef}>
                <button
                    id={id}
                    type="button"
                    className={classes.button}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-label={`${label}: ${selected ? selected.label : emptyLabel}`}
                    onClick={() => setOpen(current => !current)}
                    disabled={disabled}
                >
                    <span className={classes.value}>{selected ? selected.label : emptyLabel}</span>
                    <ExpandMoreIcon style={{ flexShrink: 0 }} />
                </button>

                {open && !disabled ? (
                    <ul className={classes.menu} role="listbox" aria-labelledby={labelId}>
                        {options.map(option => {
                            const isSelected = option.deviceId === value;
                            return (
                                <li
                                    key={option.deviceId}
                                    role="option"
                                    aria-selected={isSelected}
                                    tabIndex={0}
                                    className={`${classes.option} ${isSelected ? classes.optionSelected : ""}`}
                                    onClick={() => choose(option.deviceId)}
                                    onKeyDown={event => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            choose(option.deviceId);
                                        }
                                    }}
                                >
                                    <span>{option.label || emptyLabel}</span>
                                    {isSelected ? <CheckIcon className={classes.check} /> : null}
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </div>
        </div>
    );
};

export default DeviceSelect;
