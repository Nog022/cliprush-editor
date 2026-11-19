import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import pages from './caption-pages.json';

const INK='#081512';
const GOLD='#ffdc7c';
const MINT='#a6f2cb';
const ease={extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.18,.72,.25,1)} as const;
const image=(n:string)=>staticFile(`videos/biblioteca/gta6/imagens novas/mount-kalaga-national-park-${n}.jpg`);

type ShotProps={pic:string;label:string;title:string;accent?:string;note?:string;x?:number;y?:number;zoom?:number;endZoom?:number;target?:boolean;wide?:boolean;flood?:boolean};

function Flood(){
 const f=useCurrentFrame();
 const level=interpolate(f,[0,180,300],[850,500,380],ease);
 return <>
  <AbsoluteFill style={{background:'#182c4590',opacity:interpolate(f,[0,75],[0,.65],ease)}}/>
  <svg width="960" height="990" viewBox="0 0 960 990" style={{position:'absolute',inset:0}}>
   <defs><linearGradient id="water021" x2="0" y2="1"><stop stopColor="#85c2bd" stopOpacity=".42"/><stop offset="1" stopColor="#123c49" stopOpacity=".96"/></linearGradient></defs>
   <path d={`M0 ${level} ${Array.from({length:25},(_,i)=>`Q${i*40+10} ${level+Math.sin(f/11+i)*12} ${i*40+40} ${level+Math.sin(f/14+i+1)*8}`).join(' ')} L1000 1000 L0 1000 Z`} fill="url(#water021)" stroke="#b5eee2" strokeWidth="3"/>
   {Array.from({length:16},(_,i)=><path key={i} d={`M${(i*163+f*3)%1100-100} ${level+35+(i*47)%(990-level)}h${60+i%4*20}`} stroke="#d1f6ec" opacity=".2" strokeWidth="2"/>)}
   {Array.from({length:45},(_,i)=><line key={i} x1={(i*137+f*4)%1050} y1={(i*91+f*24)%1100-100} x2={(i*137+f*4)%1050-15} y2={(i*91+f*24)%1100-45} stroke="#d7e9ee" strokeWidth="2" opacity=".24"/>)}
  </svg>
  <div style={{position:'absolute',left:25,top:25,padding:'14px 21px',background:GOLD,color:INK,fontSize:27,fontWeight:900,letterSpacing:2}}>TEORIA • SIMULAÇÃO</div>
  <div style={{position:'absolute',right:25,bottom:25,padding:'13px 18px',background:'#081512e8',fontSize:23,letterSpacing:1}}>EFEITO GRÁFICO • NÃO É GAMEPLAY</div>
 </>;
}

function Shot({pic,label,title,accent=MINT,note,x=.5,y=.5,zoom=2,endZoom=2.14,target=false,wide=false,flood=false}:ShotProps){
 const f=useCurrentFrame();const {durationInFrames}=useVideoConfig();
 const z=interpolate(f,[0,Math.min(durationInFrames,110)],[zoom,endZoom],ease);
 const w=960*z,h=w*9/16;
 const left=Math.max(960-w,Math.min(0,480-x*w));
 const top=Math.max(990-h,Math.min(0,495-y*h));
 const tx=left+x*w,ty=top+y*h;
 return <AbsoluteFill style={{overflow:'hidden',background:INK}}>
  <Img src={image(pic)} style={{width:1080,height:1920,objectFit:'cover',filter:'blur(28px) brightness(.36) saturate(.8)',scale:1.12}}/>
  <AbsoluteFill style={{background:'linear-gradient(180deg,#081512df,transparent 48%,#081512 89%)'}}/>
  <div style={{position:'absolute',left:66,top:166,color:accent,fontSize:25,letterSpacing:5,fontWeight:700}}>{label}</div>
  <div style={{position:'absolute',left:60,right:65,top:224,fontSize:76,fontWeight:900,lineHeight:1.02,letterSpacing:-2.5,textShadow:'0 4px 18px #0008'}}>{title}</div>
  <div style={{position:'absolute',left:60,top:440,width:960,height:990,borderRadius:15,overflow:'hidden',boxShadow:'0 25px 70px #0009',border:'1px solid #e3ffec35'}}>
   <Img src={image(pic)} style={wide?{position:'absolute',width:960,height:990,objectFit:'cover',objectPosition:`${x*100}% ${y*100}%`,scale:interpolate(f,[0,180],[1,1.035],ease)}:{position:'absolute',width:w,height:h,maxWidth:'none',left,top,filter:'saturate(.95) contrast(1.035)'}}/>
   {target&&<svg width="960" height="990" style={{position:'absolute',inset:0,opacity:interpolate(f,[10,23],[0,1],ease)}}>
    <ellipse cx={tx} cy={ty} rx={pic==='06'?110:pic==='03'?(y>.8?340:110):190} ry={pic==='06'?110:pic==='03'?(y>.8?155:220):130} fill="none" stroke={GOLD} strokeWidth="5" strokeDasharray="12 7"/>
    <path d={`M${tx+100} ${ty-115}l65 -80h100`} fill="none" stroke={GOLD} strokeWidth="4"/>
   </svg>}
   {flood&&<Flood/>}
   {!flood&&<div style={{position:'absolute',left:24,bottom:22,fontSize:20,letterSpacing:2,color:'#fff',textShadow:'0 2px 6px #000',background:'#081512c9',padding:'9px 13px'}}>MOUNT KALAGA • IMAGEM ORIGINAL</div>}
  </div>
  {note&&<div style={{position:'absolute',left:65,right:65,top:1456,fontSize:27,color:accent,letterSpacing:.4}}>{note}</div>}
 </AbsoluteFill>;
}

function Captions(){
 const f=useCurrentFrame();const {fps}=useVideoConfig();const ms=f/fps*1000;
 const page=pages.find(p=>ms>=p.startMs&&ms<p.endMs+65);
 if(!page)return null;
 return <div style={{position:'absolute',left:75,right:75,top:1550,minHeight:150,display:'flex',alignItems:'center',justifyContent:'center'}}>
  <div style={{fontSize:51,fontWeight:800,lineHeight:1.18,textAlign:'center',textShadow:'0 4px 10px #000',background:'#081512d9',borderRadius:16,padding:'18px 25px'}}>{page.words.map((w,i)=><span key={i} style={{color:ms>=w.startMs&&ms<w.endMs+30?GOLD:'#fff'}}>{w.text}{' '}</span>)}</div>
 </div>;
}

function CTA(){
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const pop=spring({frame:f-8,fps,config:{damping:15}});
 return <div style={{position:'absolute',left:150,top:1080,width:780,scale:pop,padding:'32px 30px',borderRadius:25,background:'#081512f2',border:`2px solid ${MINT}`,boxShadow:'0 15px 60px #0008',textAlign:'center'}}>
  <svg width="82" height="82" viewBox="0 0 100 100" style={{verticalAlign:'middle',marginRight:22,rotate:`${interpolate(f,[0,20,35],[0,-14,0],ease)}deg`}}><path d="M36 43L53 14q13-5 10 13l-3 16h22q12 1 7 15l-10 29H36ZM13 43h16v44H13Z" fill={GOLD}/></svg>
  <span style={{fontSize:48,color:GOLD}}>CURTIU O DETALHE?</span>
  <div style={{marginTop:25,fontSize:40,color:f>45?MINT:'#fff',padding:'18px 0',borderTop:'1px solid #ffffff35'}}>{f>45?'✓ SEGUINDO • CLIPRUSH':'+ SEGUIR CLIPRUSH'}</div>
  {Array.from({length:7},(_,i)=><div key={i} style={{position:'absolute',left:390+Math.cos(i)*f*2,top:45+Math.sin(i)*f*1.4,width:7,height:7,borderRadius:9,background:GOLD,opacity:interpolate(f,[10,22,40],[0,1,0],ease)}}/>)}
 </div>;
}

export const ClipRush021:React.FC=()=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:INK,color:'white',fontFamily:'Arial, sans-serif'}}>
  <Audio src={staticFile('videos/video-021/audio/narracao.mp3')}/>
  <Sequence name="Gancho: placa à esquerda" durationInFrames={174}><Shot pic="06" label="GTA VI / O DETALHE ESTÁ AQUI" title="Essa placa mede enchentes." x={.09} y={.32} zoom={3.1} endZoom={3.5} target note="FLOOD GAUGE = MEDIDOR DE ENCHENTE"/></Sequence>
  <Sequence name="Contexto: caiaque e parque" from={174} durationInFrames={189}><Shot pic="06" label="01 / MOUNT KALAGA" title="Bem ao lado do caiaque." x={.31} y={.56} zoom={1.87} endZoom={1.9} note="A placa está na margem esquerda da imagem."/></Sequence>
  <Sequence name="Motos: plano de contexto" from={363} durationInFrames={57}><Shot pic="01" label="02 / OLHE MAIS PERTO" title="Entre as pedras…" x={.29} y={.5} zoom={1.9} endZoom={2.1}/></Sequence>
  <Sequence name="Prova: animal avermelhado" from={420} durationInFrames={90}><Shot pic="01" label="02 / DETALHE AMPLIADO" title="Um pequeno animal." x={.079} y={.635} zoom={3.8} endZoom={4.3} target note="Espécie não confirmada nesta imagem."/></Sequence>
  <Sequence name="Caçadores: contexto" from={510} durationInFrames={57}><Shot pic="03" label="03 / NO MEIO DA FLORESTA" title="Repara nessa árvore." x={.32} y={.58} zoom={1.88} endZoom={2.0}/></Sequence>
  <Sequence name="Prova: animal no tronco direito" from={567} durationInFrames={90}><Shot pic="03" label="03 / TRONCO À DIREITA" title="Quase passou despercebido." x={.904} y={.575} zoom={4.2} endZoom={4.6} target note="Pequeno animal agarrado ao tronco."/></Sequence>
  <Sequence name="Possível cervídeo: identificação cautelosa" from={657} durationInFrames={129}><Shot pic="03" label="04 / CAMUFLADO NO PRIMEIRO PLANO" title="Parece um cervo." x={.55} y={.87} zoom={2.9} endZoom={3.05} target note="Possível cervídeo • identificação incerta."/></Sequence>
  <Sequence name="Retorno ao cenário" from={786} durationInFrames={63}><Shot pic="03" label="MOUNT KALAGA / CADA DETALHE CONTA" title="Vida escondida no cenário." x={.48} y={.6} zoom={1.9} endZoom={2}/></Sequence>
  <Sequence name="CTA na fala original" from={849} durationInFrames={123}><Shot pic="01" label="CLIPRUSH / OLHAR DE PERTO" title="Você teria percebido?" x={.25} y={.54} zoom={1.9} endZoom={2}/><CTA/></Sequence>
  <Sequence name="Retorno à placa" from={972} durationInFrames={78}><Shot pic="06" label="DE VOLTA À PRIMEIRA PISTA" title="E se o nível subir?" x={.09} y={.4} zoom={2.9} endZoom={3.15} target note="A presença da placa é visível. A mecânica não está confirmada."/></Sequence>
  <Sequence name="Teoria: simulação gráfica de enchente" from={1050} durationInFrames={327}><Shot pic="06" label="HIPÓTESE / NÃO CONFIRMADA" title="Rios subindo. Rotas mudando?" x={.22} y={.5} zoom={1.9} endZoom={2.05} flood note="Visualização ilustrativa • não confirma recurso do jogo."/></Sequence>
  <Captions/>
  <div style={{position:'absolute',top:91,left:65,right:65,display:'flex',justifyContent:'space-between',fontSize:22,letterSpacing:4,color:'#d0ded6'}}><span>CLIPRUSH</span><span>ARQUIVO 021</span></div>
  <div style={{position:'absolute',bottom:95,left:65,color:'#76968a',fontSize:20,letterSpacing:3}}>GTA VI / DETALHES DE MOUNT KALAGA</div>
  <Sequence from={30*fps} durationInFrames={6}><Audio src={staticFile('videos/video-021/audio/click.wav')} volume={.2}/></Sequence>
 </AbsoluteFill>;
};
