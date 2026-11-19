import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const aqua = '#8ee7d2';
const source = staticFile('videos/biblioteca/gta6/videos/novidadesGta6/jason_andando_de_jetski_com_cachorro.mp4');
const pages: Caption[][] = [];
let page: Caption[] = [];
for (const word of words as Caption[]) {
  if (page.length && (page.length >= 4 || word.startMs - page[page.length - 1].endMs > 300)) {pages.push(page); page = [];}
  page.push(word);
  if (/[.!?,]$/.test(word.text.trim())) {pages.push(page); page = [];}
}
if (page.length) pages.push(page);

const Captions: React.FC = () => {
  const ms = useCurrentFrame() / useVideoConfig().fps * 1000;
  const active = pages.find(p => ms >= p[0].startMs && ms < p[p.length - 1].endMs + 100);
  if (!active) return null;
  return <div style={{position:'absolute',top:1485,left:85,right:85,textAlign:'center',fontSize:65,fontWeight:800,lineHeight:1.2,letterSpacing:-1,textShadow:'0 3px 14px #000'}}>
    {active.map((w,i)=><React.Fragment key={i}>{i>0?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs?aqua:'#fff'}}>{w.text.trim()}</span></React.Fragment>)}
  </div>;
};

const Shot: React.FC<{start:number;length:number;title:string;label:string;zoom?:number;focus?:number;rate?:number}> = ({start,length,title,label,zoom=1,focus=52,rate=.7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background:'radial-gradient(ellipse at 85% 20%,#25494b,#0c232b 52%,#07151d)'}}>
    <div style={{position:'absolute',left:80,top:112,fontSize:25,fontWeight:800,letterSpacing:5,color:aqua}}>CLIPRUSH <span style={{color:'#a9bfc1',fontWeight:500}}>/ EM FOCO</span></div>
    <div style={{position:'absolute',top:198,left:80,right:75,fontSize:86,fontWeight:900,lineHeight:1.04,letterSpacing:-3,whiteSpace:'pre-line',translate:`0px ${interpolate(frame,[0,10],[14,0],{extrapolateRight:'clamp'})}px`}}>{title}</div>
    <div style={{position:'absolute',top:430,left:0,width:1080,height:990,overflow:'hidden',background:'#102832',boxShadow:'0 25px 70px #0008'}}>
      <OffthreadVideo src={source} trimBefore={Math.round(start*fps)} playbackRate={rate} muted style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${focus}% 78%`,scale:interpolate(frame,[0,length],[zoom,zoom+.025],{extrapolateRight:'clamp'}),transformOrigin:'58% 80%',filter:'brightness(1.045) contrast(1.035) saturate(.95)'}}/>
      <AbsoluteFill style={{background:'linear-gradient(180deg,#0b1d2870,transparent 20%,transparent 92%,#0b1d2855)'}}/>
      <div style={{position:'absolute',left:45,top:33,padding:'10px 17px',background:'#0a2028db',borderLeft:`3px solid ${aqua}`,fontSize:25,fontWeight:750,letterSpacing:2,color:aqua}}>{label}</div>
    </div>
    <div style={{position:'absolute',top:1452,left:80,right:80,height:2,background:'#8ee7d232'}}/>
    <div style={{position:'absolute',left:80,top:1760,color:'#a2b7bd',fontSize:24,lineHeight:1.5}}>CLIPE FORNECIDO • ORIGEM NÃO VERIFICADA<br/>Gameplay oficial de GTA 6 não confirmado</div>
  </AbsoluteFill>;
};

const Follow: React.FC = () => {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const scale=spring({frame,fps,config:{damping:18,stiffness:200}});
  return <div style={{position:'absolute',left:285,top:1630,width:510,height:82,borderRadius:44,border:`1px solid ${aqua}99`,background:'#143b40f5',color:aqua,fontSize:30,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:20,scale,opacity:interpolate(frame,[0,4,49,60],[0,1,1,0],{extrapolateRight:'clamp'})}}><span style={{fontSize:40}}>{frame>18?'✓':'+'}</span>{frame>18?'SEGUINDO':'SEGUE O CLIPRUSH'}</div>;
};

export const ClipRush033: React.FC = () => <AbsoluteFill style={{fontFamily:'Arial, sans-serif',color:'#f5f8f5',background:'#07151d'}}>
  <Sequence durationInFrames={132} name="Passeio · cachorro no jetski"><Shot start={0} length={132} title={'O PASSAGEIRO\nMAIS INUSITADO'} label="UM CACHORRO NO JETSKI"/></Sequence>
  <Sequence from={132} durationInFrames={84} name="Detalhe · passageiro à frente"><Shot start={3.08} length={84} title={'OLHA QUEM VAI\nNA FRENTE'} label="APROXIME O OLHAR" zoom={1.14} focus={58}/></Sequence>
  <Sequence from={216} durationInFrames={87} name="Revelação · óculos e colete"><Shot start={5.04} length={87} title={'DE ÓCULOS\nE COLETE'} label="REPAROU NOS ACESSÓRIOS?" zoom={1.25} focus={62}/></Sequence>
  <Sequence from={303} durationInFrames={63} name="Desfecho · passeio e seguir"><Shot start={7.07} length={63} rate={1.2} title={'ATÉ O CACHORRO\nVEIO EQUIPADO'} label="UM DETALHE CURIOSO"/></Sequence>
  <Audio src={staticFile('videos/video-033/audio/narracao.mp3')}/>
  <Captions/>
  <Sequence from={303} durationInFrames={63} name="CTA seguir · confirmação"><Follow/></Sequence>
</AbsoluteFill>;
