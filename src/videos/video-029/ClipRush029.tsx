import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const gold='#ffd185';
const source=staticFile('videos/biblioteca/gta6/videos/novidadesGta6/jason_vs_gato_no_carro.mp4');
const Shot:React.FC<{start:number;length:number;title:string;label:string;focus?:number;rate?:number;zoom?:number}> = ({start,length,title,label,focus=55,rate=1,zoom=1})=>{
 const f=useCurrentFrame(); const {fps}=useVideoConfig();
 return <AbsoluteFill style={{overflow:'hidden',background:'radial-gradient(ellipse at 70% 30%,#34342a,#101717 58%,#080e10)'}}>
  <div style={{position:'absolute',top:154,left:84,color:gold,fontWeight:700,fontSize:25,letterSpacing:6}}>CLIPRUSH <span style={{color:'#859794'}}> / DETALHES</span></div>
  <div style={{position:'absolute',left:80,right:80,top:239,fontWeight:900,fontSize:87,letterSpacing:-3,lineHeight:1.02,color:'#fff'}}>{title}</div>
  <div style={{position:'absolute',left:84,top:447,fontSize:25,letterSpacing:3,color:gold,fontWeight:700}}>{label}</div>
  <div style={{position:'absolute',left:0,top:530,width:1080,height:890,overflow:'hidden',boxShadow:'0 35px 100px #0008'}}>
   <OffthreadVideo src={source} trimBefore={Math.round(start*fps)} playbackRate={rate} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${focus}% 50%`,filter:start>=16&&start<30?'brightness(1.26) contrast(.90) saturate(.98)':'brightness(1.06) contrast(1.01) saturate(.94)',transform:`scale(${interpolate(f,[0,length],[zoom,zoom+.045],{extrapolateRight:'clamp'})})`}}/>
   <AbsoluteFill style={{background:'linear-gradient(180deg,#10171735,transparent 16%,transparent 85%,#10171785)'}}/>
  </div>
  <div style={{position:'absolute',left:84,right:84,top:1460,height:2,background:'#ffd18535'}}/>
 </AbsoluteFill>;
};

const groups:Caption[][]=[]; let page:Caption[]=[];
for(const word of words as Caption[]){
 if(page.length&&(page.length>=4||word.startMs-page[page.length-1].endMs>300)){groups.push(page);page=[];}
 page.push(word);
 if(/[.!?]$/.test(word.text.trim())){groups.push(page);page=[];}
}
if(page.length)groups.push(page);
const Captions:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const ms=f/fps*1000;
 const g=groups.find(p=>ms>=p[0].startMs&&ms<p[p.length-1].endMs+70);
 if(!g)return null;
 return <div style={{position:'absolute',left:84,right:84,top:1515,height:210,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:65,fontWeight:900,lineHeight:1.13,letterSpacing:-1,color:'#fff',textShadow:'0 4px 12px #000'}}><div>{g.map((w,i)=><React.Fragment key={w.startMs}>{i?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs+65?gold:'#fff'}}>{w.text.trim()}</span></React.Fragment>)}</div></div>;
};
const CTA:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const pop=spring({frame:f,fps,config:{damping:17}});const clicked=f>=16;
 return <div style={{position:'absolute',top:350,left:84,right:84,height:143,borderRadius:24,background:'#ffd185',color:'#172020',display:'flex',alignItems:'center',justifyContent:'center',gap:27,transform:`translateY(${(1-pop)*35}px) scale(${.94+.06*pop})`,opacity:interpolate(f,[0,5,55,63],[0,1,1,0],{extrapolateRight:'clamp'})}}>
  <svg width="63" height="63" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.7" fill={clicked?'#172020':'none'}><path d="M7 10v11H3V10h4Zm0 1 5-8c2-1 3 1 2 4l-1 3h6c2 0 2 2 1 5l-2 6H7Z"/></svg>
  <div style={{fontSize:34,fontWeight:900}}>CURTIR + SEGUIR<div style={{fontSize:23,fontWeight:600,marginTop:7}}>{clicked?'✓ Mais detalhes com o ClipRush':'ClipRush'}</div></div>
  <span style={{fontSize:44,fontWeight:800}}>{clicked?'✓':'+'}</span>
 </div>;
};

export const ClipRush029:React.FC=()=> <AbsoluteFill style={{background:'#101717',fontFamily:'Arial, sans-serif'}}>
 <Sequence durationInFrames={96} name="Gancho · passageiro"><Shot start={17.5} length={96} title="ELE NÃO ESTAVA SOZINHO" label="UM PASSAGEIRO INESPERADO" focus={60}/></Sequence>
 <Sequence from={96} durationInFrames={159} name="Gancho · reação"><Shot start={20} length={159} title="OLHA A REAÇÃO DELE" label="JASON × GATO" focus={65}/></Sequence>
 <Sequence from={255} durationInFrames={120} name="Entrada no carro"><Shot start={0} length={120} title="PARECIA UM ROUBO NORMAL" label="01 / TUDO COMEÇA AQUI" focus={55}/></Sequence>
 <Sequence from={375} durationInFrames={105} name="Condução e descoberta"><Shot start={11.5} length={105} title="ATÉ ELE PERCEBER…" label="02 / ALGO NO BANCO DE TRÁS" focus={55}/></Sequence>
 <Sequence from={480} durationInFrames={123} name="O gato laranja"><Shot start={17.1} length={123} rate={.75} title="UM GATO LARANJA" label="03 / OBSERVE A INTERAÇÃO" focus={61} zoom={1.07}/></Sequence>
 <Sequence from={603} durationInFrames={162} name="Reação e colo"><Shot start={16.1} length={162} rate={1.25} title="O SUSTO. E O COLO." label="CADA GESTO CONTA" focus={64}/></Sequence>
 <Sequence from={765} durationInFrames={93} name="CTA · detalhe"><Shot start={22.6} length={93} rate={.5} title="CURTIU?" label="" focus={63}/></Sequence>
 <Sequence from={858} durationInFrames={174} name="Porta e saída do gato"><Shot start={23.4} length={174} title="A PORTA SE ABRE" label="04 / A CENA CONTINUA" focus={66}/></Sequence>
 <Sequence from={1032} durationInFrames={156} name="Reprise · interação"><Shot start={18.2} length={156} rate={.8} title="ATÉ NOS PEQUENOS GESTOS" label="REPRISE / O DETALHE EM FOCO" focus={64} zoom={1.1}/></Sequence>
 <Sequence from={1188} durationInFrames={213} name="Encerramento · outras descobertas"><Shot start={30.6} length={213} title="O QUE MAIS FALTA?" label="A PRÓXIMA DESCOBERTA…" focus={52}/></Sequence>
 <Audio src={staticFile('videos/video-029/audio/narracao.mp3')}/>
 <Captions/>
 <Sequence from={795} durationInFrames={63} name="Curtir e seguir animado"><CTA/></Sequence>
 <Sequence from={811} durationInFrames={4} name="Feedback sonoro"><Audio src={staticFile('videos/video-029/audio/click.wav')} volume={.22}/></Sequence>
</AbsoluteFill>;
