import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, Track, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, cyan, ink, media, paper} from './style';
import {CinematicCaptions} from './components/Captions';
import {ChoiceSuspense, PrisonHook, TrailerClue} from './scenes/PrisonScenes';
import {DestinyScene, InvestigationScene} from './scenes/InvestigationScene';
import {AnswerReveal, ClosingScene, OfficialSource} from './scenes/AnswerScenes';

const FilmIdentity:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const cut=[2.4,9.467,16.8,21.6,25.7,28.6,35].find(t=>Math.abs(frame/fps-t)<.15);
  return <>
    {cut!==undefined&&<AbsoluteFill style={{pointerEvents:'none',background:'#0a1422',opacity:interpolate(frame/fps-cut,[-.15,0,.15],[0,.58,0],clamp)}}/>}
    <div style={{position:'absolute',left:88,top:132,display:'flex',alignItems:'center',gap:13,color:paper,fontSize:29,fontWeight:900,letterSpacing:2,textShadow:'0 2px 10px #000'}}>
      <svg width="28" height="34" viewBox="0 0 28 34"><path d="M17 0 0 20H12L8 34 28 12H16L22 0Z" fill={cyan}/></svg>CLIP<span style={{color:cyan,marginLeft:-12}}>RUSH</span>
    </div>
    <div style={{position:'absolute',left:90,top:1742,color:'#b5bbc6',fontSize:23,letterSpacing:5,fontWeight:700}}>GTA VI <span style={{color:cyan}}> / </span> O PASSADO DE LUCIA</div>
  </>;
};

export const ClipRushVideo005:React.FC=()=> <AbsoluteFill style={{backgroundColor:ink,fontFamily:'Arial, sans-serif',color:paper}}>
  <Track name="Investigação • cenas">
    <Sequence name="01 • Por que a prisão?" durationInFrames={72}><PrisonHook/></Sequence>
    <Sequence name="02 • Trailer e primeiro sussurro" from={72} durationInFrames={212}><TrailerClue/></Sequence>
    <Sequence name="03 • Passado e mapa de pistas" from={284} durationInFrames={220}><InvestigationScene/></Sequence>
    <Sequence name="04 • Mudar o próprio destino" from={504} durationInFrames={144}><DestinyScene/></Sequence>
    <Sequence name="05 • Sussurro decisivo" from={648} durationInFrames={123}><ChoiceSuspense/></Sequence>
    <Sequence name="06 • Consulta à fonte oficial" from={771} durationInFrames={87}><OfficialSource/></Sequence>
    <Sequence name="07 • Lutou... pela família" from={858} durationInFrames={192}><AnswerReveal/></Sequence>
    <Sequence name="08 • Mais segredos de GTA 6" from={1050} durationInFrames={121}><ClosingScene/></Sequence>
  </Track>
  <FilmIdentity/>
  <Sequence name="Voz integral + legendas progressivas" durationInFrames={1171} layout="none">
    <Audio name="Narração original • pausas preservadas" src={media('audio/narracao.mp3')} volume={.9}/>
    <CinematicCaptions/>
  </Sequence>
  <Audio name="Trilha original • automação emocional" src={media('audio/lucia-investigation-score-v002.wav')} volume={1}/>
  <Audio name="Efeitos originais • sem impactos nos sussurros" src={media('audio/lucia-investigation-sfx-v001.wav')} volume={.8}/>
</AbsoluteFill>;
