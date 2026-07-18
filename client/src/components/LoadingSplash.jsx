export default function LoadingSplash({ message = 'Loading…' }) {
  return (
    <div className="cpG-splash">
      <style>{cssG}</style>

      <div className="cpG-stage">
        <div className="cpG-road"><div className="cpG-lanes" /></div>
        <div className="cpG-car">
          <svg viewBox="0 0 260 180" width="150" height="104" aria-hidden="true">
            <path d="M62 104 L86 52 Q90 46 98 46 L162 46 Q170 46 174 52 L198 104 Z" fill="#0f766e" />
            <path d="M78 100 L96 62 Q98 58 104 58 L156 58 Q162 58 164 62 L182 100 Z" fill="#cdeee8" />
            <g fill="#0f172a">
              <circle cx="103" cy="80" r="11" /><circle cx="130" cy="76" r="11" /><circle cx="157" cy="80" r="11" />
            </g>
            <rect x="26" y="100" width="208" height="60" rx="26" fill="#0d9488" />
            <rect x="40" y="118" width="30" height="16" rx="8" fill="#fef3c7" />
            <rect x="190" y="118" width="30" height="16" rx="8" fill="#fef3c7" />
            <rect x="44" y="152" width="40" height="20" rx="10" fill="#1f2937" />
            <rect x="176" y="152" width="40" height="20" rx="10" fill="#1f2937" />
          </svg>
        </div>
      </div>

      <h1 className="cpG-title">Ride Together · Save Together</h1>
      <div className="cpG-dots"><span/><span/><span/></div>
      {message && <p className="cpG-msg">{message}</p>}
    </div>
  );
}

const cssG = `
.cpG-splash{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#f0fdfa,#fff);z-index:50;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;}
.cpG-stage{position:relative;width:220px;height:150px;overflow:hidden;}
.cpG-road{position:absolute;left:50%;bottom:0;width:180%;height:90px;
  transform:translateX(-50%) perspective(240px) rotateX(62deg);transform-origin:bottom center;background:#475569;overflow:hidden;border-radius:6px;}
.cpG-lanes{position:absolute;left:calc(50% - 5px);top:-50%;width:10px;height:200%;
  background:repeating-linear-gradient(to bottom,#f8fafc 0 22px,transparent 22px 46px);animation:cpG-move .28s linear infinite;}
@keyframes cpG-move{to{transform:translateY(46px);}}
.cpG-car{position:absolute;left:50%;bottom:44px;transform:translateX(-50%);animation:cpG-shake .28s linear infinite;
  filter:drop-shadow(0 10px 8px rgba(2,6,23,.18));}
@keyframes cpG-shake{0%{transform:translateX(-50%) translateY(0) rotate(-.6deg);}50%{transform:translateX(-50%) translateY(-2px) rotate(.6deg);}100%{transform:translateX(-50%) translateY(0) rotate(-.6deg);}}
.cpG-title{margin:16px 0 0;font-size:18px;font-weight:800;letter-spacing:-.01em;
  background:linear-gradient(90deg,#134e4a 0 40%,#5eead4 50%,#134e4a 60% 100%);background-size:200% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:cpG-shimmer 1.6s linear infinite;}
@keyframes cpG-shimmer{to{background-position:-200% 0;}}
.cpG-dots{display:flex;gap:6px;margin-top:12px;}
.cpG-dots span{width:8px;height:8px;border-radius:50%;background:#0d9488;animation:cpG-blink 1s ease-in-out infinite;}
.cpG-dots span:nth-child(2){animation-delay:.15s;} .cpG-dots span:nth-child(3){animation-delay:.3s;}
@keyframes cpG-blink{0%,100%{opacity:.25;transform:translateY(0);}50%{opacity:1;transform:translateY(-4px);}}
.cpG-msg{margin:12px 0 0;color:#64748b;font-size:13px;}
@media (prefers-reduced-motion:reduce){.cpG-lanes,.cpG-car,.cpG-title,.cpG-dots span{animation:none;}}
`;
