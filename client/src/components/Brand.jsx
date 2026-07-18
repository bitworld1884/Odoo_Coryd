// Brand.jsx — single source of truth for the CoRYD logo + wordmark.

export const LOGO_SRC = '/logo.png';

const sizeMap = {
  xs: { box: 'h-8 w-8',   pad: 'p-1',   text: 'text-sm'  },
  sm: { box: 'h-9 w-9',   pad: 'p-1',   text: 'text-lg'  },
  md: { box: 'h-11 w-11', pad: 'p-1.5', text: 'text-xl'  },
  lg: { box: 'h-14 w-14', pad: 'p-2',   text: 'text-2xl' },
  xl: { box: 'h-20 w-20', pad: 'p-2.5', text: 'text-3xl' },
};

/**
 * Logo — just the mark, in a frosted glass tile.
 *
 * @param size   xs | sm | md | lg | xl
 * @param plain  render the bare image with no glass tile
 */
export function Logo({ size = 'sm', className = '', plain = false, alt = 'CoRYD' }) {
  const s = sizeMap[size] ?? sizeMap.sm;

  if (plain) {
    return (
      <img
        src={LOGO_SRC}
        alt={alt}
        className={`${s.box} shrink-0 object-contain ${className}`}
        draggable="false"
      />
    );
  }

  return (
    <span
      className={[
        s.box, s.pad,
        'inline-flex shrink-0 items-center justify-center rounded-xl',
        'bg-white/70 ring-1 ring-white/70 backdrop-blur-md',
        'shadow-[0_4px_14px_-2px_rgba(59,7,100,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]',
        className,
      ].join(' ')}
    >
      <img src={LOGO_SRC} alt={alt} className="h-full w-full object-contain" draggable="false" />
    </span>
  );
}

/**
 * Wordmark — "CoRYD" text only.
 * @param tone  'dark' on light backgrounds, 'light' on purple/dark ones
 */
export function Wordmark({ size = 'sm', tone = 'dark', className = '' }) {
  const s = sizeMap[size] ?? sizeMap.sm;

  if (tone === 'light') {
    return (
      <span className={`${s.text} font-extrabold tracking-tight text-white ${className}`}>
        Co<span className="text-brand-light">RYD</span>
      </span>
    );
  }

  return (
    <span className={`${s.text} font-extrabold tracking-tight text-ink-900 ${className}`}>
      Co
      <span className="bg-gradient-to-r from-brand to-brand-dark bg-clip-text text-transparent">
        RYD
      </span>
    </span>
  );
}

/**
 * Brand — logo + wordmark lockup. The default way to show the brand.
 */
export default function Brand({
  size = 'sm',
  tone = 'dark',
  showText = true,
  plain = false,
  className = '',
  tagline,
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Logo size={size} plain={plain} />
      {showText && (
        <span className="flex flex-col leading-none">
          <Wordmark size={size} tone={tone} />
          {tagline && (
            <span
              className={`mt-1 text-[9px] font-bold uppercase tracking-[0.18em] ${
                tone === 'light' ? 'text-white/60' : 'text-ink-400'
              }`}
            >
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
