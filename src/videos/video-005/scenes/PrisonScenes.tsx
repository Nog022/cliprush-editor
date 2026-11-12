import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {amber, clamp, cyan, display, pictures} from '../style';
import {Dust, Eyebrow, ImpactWord, Shot, Title} from '../components/Cinema';

export const PrisonHook:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const age=frame/fps-1.48;
  const shake=age>=0&&age<.3?Math.exp(-age*17):0;
  return <AbsoluteFill style={{overflow:'hidden'}}>
    <AbsoluteFill style={{translate:`${Math.sin(frame*2.2)*9*shake}px ${Math.cos(frame*2.6)*6*shake}px`}}>
      <Shot file={pictures.custody} focus="55% 42%" seconds={2.4} startScale={1.16} endScale={1.02} darkness={.1}/>
      <div style={{position:'absolute',left:-130,top:0,width:210,height:1920,background:'linear-gradient(90deg,#0008,#080a1200)',translate:`${interpolate(frame,[0,2.4*fps],[0,160],clamp)}px 0px`}} />
      <Eyebrow>O passado de Lucia</Eyebrow>
      <div style={{position:'absolute',left:88,top:1030,width:840,fontFamily:display,fontSize:103,lineHeight:1.04,color:'#fff',textShadow:'0 8px 25px #000'}}>POR QUE ELA<br/>FOI PARAR NA</div>
      <ImpactWord word="PRISÃO?!" at={1.48} top={1260} size={192}/>
      <div style={{position:'absolute',left:90,top:1270,fontFamily:display,fontSize:192,color:amber,opacity:interpolate(frame,[0,1.48*fps],[.18,0],clamp)}}>?</div>
      <Dust/>
    </AbsoluteFill>
  </AbsoluteFill>;
};

export const TrailerClue:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const quiet=interpolate(frame,[3.85*fps,4.35*fps],[0,1],clamp);
  return <AbsoluteFill>
    <Shot file={pictures.prison} focus="33% 45%" seconds={7.067} startScale={1.02} endScale={1.15} pan={-28} darkness={.05+quiet*.22} warm/>
    <Eyebrow tint={quiet>.5?'#9cabb8':amber}>{quiet>.5?'Olhe além da primeira imagem':'GTA VI / Primeiro trailer'}</Eyebrow>
    <div style={{opacity:1-quiet}}><Title top={1120} size={115}>{'ATRÁS\nDAS GRADES.'}</Title></div>
    <div style={{position:'absolute',left:100,top:1010,width:65,height:65,border:`1px solid ${cyan}55`,opacity:quiet,rotate:`${interpolate(frame,[4.1*fps,7.067*fps],[0,35],clamp)}deg`}} />
    <Dust subtle/>
  </AbsoluteFill>;
};

export const ChoiceSuspense:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill>
    <Shot file={pictures.tension} focus="33% 42%" seconds={4.1} startScale={1.05} endScale={1.14} pan={10} darkness={interpolate(frame,[0,2.4*fps],[.19,.38],clamp)}/>
    <Eyebrow tint="#9ab3c0">A pista decisiva</Eyebrow>
    <div style={{position:'absolute',left:92,top:415,width:810,height:920,borderLeft:'1px solid #ffffff15',borderRight:'1px solid #ffffff0c',scale:interpolate(frame,[0,4.1*fps],[1.07,1],clamp)}} />
    <div style={{position:'absolute',left:89,top:1000,fontFamily:display,fontSize:52,color:'#ffffff30',letterSpacing:9}}>UMA ESCOLHA.</div>
    <Dust subtle/>
  </AbsoluteFill>;
};
