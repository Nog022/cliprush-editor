import React from 'react';
import {Audio} from '@remotion/media';
import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import captionData from './captions.json';
import {SupportLayer, supportLabelAt} from './SupportFootage';

const pink = '#ff579b';
const mint = '#b6ffe0';
const smooth = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const, easing: Easing.inOut(Easing.cubic)};
type ShotName = 'acrobacia' | 'equipe' | 'balada' | 'iate' | 'avenida' | 'precarregue';
const windows: Record<ShotName, readonly [number, number]> = {acrobacia:[136,182],equipe:[404,440],balada:[61,135],iate:[316,358],avenida:[537,567],precarregue:[450,479]};
export const sourceImage = (shot: ShotName, frame: number): string => {
  const [start,end]=windows[shot];
  if(frame < start || frame > end) throw new Error(`Source frame outside approved window: ${shot}/${frame}`);
  return staticFile(`videos/video-013/media/${shot}/${String(frame).padStart(4,'0')}.jpg`);
};

const Footage: React.FC<{shot: ShotName; sourceFrame: number; sceneFrom?: number; zoom?: number; x?: number; brighten?: boolean; dark?: boolean}> = ({shot,sourceFrame,sceneFrom=0,zoom=1,x=50,brighten=false,dark=false}) => {
  const src=sourceImage(shot,sourceFrame);
  return <AbsoluteFill style={{overflow:'hidden'}}>
    <Img src={src} style={{width:'100%',height:'100%',objectFit:'cover',filter:'blur(38px) brightness(.29) saturate(1.12)',scale:1.13}} />
    <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(7,8,18,.92),transparent 38%,transparent 65%,#080a14 87%)'}} />
    <div style={{position:'absolute',left:0,right:0,top:475,height:850,overflow:'hidden',display:'flex',alignItems:'center'}}>
      <Img src={src} style={{width:1080,height:608,objectFit:'contain',scale:zoom,transformOrigin:`${x}% 50%`,filter:brighten?'brightness(1.5) contrast(1.05)':'none'}} />
    </div>
    <SupportLayer sceneFrom={sceneFrom}/>
    {dark && <AbsoluteFill style={{background:'rgba(4,6,14,.7)'}}/>}
  </AbsoluteFill>;
};

const Header: React.FC = () => <>
  <div style={{position:'absolute',left:82,top:104,fontSize:30,fontWeight:900,letterSpacing:3}}>CLIP<span style={{color:pink}}>RUSH</span></div>
  <div style={{position:'absolute',right:82,top:110,fontSize:22,letterSpacing:4,color:'#ddd7e4'}}>GTA VI · ANÁLISE</div>
</>;

const Title: React.FC<{kicker: string; children: React.ReactNode; accent?: string}> = ({kicker,children,accent=pink}) => {
  const frame=useCurrentFrame();
  return <div style={{position:'absolute',top:225,left:82,right:82,translate:`0 ${interpolate(frame,[0,12],[22,0],smooth)}px`,opacity:interpolate(frame,[0,8],[0,1],smooth)}}>
    <div style={{color:accent,fontSize:27,fontWeight:800,letterSpacing:6,marginBottom:20}}>{kicker}</div>
    <div style={{fontSize:86,fontWeight:950,lineHeight:1.03,letterSpacing:-3,textShadow:'0 4px 20px #0009'}}>{children}</div>
  </div>;
};

const Tag: React.FC<{children: React.ReactNode; color?: string}> = ({children,color=mint}) => <div style={{position:'absolute',top:1280,left:82,fontSize:27,letterSpacing:3,fontWeight:800,color,display:'flex',alignItems:'center',gap:16}}><span style={{width:8,height:25,background:color}}/>{children}</div>;

const Hook: React.FC = () => {
  const frame=useCurrentFrame();
  return <><Footage shot="precarregue" sourceFrame={450+frame%30} zoom={interpolate(frame,[0,91],[1,1.08],smooth)} />
    <Title kicker="GTA 6">PRÉ-CARREGAMENTO<br/><span style={{color:mint}}>LIBERADO!</span></Title>
    <Tag>PRÉ-CARREGUE AGORA</Tag>
    <div style={{position:'absolute',top:1645,left:82,fontSize:23,color:'#b6b4c5'}}>Pré-carregamento não significa jogo lançado.</div>
  </>;
};

const Teaser: React.FC<{shot: ShotName; start: number; count: number; sceneFrom: number}> = ({shot,start,count,sceneFrom}) => {
  const frame=useCurrentFrame();
  const end=windows[shot][1];
  return <><Footage shot={shot} sourceFrame={Math.min(end,start+frame)} sceneFrom={sceneFrom} zoom={1.1}/><Title kicker="OLHE DE NOVO">3 DETALHES<br/>QUE VOCÊ PERDEU</Title>
    <div style={{position:'absolute',top:1110,right:82,fontSize:170,fontWeight:950,color:mint,lineHeight:1,textShadow:'0 6px 25px #000'}}>0{count}</div></>;
};

const Acrobat: React.FC = () => {
  const f=useCurrentFrame();
  const source=f<47?136+f:f<71?Math.max(136,182-(f-47)*2):f<165?136+Math.floor((f-71)/2):f<212?136+f-165:171;
  const replay=f>=71&&f<165;
  return <><Footage shot="acrobacia" sourceFrame={source} sceneFrom={250} zoom={f<47?1:interpolate(f,[47,165,250],[1.05,1.32,1.15],smooth)} x={37}/>
    <Title kicker="DETALHE 01 / 03">{f<167?<>OLHA ESSE<br/><span style={{color:mint}}>MORTAL!</span></>:<>MENOS DE<br/><span style={{color:mint}}>2 SEGUNDOS.</span></>}</Title>
    {f>=120&&f<167&&<div style={{position:'absolute',left:120,top:525,width:270,height:270,border:'4px solid #b6ffe0aa',borderRadius:'50%',opacity:interpolate(f,[120,130,155,166],[0,1,1,0],smooth)}}/>}
    <Tag>{supportLabelAt(f+250)??(f<47?'PLANO ABERTO':f<71?'◀◀ REBOBINANDO':replay?'REPLAY · 0,5×':f<212?'REPLAY · 1×':'OLHE A RODA-GIGANTE')}</Tag>
  </>;
};

const Team: React.FC = () => {
  const f=useCurrentFrame();
  const source=f<37?404+f:f<106?423:f<180?404+Math.floor((f-106)/2):f<254?404+Math.floor((f-180)/2):423;
  return <><Footage shot="equipe" sourceFrame={source} sceneFrom={501} brighten zoom={interpolate(f,[0,37,105,180,253,299],[1,1.08,1.36,1.28,1.05,1],smooth)} x={interpolate(f,[37,105,180],[45,57,65],smooth)} />
    <Title kicker="DETALHE 02 / 03">{f<207?<>QUEM<br/><span style={{color:mint}}>SÃO ELES?</span></>:<>OPERAÇÃO<br/><span style={{color:mint}}>POLICIAL?</span></>}</Title>
    <Tag>{supportLabelAt(f+501)??(f<37?'VEJA O GRUPO':f<106?'Ⅱ PAUSA · PLANO AMPLIADO':f<254?'REPLAY · LUZES VERMELHAS E AZUIS':'O VÍDEO NÃO EXPLICA')}</Tag>
    {f>=207&&<div style={{position:'absolute',top:1645,left:82,fontSize:24,color:'#c9c4d4'}}>A cena não confirma a função da equipe.</div>}
  </>;
};

const Nightlife: React.FC = () => {
  const f=useCurrentFrame();
  return <><Footage shot="balada" sourceFrame={61+Math.max(0,f-97)} sceneFrom={800} zoom={interpolate(f,[97,171],[1,1.22],smooth)} x={43}/><Title kicker="DETALHE 03 / 03">VICE CITY.<br/><span style={{color:mint}}>OUTRO CENÁRIO.</span></Title><Tag>{supportLabelAt(f+800)??'VIDA NOTURNA · BALADA'}</Tag></>;
};
const Yacht: React.FC = () => {
  const f=useCurrentFrame();
  return <><Footage shot="iate" sourceFrame={Math.min(358,326+f)} sceneFrom={972} zoom={interpolate(f,[0,32],[1,1.1],smooth)}/><Title kicker="DETALHE 03 / 03">IATE<br/><span style={{color:mint}}>DE LUXO.</span></Title><Tag>OUTRO AMBIENTE · À LUZ DO DIA</Tag></>;
};
const Avenue: React.FC = () => {
  const f=useCurrentFrame();
  return <><Footage shot="avenida" sourceFrame={548+Math.min(19,Math.floor(f*.5))} sceneFrom={1005} zoom={interpolate(f,[0,78],[1,1.25],smooth)} x={50}/><Title kicker="DETALHE 03 / 03">RUAS TOMADAS<br/><span style={{color:mint}}>POR NEON.</span></Title><Tag>{supportLabelAt(f+1005)??'VICE CITY À NOITE'}</Tag></>;
};
const Recap: React.FC<{question?: boolean}> = ({question=false}) => {
  const f=useCurrentFrame();
  const shots: ShotName[]=['acrobacia','equipe','avenida'];
  const shot=shots[Math.floor(f/28)%3];
  const [start,end]=windows[shot];
  return <><Footage shot={shot} sourceFrame={start+f%(end-start+1)} sceneFrom={question?1177:1083} zoom={1.08}/><Title kicker={question?'QUAL VOCÊ NÃO VIU?':'TUDO ISSO NO MESMO VÍDEO'}>{question?<>QUAL DETALHE<br/><span style={{color:mint}}>PASSOU BATIDO?</span></>:<>EM SÓ<br/><span style={{color:mint}}>30 SEGUNDOS!</span></>}</Title><Tag>{question?'CONTA NOS COMENTÁRIOS':'MONTAGEM · IMAGENS DE APOIO'}</Tag></>;
};

const CTA: React.FC = () => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const clicked=f>=60;
  const shots: ShotName[]=['acrobacia','equipe','avenida'];
  const shot=shots[Math.floor(f/33)%3];
  const [start,end]=windows[shot];
  return <><Footage shot={shot} sourceFrame={start+f%(end-start+1)} sceneFrom={1228} zoom={1.2} dark/>
    <div style={{position:'absolute',left:82,right:82,top:595,textAlign:'center',scale:spring({frame:f,fps,config:{damping:18,stiffness:140}})}}>
      <div style={{fontSize:27,fontWeight:800,letterSpacing:7,color:mint,marginBottom:35}}>OLHE ALÉM DO ÓBVIO</div>
      <div style={{fontSize:126,fontWeight:950,letterSpacing:-6,textShadow:'0 0 45px #ff579b55'}}>CLIP<span style={{color:pink}}>RUSH</span></div>
      <div style={{fontSize:35,color:'#ded9e7',marginTop:28}}>Os próximos segredos de GTA 6.</div>
    </div>
    <div style={{position:'absolute',top:1000,left:110,right:110,height:150,borderRadius:22,background:clicked?mint:pink,color:'#090b14',display:'flex',alignItems:'center',justifyContent:'center',fontSize:46,fontWeight:950,letterSpacing:1,boxShadow:`0 0 55px ${clicked?'#b6ffe033':'#ff579b44'}`,scale:interpolate(f,[0,16,58,60,65,72],[.95,1,1,.95,1.035,1],smooth)}}>{clicked?'✓ SEGUINDO CLIPRUSH':'＋ SEGUIR CLIPRUSH'}</div>
    {f>=29&&f<80&&<div style={{position:'absolute',left:interpolate(f,[29,58],[1020,835],smooth),top:interpolate(f,[29,58],[1260,1100],smooth),fontSize:90,color:'white',rotate:'-25deg',textShadow:'0 4px 12px #000'}}>➤</div>}
  </>;
};

const Captions: React.FC = () => {
  const f=useCurrentFrame();
  const {fps}=useVideoConfig();
  const ms=f/fps*1000;
  const pages: Caption[][]=captionData;
  const page=pages.find((p,i)=>ms>=p[0].startMs&&ms<(pages[i+1]?.[0].startMs??45322));
  if(!page) return null;
  return <div style={{position:'absolute',left:88,right:88,top:1430,minHeight:140,display:'flex',justifyContent:'center',alignItems:'center',flexWrap:'wrap',gap:'8px 14px',fontSize:56,fontWeight:900,lineHeight:1.12,textAlign:'center',textShadow:'0 3px 7px #000, 0 0 18px #000',textTransform:'uppercase'}}>{page.map((w,i)=><span key={i} style={{color:ms>=w.startMs&&ms<w.endMs?mint:'white'}}>{w.text}</span>)}</div>;
};

const Progress: React.FC = () => {
  const f=useCurrentFrame();
  return <div style={{position:'absolute',bottom:178,left:82,right:82,display:'flex',gap:14}}>{[250,501,800].map((start,i)=><div key={start} style={{flex:1,height:4,background:'#ffffff2b'}}><div style={{height:4,width:`${interpolate(f,[start,[501,800,1177][i]],[0,100],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}%`,background:pink}}/></div>)}</div>;
};

export const ClipRush013: React.FC = () => <AbsoluteFill style={{background:'#080a14',color:'white',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
  <Sequence name="Gancho · pré-carregue agora" durationInFrames={92}><Hook/></Sequence>
  <Sequence name="Promessa · acrobacia" from={92} durationInFrames={62}><Teaser shot="acrobacia" start={136} count={1} sceneFrom={92}/></Sequence>
  <Sequence name="Promessa · equipe" from={154} durationInFrames={42}><Teaser shot="equipe" start={404} count={2} sceneFrom={154}/></Sequence>
  <Sequence name="Promessa · avenida" from={196} durationInFrames={54}><Teaser shot="avenida" start={548} count={3} sceneFrom={196}/></Sequence>
  <Sequence name="01 · mortal, reverse e replay" from={250} durationInFrames={251}><Acrobat/></Sequence>
  <Sequence name="02 · equipe, pausa e replay" from={501} durationInFrames={299}><Team/></Sequence>
  <Sequence name="03 · balada" from={800} durationInFrames={172}><Nightlife/></Sequence>
  <Sequence name="03 · iate" from={972} durationInFrames={33}><Yacht/></Sequence>
  <Sequence name="03 · avenida" from={1005} durationInFrames={78}><Avenue/></Sequence>
  <Sequence name="Recompensa · 30 segundos" from={1083} durationInFrames={94}><Recap/></Sequence>
  <Sequence name="Pergunta ao público" from={1177} durationInFrames={51}><Recap question/></Sequence>
  <Sequence name="CTA · SEGUIR CLIPRUSH" from={1228} durationInFrames={132}><CTA/></Sequence>
  <Header/>
  <Captions/>
  <Progress/>
  <Audio src={staticFile('videos/video-013/audio/narracao.mp3')}/>
  <Audio src={staticFile('videos/video-013/audio/efeitos-v001.wav')}/>
</AbsoluteFill>;
