import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const cyan='#72ece7';
const media=(name:string)=>staticFile(`videos/video-028/footage/${name}`);
const Shot:React.FC<{file:string;trim:number;duration:number;title:string;kicker:string;focus?:number;zoom?:number;timecode:string;warning?:boolean}> = ({file,trim,duration,title,kicker,focus=50,zoom=1,timecode,warning=false})=>{
 const f=useCurrentFrame();
 const scale=interpolate(f,[0,duration],[zoom,zoom+.055],{extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:'#080f18',overflow:'hidden'}}>
  <OffthreadVideo src={media(file+'-clean.mp4')} trimBefore={trim} muted style={{width:'100%',height:'100%',objectFit:'cover',filter:'blur(44px) brightness(.22)',transform:'scale(1.12)'}}/>
  <AbsoluteFill style={{background:'linear-gradient(180deg,#080f18dc,transparent 40%,#080f18 91%)'}}/>
  <div style={{position:'absolute',left:64,top:138,display:'flex',alignItems:'center',gap:17}}>
   <div style={{height:10,width:10,borderRadius:8,background:cyan}}/><span style={{color:cyan,fontWeight:700,fontSize:23,letterSpacing:4}}>CLIPRUSH / INVESTIGA</span>
  </div>
  <div style={{position:'absolute',left:64,right:64,top:207,color:'#fff',fontSize:67,lineHeight:1.06,letterSpacing:-2,fontWeight:900}}>{title}</div>
  <div style={{position:'absolute',left:68,top:302,color:'#b4c5cf',fontSize:25,letterSpacing:3,fontWeight:700}}>{kicker}</div>
  <div style={{position:'absolute',top:390,left:0,width:1080,height:1020,overflow:'hidden'}}>
   <OffthreadVideo src={media(file+'-clean.mp4')} trimBefore={trim} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${focus}% 50%`,transform:`scale(${scale})`}}/>
   <AbsoluteFill style={{background:'linear-gradient(0deg,#080f18a0,transparent 13%,transparent 90%,#080f1840)'}}/>
   <div style={{position:'absolute',left:38,top:28,width:40,height:40,borderLeft:`2px solid ${cyan}aa`,borderTop:`2px solid ${cyan}aa`}}/>
   <div style={{position:'absolute',right:38,bottom:28,width:40,height:40,borderRight:`2px solid ${cyan}aa`,borderBottom:`2px solid ${cyan}aa`}}/>
  </div>
  <div style={{position:'absolute',left:64,top:1440,color:warning?'#f4b3a4':'#9cb5c2',fontSize:20,fontWeight:700,letterSpacing:2}}>TRECHO ORIGINAL · {timecode}</div>
 </AbsoluteFill>;
};

// The narration remains on its original clock; short pages follow real word timings.
const groups:Caption[][]=[];
let page:Caption[]=[];
for(const word of words as Caption[]){
 if(page.length&&(page.length>=4||word.startMs-page[page.length-1].endMs>300)){groups.push(page);page=[];}
 page.push(word);
 if(/[.!?]$/.test(word.text.trim())){groups.push(page);page=[];}
}
if(page.length)groups.push(page);
const Captions:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();const ms=f/fps*1000;
 const g=groups.find(p=>ms>=p[0].startMs&&ms<p[p.length-1].endMs+75);
 if(!g)return null;
 return <div style={{position:'absolute',top:1515,left:62,right:62,minHeight:170,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
  <div style={{color:'#fff',fontSize:65,lineHeight:1.17,fontWeight:900,letterSpacing:-1,textShadow:'0 3px 12px #000, 0 0 3px #000'}}>{g.map((w,i)=><React.Fragment key={w.startMs}>{i>0?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs+75?cyan:'#fff'}}>{w.text.trim()}</span></React.Fragment>)}</div>
 </div>;
};
const CTA:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const pop=spring({frame:f,fps,config:{damping:16,stiffness:180}});
 const clicked=f>=15;
 return <div style={{position:'absolute',left:115,right:115,top:1170,display:'flex',alignItems:'center',gap:22,padding:'22px 32px',background:'#0a1927f2',border:`2px solid ${cyan}`,borderRadius:25,transform:`translateY(${(1-pop)*55}px) scale(${.94+.06*pop})`,opacity:interpolate(f,[0,5,53,60],[0,1,1,0],{extrapolateRight:'clamp'})}}>
  <svg width="66" height="66" viewBox="0 0 24 24" fill={clicked?cyan:'none'} stroke={cyan} strokeWidth="1.6"><path d="M7 10v11H3V10h4Zm0 1 5-8c2-1 3 1 2 4l-1 3h6c2 0 2 2 1 5l-2 6H7Z"/></svg>
  <div style={{fontWeight:800,fontSize:32,color:'#fff'}}>CURTIR <span style={{color:cyan}}>+ SEGUIR</span><div style={{fontSize:21,color:'#a9c1cc',marginTop:6}}>{clicked?'✓ ClipRush · mais descobertas':'ClipRush'}</div></div>
  <div style={{position:'absolute',right:30,top:21,fontSize:39,color:cyan,transform:`scale(${clicked?1.12:1})`}}>{clicked?'✓':'+'}</div>
 </div>;
};
const MotorEvidence:React.FC=()=>{
 const f=useCurrentFrame();
 return <div style={{position:'absolute',left:100,right:100,top:550,padding:'22px 30px',background:'#08131fed',border:`1px solid ${cyan}99`,borderRadius:16,opacity:interpolate(f,[0,6,91,102],[0,1,1,0],{extrapolateRight:'clamp'})}}>
  <div style={{fontSize:21,fontWeight:700,color:cyan,letterSpacing:2,marginBottom:12}}>AVISO ORIGINAL DO JOGO</div>
  <Img src={media('motor-notice.png')} style={{width:760,height:'auto'}}/>
 </div>;
};
const Progress:React.FC=()=>{const f=useCurrentFrame();return <div style={{position:'absolute',left:64,right:64,bottom:130,height:3,background:'#ffffff20'}}><div style={{height:3,width:`${f/1508*100}%`,background:cyan}}/></div>;};

export const ClipRush028:React.FC=()=> <AbsoluteFill style={{background:'#080f18',fontFamily:'Arial, sans-serif'}}>
 <Sequence durationInFrames={45} name="Gancho · barco no limite"><Shot file="motor" trim={165} duration={45} title="O FIM DO MAPA" kicker="O QUE ACONTECE LÁ?" timecode="14:55" zoom={1.06}/></Sequence>
 <Sequence from={45} durationInFrames={63} name="Gancho · salto"><Shot file="jump" trim={66} duration={63} title="O FIM DO MAPA" kicker="O QUE ACONTECE LÁ?" timecode="15:03" focus={20}/></Sequence>
 <Sequence from={108} durationInFrames={120} name="Início da viagem"><Shot file="boarding" trim={60} duration={120} title="RUMO AO LIMITE" kicker="A VIAGEM COMEÇA" timecode="03:04" focus={67}/></Sequence>
 <Sequence from={228} durationInFrames={114} name="Oceano aberto"><Shot file="ocean" trim={0} duration={114} title="SÓ OCEANO" kicker="A COSTA FICA PARA TRÁS" timecode="09:15"/></Sequence>
 <Sequence from={342} durationInFrames={60} name="Cidade no horizonte"><Shot file="ocean" trim={330} duration={60} title="CADA VEZ MAIS LONGE" kicker="OLHE O HORIZONTE" timecode="09:26" zoom={1.09} focus={47}/></Sequence>
 <Sequence from={402} durationInFrames={69} name="Prova · posição no mapa"><Shot file="map" trim={90} duration={69} title="NO LIMITE DO MAPA" kicker="A POSIÇÃO NO OCEANO" timecode="13:19" zoom={1.03} focus={0}/></Sequence>
 <Sequence from={471} durationInFrames={69} name="Navegação ao pôr do sol"><Shot file="edge" trim={0} duration={69} title="ALGO MUDA AQUI" kicker="A ÚLTIMA PARTE DA VIAGEM" timecode="14:30"/></Sequence>
 <Sequence from={540} durationInFrames={162} name="Pane · barco"><Shot file="motor" trim={0} duration={162} title="O MOTOR PARA" kicker="OBSERVE O BARCO" timecode="14:50" focus={0} zoom={1.04}/><Sequence from={45} durationInFrames={102}><MotorEvidence/></Sequence></Sequence>
 <Sequence from={702} durationInFrames={102} name="CTA · pôr do sol"><Shot file="edge" trim={420} duration={102} title="FIM DA VIAGEM?" kicker="AINDA TEM MAIS" timecode="14:44"/></Sequence>
 <Sequence from={804} durationInFrames={126} name="Jason sai do barco"><Shot file="jump" trim={0} duration={126} title="E AGORA, NA ÁGUA?" kicker="DO BARCO AO OCEANO" timecode="15:01" focus={20}/></Sequence>
 <Sequence from={930} durationInFrames={114} name="Nenhum tubarão visível"><Shot file="jump" trim={195} duration={114} title="CADÊ O TUBARÃO?" kicker="NESTE TRECHO, NENHUM APARECE" timecode="15:07" focus={46}/></Sequence>
 <Sequence from={1044} durationInFrames={192} name="Dano e morte reais"><Shot file="death" trim={0} duration={192} title="O DESFECHO" kicker="A SEQUÊNCIA ORIGINAL" timecode="15:16 → 15:22" focus={0} warning/></Sequence>
 <Sequence from={1236} durationInFrames={273} name="Encerramento · oceano"><Shot file="closing" trim={0} duration={273} title="E VOCÊ?" kicker="TUBARÃO OU MISTÉRIO?" timecode="14:08" zoom={1.02}/></Sequence>
 <Audio src={staticFile('videos/video-028/audio/narracao.mp3')}/>
 <Sequence from={744} durationInFrames={60} name="Curtir e seguir"><CTA/></Sequence>
 <Sequence from={759} durationInFrames={3} name="Clique discreto"><Audio src={media('click.wav')} volume={0.35}/></Sequence>
 <Captions/><Progress/>
</AbsoluteFill>;
