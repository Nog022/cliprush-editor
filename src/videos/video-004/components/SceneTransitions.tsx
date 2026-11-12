import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, color} from '../theme';

const cuts = [{at:5.5,type:'pan'},{at:9.5,type:'iris'},{at:15.6,type:'diagonal'},{at:20.5,type:'pan'},{at:29.3,type:'scan'},{at:35.2,type:'diagonal'}];

export const SceneTransitions: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const cut=cuts.find(c=>Math.abs(frame/fps-c.at)<.19);
  if(!cut) return null;
  const phase=(frame/fps-cut.at+.19)/.38;
  const strength=Math.sin(phase*Math.PI);
  if(cut.type==='iris') return <AbsoluteFill style={{pointerEvents:'none',border:`${strength*500}px solid #FF63BD`,boxSizing:'border-box',opacity:strength*.55,scale:interpolate(phase,[0,1],[1.5,.4],clamp),borderRadius:'50%'}} />;
  if(cut.type==='scan') return <AbsoluteFill style={{pointerEvents:'none',opacity:strength*.65,background:`repeating-linear-gradient(0deg,transparent 0px,transparent 14px,${color.red} 15px,transparent 18px)`,translate:`${Math.sin(frame*5)*15}px 0px`}} />;
  return <AbsoluteFill style={{pointerEvents:'none',overflow:'hidden'}}>
    {[0,1,2].map(i=><div key={i} style={{position:'absolute',top:-350,left:-900,width:700,height:2600,background:i===1?color.cyan:color.violet,opacity:i===1?.8:.65,rotate:cut.type==='diagonal'?'22deg':'0deg',translate:`${interpolate(phase,[0,1],[-300,2800],clamp)-i*170}px 0px`}} />)}
  </AbsoluteFill>;
};
