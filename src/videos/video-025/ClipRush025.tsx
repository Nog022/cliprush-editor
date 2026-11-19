import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {WebcamTopGameplayBottom, type WebcamTopGameplayBottomProps} from '../../templates/webcam_top_gameplay_bottom';
import {coverRegion} from '../../templates/webcam_top_gameplay_bottom/geometry';
import pages from './caption-pages.json';

export const rdr2Preset: WebcamTopGameplayBottomProps = {
  src: 'videos/biblioteca/alanzoka/rdr2-alan.mp4',
  sourceSize: {width: 1920, height: 1080},
  startSeconds: 875,
  durationSeconds: 35,
  webcamRegion: {x: 1473, y: 9, w: 435, h: 252},
  gameplayRegion: {x: 0, y: 160, w: 1465, h: 920},
  webcamHeightRatio: 0.4,
  webcamFocus: {x: 1649.25, y: 151.5},
};

const GOLD = '#ffd26f';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

function Captions() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find((p, i) => ms >= p.startMs && ms < Math.min(p.endMs + 100, pages[i + 1]?.startMs ?? Infinity));
  if (!page) return null;
  return <div style={{position: 'absolute', top: 704, left: 70, right: 70, minHeight: 128,
    display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>
    <div style={{textAlign: 'center', fontSize: 58, fontWeight: 900, lineHeight: 1.14,
      padding: '15px 24px', borderRadius: 16, background: '#101214dc', textWrap: 'balance',
      textShadow: '0 3px 5px #000', borderBottom: `3px solid ${GOLD}90`,
      scale: interpolate(ms - page.startMs, [0, 90, 150], [0.96, 1.015, 1], clamp)}}>
      {page.words.map((word, i) => <span key={i} style={{color: ms >= word.startMs && ms < word.endMs + 35 ? GOLD : '#fff'}}>{word.text.trim()}{' '}</span>)}
    </div>
  </div>;
}

export const ClipRush025: React.FC<WebcamTopGameplayBottomProps> = (props) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  // Editorial cuts keep the original audio and source timeline continuous.
  const reaction = (seconds >= 6.8 && seconds < 9.9) || (seconds >= 26.7 && seconds < 30.5);
  const closingReaction = seconds >= 31.35 && seconds < 33.3;
  const webcamZoom = reaction ? 1.12 : closingReaction ? 1.16 : 1;
  const webcam = props.webcamRegion;
  const webcamRegion = {
    x: webcam.x + (webcam.w - webcam.w / webcamZoom) / 2,
    y: webcam.y + (webcam.h - webcam.h / webcamZoom) / 2,
    w: webcam.w / webcamZoom,
    h: webcam.h / webcamZoom,
  };
  const npcCloseup = seconds >= 19.35 && seconds < 24.5;
  const approach = seconds >= 13.15 && seconds < 19.35;
  const gameplayRegion = npcCloseup
    ? {x: 390, y: 270, w: 930, h: 800}
    : approach ? {x: 320, y: 160, w: 1145, h: 920} : props.gameplayRegion;
  const gameplay = coverRegion(gameplayRegion, 1080, 1152);
  const markerOpacity = interpolate(seconds, [20.45, 20.6, 21.05, 21.2], [0, 0.8, 0.8, 0], clamp);
  return <AbsoluteFill style={{fontFamily: 'Arial, sans-serif', color: '#fff', background: '#080b0d'}}>
    <WebcamTopGameplayBottom {...props} webcamRegion={webcamRegion} gameplayRegion={gameplayRegion}/>
    <div style={{position: 'absolute', top: 767, height: 3, width: 1080, background: GOLD, opacity: 0.7}}/>
    {seconds < 3.15 && <div style={{position: 'absolute', top: 850, left: 85, right: 85, textAlign: 'center',
      fontSize: 65, fontWeight: 900, lineHeight: 1.05, textShadow: '0 4px 10px #000, 0 0 4px #000',
      opacity: interpolate(seconds, [0, 0.15, 2.9, 3.15], [0, 1, 1, 0], clamp)}}>
      O QUE ACONTECEU<br/>COM ESSE <span style={{color: GOLD}}>NPC?</span>
    </div>}
    <div style={{position: 'absolute', left: 800 * gameplay.scale + gameplay.left - 90,
      top: 768 + 500 * gameplay.scale + gameplay.top - 90, width: 180, height: 180,
      borderRadius: '50%', border: `4px solid ${GOLD}`, opacity: markerOpacity,
      boxShadow: '0 0 0 8px #0002', pointerEvents: 'none'}}/>
    <Captions/>
  </AbsoluteFill>;
};
