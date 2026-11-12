import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, Track, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset, clamp, color} from './theme';
import {HookScene} from './scenes/HookScene';
import {DownloadScene, PreloadRevealScene, RockstarProofScene} from './scenes/NewsScenes';
import {ConsoleComparisonScene} from './scenes/ConsoleComparisonScene';
import {FinalQuestionScene, StorageScene} from './scenes/StorageScenes';
import {CaptionSystem} from './components/CaptionSystem';
import {SceneTransitions} from './components/SceneTransitions';

const Identity: React.FC = () => {
  const frame=useCurrentFrame();
  const {durationInFrames}=useVideoConfig();
  return <>
    <div style={{position:'absolute',top:128,left:86,display:'flex',gap:14,alignItems:'center',color:color.white,textShadow:'0 2px 12px #000'}}>
      <svg width="37" height="42" viewBox="0 0 37 42"><path d="M20 0 0 25H15L11 42 37 15H21L27 0Z" fill={color.cyan}/></svg>
      <div style={{fontWeight:900,fontSize:34,letterSpacing:2}}>CLIP<span style={{color:color.cyan}}>RUSH</span></div>
    </div>
    <div style={{position:'absolute',left:88,top:207,width:817,height:3,background:'#ffffff20'}}><div style={{width:`${interpolate(frame,[0,durationInFrames-1],[0,100],clamp)}%`,height:3,background:color.cyan}} /></div>
    <div style={{position:'absolute',left:88,top:1752,fontSize:23,color:'#dce5f0',fontWeight:700,letterSpacing:4,textShadow:'0 2px 8px #000'}}>GTA VI <span style={{color:color.cyan}}> / </span> PREPARA O SSD.</div>
  </>;
};

export const ClipRushVideo004: React.FC = () => (
  <AbsoluteFill style={{backgroundColor:color.ink,color:color.white,fontFamily:'Arial, sans-serif'}}>
    <Track name="Cenas • edição 004">
      <Sequence name="01 • Impacto 212 GB" durationInFrames={165}><HookScene/></Sequence>
      <Sequence name="02 • Rockstar confirmou" from={165} durationInFrames={120}><RockstarProofScene/></Sequence>
      <Sequence name="03 • Calendário antecipado" from={285} durationInFrames={183}><PreloadRevealScene/></Sequence>
      <Sequence name="04 • Download digital" from={468} durationInFrames={147}><DownloadScene/></Sequence>
      <Sequence name="05 • Travessia PS5 / Xbox" from={615} durationInFrames={264}><ConsoleComparisonScene/></Sequence>
      <Sequence name="06 • Limite de armazenamento" from={879} durationInFrames={177}><StorageScene/></Sequence>
      <Sequence name="07 • Qual jogo sai?" from={1056} durationInFrames={144}><FinalQuestionScene/></Sequence>
    </Track>
    <SceneTransitions/>
    <Identity/>
    <Sequence name="Narração completa + legendas" durationInFrames={1200} layout="none">
      <Audio name="Voz original • sem cortes" src={asset('audio/narracao.mp3')} volume={.92}/>
      <CaptionSystem/>
    </Sequence>
    <Audio name="Trilha original • ducking na voz" src={asset('audio/cliprush-004-original-score-v001.wav')} volume={.7}/>
    <Audio name="Sound design original • impactos e UI" src={asset('audio/cliprush-004-original-sfx-v001.wav')} volume={.7}/>
  </AbsoluteFill>
);
