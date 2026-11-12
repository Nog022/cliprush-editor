import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset, clamp, color, display, ease} from '../theme';

export const Kicker: React.FC<{children: React.ReactNode; top?: number; tint?: string}> = ({children, top = 310, tint = color.cyan}) => (
  <div style={{position: 'absolute', left: 88, top, fontSize: 30, letterSpacing: 5, fontWeight: 800, color: tint, textTransform: 'uppercase'}}>{children}</div>
);

export const Headline: React.FC<{children: React.ReactNode; top?: number; size?: number; tint?: string; delay?: number}> = ({children, top = 385, size = 100, tint = color.white, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div data-safe="headline" style={{position: 'absolute', left: 84, top, width: 840, fontFamily: display, fontSize: size, lineHeight: .99, letterSpacing: -1.5, color: tint, whiteSpace: 'pre-line', textShadow: '0 7px 24px #0008',
    translate: `0px ${interpolate(frame - delay * fps, [0, .45 * fps], [65, 0], {...clamp, easing: Easing.out(Easing.cubic)})}px`,
    opacity: interpolate(frame - delay * fps, [0, .18 * fps], [0, 1], clamp),
    scale: .97 + .03 * spring({frame: frame - delay * fps, fps, config: ease})}}>{children}</div>;
};

export const ArtPlane: React.FC<{file: string; top?: number; height?: number; left?: number; width?: number; tilt?: number; fit?: 'cover' | 'contain'; focus?: string}> = ({file, top = 520, height = 840, left = 64, width = 900, tilt = -3, fit = 'cover', focus = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{position: 'absolute', top, left, width, height, perspective: 1500,
    translate: `0px ${interpolate(frame, [0, .65 * fps, 5 * fps], [90, 0, -20], clamp)}px`,
    rotate: `${interpolate(frame, [0, 5 * fps], [tilt, -tilt / 3], clamp)}deg`}}>
    <div style={{width: '100%', height: '100%', transform: `rotateY(${interpolate(frame, [0, .7 * fps, 5 * fps], [-12, 2, -2], clamp)}deg)`, boxShadow: '24px 35px 0 #02040b80, 0 35px 100px #0009', border: '2px solid #ffffff33', overflow: 'hidden', background: color.ink}}>
      <Img src={asset(file)} style={{width: '100%', height: '100%', objectFit: fit, objectPosition: focus,
        scale: interpolate(frame, [0, 5 * fps], [1.04, 1.12], clamp), translate: `${interpolate(frame, [0, 5 * fps], [-12, 12], clamp)}px 0px`}} />
    </div>
  </div>;
};

export const Ambient: React.FC<{tint?: string; warm?: boolean}> = ({tint = color.cyan, warm = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: `radial-gradient(ellipse at 75% 35%, ${tint}23, transparent 55%), linear-gradient(150deg, ${warm ? '#251228' : '#111B3A'}, #080A12 65%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -200, top: 200, width: 1200, height: 1200, borderRadius: '50%', border: `1px solid ${tint}27`, scale: interpolate(frame, [0, 8*fps], [.8, 1.05], clamp)}} />
    <div style={{position: 'absolute', left: 200, top: 350, width: 1050, height: 1050, borderRadius: '50%', border: `1px solid ${tint}22`}} />
    <div style={{position: 'absolute', width: 1800, height: 1000, left: -350, top: 1000, opacity: .2, transform: 'perspective(650px) rotateX(65deg)', backgroundImage: `linear-gradient(${tint}55 1px, transparent 1px), linear-gradient(90deg, ${tint}55 1px, transparent 1px)`, backgroundSize: '100px 100px', backgroundPosition: `0px ${frame * 1.8}px`}} />
    {[0,1,2].map(i => <div key={i} style={{position: 'absolute', left: -200, top: 550 + i*290, width: 1500, height: 2, background: `linear-gradient(90deg, transparent, ${tint}60, transparent)`, rotate: '-24deg', translate: `${(frame / fps * 100 + i*260)%1700-300}px 0px`}} />)}
  </AbsoluteFill>;
};

export const Burst: React.FC<{at: number; tint?: string; x?: number; y?: number}> = ({at, tint = color.yellow, x = 515, y = 930}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const age = frame / fps - at;
  if (age < 0 || age > 1.4) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {[0,.12,.25].map((offset,i) => <div key={offset} style={{position: 'absolute', left: x-250, top: y-250, width: 500, height: 500, borderRadius: '50%', border: `${5-i}px solid ${tint}`, scale: interpolate(age-offset, [0, .75], [.1, 3.2], clamp), opacity: interpolate(age-offset, [0, .1, .75], [0,.65,0], clamp)}} />)}
    {Array.from({length: 32}, (_,i) => {
      const angle = random(`angle-${i}`)*Math.PI*2;
      const reach = 200+random(`reach-${i}`)*650;
      const p = interpolate(age, [0, 1.2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3+random(i)*5, height: 12+random(i+2)*24, background: i%3 ? tint : color.white, borderRadius: 10, translate: `${Math.cos(angle)*reach*p}px ${Math.sin(angle)*reach*p+80*p*p}px`, rotate: `${angle*180/Math.PI+90}deg`, opacity: interpolate(age, [0,.06,.9,1.2], [0,1,.5,0], clamp)}} />;
    })}
  </AbsoluteFill>;
};

export const ConsoleModel: React.FC<{xbox?: boolean}> = ({xbox = false}) => (
  <svg viewBox="0 0 300 370" width="240" height="300" aria-label={xbox ? 'Console Xbox illustrativo' : 'Console PS5 illustrativo'}>
    <defs>
      <linearGradient id={xbox ? 'console-x' : 'console-p'}><stop stopColor={xbox ? '#313c37' : '#fff'}/><stop offset="1" stopColor={xbox ? '#0a110c' : '#a5bed7'}/></linearGradient>
    </defs>
    {xbox ? <>
      <path d="M80 60 195 30 246 57 246 315 130 347 80 317Z" fill="url(#console-x)" stroke="#7bff7766" strokeWidth="2" />
      <path d="M80 60 130 88 246 57 M130 88V347" fill="none" stroke="#7bff7733" strokeWidth="2" />
      {Array.from({length:30},(_,i)=><circle key={i} cx={104+i%6*18} cy={55+Math.floor(i/6)*6} r="2" fill="#071109" />)}
      <circle cx="151" cy="117" r="9" fill="#b6ffc0"/><path d="m147 113 8 8m0-8-8 8" stroke="#112718" strokeWidth="2" />
      <path d="M152 167V275" stroke="#050807" strokeWidth="4"/>
    </> : <>
      <path d="M93 50Q149 75 196 40L194 321 111 341Z" fill="#10182b" stroke="#00c8ff" strokeWidth="3" />
      <path d="M72 22Q94 69 113 68L125 343 71 325Q94 187 72 22Z" fill="url(#console-p)" />
      <path d="M196 40 226 19Q199 191 224 320L188 337Z" fill="url(#console-p)" />
      <path d="M153 291H172" stroke="#c8e9ff" strokeWidth="4"/>
    </>}
    <ellipse cx="153" cy="347" rx="96" ry="11" fill="#0006" />
  </svg>
);

export const StorageBar: React.FC<{progress: number; tint?: string; segments?: number}> = ({progress, tint = color.yellow, segments = 24}) => (
  <div style={{display: 'flex', gap: 6, padding: 13, border: `2px solid ${tint}77`, background: '#060911', height: 96, boxShadow: `0 0 50px ${tint}15`}}>
    {Array.from({length:segments},(_,i)=><div key={i} style={{flex: 1, background: (i+1)/segments <= progress ? tint : '#1b2237', boxShadow: (i+1)/segments <= progress ? `0 0 15px ${tint}30` : 'none'}} />)}
  </div>
);
