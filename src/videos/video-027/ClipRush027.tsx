import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const media = (name: string) => staticFile(`videos/video-027/footage/${name}`);
const pink = '#ff57b0';

const Shot: React.FC<{file:string; trim:number; duration:number; label:string; focus?:number; zoom?:number; detail?:boolean}> = ({file,trim,duration,label,focus=50,zoom=1,detail=false}) => {
 const f=useCurrentFrame();
 const scale=interpolate(f,[0,duration],[zoom,zoom+0.065],{extrapolateRight:'clamp'});
 return <AbsoluteFill style={{overflow:'hidden',background:'#090c11'}}>
  <OffthreadVideo src={media(file)} trimBefore={trim} muted style={{position:'absolute',width:'100%',height:'100%',objectFit:'cover',filter:'blur(35px) brightness(.32)',transform:'scale(1.15)'}} />
  <div style={{position:'absolute',top:detail?340:255,left:0,width:1080,height:detail?1090:1230,overflow:'hidden'}}>
   <OffthreadVideo src={media(file)} trimBefore={trim} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${focus}% 50%`,transform:`scale(${scale})`}} />
   <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(5,8,12,.65),transparent 22%,transparent 83%,rgba(5,8,12,.22))'}} />
  </div>
  <div style={{position:'absolute',top:126,left:62,right:62,display:'flex',alignItems:'center',gap:18}}>
   <div style={{width:8,height:48,background:pink}} />
   <div style={{color:'white',fontSize:33,fontWeight:800,letterSpacing:3}}>{label}</div>
  </div>
  <div style={{position:'absolute',top:194,left:88,color:'#aeb7c4',fontSize:20,fontWeight:600,letterSpacing:4}}>CLIPRUSH / EM DETALHE</div>
 </AbsoluteFill>;
};
const Captions: React.FC = () => {
 const frame=useCurrentFrame();const time=frame/30*1000;
 const captions:Caption[]=words;
 const index=captions.findIndex(w=>time>=w.startMs && time<w.endMs+65);
 if(index<0)return null;
 // Stable pages: split at punctuation, pauses or four-word groups.
 const groups:Caption[][]=[];let group:Caption[]=[];
 for(const w of captions){
  if(group.length && (group.length>=4 || w.startMs-group[group.length-1].endMs>350)){groups.push(group);group=[];}
  group.push(w);if(/[.!?]$/.test(w.text.trim())){groups.push(group);group=[];}
 }
 if(group.length)groups.push(group);
 const page=groups.find(g=>time>=g[0].startMs && time<g[g.length-1].endMs+65);
 if(!page)return null;
 return <div style={{position:'absolute',left:70,right:70,top:1510,minHeight:170,display:'flex',justifyContent:'center',alignItems:'center',textAlign:'center'}}>
  <div style={{fontSize:64,lineHeight:1.14,fontWeight:900,textShadow:'0 3px 12px #000, 0 0 3px #000',letterSpacing:-1}}>{page.map((w,i)=><React.Fragment key={w.startMs}>{i>0?' ':''}<span style={{color:time>=w.startMs && time<w.endMs+65?pink:'#fff'}}>{w.text.trim()}</span></React.Fragment>)}</div>
 </div>;
};
const Evidence: React.FC = () => {
 const f=useCurrentFrame();return <div style={{position:'absolute',top:1040,left:72,right:72,padding:20,background:'#090c11ec',border:`2px solid ${pink}`,borderRadius:16,opacity:interpolate(f,[0,6,126,146],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>
  <div style={{fontSize:21,color:pink,fontWeight:800,letterSpacing:2,marginBottom:15}}>AVISO ORIGINAL DO JOGO</div>
  <Img src={media('aviso.png')} style={{width:'100%',height:'auto'}} />
 </div>;
};
export const ClipRush027:React.FC=()=> <AbsoluteFill style={{fontFamily:'Arial, sans-serif',background:'#090c11'}}>
 <Sequence durationInFrames={78} name="Gancho • tinta rosa"><Shot file="explosao-clean.mp4" detail trim={150} duration={78} label="O DETALHE ROSA" focus={40} zoom={1.02}/></Sequence>
 <Sequence from={78} durationInFrames={120} name="Contexto • assalto"><Shot file="assalto-clean.mp4" trim={0} duration={120} label="O ASSALTO" focus={58}/></Sequence>
 <Sequence from={198} durationInFrames={129} name="Coleta • dinheiro"><Shot file="assalto-clean.mp4" trim={240} duration={129} label="O DINHEIRO" focus={63}/></Sequence>
 <Sequence from={327} durationInFrames={126} name="Deslocamento • despiste"><Shot file="despiste-clean.mp4" trim={0} duration={126} label="O DESPISTE" focus={20}/></Sequence>
 <Sequence from={453} durationInFrames={132} name="Prova • explosão"><Shot file="explosao-clean.mp4" detail trim={111} duration={132} label="A TINTA EXPLODE" focus={37}/></Sequence>
 <Sequence from={585} durationInFrames={147} name="Prova • descrição"><Shot file="tinta-clean.mp4" trim={0} duration={147} label="A DESCRIÇÃO DA LÚCIA" focus={50}/><Evidence/></Sequence>
 <Sequence from={732} durationInFrames={108} name="Revisão • assalto"><Shot file="assalto-clean.mp4" trim={510} duration={108} label="REVEJA O ASSALTO" focus={62} zoom={1.05}/></Sequence>
 <Sequence from={840} durationInFrames={90} name="Saída do assalto"><Shot file="assalto-clean.mp4" trim={642} duration={90} label="A SAÍDA" focus={68}/></Sequence>
 <Sequence from={930} durationInFrames={85} name="Tentativa junto ao carro"><Shot file="tentativa-clean.mp4" trim={0} duration={85} label="TENTATIVA DE FUGA" focus={50}/></Sequence>
 <Sequence from={1015} durationInFrames={90} name="Encerramento • corrida"><Shot file="tinta-clean.mp4" trim={210} duration={90} label="E NO MUNDO ABERTO?" focus={50}/></Sequence>
 <Audio src={staticFile('videos/video-027/audio/narracao.mp3')}/>
 <Captions/>
 <div style={{position:'absolute',bottom:125,left:70,right:70,height:3,background:'#ffffff24'}}><Progress/></div>
</AbsoluteFill>;
const Progress: React.FC=()=>{const f=useCurrentFrame();return <div style={{height:3,width:`${f/1104*100}%`,background:pink}}/>;};
