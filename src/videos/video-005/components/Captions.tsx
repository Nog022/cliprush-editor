import React from 'react';
import type {Caption} from '@remotion/captions';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../captions.json';
import {amber, clamp, cyan, display, paper} from '../style';

const words:Caption[]=data;
const whispered=[[6500,7390],[7500,9450],[21600,24000],[24300,25700]];
const pages:Caption[][]=[];
for(const word of words){
  if(whispered.some(([a,b])=>word.startMs>=a&&word.startMs<b))continue;
  const page=pages[pages.length-1];
  const previous=page?.[page.length-1];
  if(!page||page.length>=4||page.map(w=>w.text).join('').length+word.text.length>29||
    (previous&&(word.startMs-previous.endMs>150||/[.!?,]$/.test(previous.text.trim()))))pages.push([word]);
  else page.push(word);
}

export const CinematicCaptions:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const ms=frame/fps*1000;
  const whisper=whispered.find(([a,b])=>ms>=a&&ms<b);
  if(whisper){
    const line=words.filter(w=>w.startMs>=whisper[0]&&w.startMs<whisper[1]&&w.startMs<=ms);
    if(!line.length)return null;
    const start=line[0].startMs/1000*fps;
    const text=line.map(w=>w.text).join('').trim();
    const ellipsis=(whisper[0]===6500||whisper[0]===21600)&&ms>line[line.length-1].endMs;
    return <div data-safe="whisper" style={{position:'absolute',left:100,top:1120,width:800,color:paper,fontFamily:'Arial, sans-serif',fontWeight:600,fontSize:72,lineHeight:1.24,letterSpacing:-1,textShadow:'0 6px 25px #000',
      opacity:interpolate(frame,[start,start+.35*fps],[.2,1],clamp),translate:`0px ${interpolate(frame,[start,start+.7*fps],[12,0],clamp)}px`}}>
      <div style={{width:50,height:3,background:cyan,marginBottom:32,opacity:.6}}/>
      {text}{ellipsis?'…':''}
    </div>;
  }
  // The impact typography carries these exact words; no duplicate subtitle below it.
  if((ms>=30350&&ms<=30588)||(ms>=32200&&ms<=32763))return null;
  const page=pages.find(p=>ms>=p[0].startMs&&ms<p[p.length-1].endMs+65);
  if(!page)return null;
  const spoken=page.filter(w=>w.startMs<=ms);
  const last=spoken[spoken.length-1];
  if(!last||ms>last.endMs+65)return null;
  const enter=spring({frame:frame-page[0].startMs/1000*fps,fps,config:{damping:24,stiffness:160}});
  return <div data-safe="captions" style={{position:'absolute',left:90,top:1500,width:820,textAlign:'center',fontFamily:display,fontSize:62,lineHeight:1.14,letterSpacing:.4,textTransform:'uppercase',textShadow:'0 3px 0 #080a12,0 7px 18px #000',translate:`0px ${(1-enter)*12}px`,padding:'15px 0'}}>
    {spoken.map(w=><span key={w.startMs} style={{color:ms<w.endMs?amber:paper}}>{w.text}</span>)}
  </div>;
};
