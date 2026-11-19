import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const accent='#f4cf90';
const source=staticFile('videos/biblioteca/gta6/videos/novidadesGta6/jason_seguindo_lucia.mp4');
const Shot:React.FC<{start:number;length:number;title:string;label:string;focus?:number;rate?:number;detail?:boolean}> = ({start,length,title,label,focus=50,rate=1,detail=false})=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const zoom=interpolate(f,[0,length],[1,1.045],{extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 80% 20%,#344038,#111c1c 55%,#080f11)',overflow:'hidden'}}>
  <div style={{position:'absolute',top:145,left:84,color:accent,fontSize:25,fontWeight:800,letterSpacing:6}}>CLIPRUSH <span style={{color:'#98aaa3'}}> / EM FOCO</span></div>
  <div style={{position:'absolute',top:230,left:80,right:80,color:'#fff',fontSize:86,fontWeight:900,letterSpacing:-3,lineHeight:1.03}}>{title}</div>
  <div style={{position:'absolute',top:438,left:84,color:accent,fontSize:27,fontWeight:700,letterSpacing:2}}>{label}</div>
  <div style={{position:'absolute',top:510,left:0,width:1080,height:920,overflow:'hidden',boxShadow:'0 28px 90px #0007'}}>
   <OffthreadVideo src={source} trimBefore={Math.round(start*fps)} playbackRate={rate} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${focus}% 50%`,transform:`scale(${zoom})`,filter:'brightness(1.07) contrast(1.02) saturate(.94)'}}/>
   <AbsoluteFill style={{background:'linear-gradient(180deg,#111c1c12,transparent 15%,transparent 87%,#111c1c55)'}}/>
   {detail&&<div style={{position:'absolute',left:205,top:295,width:450,height:190,border:`3px solid ${accent}`,borderRadius:18,boxShadow:'0 0 0 2000px #0002',opacity:interpolate(f,[0,10],[0,1],{extrapolateRight:'clamp'})}}/>}
  </div>
  <div style={{position:'absolute',top:1452,left:84,right:84,height:2,background:'#f4cf9033'}}/>
  <div style={{position:'absolute',top:1750,left:84,right:84,color:'#b7c4bf',fontSize:23,letterSpacing:1,lineHeight:1.4}}>CLIPE FORNECIDO • ORIGEM NÃO VERIFICADA<br/>Gameplay oficial de GTA 6 não confirmado</div>
 </AbsoluteFill>;
};
const groups:Caption[][]=[];let page:Caption[]=[];
for(const w of words as Caption[]){
 if(page.length&&(page.length>=4||w.startMs-page[page.length-1].endMs>300)){groups.push(page);page=[];}
 page.push(w);if(/[.!?]$/.test(w.text.trim())){groups.push(page);page=[];}
}
if(page.length)groups.push(page);
const Captions:React.FC=()=>{
 const f=useCurrentFrame();const ms=f/30*1000;
 const g=groups.find(p=>ms>=p[0].startMs&&ms<p[p.length-1].endMs+65);
 if(!g)return null;
 return <div style={{position:'absolute',left:84,right:84,top:1510,height:210,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',color:'white',fontWeight:900,fontSize:64,lineHeight:1.15,letterSpacing:-1,textShadow:'0 4px 12px #000'}}><div>{g.map((w,i)=><React.Fragment key={`${w.startMs}-${i}`}>{i?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs+65?accent:'white'}}>{w.text.trim()}</span></React.Fragment>)}</div></div>;
};
const CTA:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const p=spring({frame:f,fps,config:{damping:17}});const click=f>=16;
 return <div style={{position:'absolute',top:330,left:84,right:84,height:155,borderRadius:24,background:accent,color:'#13201e',display:'flex',alignItems:'center',justifyContent:'center',gap:26,transform:`translateY(${(1-p)*30}px) scale(${.94+.06*p})`,opacity:interpolate(f,[0,5,99,107],[0,1,1,0],{extrapolateRight:'clamp'})}}>
  <svg width="61" height="61" viewBox="0 0 24 24" fill={click?'#13201e':'none'} stroke="currentColor" strokeWidth="1.7"><path d="M7 10v11H3V10h4Zm0 1 5-8c2-1 3 1 2 4l-1 3h6c2 0 2 2 1 5l-2 6H7Z"/></svg>
  <div style={{fontSize:34,fontWeight:900}}>CURTIR + SEGUIR<div style={{fontSize:24,marginTop:8}}>{click?'✓ Valeu! Mais detalhes com o ClipRush':'Gostou desse detalhe?'}</div></div>
 </div>;
};
export const ClipRush030:React.FC=()=> <AbsoluteFill style={{background:'#111c1c',fontFamily:'Arial, sans-serif'}}>
 <Sequence durationInFrames={102} name="Gancho · van"><Shot start={20} length={102} title="ELA TEM UMA ROTINA?" label="OBSERVE A VAN" focus={43}/></Sequence>
 <Sequence from={102} durationInFrames={156} name="Gancho · destino"><Shot start={24} length={156} rate={.85} title="ALGUÉM VEM BUSCÁ-LA" label="O DETALHE ESTÁ NA LATERAL" focus={43}/></Sequence>
 <Sequence from={258} durationInFrames={249} name="Saída da casa"><Shot start={6} length={249} rate={1.2} title="SEGUINDO CADA PASSO" label="01 / DA CASA ATÉ A RUA" focus={53}/></Sequence>
 <Sequence from={507} durationInFrames={93} name="Chegada à rua"><Shot start={16} length={93} title="ELA NÃO PARA POR AÍ" label="02 / A ROTINA CONTINUA" focus={54}/></Sequence>
 <Sequence from={600} durationInFrames={129} name="Chegada da van"><Shot start={19} length={129} title="UMA VAN SE APROXIMA" label="03 / UM ENCONTRO MARCADO?" focus={42}/></Sequence>
 <Sequence from={729} durationInFrames={153} name="Inscrição lateral"><Shot start={23.2} length={153} rate={.43} title="OLHE A INSCRIÇÃO" label="04 / CENTRO COMUNITÁRIO" focus={35} detail/></Sequence>
 <Sequence from={882} durationInFrames={117} name="CTA"><Shot start={25.5} length={117} rate={.45} title="CURTIU?" label="" focus={44}/></Sequence>
 <Sequence from={999} durationInFrames={168} name="Embarque e partida"><Shot start={26} length={168} rate={1.2} title="ELA ENTRA. A VAN PARTE." label="05 / JASON FICA PARA TRÁS" focus={48}/></Sequence>
 <Sequence from={1167} durationInFrames={165} name="Hipótese · saída"><Shot start={3} length={165} title="UMA ROTINA DE TRABALHO?" label="HIPÓTESE / REPRISE PARA ANÁLISE" focus={52}/></Sequence>
 <Sequence from={1332} durationInFrames={153} name="Hipótese · continuidade"><Shot start={12.5} length={153} title="MESMO QUANDO VOCÊ SEGUE?" label="HIPÓTESE / REPRISE PARA ANÁLISE" focus={52}/></Sequence>
 <Sequence from={1485} durationInFrames={163} name="Encerramento"><Shot start={32.8} length={163} title="O QUE MAIS FALTA VER?" label="A PRÓXIMA DESCOBERTA…" focus={48}/></Sequence>
 <Audio src={staticFile('videos/video-030/audio/narracao.mp3')}/>
 <Captions/>
 <Sequence from={885} durationInFrames={108} name="CTA animado"><CTA/></Sequence>
 <Sequence from={901} durationInFrames={5} name="Clique discreto"><Audio src={staticFile('videos/video-030/audio/click.wav')} volume={.18}/></Sequence>
</AbsoluteFill>;
