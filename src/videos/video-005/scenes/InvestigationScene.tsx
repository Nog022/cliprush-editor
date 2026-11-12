import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {amber, clamp, cyan, display, ink, media, paper, pictures, red} from '../style';
import {Dust, Eyebrow, PhotoEvidence, Shot} from '../components/Cinema';

const StoryMap:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const route=interpolate(frame,[5*fps,6.6*fps],[0,1],clamp);
  return <div style={{position:'absolute',left:1130,top:500,width:840,height:910,perspective:1500}}>
    <div style={{position:'absolute',inset:0,background:'#0d1724',border:'1px solid #b5c7cb44',boxShadow:'18px 25px 65px #0009',transform:`rotateX(${interpolate(frame,[4.6*fps,7.33*fps],[12,2],clamp)}deg) rotateY(-3deg)`}}>
      <svg width="840" height="910" viewBox="0 0 840 910">
        <defs><pattern id="lc-grid" width="45" height="45" patternUnits="userSpaceOnUse"><path d="M45 0H0V45" fill="none" stroke="#89abb1" opacity=".12"/></pattern></defs>
        <rect width="840" height="910" fill="url(#lc-grid)"/>
        <path d="M40 100 290 70 360 130 330 220 393 285 350 353 415 420 389 493 450 535 425 610 488 636 520 750 563 830 516 840 458 780 432 703 371 660 310 610 260 520 172 500 114 400 44 370Z" fill="#1e323d" stroke="#587a82" strokeWidth="2"/>
        <path d="M83 188 274 174 319 267 244 338M144 410 312 443 360 541 326 608M390 652 453 678 475 764" stroke="#719197" strokeWidth="1" fill="none" opacity=".5"/>
        <path d="M347 214C713 305 668 523 487 714" fill="none" stroke="#06202b" strokeWidth="15"/>
        <path d="M347 214C713 305 668 523 487 714" fill="none" stroke={cyan} strokeWidth="4" strokeDasharray="720" strokeDashoffset={(1-route)*720}/>
        <circle cx="347" cy="214" r="13" fill={amber}/><circle cx="347" cy="214" r="28" fill="none" stroke={amber}/>
        <circle cx="487" cy="714" r="13" fill={cyan} opacity={route}/><circle cx="487" cy="714" r={24+6*Math.sin(frame/fps*3)} fill="none" stroke={cyan} opacity={route*.6}/>
        <path d="M370 190 418 145H730M510 740 553 790H743" stroke="#ffffff55" fill="none"/>
        <text x="420" y="120" fill={paper} fontFamily="Arial" fontSize="34" fontWeight="800">LIBERTY CITY</text>
        <text x="420" y="176" fill={amber} fontFamily="Arial" fontSize="25">SEU PASSADO</text>
        <text x="550" y="766" fill={paper} fontFamily="Arial" fontSize="34" fontWeight="800">LEONIDA</text>
        <text x="80" y="850" fill="#8da4b3" fontFamily="Arial" fontSize="23">Mapa narrativo • sem escala</text>
      </svg>
    </div>
  </div>;
};

export const InvestigationScene:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const pan=interpolate(frame,[4.8*fps,5.35*fps],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)});
  return <AbsoluteFill style={{background:ink,overflow:'hidden'}}>
    <Shot file={pictures.sea} seconds={7.333} focus="52% 50%" startScale={1.1} endScale={1} darkness={.7}/>
    <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,#111b3a55,#080a12aa)',backgroundImage:'radial-gradient(#ffffff12 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
    <Eyebrow tint={amber}>Reconstruindo as pistas</Eyebrow>
    <div style={{position:'absolute',left:88,top:385,fontFamily:display,fontSize:112,color:paper}}>O PASSADO.</div>
    <div style={{position:'absolute',inset:0,translate:`${-1040*pan}px 0px`,transform:`perspective(1700px) rotateY(${Math.sin(pan*Math.PI)*-5}deg)`,transformOrigin:'540px 900px'}}>
      <PhotoEvidence file={pictures.custody} label="LUCIA CAMINOS" left={105} top={565} width={445} height={620} focus="55% 50%" angle={-6}/>
      <div style={{position:'absolute',left:602,top:690,width:280,color:paper,rotate:'4deg',opacity:interpolate(frame,[1.7*fps,2.2*fps],[0,1],clamp)}}>
        <div style={{color:amber,fontSize:27,fontWeight:900,letterSpacing:4}}>PISTA 01</div>
        <svg width="170" height="180" viewBox="0 0 170 180" style={{marginTop:22}}><path d="M40 143 30 98 40 38Q47 16 65 35 71 7 89 27 102 7 115 34 133 20 139 45L149 90 125 144Z" fill="#163140" stroke={cyan} strokeWidth="4"/><path d="M41 140H125V168H45ZM40 77 78 83 79 124M65 35 61 68M89 27 87 68M115 34 112 71" fill="none" stroke={cyan} strokeWidth="3"/></svg>
        <div style={{fontFamily:display,fontSize:55,lineHeight:1.04,marginTop:25}}>APRENDEU<br/>A LUTAR.</div>
        <div style={{fontSize:30,lineHeight:1.3,marginTop:22,color:'#bac8cd'}}>Com o pai.<br/>Desde pequena.</div>
      </div>
      <svg width="1000" height="1350" style={{position:'absolute',left:0,top:0,pointerEvents:'none'}}><path d="M493 655Q568 600 627 677" stroke={red} strokeWidth="4" fill="none" strokeDasharray="200" strokeDashoffset={interpolate(frame,[1.4*fps,2*fps],[200,0],clamp)}/><circle cx="492" cy="655" r="8" fill={red}/></svg>
      <div style={{position:'absolute',left:120,top:1265,fontSize:31,color:'#c9c2b1',letterSpacing:2}}>A HISTÓRIA COMEÇA ANTES DA PRISÃO.</div>
      <StoryMap/>
    </div>
    <Dust subtle/>
  </AbsoluteFill>;
};

export const DestinyScene:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const change=interpolate(frame,[2.5*fps,2.95*fps],[0,1],clamp);
  return <AbsoluteFill>
    <Shot file={pictures.bike} focus="39% 45%" seconds={4.8} startScale={1.13} endScale={1.05} pan={-13} darkness={.12} warm/>
    <div style={{position:'absolute',left:0,top:1000,width:1080,height:780,opacity:.09*(1-change),maskImage:'linear-gradient(transparent,black 40%,transparent)'}}><Img src={media(pictures.sea)} style={{width:'100%',height:'100%',objectFit:'cover',translate:`${frame*.1}px 0px`}}/></div>
    <Eyebrow tint={amber}>O sonho. E a decisão.</Eyebrow>
    <div style={{position:'absolute',left:90,top:1040,opacity:1-change,translate:`0px ${-change*35}px`}}>
      <div style={{fontSize:28,fontWeight:800,letterSpacing:6,color:amber}}>O SONHO DA MÃE</div>
      <div data-safe="destiny" style={{fontFamily:display,fontSize:110,lineHeight:1.08,color:paper,width:830,marginTop:27}}>UMA VIDA<br/>MELHOR.</div>
    </div>
    <div style={{position:'absolute',left:90,top:1030,opacity:change,translate:`0px ${(1-change)*35}px`}}>
      <div style={{fontSize:28,fontWeight:800,letterSpacing:6,color:cyan}}>A ESCOLHA DE LUCIA</div>
      <div data-safe="destiny" style={{fontFamily:display,fontSize:102,lineHeight:1.08,color:paper,width:830,marginTop:27}}>MUDAR O<br/>PRÓPRIO <span style={{color:amber}}>DESTINO.</span></div>
    </div>
    <Dust subtle/>
  </AbsoluteFill>;
};
