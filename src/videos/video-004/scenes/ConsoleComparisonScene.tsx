import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, color, display} from '../theme';
import {Burst, ConsoleModel} from '../components/VisualKit';

const Room: React.FC<{xbox?: boolean; left: number}> = ({xbox = false,left}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const tint=xbox?color.green:color.cyan;
  const arrival=xbox?6.6:2.58;
  const p=interpolate(frame,[(arrival-.9)*fps,arrival*fps],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
  const pulse=spring({frame:frame-arrival*fps,fps,config:{damping:13,stiffness:180}});
  return <div style={{position:'absolute',left,top:0,width:1080,height:1920,overflow:'hidden',background:`radial-gradient(ellipse at 50% 52%,${xbox?'#1b3f27':'#123e6b'},#080A12 62%)`}}>
    <div style={{position:'absolute',inset:0,opacity:.75,perspective:900}}>
      {[0,1,2,3,4].map(i=><div key={i} style={{position:'absolute',left:35,top:280,width:1010,height:1160,border:`${i===0?3:1}px solid ${tint}${i===0?'88':'44'}`,transform:`translateZ(${-i*290}px)`,boxShadow:i===0?`inset 0 0 90px ${tint}08`:'none'}} />)}
    </div>
    <div style={{position:'absolute',left:-400,top:1250,width:1900,height:1000,transform:'perspective(550px) rotateX(65deg)',backgroundImage:`linear-gradient(${tint}55 1px,transparent 1px),linear-gradient(90deg,${tint}55 1px,transparent 1px)`,backgroundSize:'120px 120px',backgroundPosition:`0px ${frame*2}px`,opacity:.35}} />
    <div style={{position:'absolute',left:87,top:323,fontSize:29,letterSpacing:5,fontWeight:800,color:tint}}>QUANDO COMEÇA?</div>
    <div data-safe="console-name" style={{position:'absolute',left:82,top:400,fontFamily:display,fontSize:xbox?108:148,lineHeight:1,color:color.white}}>{xbox?'XBOX':'PS5'}<span style={{display:'block',fontFamily:'Arial, sans-serif',fontSize:30,fontWeight:700,letterSpacing:7,color:tint,marginTop:22}}>{xbox?'SERIES X|S':'PLAYSTATION 5'}</span></div>
    <div style={{position:'absolute',left:240,top:685,width:545,height:545,perspective:1100,transform:`rotateY(${(1-p)*(xbox?-13:13)}deg)`,scale:1+(1-pulse)*.025}}>
      <svg width="545" height="545" viewBox="0 0 545 545" style={{position:'absolute',inset:0,rotate:`${(1-p)*-30}deg`}}>
        <circle cx="272.5" cy="272.5" r="251" stroke={tint} strokeWidth="2" fill={`${tint}04`} />
        <circle cx="272.5" cy="272.5" r="236" stroke={tint} strokeWidth="8" strokeDasharray="3 22" fill="none" opacity=".6" />
        <circle cx="272.5" cy="272.5" r="210" stroke={tint} strokeWidth="1" fill="#080a12a0" />
        <path d="M272.5 79V110M466 272.5H435M272.5 466V435M79 272.5H110" stroke={tint} strokeWidth="6" />
        <g transform={`rotate(${(xbox?270:360)*p} 272.5 272.5)`}><path d="M272.5 124V181" stroke="white" strokeWidth="8" strokeLinecap="round"/><circle cx="272.5" cy="124" r="8" fill={tint}/></g>
      </svg>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:display,fontSize:142,color:color.white,letterSpacing:-4,textShadow:`0 0 50px ${tint}44`}}>{p<.96?(xbox?'20:59':'23:59'):(xbox?'21h':'00h')}</div>
    </div>
    <div style={{position:'absolute',left:704,top:1002,rotate:'7deg',scale:.8,opacity:interpolate(frame,[xbox?5.1*fps:.4*fps,xbox?5.6*fps:1*fps],[0,1],clamp)}}><ConsoleModel xbox={xbox}/></div>
    <div style={{position:'absolute',left:88,top:1280,display:'flex',alignItems:'baseline',gap:28,color:color.white}}><span style={{fontFamily:display,fontSize:105,color:tint}}>{xbox?'09/11':'10/11'}</span><span style={{fontSize:32,fontWeight:700}}>2026</span></div>
    <div style={{position:'absolute',left:91,top:1403,fontSize:30,color:'#b5c0d1'}}>{xbox?'Horário de Brasília • 00h GMT em 10/11':'Meia-noite no horário local'}</div>
    <Burst at={arrival} tint={tint} y={960} />
  </div>;
};

export const ConsoleComparisonScene: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  // Xbox word: 25.14s, 4.64s after this scene's 20.5s start.
  const pan=interpolate(frame,[4.64*fps,5.22*fps],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)});
  return <AbsoluteFill style={{background:color.ink,overflow:'hidden',perspective:1800}}>
    <div style={{position:'absolute',top:0,left:0,width:2200,height:1920,translate:`${-1120*pan}px 0px`,transform:`rotateY(${Math.sin(pan*Math.PI)*-7}deg) scale(${1-Math.sin(pan*Math.PI)*.075})`,transformOrigin:`${515+pan*1120}px 960px`}}>
      <Room left={0}/>
      <div style={{position:'absolute',left:1080,top:0,width:40,height:1920,background:'linear-gradient(90deg,#00c8ff,#ffffff,#9dff67)',boxShadow:'0 0 80px #ffffff88'}} />
      <Room left={1120} xbox/>
    </div>
    <div style={{position:'absolute',top:470,left:0,width:1080,height:750,opacity:Math.sin(pan*Math.PI)*.28,background:'repeating-linear-gradient(0deg,transparent 0px,transparent 12px,#ffffff 13px,transparent 15px)',translate:`${Math.sin(frame*2)*20}px 0px`}} />
  </AbsoluteFill>;
};
