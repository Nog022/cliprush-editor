import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {amber, clamp, cyan, display, ink, media, paper, pictures, violet} from '../style';
import {Dust, Eyebrow, ImpactWord, Shot} from '../components/Cinema';

export const OfficialSource:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{background:ink,overflow:'hidden'}}>
    <Shot file={pictures.tension} focus="35% 45%" seconds={2.9} startScale={1.1} endScale={1.18} darkness={.67}/>
    <Eyebrow tint={amber}>A resposta estava na fonte</Eyebrow>
    <div style={{position:'absolute',left:89,top:465,width:820,perspective:1500}}>
      <div style={{position:'relative',padding:'58px 48px 64px',background:'linear-gradient(150deg,#17232a,#0b111a)',border:'1px solid #f4eee344',boxShadow:'25px 30px 90px #0008',transform:`rotateY(${interpolate(frame,[0,.65*fps,2.9*fps],[19,-3,0],clamp)}deg)`,scale:interpolate(frame,[0,2.9*fps],[.95,1.04],clamp)}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:24,fontWeight:800,letterSpacing:3,color:'#9badb8'}}><span>CONSULTA CLIPRUSH</span><span>FONTE</span></div>
        <div style={{height:1,background:'#ffffff30',margin:'34px 0 48px'}}/>
        <div style={{fontFamily:display,fontSize:110,lineHeight:1,color:amber}}>ROCKSTAR<br/>GAMES.</div>
        <div style={{height:5,width:`${interpolate(frame,[.3*fps,1.5*fps],[0,100],clamp)}%`,background:amber,margin:'34px 0 45px'}}/>
        <div style={{fontFamily:display,fontSize:57,color:paper}}>BIOGRAFIA DE LUCIA</div>
        <div style={{fontSize:28,color:'#bac4ce',marginTop:22}}>rockstargames.com/VI</div>
        <div style={{fontSize:22,color:'#8799a5',marginTop:45}}>Painel editorial • referência ao site oficial</div>
      </div>
    </div>
    <div style={{position:'absolute',left:90,top:1280,fontFamily:display,fontSize:80,color:paper,opacity:interpolate(frame,[1.3*fps,1.7*fps],[0,1],clamp)}}>O MOTIVO FOI REVELADO.</div>
    <div style={{position:'absolute',left:-250,top:1000,width:1300,height:800,background:`radial-gradient(ellipse,${amber}18,transparent 65%)`,opacity:frame/(2.9*fps)}}/>
    <Dust/>
  </AbsoluteFill>;
};

export const AnswerReveal:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const fight=1.75; // 28.6 + 1.75 = 30.35s, measured "lutou" onset.
  const family=3.6; // 32.2s; no family text is mounted before this point.
  const revealed=frame>=family*fps;
  const opening=interpolate(frame,[family*fps,(family+.55)*fps],[0,1],{...clamp,easing:Easing.out(Easing.cubic)});
  const hit=spring({frame:frame-family*fps,fps,config:{damping:19,stiffness:170}});
  const fightZoom=interpolate(frame,[fight*fps,(fight+.08)*fps,(fight+.48)*fps],[1,1.065,1],clamp);
  return <AbsoluteFill style={{background:ink,overflow:'hidden'}}>
    <AbsoluteFill style={{scale:fightZoom}}><Shot file={pictures.custody} focus="55% 40%" seconds={6.4} startScale={1.02} endScale={1.15} darkness={.2}/></AbsoluteFill>
    <AbsoluteFill style={{opacity:opening}}><Shot file={pictures.bike} focus="39% 44%" seconds={6.4} startScale={1.16} endScale={1.02} darkness={.02} warm/></AbsoluteFill>
    <Eyebrow tint={revealed?amber:cyan}>{frame/fps>4.5?'Mistério resolvido.':revealed?'A resposta':'Por que ela foi presa?'}</Eyebrow>
    {!revealed&&<>
      {frame<fight*fps&&<div style={{position:'absolute',left:90,top:1080,fontFamily:display,fontSize:106,lineHeight:1.08,color:paper}}>LUCIA FOI<br/>PRESA PORQUE...</div>}
      <ImpactWord word="LUTOU..." at={fight} top={1140} size={218}/>
    </>}
    {revealed&&<div data-reveal="family" style={{position:'absolute',left:87,top:1000,width:840,scale:.94+.06*hit,transformOrigin:'left center',translate:`0px ${(1-hit)*35}px`}}>
      <div style={{fontFamily:display,fontSize:88,lineHeight:1.02,color:paper}}>ELA DEFENDEU<br/>A PRÓPRIA</div>
      <div style={{fontFamily:display,fontSize:184,lineHeight:1.06,letterSpacing:-2,color:amber,textShadow:'0 7px 0 #4f3a25,0 15px 45px #0008'}}>FAMÍLIA!</div>
      <div style={{marginTop:20,borderTop:`2px solid ${amber}88`,paddingTop:18,fontSize:24,fontWeight:800,letterSpacing:1,color:paper}}>ROCKSTAR GAMES • BIOGRAFIA OFICIAL</div>
      <div style={{marginTop:12,fontSize:25,color:'#c9c2b4'}}>rockstargames.com/VI</div>
    </div>}
    {[0,1].map(i=><div key={i} style={{position:'absolute',left:i===0?40:980,top:230,width:4,height:1160,background:`linear-gradient(transparent,${revealed?amber:cyan}88,transparent)`,translate:`${(i===0?-1:1)*opening*280}px 0px`,opacity:.55}}/>)}
    <Dust/>
  </AbsoluteFill>;
};

export const ClosingScene:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const intro=spring({frame,fps,config:{damping:22,stiffness:130}});
  return <AbsoluteFill style={{background:ink,overflow:'hidden'}}>
    <Shot file={pictures.city} focus="50% 50%" seconds={4.034} startScale={1.14} endScale={1.06} darkness={.47} warm/>
    <div style={{position:'absolute',left:0,top:325,width:1080,height:690,maskImage:'linear-gradient(transparent,black 15%,black 80%,transparent)',scale:interpolate(frame,[0,4.034*fps],[1.13,1],clamp)}}><Img src={media(pictures.city)} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
    <div style={{position:'absolute',left:88,top:980,width:840,translate:`0px ${(1-intro)*55}px`}}>
      <div style={{fontSize:42,fontWeight:900,letterSpacing:8,color:cyan}}>SIGA O</div>
      <div style={{fontFamily:display,fontSize:165,lineHeight:1.1,color:paper,letterSpacing:-2}}>CLIP<span style={{color:cyan}}>RUSH</span></div>
      <div style={{width:145,height:6,background:`linear-gradient(90deg,${cyan},${violet})`,margin:'30px 0'}}/>
      <div data-safe="closing" style={{fontFamily:display,fontSize:78,lineHeight:1.09,color:paper}}>MAIS SEGREDOS<br/>DE <span style={{color:amber}}>GTA 6.</span></div>
    </div>
    <Dust/>
  </AbsoluteFill>;
};
