import React from "react";

const HEX_PATH = "M7 0 13.5 4V12L7 16 .5 12V4Z";
const OFFSETS = [0, 9, 18, 27];

const levelColor = level => {
    if (level >= 4) {
        return "#2ecc71";
    }
    if (level >= 2) {
        return "#f2c600";
    }
    if (level >= 1) {
        return "#e5484d";
    }
    return "#6f6f6f";
};

const ConnectionHexes = ({ level = 4, className, title }) => {
    const normalized = Math.max(0, Math.min(4, Number(level) || 0));
    const color = levelColor(normalized);

    return (
        <svg
            className={className}
            viewBox="0 0 40 18"
            role="img"
            aria-label={title || `Nivel de conexión ${normalized} de 4`}
        >
            {OFFSETS.map((offset, index) => {
                const lit = index < normalized;
                return (
                    <path
                        key={offset}
                        transform={`translate(${offset} 1)`}
                        d={HEX_PATH}
                        fill="none"
                        stroke={lit ? color : "#4a4a4a"}
                        strokeWidth="1.6"
                        strokeLinejoin="round"
                        opacity={lit ? 1 : 0.45}
                    />
                );
            })}
        </svg>
    );
};

export default ConnectionHexes;
