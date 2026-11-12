import React from 'react';
import type {Caption} from '@remotion/captions';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import data from '../captions.json';
import {color, display} from '../theme';

const captions: Caption[] = data;
const pages: Caption[][] = [];
for (const word of captions) {
  const page = pages[pages.length-1];
  const previous = page?.[page.length-1];
  if (!page || page.length >= 4 || page.map(w=>w.text).join('').length + word.text.length > 27 ||
    (previous && (/[.!?,]$/.test(previous.text.trim()) || word.startMs-previous.endMs > 280))) {
    pages.push([word]);
  } else page.push(word);
}

export const CaptionSystem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame/fps*1000;
  const page = pages.find(p => ms >= p[0].startMs && ms < p[p.length-1].endMs+85);
  if (!page) return null;
  const progress = spring({frame: frame-page[0].startMs/1000*fps, fps, config:{damping:20,stiffness:220}});
  return <div data-safe="captions" style={{position:'absolute',left:86,top:1470,width:830,minHeight:125,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'20px 18px',boxSizing:'border-box',background:'linear-gradient(90deg,#080a1200,#080a12ed 13%,#080a12ed 87%,#080a1200)',translate:`0px ${(1-progress)*16}px`,scale:.98+.02*progress}}>
    <div style={{fontFamily:display,fontSize:59,lineHeight:1.12,letterSpacing:.6,textTransform:'uppercase',textShadow:'0 3px 0 #080a12,0 6px 18px #000',WebkitTextStroke:'1px #080a12'}}>
      {page.map((word,i) => <span key={`${word.startMs}-${i}`} style={{color: ms>=word.startMs && ms<word.endMs ? color.yellow : color.white}}>{word.text}</span>)}
    </div>
  </div>;
};
