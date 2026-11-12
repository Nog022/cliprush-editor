import React from 'react';
import {Audio, Video} from '@remotion/media';
import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {shots, type Shot, type Visual} from './edit';
import captionData from './captions.json';

const pink='#ff70c6';
const cyan='#64e6ed';
const gold='#ffe08a';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const media=(file:string)=>staticFile(`videos/video-006/${file}`);

const CameraMedia:React.FC<{visual:Visual;motion:Shot['motion'];duration:number}>=({visual,motion,duration})=>{
  const f=useCurrentFrame(); const {fps}=useVideoConfig();
  return <AbsoluteFill style={{overflow:'hidden'}}>
    <AbsoluteFill style={{
      scale:interpolate(f,[0,duration],[motion==='pull'?1.14:1.02,motion==='push'?1.14:motion==='pull'?1.02:1.04],clamp),
      translate:interpolate(f,[0,duration],motion==='left'?['24px 0px','-24px 0px']:motion==='right'?['-24px 0px','24px 0px']:['0px 0px','0px 0px'],clamp),
    }}>
      {visual.kind==='video'?<Video src={media(visual.file)} muted objectFit="cover" trimBefore={Math.round((visual.offset??0)*fps)} style={{width:'100%',height:'100%',objectPosition:visual.position??'50% 50%'}}/>:<Img src={media(visual.file)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:visual.position??'50% 50%'}}/>}
    </AbsoluteFill>
  </AbsoluteFill>;
};

const GameTag:React.FC<{visual:Visual;top:number}>=({visual,top})=><div style={{position:'absolute',left:82,top,display:'flex',alignItems:'center',gap:18,textShadow:'0 3px 10px #000',fontSize:38,fontWeight:900}}>
  <span style={{background:visual.game==='GTA 6'?pink:cyan,color:'#111322',padding:'8px 16px'}}>{visual.game}</span>
  <span style={{fontSize:25,letterSpacing:2}}>{visual.kind==='video'?'TRAILER 2':'IMAGEM'}</span>
</div>;

const Scene:React.FC<{shot:Shot}>=({shot})=>{
  const f=useCurrentFrame(); const {fps}=useVideoConfig(); const d=shot.to-shot.from;
  const split=shot.layout==='split'||shot.layout==='reveal';
  const phone=shot.layout==='phone';
  const backdrop=shot.a.kind==='image'?shot.a.file:'imagens/transito_gta6.jfif';
  return <AbsoluteFill data-shot={shot.id} style={{overflow:'hidden',background:'#080a12'}}>
    <Img src={media(backdrop)} style={{width:'100%',height:'100%',objectFit:'cover',filter:'blur(28px)',opacity:.26,scale:1.12}}/>
    <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(6,7,17,.8),transparent 38%,rgba(6,7,17,.95) 87%)'}}/>
    <div data-safe="chapter" style={{position:'absolute',left:82,top:196,color:shot.a.game==='GTA 6'?pink:cyan,fontWeight:800,fontSize:30,letterSpacing:4}}>{shot.chapter}</div>
    <div data-safe="title" style={{position:'absolute',left:80,right:130,top:245,fontSize:shot.title.length>25?57:72,fontWeight:950,lineHeight:1.06,letterSpacing:-2,textShadow:'0 4px 20px #000',translate:`0 ${interpolate(f,[0,.22*fps],[12,0],clamp)}px`}}>{shot.title}</div>
    {split&&<>
      <div style={{position:'absolute',top:390,left:0,width:1080,height:500,overflow:'hidden'}}><CameraMedia visual={shot.a} motion={shot.motion} duration={d}/></div>
      <GameTag visual={shot.a} top={406}/>
      <div style={{position:'absolute',top:914,left:0,width:1080,height:500,overflow:'hidden'}}><CameraMedia visual={shot.b!} motion={shot.motion==='steady'?'steady':'pull'} duration={d}/></div>
      <GameTag visual={shot.b!} top={930}/>
      <div style={{position:'absolute',top:890,height:24,width:1080,background:`linear-gradient(90deg,${cyan},${pink})`}}/>
      {shot.layout==='reveal'&&<>
        <div data-safe="stat-five" style={{position:'absolute',top:708,left:80,fontSize:82,fontWeight:950,textShadow:'0 4px 20px #000',color:cyan}}>≈ 55 MIL</div>
        <div data-safe="stat-six" style={{position:'absolute',top:1195,left:80,fontSize:112,fontWeight:950,color:gold,textShadow:'0 5px 20px #000',scale:interpolate(f,[0,8,15],[.92,1.04,1],clamp)}}>{shot.number}</div>
      </>}
    </>}
    {!split&&!phone&&<>
      <div style={{position:'absolute',top:420,left:0,width:1080,height:880,overflow:'hidden'}}><CameraMedia visual={shot.a} motion={shot.motion} duration={d}/></div>
      <GameTag visual={shot.a} top={442}/>
      {shot.number?<div data-safe="stat" style={{position:'absolute',left:80,top:1140,fontSize:124,fontWeight:950,color:gold,textShadow:'0 5px 20px #000'}}>{shot.number}</div>:<div style={{position:'absolute',left:82,top:1340,width:120,height:5,background:shot.a.game==='GTA 6'?pink:cyan}}/>}
    </>}
    {phone&&<>
      <div style={{position:'absolute',left:230,top:410,width:580,height:950,overflow:'hidden',border:'7px solid #d9c9e7',borderRadius:65,rotate:`${interpolate(f,[0,d],[-2,2],clamp)}deg`,boxShadow:'0 30px 90px #000'}}>
        <CameraMedia visual={shot.a} motion={shot.motion} duration={d}/>
        <div style={{position:'absolute',top:15,left:190,width:190,height:24,borderRadius:30,background:'#0a0912'}}/>
        <div style={{position:'absolute',bottom:30,left:28,right:28,fontSize:34,fontWeight:900,textShadow:'0 3px 8px #000'}}>GTA 6 <span style={{color:pink}}> / </span> VIDA SOCIAL</div>
      </div>
      <div data-safe="illustration" style={{position:'absolute',left:80,right:130,top:1398,fontSize:27,textAlign:'center',color:'#e5d6ec'}}>MONTAGEM ILUSTRATIVA • NÃO É INTERFACE DO JOGO</div>
    </>}
    {(shot.number||shot.id==='question-six')&&<div data-safe="source" style={{position:'absolute',left:82,right:130,top:1432,fontSize:26,color:'#efdcf2'}}>ANIMAÇÕES • FONTE: PC GAMER / NYT, AGO. 2026</div>}
    {shot.entry==='wipe'&&<div style={{position:'absolute',inset:0,background:pink,width:interpolate(f,[0,7],[1100,0],clamp),opacity:.85}}/>}
    {shot.entry==='lift'&&<AbsoluteFill style={{background:'#c6a9ff',opacity:interpolate(f,[0,6],[.18,0],clamp)}}/>}
  </AbsoluteFill>;
};

const DynamicCaptions:React.FC=()=>{
  const f=useCurrentFrame(); const {fps}=useVideoConfig(); const ms=f/fps*1000;
  const current=(captionData as Caption[]).find(c=>ms>=c.startMs&&ms<c.endMs);
  if(!current)return null;
  return <div data-safe="caption" style={{position:'absolute',left:84,right:146,top:1530,minHeight:150,display:'flex',justifyContent:'center',alignItems:'center',textAlign:'center',fontWeight:900,fontSize:66,lineHeight:1.12,letterSpacing:-1,textShadow:'0 4px 5px #000, 0 0 20px #000',WebkitTextStroke:'1.4px #090911',paintOrder:'stroke fill',translate:`0 ${interpolate(ms-current.startMs,[0,120],[9,0],clamp)}px`}}>
    <span>{current.text.split(/(GTA [56]|600 mil|55 mil|multidões|muda tudo|evolução|verdade)/gi).map((word,i)=><span key={i} style={{color:/GTA 6/i.test(word)?pink:/GTA 5/i.test(word)?cyan:/600 mil|55 mil|multidões|muda tudo|evolução|verdade/i.test(word)?gold:'white'}}>{word}</span>)}</span>
  </div>;
};

const Identity:React.FC=()=>{
  const f=useCurrentFrame(); const {durationInFrames}=useVideoConfig();
  return <>
    <div style={{position:'absolute',top:120,left:82,fontSize:28,fontWeight:900,letterSpacing:4}}>CLIP<span style={{color:pink}}>RUSH</span></div>
    <div style={{position:'absolute',top:1725,left:84,color:'#b9b6c8',fontSize:23,letterSpacing:4}}>GTA 5 <span style={{color:pink}}>×</span> GTA 6</div>
    <div style={{position:'absolute',left:82,top:1780,width:864,height:4,background:'#353042'}}><div style={{height:4,background:`linear-gradient(90deg,${cyan},${pink})`,width:`${f/(durationInFrames-1)*100}%`}}/></div>
  </>;
};

const Soundtrack:React.FC=()=>{
  const f=useCurrentFrame(); const {fps}=useVideoConfig(); const seconds=f/fps;
  const speech=(captionData as Caption[]).some(c=>seconds*1000>=c.startMs-120&&seconds*1000<c.endMs+160);
  return <>
    <Audio src={media('audio/score-original-v001.wav')} volume={interpolate(seconds,[0,.5,27.9,28.56,36.4,37.9,38.18,42.7,43.5],[0,.16,.16,.055,.055,.10,.21,.15,0],clamp)*(speech?.72:1)}/>
    <Audio src={media('audio/sfx-original-v001.wav')} volume={.65}/>
  </>;
};

export const ClipRushVideo006:React.FC=()=> <AbsoluteFill style={{background:'#080a12',fontFamily:'Arial, sans-serif',color:'white'}}>
  {shots.map(shot=><Sequence key={shot.id} name={`${shot.id} • ${shot.intent}`} from={shot.from} durationInFrames={shot.to-shot.from}><Scene shot={shot}/></Sequence>)}
  <Sequence name="Narração integral e legendas por frase" durationInFrames={1305} layout="none">
    <Audio src={media('audio/narracao.mp3')} volume={.88}/>
    <DynamicCaptions/>
  </Sequence>
  <Soundtrack/>
  <Identity/>
</AbsoluteFill>;
