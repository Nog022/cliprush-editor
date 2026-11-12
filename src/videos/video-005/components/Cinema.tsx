import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {amber, clamp, cyan, display, ink, media, paper} from '../style';

export const Shot: React.FC<{
  file:string; focus?:string; seconds:number; startScale?:number; endScale?:number;
  pan?:number; darkness?:number; warm?:boolean;
}> = ({file,focus='50% 45%',seconds,startScale=1.03,endScale=1.1,pan=18,darkness=.2,warm=false}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{overflow:'hidden',background:ink}}>
    <Img src={media(file)} style={{position:'absolute',left:-60,top:-40,width:1200,height:2000,objectFit:'cover',objectPosition:focus,
      scale:interpolate(frame,[0,seconds*fps],[startScale,endScale],clamp),translate:`${interpolate(frame,[0,seconds*fps],[-pan,pan],clamp)}px ${interpolate(frame,[0,seconds*fps],[12,-18],clamp)}px`}} />
    <AbsoluteFill style={{background:warm?'linear-gradient(140deg,#ffac4b25,#270e2800 55%,#080a12)':'linear-gradient(130deg,#071f3455,transparent 55%,#080a12)',mixBlendMode:'multiply'}} />
    <AbsoluteFill style={{background:`rgba(8,10,18,${darkness})`}} />
    <AbsoluteFill style={{background:'linear-gradient(180deg,#080a1270 0%,transparent 25%,transparent 42%,#080a12a0 65%,#080a12f5 88%,#080a12)'}} />
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 40%,transparent 35%,#080a1288 100%)'}} />
  </AbsoluteFill>;
};

export const Eyebrow: React.FC<{children:React.ReactNode;top?:number;tint?:string}> = ({children,top=307,tint=cyan}) => <div style={{position:'absolute',left:90,top,fontSize:27,fontWeight:800,letterSpacing:5,color:tint,textTransform:'uppercase'}}>{children}</div>;

export const Title: React.FC<{children:React.ReactNode;top?:number;size?:number;tint?:string;delay?:number;gentle?:boolean}> = ({children,top=1080,size=112,tint=paper,delay=0,gentle=false}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <div data-safe="title" style={{position:'absolute',left:88,top,width:840,fontFamily:display,fontSize:size,lineHeight:1.04,letterSpacing:.3,color:tint,whiteSpace:'pre-line',textShadow:'0 5px 28px #0008',
    opacity:interpolate(frame,[delay*fps,(delay+(gentle?.6:.2))*fps],[0,1],clamp),
    translate:`0px ${interpolate(frame,[delay*fps,(delay+(gentle?.9:.5))*fps],[gentle?20:55,0],{...clamp,easing:Easing.out(Easing.cubic)})}px`}}>{children}</div>;
};

export const Dust: React.FC<{subtle?:boolean}> = ({subtle=false}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{pointerEvents:'none',overflow:'hidden'}}>
    {Array.from({length:16},(_,i)=><div key={i} style={{position:'absolute',width:random(`dust-size${i}`)*3+1,height:random(`dust-size${i}`)*3+1,borderRadius:'50%',background:'#fff4da',opacity:(subtle?.12:.22)*(Math.sin(frame/fps*.6+i)+1)/2,left:random(`dust-x${i}`)*1080,top:random(`dust-y${i}`)*1800,translate:`${Math.sin(frame/fps*.16+i)*25}px ${-frame/fps*(subtle?2:5)}px`}} />)}
  </AbsoluteFill>;
};

export const PhotoEvidence: React.FC<{file:string;label:string;left:number;top:number;width:number;height:number;angle?:number;focus?:string}> = ({file,label,left,top,width,height,angle=-4,focus='50% 50%'}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <div style={{position:'absolute',left,top,width,height,padding:15,paddingBottom:65,boxSizing:'border-box',background:paper,boxShadow:'20px 30px 65px #0008',rotate:`${angle+Math.sin(frame/fps*.3)*.6}deg`,translate:`0px ${interpolate(frame,[0,.8*fps],[70,0],{...clamp,easing:Easing.out(Easing.cubic)})}px`}}>
    <Img src={media(file)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:focus}} />
    <div style={{position:'absolute',bottom:22,left:23,fontSize:22,fontWeight:900,color:'#182332',letterSpacing:2}}>{label}</div>
    <div style={{position:'absolute',width:96,height:34,left:width/2-48,top:-15,background:'#b7ae95bb',rotate:'-5deg',border:'1px solid #ded5bc66'}} />
  </div>;
};

export const ImpactWord: React.FC<{word:string;at:number;top?:number;size?:number}> = ({word,at,top=1110,size=230}) => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  if(frame<at*fps)return null;
  const s=spring({frame:frame-at*fps,fps,config:{damping:15,stiffness:240,mass:.65}});
  return <div style={{position:'absolute',left:84,top,width:840,fontFamily:display,fontSize:size,lineHeight:1,color:amber,letterSpacing:-2,scale:1.32-.32*s,transformOrigin:'30% 50%',textShadow:'0 7px 0 #705632,0 16px 40px #0008'}}>{word}</div>;
};
