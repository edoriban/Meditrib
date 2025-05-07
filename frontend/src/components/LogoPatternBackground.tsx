export const LogoPatternBackground: React.FC = () => (
    <svg
        width="100%"
        height="100%"
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            opacity: 0.05,
            pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <pattern
                id="logoPattern"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
            >
                {/* Hexagon outline */}
                <polygon
                    points="30,6 54,18 54,42 30,54 6,42 6,18"
                    stroke="#fff"
                    strokeWidth="4"
                    fill="none"
                />
                {/* Angular inner M shape */}
                <polyline
                    points="16,42 16,24 24,24 30,30 36,24 44,24 44,42"
                    stroke="#fff"
                    strokeWidth="5"
                    fill="none"
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                />
                <line
                    x1="30"
                    y1="28"
                    x2="30"
                    y2="44"
                    stroke="#fff"
                    strokeWidth="5"
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                />
            </pattern>
        </defs>
        <rect width="100%" height="100%" rotate="15" fill="url(#logoPattern)" />
    </svg>
);