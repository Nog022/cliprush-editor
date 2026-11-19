import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Caption} from '@remotion/captions';
import words from './words.json';

const source = staticFile('videos/biblioteca/gta6/videos/novidadesGta6/jason_roubando_um_aviao_comercial.mp4');
const gold = '#f1ce8c';
const pages: Caption[][] = [];
let page: Caption[] = [];
for (const word of words as Caption[]) {
  if (page.length && (page.length >= 4 || word.startMs - page[page.length - 1].endMs > 350)) {pages.push(page); page = [];}
  page.push(word);
  if (/[.!?]$/.test(word.text.trim())) {pages.push(page); page = [];}
}
if (page.length) pages.push(page);

const Captions: React.FC = () => {
  const ms = useCurrentFrame() / useVideoConfig().fps * 1000;
  const active = pages.find(p => ms >= p[0].startMs && ms < p[p.length - 1].endMs + 90);
  if (!active) return null;
  return <div style={{position:'absolute',top:1474,left:85,right:85,textAlign:'center',fontSize:62,fontWeight:800,lineHeight:1.2,letterSpacing:-1,textShadow:'0 3px 14px #000'}}>
    {active.map((w,i)=><React.Fragment key={i}>{i>0?' ':''}<span style={{color:ms>=w.startMs&&ms<w.endMs?gold:'#f5f7f4'}}>{w.text.trim()}</span></React.Fragment>)}
  </div>;
};

const Shot: React.FC<{start:number;length:number;title:string;label:string;focus?:number;rate?:number;wide?:boolean}> = ({start,length,title,label,focus=50,rate=1,wide=false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame:f,fps,config:{damping:24,stiffness:160}});
  return <AbsoluteFill style={{background:'radial-gradient(ellipse at 90% 18%,#28464d 0%,#10242c 43%,#08141c 85%)'}}>
    <div style={{position:'absolute',left:80,top:114,fontSize:25,fontWeight:800,letterSpacing:5,color:gold}}>CLIPRUSH <span style={{color:'#a0b5bd',fontWeight:500}}> / EM FOCO</span></div>
    <div style={{position:'absolute',top:190,left:80,right:80,color:'#f5f5ed',fontSize:86,fontWeight:900,lineHeight:1.03,letterSpacing:-3,whiteSpace:'pre-line',opacity:interpolate(f,[0,7],[.5,1],{extrapolateRight:'clamp'}),transform:`translateY(${12*(1-enter)}px)`}}>{title}</div>
    <div style={{position:'absolute',top:426,left:0,width:1080,height:980,overflow:'hidden',background:'#09141b',boxShadow:'0 25px 65px #0007'}}>
      <OffthreadVideo src={source} trimBefore={Math.round(start*fps)} playbackRate={rate} muted style={{width:'100%',height:'100%',objectFit:wide?'contain':'cover',objectPosition:`${focus}% 50%`,transform:`scale(${interpolate(f,[0,length],[1,wide?1:1.025],{extrapolateRight:'clamp'})})`,filter:'brightness(1.07) contrast(1.025) saturate(.94)'}}/>
      <AbsoluteFill style={{background:'linear-gradient(180deg,#08141b66,transparent 15%,transparent 89%,#08141b88)'}}/>
      <div style={{position:'absolute',left:43,top:30,padding:'11px 17px',background:'#09151de3',borderLeft:`3px solid ${gold}`,fontSize:24,fontWeight:750,color:gold,letterSpacing:2}}>{label}</div>
    </div>
    <div style={{position:'absolute',left:80,right:80,top:1433,height:2,background:'#f1ce8c30'}}/>
    <div style={{position:'absolute',left:80,top:1750,color:'#8da4af',fontSize:23,lineHeight:1.55,letterSpacing:.3}}>CLIPE FORNECIDO • ORIGEM NÃO VERIFICADA<br/>Gameplay oficial de GTA 6 não confirmado</div>
  </AbsoluteFill>;
};

const CTA: React.FC<{follow?:boolean}> = ({follow=false}) => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig();
  const enter=spring({frame:f,fps,config:{damping:16,stiffness:200}});
  const opacity=interpolate(f,[0,4,38,45],[0,1,1,0],{extrapolateRight:'clamp'});
  return <div style={{position:'absolute',top:1618,left:follow?288:342,width:follow?504:396,height:84,border:`1px solid ${gold}99`,borderRadius:48,background:'#18313bee',display:'flex',alignItems:'center',justifyContent:'center',gap:18,color:gold,fontSize:30,fontWeight:800,letterSpacing:1,opacity,transform:`scale(${enter})`}}>
    {follow?<span style={{fontSize:39}}>{f>15?'✓':'+'}</span>:<svg width="39" height="39" viewBox="0 0 24 24" fill={gold}><path d="M2 10h4v12H2V10zm6 12V10l6-8c2 0 3 2 2 5l-1 3h5c2 0 3 1 2 3l-2 7c0 1-1 2-3 2H8z"/></svg>}
    {follow?(f>15?'SEGUINDO':'SEGUE O CLIPRUSH'):'CURTIU?'}
    {!follow&&[0,1,2,3,4].map(i=><span key={i} style={{position:'absolute',left:50+Math.cos(i*1.26)*f*2,top:40+Math.sin(i*1.26)*f*1.2,width:6,height:6,background:gold,borderRadius:4,opacity:interpolate(f,[6,12,25],[0,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/>)}
  </div>;
};

export const ClipRush032: React.FC = () => <AbsoluteFill style={{fontFamily:'Arial, sans-serif',color:'#fff',background:'#08141c'}}>
  <Sequence durationInFrames={96} name="Gancho · avião em fuga"><Shot start={58} length={96} title={'UM AVIÃO.\nUMA FUGA LOUCA.'} label="A FUGA"/></Sequence>
  <Sequence from={96} durationInFrames={144} name="Gancho · perseguição aérea"><Shot start={69} length={144} title={'DECOLOU.\nE AGORA?'} label="SOB PERSEGUIÇÃO"/></Sequence>
  <Sequence from={240} durationInFrames={96} name="Aeroporto · embarque"><Shot start={0} length={96} title={'TUDO COMEÇA\nNO AEROPORTO'} label="01 / EMBARQUE" focus={46}/></Sequence>
  <Sequence from={336} durationInFrames={126} name="Aeroporto · manobra entre aviões"><Shot start={12} length={126} title={'MANOBRAR\nESSE GIGANTE'} label="02 / NO PÁTIO" wide/></Sequence>
  <Sequence from={462} durationInFrames={99} name="Pista · aceleração"><Shot start={43} length={99} title={'PISTA LIVRE.\nPOTÊNCIA TOTAL.'} label="03 / ACELERAÇÃO"/></Sequence>
  <Sequence from={561} durationInFrames={93} name="Decolagem"><Shot start={56.5} length={93} title={'ELE CONSEGUIU\nDECOLAR'} label="04 / DECOLAGEM"/></Sequence>
  <Sequence from={654} durationInFrames={99} name="Curvas sobre a cidade"><Shot start={77} length={99} title={'CURVAS SOBRE\nA CIDADE'} label="05 / EM VOO"/></Sequence>
  <Sequence from={753} durationInFrames={87} name="Passagem entre nuvens"><Shot start={135} length={87} title={'ATÉ O MEIO\nDAS NUVENS'} label="06 / NAS ALTURAS"/></Sequence>
  <Sequence from={840} durationInFrames={90} name="CTA · voo panorâmico"><Shot start={89} length={90} title={'A FUGA\nCONTINUA…'} label="SOBRE A CIDADE"/></Sequence>
  <Sequence from={930} durationInFrames={93} name="Preparação para o salto"><Shot start={155.5} length={93} title={'O FINAL É\nAINDA MAIS LOUCO'} label="O ÚLTIMO MOVIMENTO"/></Sequence>
  <Sequence from={1023} durationInFrames={144} name="Revelação · abandono e abertura do paraquedas"><Shot start={160} length={144} rate={1.9} title={'EM PLENO VOO.\nELE PULOU.'} label="07 / O SALTO"/></Sequence>
  <Sequence from={1167} durationInFrames={155} name="Desfecho · paraquedas sobre a cidade"><Shot start={171.2} length={155} title={'E A FUGA TERMINA\nDE PARAQUEDAS'} label="08 / O DESFECHO"/></Sequence>
  <Audio src={staticFile('videos/video-032/audio/narracao.mp3')}/>
  <Audio src={staticFile('videos/video-032/audio/atmosfera.wav')} volume={.3}/>
  <Captions/>
  <Sequence from={840} durationInFrames={46} name="CTA curtir · animação e partículas"><CTA/></Sequence>
  <Sequence from={891} durationInFrames={46} name="CTA seguir · confirmação"><CTA follow/></Sequence>
</AbsoluteFill>;
