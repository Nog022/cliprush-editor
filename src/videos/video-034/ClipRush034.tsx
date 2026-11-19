import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const gold = '#f4d788';
const source = staticFile('videos/biblioteca/gta6/videos/novidadesGta6/ovo_de_pascoa_encima_da_torre_de_radio.mp4');
const pages: Caption[][] = [];
let page: Caption[] = [];
for (const word of words as Caption[]) {
  if (page.length && (page.length >= 4 || word.startMs - page[page.length - 1].endMs > 280)) {pages.push(page); page = [];}
  page.push(word);
  if (/[.!?,]$/.test(word.text.trim())) {pages.push(page); page = [];}
}
if (page.length) pages.push(page);

const Captions: React.FC = () => {
  const ms = useCurrentFrame() / useVideoConfig().fps * 1000;
  const active = pages.find(p => ms >= p[0].startMs && ms < p[p.length - 1].endMs + 90);
  if (!active) return null;
  return <div style={{position:'absolute',top:1465,left:85,right:85,textAlign:'center',fontSize:64,fontWeight:800,lineHeight:1.2,letterSpacing:-1,textShadow:'0 3px 14px #000'}}>
    {active.map((w,i)=><React.Fragment key={i}>{i>0?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs?gold:'#fff'}}>{w.text.trim()}</span></React.Fragment>)}
  </div>;
};

const Shot: React.FC<{start:number;length:number;title:string;label:string;index:string;focus?:number;rate?:number;zoom?:number}> = ({start,length,title,label,index,focus=53,rate=1,zoom=1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background:'radial-gradient(ellipse at 90% 4%,#303e4a,#121b26 48%,#080d16)'}}>
    <div style={{position:'absolute',left:80,top:110,fontSize:26,fontWeight:800,letterSpacing:5,color:gold}}>CLIPRUSH <span style={{color:'#a3aebb',fontWeight:500}}>/ DETALHES</span></div>
    <div style={{position:'absolute',right:80,top:110,color:'#7e8b98',fontSize:26,letterSpacing:2}}>{index} / 10</div>
    <div style={{position:'absolute',left:80,top:199,right:75,fontSize:86,lineHeight:1.02,letterSpacing:-3,fontWeight:900,whiteSpace:'pre-line',translate:`0px ${interpolate(frame,[0,11],[18,0],{extrapolateRight:'clamp'})}px`,opacity:interpolate(frame,[0,6],[.4,1],{extrapolateRight:'clamp'})}}>{title}</div>
    <div style={{position:'absolute',top:450,left:0,width:1080,height:930,overflow:'hidden',background:'#18222a',boxShadow:'0 24px 80px #0008'}}>
      <OffthreadVideo src={source} trimBefore={Math.round(start*fps)} playbackRate={rate} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${focus}% 50%`,scale:interpolate(frame,[0,length],[zoom,zoom+.022],{extrapolateRight:'clamp'}),transformOrigin:`${focus}% 50%`,filter:'brightness(1.055) contrast(1.045) saturate(.95)'}}/>
      <AbsoluteFill style={{background:'linear-gradient(180deg,#080d1640,transparent 17%,transparent 86%,#080d16a8)'}}/>
      <div style={{position:'absolute',left:45,top:30,padding:'10px 17px',background:'#111a23dc',borderLeft:`3px solid ${gold}`,fontSize:25,fontWeight:750,letterSpacing:2,color:gold}}>{label}</div>
    </div>
    <div style={{position:'absolute',top:1418,left:80,right:80,height:2,background:'#f4d78833'}}/>
    <div style={{position:'absolute',left:80,top:1760,color:'#9da9b8',fontSize:24,lineHeight:1.5}}>CLIPE FORNECIDO • ORIGEM NÃO VERIFICADA<br/>Gameplay oficial de GTA 6 não confirmado</div>
  </AbsoluteFill>;
};

const CTA: React.FC<{follow?:boolean}> = ({follow=false}) => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const scale=spring({frame,fps,config:{damping:17,stiffness:220}});
  return <div style={{position:'absolute',left:260,top:1635,width:560,height:85,borderRadius:44,border:`1px solid ${gold}99`,background:'#30343cf5',color:gold,fontSize:31,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:20,scale,opacity:interpolate(frame,[0,4,46,58],[0,1,1,0],{extrapolateRight:'clamp'})}}>
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{follow?<path d={frame>19?'m5 12 4 4L19 6':'M12 4v16M4 12h16'}/>:<path d="M7 10v11H3V10h4Zm0 0 5-8c2 0 3 2 2 5l-1 3h6c2 0 3 1 2 3l-2 7c0 1-1 1-2 1H7"/>}</svg>
    {follow?(frame>19?'SEGUINDO':'SEGUE O CLIPRUSH'):(frame>17?'CURTIDO!':'DEIXA O LIKE')}
    {!follow && Array.from({length:6},(_,i)=><div key={i} style={{position:'absolute',left:68+Math.cos(i*Math.PI/3)*frame*1.5,top:38+Math.sin(i*Math.PI/3)*frame*1.5,width:6,height:6,borderRadius:4,background:gold,opacity:interpolate(frame,[8,16,29],[0,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/>)}
  </div>;
};

export const ClipRush034: React.FC = () => <AbsoluteFill style={{fontFamily:'Arial, sans-serif',color:'#f8f7f1',background:'#080d16'}}>
  <Sequence durationInFrames={90} name="Gancho · torre vista do alto"><Shot index="01" start={35.5} length={90} title={'UM OVO NO\nTOPO DA TORRE'} label="UM ESCONDERIJO IMPROVÁVEL" focus={50}/></Sequence>
  <Sequence from={90} durationInFrames={108} name="Pista · ninho e ovos"><Shot index="02" start={0} length={108} title={'ESCONDIDO\nLÁ EM CIMA'} label="OLHE PARA O NINHO" focus={58}/></Sequence>
  <Sequence from={198} durationInFrames={119} name="Suspense · ovo nas mãos"><Shot index="03" start={16.5} length={119} rate={.65} title={'E SE JOGAR\nLÁ DE CIMA?'} label="ACOMPANHE O OVO" focus={49}/></Sequence>
  <Sequence from={317} durationInFrames={181} name="Descoberta · aproximação do ninho"><Shot index="04" start={3.6} length={181} title={'UM NINHO\nNAS ALTURAS'} label="O DETALHE ESTÁ NO TOPO" focus={60} zoom={1.06}/></Sequence>
  <Sequence from={498} durationInFrames={135} name="Interação · pegar o ovo"><Shot index="05" start={10} length={135} title={'DÁ PARA\nPEGAR O OVO'} label="NÃO É SÓ DECORAÇÃO" focus={58}/></Sequence>
  <Sequence from={633} durationInFrames={159} name="Ação · segurar e arremessar"><Shot index="06" start={17.8} length={159} rate={.8} title={'ELE REALMENTE\nARREMESSOU'} label="DO TOPO DA TORRE" focus={49}/></Sequence>
  <Sequence from={792} durationInFrames={114} name="Queda · ovo em direção à cidade"><Shot index="07" start={22.04} length={114} rate={.9} title={'DIRETO PARA\nA CIDADE'} label="AGORA OLHE LÁ EMBAIXO" focus={51}/></Sequence>
  <Sequence from={906} durationInFrames={90} name="Revelação · impacto no carro"><Shot index="08" start={29} length={90} rate={.9} title={'EM CIMA\nDE UM CARRO'} label="O DESTINO DO OVO" focus={50}/></Sequence>
  <Sequence from={996} durationInFrames={162} name="Reação · motorista e estrago"><Shot index="09" start={31.7} length={162} rate={.7} title={'IMAGINA\nESSE SUSTO'} label="UM PASSEIO INTERROMPIDO" focus={40}/></Sequence>
  <Sequence from={1158} durationInFrames={183} name="Encerramento · retorno ao ninho"><Shot index="10" start={38} length={183} rate={.5} title={'VOCÊ TINHA\nREPARADO?'} label="MAIS DETALHES NO CLIPRUSH" focus={56}/></Sequence>
  <Audio src={staticFile('videos/video-034/audio/narracao.mp3')}/>
  <Captions/>
  <Sequence from={1185} durationInFrames={60} name="CTA · curtir"><CTA/><Audio src={staticFile('videos/video-034/audio/click.wav')} volume={.23}/></Sequence>
  <Sequence from={1252} durationInFrames={60} name="CTA · seguir"><CTA follow/><Audio src={staticFile('videos/video-034/audio/click.wav')} volume={.17}/></Sequence>
</AbsoluteFill>;
