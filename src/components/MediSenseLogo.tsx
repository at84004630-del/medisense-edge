
interface MediSenseLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  showBadge?: boolean
  className?: string
}

export default function MediSenseLogo({
  size = 'md',
  showSubtitle = true,
  showBadge = true,
  className = ''
}: MediSenseLogoProps) {
  // Dimensions based on size
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36
  const titleSize = size === 'sm' ? '0.88rem' : size === 'lg' ? '1.25rem' : '1.02rem'
  const subSize = size === 'sm' ? '0.58rem' : size === 'lg' ? '0.72rem' : '0.64rem'

  return (
    <div
      className={`medisense-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.55rem' : '0.75rem',
        userSelect: 'none',
      }}
    >
      {/* ── Custom Futuristic SVG Emblem: Hexagon + Medical Cross + Neural Synapse ── */}
      <div
        className="logo-emblem-wrap"
        style={{
          position: 'relative',
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Ambient neon backglow */}
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '35%',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.45) 0%, rgba(124, 111, 240, 0.25) 50%, transparent 75%)',
            filter: 'blur(6px)',
            opacity: 0.85,
            pointerEvents: 'none',
          }}
        />

        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 4px 10px rgba(0, 212, 255, 0.4))',
            transition: 'transform var(--t-spring)',
          }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="msHexGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#7c6ff0" />
              <stop offset="100%" stopColor="#00e5a0" />
            </linearGradient>

            <linearGradient id="msCrossGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c8f5ff" />
            </linearGradient>

            <linearGradient id="msPulseGrad" x1="20" y1="50" x2="80" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#00e5a0" />
              <stop offset="100%" stopColor="#7c6ff0" />
            </linearGradient>

            <filter id="msGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Snapdragon Hexagon NPU Ring */}
          <polygon
            points="50,6 88,28 88,72 50,94 12,72 12,28"
            fill="rgba(4, 16, 34, 0.9)"
            stroke="url(#msHexGrad)"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Inner Accent Hexagon Grid Lines */}
          <polygon
            points="50,16 80,33 80,67 50,84 20,67 20,33"
            fill="none"
            stroke="rgba(0, 212, 255, 0.22)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Modern Medical Cross with rounded caps */}
          {/* Vertical Bar */}
          <rect
            x="44"
            y="26"
            width="12"
            height="48"
            rx="5"
            fill="url(#msCrossGrad)"
            filter="drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))"
          />
          {/* Horizontal Bar */}
          <rect
            x="26"
            y="44"
            width="48"
            height="12"
            rx="5"
            fill="url(#msCrossGrad)"
            filter="drop-shadow(0 0 6px rgba(0, 212, 255, 0.6))"
          />

          {/* Integrated ECG / Neural Waveform overlay */}
          <path
            d="M 28,50 L 38,50 L 44,40 L 50,62 L 56,36 L 62,54 L 68,50 L 72,50"
            fill="none"
            stroke="url(#msPulseGrad)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#msGlowFilter)"
          />

          {/* Hexagon Corner Neural Nodes (Silicon Pins) */}
          <circle cx="50" cy="6" r="3" fill="#00d4ff" />
          <circle cx="88" cy="28" r="3" fill="#7c6ff0" />
          <circle cx="88" cy="72" r="3" fill="#00e5a0" />
          <circle cx="50" cy="94" r="3" fill="#00d4ff" />
          <circle cx="12" cy="72" r="3" fill="#7c6ff0" />
          <circle cx="12" cy="28" r="3" fill="#00e5a0" />

          {/* Center Glowing Synapse Core */}
          <circle cx="50" cy="50" r="3" fill="#ffffff" filter="url(#msGlowFilter)" />
        </svg>
      </div>

      {/* ── Brand Wordmark ── */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-display, "Outfit", sans-serif)',
              fontSize: titleSize,
              fontWeight: 800,
              color: 'var(--txt-1, #f3f8fd)',
              letterSpacing: '-0.025em',
            }}
          >
            Medi<span
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #7c6ff0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
              }}
            >
              Sense
            </span>
          </span>

          {showBadge && (
            <span
              className="logo-edge-pill"
              style={{
                fontSize: size === 'sm' ? '0.52rem' : '0.6rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '0.15rem 0.45rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.18) 0%, rgba(124, 111, 240, 0.22) 100%)',
                border: '1px solid rgba(0, 212, 255, 0.4)',
                color: 'var(--cyan, #00d4ff)',
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.2)',
                fontFamily: 'var(--mono, monospace)',
              }}
            >
              EDGE
            </span>
          )}
        </div>

        {showSubtitle && (
          <span
            style={{
              fontSize: subSize,
              color: 'var(--txt-3, #52718e)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontFamily: 'var(--mono, monospace)',
              marginTop: '0.1rem',
            }}
          >
            Snapdragon NPU · Hexagon 45 TOPS
          </span>
        )}
      </div>
    </div>
  )
}
