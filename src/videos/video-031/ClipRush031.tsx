import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const source = staticFile('videos/biblioteca/gta6/videos/novidadesGta6/jason_sendo_devorador_por_jacare.mp4');
const gold = '#e9d3a1';
const pages: Caption[][] = [];
let current: Caption[] = [];
for (const word of words as Caption[]) {
  if (current.length && (current.length >= 4 || word.startMs - current[current.length - 1].endMs > 350)) {
    pages.push(current); current = [];
  }
  current.push(word);
  if (/[.!?]$/.test(word.text.trim())) {pages.push(current); current = [];}
}
if (current.length) pages.push(current);

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const page = pages.find(p => ms >= p[0].startMs && ms < p[p.length - 1].endMs + 100);
  if (!page) return null;
  return <div style={{position:'absolute',top:1512,left:82,right:82,textAlign:'center',fontSize:62,fontWeight:850,lineHeight:1.18,letterSpacing:-1,textShadow:'0 4px 16px #000c'}}>
    {page.map((w,i)=><React.Fragment key={i}>{i>0?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs?gold:'#f8faf6'}}>{w.text.trim()}</span></React.Fragment>)}
  </div>;
};

const Shot: React.FC<{start:number;length:number;title:string;label:string;focus?:number;rate?:number;replay?:boolean;wide?:boolean}> = ({start,length,title,label,focus=53,rate=1,replay=false,wide=false}) => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const enter=spring({frame:f,fps,config:{damping:22,stiffness:130}});
  return <AbsoluteFill style={{overflow:'hidden',background:'radial-gradient(ellipse at 84% 35%,#263c32,#101f1d 58%,#080f10)'}}>
    <div style={{position:'absolute',left:76,top:112,fontSize:25,fontWeight:800,letterSpacing:5,color:gold}}>CLIPRUSH <span style={{color:'#a0b4a8',fontWeight:500}}> / EM FOCO</span></div>
    <div style={{position:'absolute',top:184,left:76,right:76,color:'#f4f5ed',fontSize:82,fontWeight:900,lineHeight:1.02,letterSpacing:-2.5,whiteSpace:'pre-line',opacity:interpolate(f,[0,7],[0.5,1],{extrapolateRight:'clamp'}),translate:`0 ${12*(1-enter)}px`}}>{title}</div>
    <div style={{position:'absolute',top:380,left:0,width:1080,height:1090,overflow:'hidden',boxShadow:'0 25px 65px #0006'}}>
      <OffthreadVideo src={source} trimBefore={Math.round(start*fps)} playbackRate={rate} muted style={{width:'100%',height:'100%',objectFit:wide?'contain':'cover',objectPosition:`${focus}% 50%`,scale:interpolate(f,[0,length],[1,wide?1:1.035],{extrapolateRight:'clamp'}),filter:'contrast(1.035) saturate(.94) brightness(1.035)'}}/>
      <AbsoluteFill style={{background:'linear-gradient(180deg,#101f1d55,transparent 12%,transparent 88%,#101f1d99)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',left:44,top:34,padding:'12px 19px',background:'#0b1515d9',borderLeft:`3px solid ${gold}`,color:gold,fontSize:23,fontWeight:750,letterSpacing:2}}>{replay?'REPRISE • ':''}{label}</div>
    </div>
    <div style={{position:'absolute',left:80,right:80,top:1481,height:2,background:'#e9d3a138'}}/>
    <div style={{position:'absolute',left:82,top:1752,right:82,color:'#9baea4',fontSize:23,lineHeight:1.5,letterSpacing:.5}}>CLIPE FORNECIDO • ORIGEM NÃO VERIFICADA<br/>Gameplay oficial de GTA 6 não confirmado</div>
  </AbsoluteFill>;
};

const EndQuestion: React.FC = () => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig();
  return <div style={{position:'absolute',top:1660,left:270,right:270,padding:'13px 0',border:`1px solid ${gold}88`,borderRadius:40,textAlign:'center',fontSize:25,fontWeight:800,letterSpacing:2,color:gold,background:'#12221fe8',scale:spring({frame:f,fps,config:{damping:18}})}}>VOCÊ CHEGARIA PERTO?</div>;
};

export const ClipRush031: React.FC = () => <AbsoluteFill style={{fontFamily:'Arial, sans-serif',background:'#0b1615'}}>
  <Sequence durationInFrames={138} name="Gancho · bote fora da água"><Shot start={14} length={138} rate={.8} title={'NEM EM TERRA\nVOCÊ ESTÁ SEGURO'} label="O ATAQUE" focus={58}/></Sequence>
  <Sequence from={138} durationInFrames={126} name="Contexto · margem do rio"><Shot start={0} length={126} title={'TUDO COMEÇA\nNA BEIRA DO RIO'} label="01 / APROXIMAÇÃO" focus={53}/></Sequence>
  <Sequence from={264} durationInFrames={111} name="Jacaré imóvel"><Shot start={9.5} length={111} title={'PARECE PARADO.\nSÓ PARECE.'} label="02 / DISTÂNCIA CURTA" focus={54}/></Sequence>
  <Sequence from={375} durationInFrames={93} name="Bote · avanço e agarrão"><Shot start={13.2} length={93} rate={.9} title={'UM PASSO A MAIS.\nELE AVANÇA.'} label="03 / O BOTE" focus={59}/></Sequence>
  <Sequence from={468} durationInFrames={96} name="Violência do ataque"><Shot start={16} length={96} rate={.85} title={'O ATAQUE\nNÃO DÁ TRÉGUA'} label="04 / AGARROU" focus={42}/></Sequence>
  <Sequence from={564} durationInFrames={102} name="Queda e morte"><Shot start={18.7} length={102} title={'NO CHÃO.\nSEM ESCAPATÓRIA.'} label="05 / O DESFECHO" focus={53}/></Sequence>
  <Sequence from={666} durationInFrames={168} name="Reprise identificada · análise do ataque"><Shot start={13.7} length={168} rate={1} title={'O BOTE,\nEM DETALHE'} label="DO TRECHO FORNECIDO" replay focus={59}/></Sequence>
  <Sequence from={834} durationInFrames={135} name="Exploração · retorno à margem"><Shot start={4.5} length={135} title={'E SE FOSSE\nCOM VOCÊ?'} label="À MARGEM DO RIO" focus={54}/></Sequence>
  <Sequence from={969} durationInFrames={72} name="Pergunta final · detalhe do animal"><Shot start={10.6} length={72} rate={.65} title={'VOCÊ TERIA\nCORAGEM?'} label="OBSERVE A DISTÂNCIA" focus={59}/></Sequence>
  <Audio src={staticFile('videos/video-031/audio/narracao.mp3')}/>
  <Audio src={staticFile('videos/video-031/audio/atmosfera.wav')} volume={.22}/>
  <Captions/>
  <Sequence from={978} durationInFrames={63} name="Pergunta para o público"><EndQuestion/></Sequence>
</AbsoluteFill>;
