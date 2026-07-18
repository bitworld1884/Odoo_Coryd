import { LOGO_SRC } from './Brand.jsx';

export default function LandingSplash() {
  return (
    <div className="cpL-splash">
      <style>{cssL}</style>

      {/* Ambient glass orbs */}
      <div className="cpL-orb cpL-o1" />
      <div className="cpL-orb cpL-o2" />
      <div className="cpL-orb cpL-o3" />

      <div className="cpL-brand">
        <img src={LOGO_SRC} alt="" className="cpL-brandMark" />
        <span>Co<b>RYD</b></span>
      </div>

      <div className="cpL-scene">
        <div className="cpL-cloud cpL-c1" />
        <div className="cpL-cloud cpL-c2" />
        <div className="cpL-cloud cpL-c3" />
        <div className="cpL-road"><div className="cpL-lanes" /></div>

        <div className="cpL-car">
          <div className="cpL-carInner">
            <img src={LOGO_SRC} alt="CoRYD" className="cpL-logo" />
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

const cssL = `
.cpL-splash{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:
    radial-gradient(at 12% 8%,  rgba(167,139,250,.45) 0px, transparent 55%),
    radial-gradient(at 88% 6%,  rgba(196,181,253,.40) 0px, transparent 50%),
    radial-gradient(at 78% 84%, rgba(139,92,246,.32)  0px, transparent 52%),
    radial-gradient(at 18% 92%, rgba(148,163,184,.34) 0px, transparent 50%),
    #eeecf5;
  overflow:hidden;z-index:50;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;}

/* ── floating glass orbs ── */
.cpL-orb{position:absolute;border-radius:50%;filter:blur(42px);pointer-events:none;}
.cpL-o1{width:300px;height:300px;background:rgba(124,58,237,.30);top:-70px;left:-60px;animation:cpL-float 15s ease-in-out infinite;}
.cpL-o2{width:250px;height:250px;background:rgba(148,163,184,.34);bottom:-60px;right:-40px;animation:cpL-float 19s ease-in-out infinite reverse;}
.cpL-o3{width:200px;height:200px;background:rgba(196,181,253,.36);top:52%;left:8%;animation:cpL-float 23s ease-in-out infinite -5s;}
@keyframes cpL-float{0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(26px,-32px,0) scale(1.12);}}

/* ── brand lockup (glass pill) ── */
.cpL-brand{position:absolute;top:26px;display:flex;align-items:center;gap:10px;
  padding:8px 18px 8px 10px;border-radius:999px;
  background:rgba(255,255,255,.55);backdrop-filter:blur(17px);-webkit-backdrop-filter:blur(17px);
  border:1px solid rgba(255,255,255,.6);
  box-shadow:0 8px 32px rgba(59,7,100,.12),inset 0 1px 0 rgba(255,255,255,.8);
  font-size:19px;font-weight:800;letter-spacing:-.01em;color:#2c2c3b;
  opacity:0;animation:cpL-fade .7s ease .2s forwards;}
.cpL-brandMark{width:30px;height:30px;object-fit:contain;}
.cpL-brand b{background:linear-gradient(90deg,#7c3aed,#5b21b6);-webkit-background-clip:text;background-clip:text;color:transparent;}

/* ── scene ── */
.cpL-scene{position:relative;width:min(560px,92vw);height:300px;}
.cpL-road{position:absolute;left:50%;bottom:0;width:170%;height:150px;
  transform:translateX(-50%) perspective(340px) rotateX(60deg);transform-origin:bottom center;
  background:linear-gradient(180deg,#55556c,#414155);overflow:hidden;border-radius:8px;
  box-shadow:0 -8px 30px rgba(59,7,100,.16);}
.cpL-lanes{position:absolute;left:calc(50% - 6px);top:-50%;width:12px;height:200%;
  background:repeating-linear-gradient(to bottom,#ede9fe 0 30px,transparent 30px 70px);animation:cpL-move .5s linear infinite;}
@keyframes cpL-move{to{transform:translateY(70px);}}

/* ── logo "vehicle" ── */
.cpL-car{position:absolute;left:50%;bottom:64px;transform:translateX(-140%);
  animation:cpL-drive 1.5s cubic-bezier(.2,.8,.2,1) forwards;
  filter:drop-shadow(0 18px 16px rgba(59,7,100,.26));}
@keyframes cpL-drive{0%{transform:translateX(-170%);}70%{transform:translateX(-42%);}100%{transform:translateX(-50%);}}
.cpL-carInner{animation:cpL-bob 1.3s ease-in-out 1.5s infinite;
  padding:14px 20px;border-radius:26px;
  background:rgba(255,255,255,.42);backdrop-filter:blur(17px);-webkit-backdrop-filter:blur(17px);
  border:1px solid rgba(255,255,255,.6);
  box-shadow:0 8px 32px rgba(59,7,100,.14),inset 0 1px 0 rgba(255,255,255,.85),inset 0 -1px 0 rgba(255,255,255,.15);}
@keyframes cpL-bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
.cpL-logo{width:210px;max-width:52vw;height:auto;display:block;}

/* ── clouds ── */
.cpL-cloud{position:absolute;background:rgba(255,255,255,.85);border-radius:999px;
  box-shadow:26px 8px 0 -4px rgba(255,255,255,.85),-26px 8px 0 -6px rgba(255,255,255,.85);}
.cpL-c1{width:70px;height:26px;top:24px;animation:cpL-drift 13s linear infinite;}
.cpL-c2{width:52px;height:20px;top:70px;animation:cpL-drift 18s linear infinite -6s;}
.cpL-c3{width:60px;height:22px;top:14px;animation:cpL-drift 22s linear infinite -12s;}
@keyframes cpL-drift{from{right:-90px;}to{right:110%;}}

/* ── title ── */
.cpL-title{margin:26px 0 0;text-align:center;font-size:32px;font-weight:800;line-height:1.2;
  display:flex;flex-direction:column;letter-spacing:-.02em;}
.cpL-line{opacity:0;transform:translateY(18px);animation:cpL-rise .6s cubic-bezier(.16,1,.3,1) forwards;}
.cpL-l1{animation-delay:1.5s;color:#2c2c3b;}
.cpL-l2{animation-delay:1.8s;background:linear-gradient(90deg,#7c3aed,#5b21b6);
  -webkit-background-clip:text;background-clip:text;color:transparent;}
@keyframes cpL-rise{to{opacity:1;transform:translateY(0);}}
@keyframes cpL-fade{to{opacity:1;}}

@media (max-width:640px){.cpL-title{font-size:26px;}.cpL-scene{height:250px;}}
@media (prefers-reduced-motion:reduce){
  .cpL-car,.cpL-carInner,.cpL-lanes,.cpL-cloud,.cpL-line,.cpL-brand,.cpL-orb{animation:none;opacity:1;transform:none;}
  .cpL-car{transform:translateX(-50%);}
}
`;
