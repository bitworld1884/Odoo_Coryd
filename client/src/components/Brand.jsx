// Brand.jsx — single source of truth for the CoRYD logo + wordmark.

export const LOGO_SRC = '/logo.png';

const sizeMap = {
  xs: { box: 'h-16 w-16',            text: 'text-sm'  },
  sm: { box: 'h-[4.5rem] w-[4.5rem]', text: 'text-lg'  },
  md: { box: 'h-[5.5rem] w-[5.5rem]', text: 'text-xl'  },
  lg: { box: 'h-28 w-28',            text: 'text-2xl' },
  xl: { box: 'h-40 w-40',            text: 'text-3xl' },
};

/**
 * Logo — the bare mark, no background tile.
 *
 * @param size  xs | sm | md | lg | xl
 */
export function Logo({ size = 'sm', className = '', alt = 'CoRYD' }) {
  const s = sizeMap[size] ?? sizeMap.sm;

  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={`${s.box} shrink-0 object-contain ${className}`}
      draggable="false"
    />
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
