export default function LandingSplash() {
  return (
    <div className="cpL-splash">
      <style>{cssL}</style>
      <div className="cpL-brand">🚗 CoRYD</div>

      <div className="cpL-scene">
        <div className="cpL-cloud cpL-c1" />
        <div className="cpL-cloud cpL-c2" />
        <div className="cpL-cloud cpL-c3" />
        <div className="cpL-road"><div className="cpL-lanes" /></div>

        <div className="cpL-car">
          <div className="cpL-carInner">
            <Car />
          </div>
        </div>
      </div>

      <h1 className="cpL-title">
        <span className="cpL-line cpL-l1">Ride Together</span>
        <span className="cpL-line cpL-l2">Save Together</span>
      </h1>
    </div>
  );
}

function Car() {
  return (
    <svg viewBox="0 0 260 180" width="230" height="160" aria-hidden="true">
      <ellipse cx="52" cy="132" rx="26" ry="10" fill="#fde68a" opacity="0.5" />
      <ellipse cx="208" cy="132" rx="26" ry="10" fill="#fde68a" opacity="0.5" />
      <path d="M62 104 L86 52 Q90 46 98 46 L162 46 Q170 46 174 52 L198 104 Z" fill="#0f766e" />
      <path d="M78 100 L96 62 Q98 58 104 58 L156 58 Q162 58 164 62 L182 100 Z" fill="#cdeee8" />
      <g fill="#0f172a">
        <circle cx="103" cy="80" r="11" /><path d="M90 100 a13 13 0 0 1 26 0 Z" />
        <circle cx="130" cy="76" r="11" /><path d="M117 98 a13 13 0 0 1 26 0 Z" />
        <circle cx="157" cy="80" r="11" /><path d="M144 100 a13 13 0 0 1 26 0 Z" />
      </g>
      <rect x="26" y="100" width="208" height="60" rx="26" fill="#0d9488" />
      <rect x="34" y="146" width="192" height="14" rx="7" fill="#0b5f58" />
      <rect x="40" y="118" width="30" height="16" rx="8" fill="#fef3c7" />
      <rect x="190" y="118" width="30" height="16" rx="8" fill="#fef3c7" />
      <rect x="118" y="120" width="24" height="10" rx="5" fill="#0b5f58" />
      <rect x="44" y="152" width="40" height="20" rx="10" fill="#1f2937" />
      <rect x="176" y="152" width="40" height="20" rx="10" fill="#1f2937" />
    </svg>
  );
}

const cssL = `
.cpL-splash{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:linear-gradient(180deg,#e6fffb,#f0fdfa 45%,#fff);overflow:hidden;z-index:50;
  font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;}
.cpL-brand{position:absolute;top:28px;font-size:22px;font-weight:800;color:#0f766e;opacity:0;animation:cpL-fade .6s ease .2s forwards;}
.cpL-scene{position:relative;width:min(560px,92vw);height:300px;}
.cpL-road{position:absolute;left:50%;bottom:0;width:170%;height:150px;
  transform:translateX(-50%) perspective(340px) rotateX(60deg);transform-origin:bottom center;
  background:#475569;overflow:hidden;border-radius:6px;}
.cpL-lanes{position:absolute;left:calc(50% - 6px);top:-50%;width:12px;height:200%;
  background:repeating-linear-gradient(to bottom,#f8fafc 0 30px,transparent 30px 70px);animation:cpL-move .5s linear infinite;}
@keyframes cpL-move{to{transform:translateY(70px);}}
.cpL-car{position:absolute;left:50%;bottom:70px;transform:translateX(-140%);animation:cpL-drive 1.5s cubic-bezier(.2,.8,.2,1) forwards;
  filter:drop-shadow(0 14px 10px rgba(2,6,23,.18));}
@keyframes cpL-drive{0%{transform:translateX(-160%);}70%{transform:translateX(-42%);}100%{transform:translateX(-50%);}}
.cpL-carInner{animation:cpL-bob 1.2s ease-in-out 1.5s infinite;}
@keyframes cpL-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}
.cpL-cloud{position:absolute;background:#fff;border-radius:999px;opacity:.9;box-shadow:26px 8px 0 -4px #fff,-26px 8px 0 -6px #fff;}
.cpL-c1{width:70px;height:26px;top:24px;animation:cpL-drift 13s linear infinite;}
.cpL-c2{width:52px;height:20px;top:70px;animation:cpL-drift 18s linear infinite -6s;}
.cpL-c3{width:60px;height:22px;top:14px;animation:cpL-drift 22s linear infinite -12s;}
@keyframes cpL-drift{from{right:-90px;}to{right:110%;}}
.cpL-title{margin:18px 0 0;text-align:center;font-size:30px;font-weight:800;color:#134e4a;line-height:1.2;display:flex;flex-direction:column;}
.cpL-line{opacity:0;transform:translateY(18px);animation:cpL-rise .6s ease forwards;}
.cpL-l1{animation-delay:1.5s;} .cpL-l2{animation-delay:1.8s;}
@keyframes cpL-rise{to{opacity:1;transform:translateY(0);}}
@keyframes cpL-fade{to{opacity:1;}}
@media (prefers-reduced-motion:reduce){.cpL-car,.cpL-carInner,.cpL-lanes,.cpL-cloud,.cpL-line,.cpL-brand{animation:none;opacity:1;transform:none;}}
`;
