import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Easing, Img, OffthreadVideo, Sequence, cancelRender, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import pages from './caption-pages.json';

const MINT='#9df0cf';
const GOLD='#f0c88f';
const BG='#080f17';
const T1='videos/biblioteca/gta6/videos/Trailer 1 GTA VI.mp4';
const T2='videos/biblioteca/gta6/videos/Trailer 2 GTA VI.mp4';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.2,.7,.25,1)} as const;

function FontReady(){
 const [handle]=useState(()=>delayRender('Video 020 font'));
 useEffect(()=>{
  const font=new FontFace('CR020',`url("${staticFile('videos/video-020/fonts/Arial-Bold.ttf')}")`,{weight:'700'});
  font.load().then(f=>{document.fonts.add(f);continueRender(handle);}).catch(cancelRender);
 },[handle]);
 return null;
}

function Heading({label,children,note}:{label:string;children:React.ReactNode;note?:string}){
 const f=useCurrentFrame();
 return <div style={{position:'absolute',left:82,right:92,top:183,opacity:interpolate(f,[0,6],[0,1],clamp),translate:`0 ${interpolate(f,[0,14],[20,0],clamp)}px`}}>
  <div style={{color:MINT,fontSize:28,letterSpacing:4,marginBottom:25,display:'flex',alignItems:'center',gap:15}}><span style={{width:30,height:3,background:MINT}}/>{label}</div>
  <div style={{fontSize:94,lineHeight:1.04,letterSpacing:-4,textShadow:'0 3px 25px #0008'}}>{children}</div>
  {note&&<div style={{fontSize:31,color:'#bdcbd3',lineHeight:1.35,marginTop:22,letterSpacing:0}}>{note}</div>}
 </div>;
}

function Shot({src=T1,start,frames,rate=1,focus=.5,wide=false,image,children}:{src?:string;start?:number;frames:number;rate?:number;focus?:number;wide?:boolean;image?:string;children?:React.ReactNode}){
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const style:React.CSSProperties={position:'absolute',width:'100%',height:wide?850:1920,top:wide?520:0,objectFit:'cover',objectPosition:`${focus*100}% 50%`,scale:interpolate(f,[0,frames],[1.015,1.065],clamp),filter:'saturate(.92) brightness(1.06)'};
 return <AbsoluteFill style={{overflow:'hidden',background:BG}}>
  {image?<Img src={staticFile(`videos/video-020/images/${image}.jpg`)} style={style}/>:<OffthreadVideo src={staticFile(src)} trimBefore={Math.round((start??0)*fps)} playbackRate={rate} muted style={style}/>}
  <AbsoluteFill style={{background:wide?'linear-gradient(180deg,#080f17 0%,#080f17 23%,transparent 32%,transparent 62%,#080f17 75%)':'linear-gradient(180deg,#080f17e8 0%,#080f1780 22%,transparent 38%,transparent 61%,#080f17d9 79%,#080f17 100%)'}}/>
  {children}
 </AbsoluteFill>;
}

function CityGrid(){
 const f=useCurrentFrame();
 return <svg viewBox="0 0 900 250" width="100%" height="100%" style={{background:'#122332'}}>
  <defs><pattern id="grid020" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)"><rect width="50" height="50" fill="none" stroke="#527184" strokeWidth="2"/><rect x="7" y="7" width="35" height="35" fill="#263e4d"/></pattern></defs>
  <rect width="900" height="250" fill="url(#grid020)"/>
  <path d="M490 -40Q380 75 470 160T430 300" fill="none" stroke="#080f17" strokeWidth="96"/>
  <path d="M140 230L250 155 350 170 510 80 760 88" fill="none" stroke={MINT} strokeWidth="5" strokeDasharray="900" strokeDashoffset={interpolate(f,[0,80],[900,0],clamp)}/>
  <circle cx="760" cy="88" r="10" fill={MINT}/>
  <text x="24" y="225" fill="#b1c6d0" fontSize="20" letterSpacing="2">CARTOGRAFIA ILUSTRATIVA</text>
 </svg>;
}

function Opening(){
 const f=useCurrentFrame();
 return <AbsoluteFill style={{background:BG}}>
  <Img src={staticFile('videos/video-020/images/sunset.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.17,scale:interpolate(f,[0,280],[1,1.08],clamp)}}/>
  <Heading label="IMAGINA A ESCALA">Três mundos.<br/><span style={{color:MINT}}>Um só jogo?</span></Heading>
  {[{name:'GTA IV',at:38,tag:'LIBERTY CITY',img:null},{name:'GTA V',at:83,tag:'LOS SANTOS',img:'gta5'},{name:'RED DEAD II',at:118,tag:'O VELHO OESTE',img:'rdr2'}].map((p,i)=><div key={p.name} style={{position:'absolute',left:82,top:530+i*268,width:900,height:236,overflow:'hidden',borderLeft:`4px solid ${i===2?GOLD:MINT}`,opacity:interpolate(f,[p.at,p.at+9],[0,1],clamp),translate:`${interpolate(f,[p.at,p.at+18],[80,0],clamp)}px 0`,boxShadow:'0 18px 45px #0007'}}>
   {p.img?<Img src={staticFile(`videos/video-020/images/${p.img}.jpg`)} style={{width:'100%',height:'100%',objectFit:'cover',scale:interpolate(f,[0,280],[1.02,1.12],clamp),objectPosition:p.img==='gta5'?'50% 40%':'50% 50%'}}/>:<CityGrid/>}
   <AbsoluteFill style={{background:'linear-gradient(90deg,#080f17ed,transparent 90%)'}}/>
   <div style={{position:'absolute',left:30,bottom:30,fontSize:p.img==='rdr2'?46:62,letterSpacing:-2}}>{p.name}<div style={{fontSize:22,color:'#d1dce1',letterSpacing:3,marginTop:9}}>{p.tag}</div></div>
  </div>)}
  <div style={{position:'absolute',left:82,top:1360,fontSize:26,color:'#aebec6',letterSpacing:1}}>Combinação imaginada pela narração</div>
 </AbsoluteFill>;
}

function Comparison(){
 const f=useCurrentFrame();
 const grow=interpolate(f,[20,63],[1,Math.SQRT2],clamp);
 return <AbsoluteFill style={{background:BG}}>
  <Img src={staticFile('videos/video-020/images/sunset.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.16}}/>
  <Heading label="A DIMENSÃO DE LEONIDA"><span style={{color:MINT,fontSize:154}}>≈ 2×</span><br/>a área de GTA V</Heading>
  <div style={{position:'absolute',left:110,top:700,width:310,height:310,border:'2px solid #7e969d',background:'#53747a22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:55,color:'#cad6db'}}>GTA V</div>
  <div style={{position:'absolute',left:535,top:700-(grow-1)*155,width:310*grow,height:310*grow,border:`3px solid ${MINT}`,background:'#9df0cf19',display:'flex',alignItems:'center',justifyContent:'center',fontSize:65,color:MINT,boxShadow:'0 0 90px #9df0cf16'}}>GTA VI</div>
  <svg width="900" height="520" style={{position:'absolute',left:82,top:600,opacity:.45}}><path d="M35 480H345M35 470v20M345 470v20M454 480h430M454 470v20M884 470v20" fill="none" stroke={MINT} strokeWidth="2"/></svg>
  <div style={{position:'absolute',left:82,right:90,top:1190,fontSize:32,color:'#bdcbd3',lineHeight:1.45}}>Comparação aproximada de área.<br/>Esquema sem escala geográfica.</div>
  <div style={{position:'absolute',left:82,top:1330,fontSize:25,color:'#889fa9'}}>Fonte: entrevista Rockstar / Game Informer, set. 2026</div>
 </AbsoluteFill>;
}

function Detail(){
 const f=useCurrentFrame();
 return <Shot image="computer" frames={96} wide focus={.45}>
  <Heading label="OLHE MAIS PERTO">O mundo está<br/><span style={{color:GOLD}}>nos detalhes.</span></Heading>
  <div style={{position:'absolute',left:214,top:935,width:420,height:182,border:`3px solid ${GOLD}`,borderRadius:8,opacity:interpolate(f,[5,18],[0,1],clamp),boxShadow:'0 0 0 999px #080f1710'}}/>
  <div style={{position:'absolute',left:82,top:1340,fontSize:25,color:'#aebec6'}}>Detalhe do Trailer 2 • quadro ampliado</div>
 </Shot>;
}

function Captions(){
 const f=useCurrentFrame();const {fps}=useVideoConfig();const ms=f/fps*1000;
 const page=pages.find(p=>ms>=p.startMs&&ms<p.endMs);if(!page)return null;
 return <div style={{position:'absolute',left:82,right:104,bottom:295,display:'flex',justifyContent:'center'}}>
  <div style={{padding:'17px 24px 20px',maxWidth:894,background:'#060d15ed',borderRadius:12,boxShadow:'0 8px 32px #0005',fontSize:59,lineHeight:1.18,textAlign:'center',letterSpacing:-1.4}}>{page.words.map((w,i)=><React.Fragment key={`${i}-${w.startMs}`}>{i?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs?MINT:'#fff'}}>{w.text.trim()}</span></React.Fragment>)}</div>
 </div>;
}

function Signature(){
 const f=useCurrentFrame();const {durationInFrames}=useVideoConfig();
 return <><div style={{position:'absolute',left:82,top:107,fontSize:24,letterSpacing:5,color:'#c7d7df',opacity:.65}}>CLIPRUSH</div><div style={{position:'absolute',left:82,right:104,bottom:220,height:2,background:'#ffffff12'}}><div style={{height:2,width:`${f/(durationInFrames-1)*100}%`,background:MINT,opacity:.6}}/></div></>;
}

export const ClipRush020:React.FC=()=> <AbsoluteFill style={{background:BG,color:'#fff',fontFamily:'CR020,Arial,sans-serif',fontWeight:700}}>
 <FontReady/>
 <Audio src={staticFile('videos/video-020/audio/narracao.mp3')} volume={.96}/>
 <Audio src={staticFile('videos/video-020/audio/atmosfera-original.wav')} volume={.6}/>
 <Sequence name="Três mundos, uma hipótese" durationInFrames={280}><Opening/></Sequence>
 <Sequence name="Leonida: a escala" from={280} durationInFrames={82}><Shot start={11.2} frames={82} rate={.85} wide><Heading label="GTA VI / LEONIDA">Um mundo<br/><span style={{color:MINT}}>dessa escala.</span></Heading></Shot></Sequence>
 <Sequence name="Da praia às ilhas" from={362} durationInFrames={77}><Shot src={T2} start={6.18} frames={77} rate={.7} wide><Heading label="UM SÓ MUNDO">Muito além<br/>de Vice City.</Heading></Shot></Sequence>
 <Sequence name="Comparação de área" from={439} durationInFrames={160}><Comparison/></Sequence>
 <Sequence name="Virada: tamanho não é tudo" from={599} durationInFrames={88}><Shot src={T2} start={34.7} frames={88} rate={1} focus={.6}><Heading label="MAS TEM UM DETALHE">Tamanho<br/><span style={{color:GOLD}}>não é tudo.</span></Heading></Shot></Sequence>
 <Sequence name="O mundo por fora" from={687} durationInFrames={67}><Shot start={35.72} frames={67} rate={.7} wide><Heading label="POR FORA">Um mapa<br/>gigantesco.</Heading></Shot></Sequence>
 <Sequence name="O mundo por dentro: bar" from={754} durationInFrames={70}><Shot src={T2} start={90.42} frames={70} rate={.64} wide focus={.45}><Heading label="POR DENTRO">Muito mais<br/><span style={{color:MINT}}>interiores.</span></Heading></Shot></Sequence>
 <Sequence name="Loja: espaços com personalidade" from={824} durationInFrames={47}><Shot image="shop" frames={47} wide focus={.43}><Heading label="POR DENTRO">Cada lugar,<br/>uma descoberta.</Heading></Shot></Sequence>
 <Sequence name="Zoom nos detalhes" from={871} durationInFrames={96}><Detail/></Sequence>
 <Sequence name="Explorar: ruas e rotas" from={967} durationInFrames={80}><Shot start={23.3} frames={80} rate={.53} wide focus={.58}><Heading label="EXPLORAR">Cada caminho<br/><span style={{color:MINT}}>puxa outro.</span></Heading></Shot></Sequence>
 <Sequence name="Descobertas dentro dos prédios" from={1047} durationInFrames={109}><Shot src={T2} start={144.45} frames={109} rate={.74} wide focus={.6}><Heading label="ALÉM DA FACHADA">O que existe<br/>lá dentro?</Heading></Shot></Sequence>
 <Sequence name="Pergunta final: quanto tempo?" from={1156} durationInFrames={134}><Shot start={31.08} frames={134} rate={.32} wide focus={.52}><Heading label="AGORA É COM VOCÊ"><span style={{color:MINT}}>Quantas horas</span><br/>para ver tudo?</Heading></Shot></Sequence>
 <Captions/><Signature/>
</AbsoluteFill>;
