export const LogoPatternBackground: React.FC = () => (
    <svg
        width="100%"
        height="100%"
        style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            opacity: 0.06,
            pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="vanposGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <pattern
                id="logoPattern"
                width="80"
                height="80"
                patternUnits="userSpaceOnUse"
            >
                {/* Outer rounded square */}
                <rect
                    x="8"
                    y="8"
                    width="64"
                    height="64"
                    rx="12"
                    stroke="#fff"
                    strokeWidth="2"
                    fill="none"
                />
                {/* Stylized V shape */}
                <polyline
                    points="20,24 40,56 60,24"
                    stroke="#fff"
                    strokeWidth="6"
                    fill="none"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                {/* Small barcode lines at bottom */}
                <line x1="28" y1="64" x2="28" y2="56" stroke="#fff" strokeWidth="2" />
                <line x1="36" y1="64" x2="36" y2="58" stroke="#fff" strokeWidth="2" />
                <line x1="44" y1="64" x2="44" y2="56" stroke="#fff" strokeWidth="2" />
                <line x1="52" y1="64" x2="52" y2="58" stroke="#fff" strokeWidth="2" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#logoPattern)" />
    </svg>
);