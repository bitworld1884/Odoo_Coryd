import { LOGO_SRC } from './Brand.jsx';

export default function LoadingSplash({ message = 'Loading…' }) {
  return (
    <div className="cpG-splash">
      <style>{cssG}</style>

      <div className="cpG-orb cpG-o1" />
      <div className="cpG-orb cpG-o2" />

      <div className="cpG-stage">
        <div className="cpG-road"><div className="cpG-lanes" /></div>
        <div className="cpG-car">
          <img src={LOGO_SRC} alt="CoRYD" className="cpG-logo" />
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
  background:
    radial-gradient(at 20% 12%, rgba(167,139,250,.40) 0px, transparent 55%),
    radial-gradient(at 82% 88%, rgba(139,92,246,.30)  0px, transparent 52%),
    #eeecf5;
  overflow:hidden;z-index:50;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;}

.cpG-orb{position:absolute;border-radius:50%;filter:blur(46px);pointer-events:none;}
.cpG-o1{width:260px;height:260px;background:rgba(124,58,237,.26);top:-60px;left:-50px;animation:cpG-float 14s ease-in-out infinite;}
.cpG-o2{width:220px;height:220px;background:rgba(148,163,184,.32);bottom:-50px;right:-40px;animation:cpG-float 18s ease-in-out infinite reverse;}
@keyframes cpG-float{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(22px,-26px,0) scale(1.1);}}

.cpG-stage{position:relative;width:240px;height:160px;overflow:hidden;}
.cpG-road{position:absolute;left:50%;bottom:0;width:180%;height:90px;
  transform:translateX(-50%) perspective(240px) rotateX(62deg);transform-origin:bottom center;
  background:linear-gradient(180deg,#55556c,#414155);overflow:hidden;border-radius:8px;
  box-shadow:0 -6px 24px rgba(59,7,100,.16);}
.cpG-lanes{position:absolute;left:calc(50% - 5px);top:-50%;width:10px;height:200%;
  background:repeating-linear-gradient(to bottom,#ede9fe 0 22px,transparent 22px 46px);animation:cpG-move .28s linear infinite;}
@keyframes cpG-move{to{transform:translateY(46px);}}

.cpG-car{position:absolute;left:50%;bottom:46px;transform:translateX(-50%);
  animation:cpG-shake .3s linear infinite;
  padding:10px 14px;border-radius:20px;
  background:rgba(255,255,255,.45);backdrop-filter:blur(17px);-webkit-backdrop-filter:blur(17px);
  border:1px solid rgba(255,255,255,.6);
  box-shadow:0 8px 32px rgba(59,7,100,.15),inset 0 1px 0 rgba(255,255,255,.85);}
@keyframes cpG-shake{
  0%{transform:translateX(-50%) translateY(0)    rotate(-.7deg);}
  50%{transform:translateX(-50%) translateY(-3px) rotate(.7deg);}
  100%{transform:translateX(-50%) translateY(0)   rotate(-.7deg);}}
.cpG-logo{width:132px;height:auto;display:block;}

.cpG-title{margin:20px 0 0;font-size:18px;font-weight:800;letter-spacing:-.015em;
  background:linear-gradient(90deg,#5b21b6 0 40%,#c4b5fd 50%,#5b21b6 60% 100%);background-size:200% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;animation:cpG-shimmer 1.8s linear infinite;}
@keyframes cpG-shimmer{to{background-position:-200% 0;}}

.cpG-dots{display:flex;gap:6px;margin-top:14px;}
.cpG-dots span{width:8px;height:8px;border-radius:50%;background:#7c3aed;animation:cpG-blink 1s ease-in-out infinite;}
.cpG-dots span:nth-child(2){animation-delay:.15s;} .cpG-dots span:nth-child(3){animation-delay:.3s;}
@keyframes cpG-blink{0%,100%{opacity:.25;transform:translateY(0);}50%{opacity:1;transform:translateY(-4px);}}

.cpG-msg{margin:12px 0 0;color:#71718a;font-size:13px;font-weight:500;}

@media (prefers-reduced-motion:reduce){.cpG-lanes,.cpG-car,.cpG-title,.cpG-dots span,.cpG-orb{animation:none;}}
`;
