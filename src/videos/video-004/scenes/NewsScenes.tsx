import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset, clamp, color, display, ease, images} from '../theme';
import {Ambient, ArtPlane, Burst, Headline, Kicker} from '../components/VisualKit';

export const RockstarProofScene: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const stamp=spring({frame:frame-3.02*fps,fps,config:{damping:14,stiffness:210}});
  return <AbsoluteFill style={{overflow:'hidden',background:color.ink}}>
    <Ambient tint={color.cyan} />
    <Kicker>Direto da fonte</Kicker>
    <Headline size={107}>{'A ROCKSTAR\nCONFIRMOU.'}</Headline>
    <div style={{position:'absolute',left:92,top:655,width:810,height:650,perspective:1400}}>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(145deg,#172944,#0b1225)',border:'2px solid #00c8ff66',boxShadow:'25px 25px 0 #0005,0 20px 90px #00c8ff11',padding:48,boxSizing:'border-box',transform:`rotateY(${interpolate(frame,[0,.55*fps,4*fps],[28,-5,0],clamp)}deg) rotateX(${interpolate(frame,[0,.55*fps],[9,0],clamp)}deg)`,translate:`${interpolate(frame,[0,.6*fps],[850,0],clamp)}px 0px`,scale:interpolate(frame,[1.7*fps,2.6*fps],[1,1.035],clamp)}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:24,letterSpacing:3,color:color.muted,fontWeight:700}}><span>CLIPRUSH / NOTÍCIA</span><span>03.11.2026</span></div>
        <div style={{height:1,background:'#ffffff33',margin:'33px 0'}} />
        <div style={{fontSize:37,color:color.white,fontWeight:800}}>Rockstar Games • Suporte</div>
        <div style={{fontSize:32,color:color.muted,marginTop:16}}>Espaço para o pré-download</div>
        <div style={{position:'absolute',left:50,top:310,fontFamily:display,fontSize:70,color:color.cyan,opacity:interpolate(frame,[1.25*fps,1.45*fps],[1,0],clamp)}}>NÃO É RUMOR.</div>
        <div style={{position:'relative',marginTop:38,padding:'15px 20px',border:'3px solid #ffe34d',background:'#ffe34d0d',clipPath:`inset(0 ${interpolate(frame,[1.4*fps,2.1*fps],[100,0],clamp)}% 0 0)`}}>
          <div style={{fontFamily:display,fontSize:113,color:color.yellow,lineHeight:1}}>ATÉ 212 GB</div>
          <div style={{fontSize:31,color:color.white,marginTop:12}}>Conforme o dispositivo.</div>
        </div>
        <div style={{marginTop:34,fontSize:24,color:'#a4cbd8'}}>Fonte: support.rockstargames.com</div>
        <div style={{marginTop:16,fontSize:21,color:color.muted}}>Resumo editorial ClipRush • sem captura de tela</div>
      </div>
    </div>
    <Burst at={3.02} tint={color.cyan} y={1245} />
    <div style={{position:'absolute',top:1200,left:215,padding:'16px 32px',border:`4px solid ${color.cyan}`,background:color.ink,fontFamily:display,fontSize:65,color:color.cyan,rotate:'-7deg',scale:1.8-.8*stamp,opacity:frame>=3.02*fps?1:0}}>CONFIRMADO</div>
  </AbsoluteFill>;
};

export const PreloadRevealScene: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  // Global word 'antecipado' begins at 13.06s. This scene starts at 9.5s.
  const reveal=3.56;
  const turn=interpolate(frame,[reveal*fps,(reveal+.55)*fps],[0,180],clamp);
  const settled=spring({frame:frame-reveal*fps,fps,config:ease});
  return <AbsoluteFill style={{overflow:'hidden',background:color.ink}}>
    <Img src={asset(images.street)} style={{position:'absolute',left:-200,top:160,width:1460,height:1460,objectFit:'cover',scale:interpolate(frame,[0,6.1*fps],[1.12,1],clamp),translate:`${interpolate(frame,[0,6.1*fps],[60,-55],clamp)}px 0px`}} />
    <AbsoluteFill style={{background:'linear-gradient(180deg,#080a12d9,#16112677 45%,#080a12f5 79%)'}} />
    <Kicker tint={color.pink}>Outra novidade</Kicker>
    <Headline top={385} size={96}>{frame<reveal*fps?'MAS CALMA...\nTEM MAIS.':'PRÉ-DOWNLOAD\nANTECIPADO!'}</Headline>
    <div style={{position:'absolute',left:216,top:740,width:610,height:535,perspective:1600,transform:`rotateZ(${interpolate(frame,[0,reveal*fps,6.1*fps],[-7,-3,1],clamp)}deg)`,scale:interpolate(frame,[0,.6*fps],[.7,1],clamp)*(1+.05*settled)}}>
      {[3,2,1].map(i=><div key={i} style={{position:'absolute',inset:0,background:'#3d2d47',border:'2px solid #8a658c',translate:`${i*8}px ${i*10}px`,borderRadius:15}} />)}
      <div style={{position:'absolute',inset:0,borderRadius:15,background:'#fff7ed',boxShadow:'0 30px 100px #0009',overflow:'hidden'}}>
        <div style={{height:104,background:color.pink,color:color.ink,fontSize:40,fontWeight:900,letterSpacing:8,textAlign:'center',paddingTop:27,boxSizing:'border-box'}}>NOVEMBRO</div>
        <div style={{fontFamily:display,fontSize:300,lineHeight:1.1,textAlign:'center',color:'#20152e',textShadow:frame>reveal*fps?'0 0 30px #ff63bd44':'none'}}>10</div>
        <div style={{fontSize:29,fontWeight:800,textAlign:'center',color:'#69566d',letterSpacing:5}}>2026 • PRÉ-DOWNLOAD</div>
      </div>
      <div style={{position:'absolute',inset:0,transformOrigin:'50% 0%',transform:`rotateX(${-turn}deg)`,backfaceVisibility:'hidden',background:'#fff7ed',borderRadius:15,boxShadow:'0 8px 40px #0005',overflow:'hidden',visibility:turn>=90?'hidden':'visible'}}>
        <div style={{height:104,background:'#442e4a',color:'#efd9ec',fontSize:40,fontWeight:900,letterSpacing:8,textAlign:'center',paddingTop:27,boxSizing:'border-box'}}>NOVEMBRO</div>
        <div style={{fontFamily:display,fontSize:300,lineHeight:1.1,textAlign:'center',color:'#6d5d75'}}>12</div>
        <div style={{fontSize:29,fontWeight:800,textAlign:'center',color:'#69566d',letterSpacing:5}}>DATA ANTERIOR</div>
      </div>
      {[85,475].map(x=><div key={x} style={{position:'absolute',width:22,height:64,borderRadius:12,background:'linear-gradient(90deg,#282735,#e6e5f0,#686577)',left:x,top:-24,boxShadow:'0 5px 10px #0005'}} />)}
    </div>
    <Burst at={reveal} tint={color.pink} y={1010} />
    <div style={{position:'absolute',left:172,top:1340,width:700,textAlign:'center',fontFamily:display,fontSize:60,color:color.white,opacity:interpolate(frame,[reveal*fps,(reveal+.2)*fps],[0,1],clamp)}}><span style={{color:'#c4a5b6',textDecoration:'line-through'}}>12/11</span><span style={{color:color.pink,margin:'0 38px'}}>→</span>10/11</div>
  </AbsoluteFill>;
};

export const DownloadScene: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const progress=interpolate(frame,[.8*fps,3.55*fps],[0,1],clamp);
  return <AbsoluteFill style={{background:color.ink,overflow:'hidden'}}>
    <Ambient tint={color.violet} />
    <Kicker tint={color.pink}>Comprou a versão digital?</Kicker>
    <Headline size={103}>{'BAIXE ANTES\nDO LANÇAMENTO.'}</Headline>
    <ArtPlane file={images.cover} left={92} top={695} width={500} height={500} fit="contain" tilt={-9} />
    <div style={{position:'absolute',left:640,top:775,width:240,opacity:interpolate(frame,[.8*fps,1.2*fps],[0,1],clamp)}}>
      <svg viewBox="0 0 200 200" width="210" height="210"><circle cx="100" cy="100" r="86" stroke="#ffffff16" strokeWidth="7" fill="none"/><circle cx="100" cy="100" r="86" stroke={color.cyan} strokeWidth="7" fill="none" strokeDasharray={Math.PI*172} strokeDashoffset={(1-progress)*Math.PI*172} transform="rotate(-90 100 100)"/><path d={progress>=1?'M64 102 90 128 140 73':'M100 50V132M68 105 100 137 132 105'} stroke={color.cyan} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      <div style={{fontFamily:display,fontSize:66,textAlign:'center',color:color.cyan}}>{Math.round(progress*100)}%</div>
      <div style={{fontSize:25,textAlign:'center',color:color.muted,marginTop:12}}>{progress>=1?'PRONTO PARA O DIA':'PREPARANDO'}</div>
    </div>
    <div style={{position:'absolute',left:94,top:1235,width:810,height:18,background:'#202344',borderRadius:20,overflow:'hidden'}}><div style={{height:'100%',width:`${progress*100}%`,background:`linear-gradient(90deg,${color.violet},${color.cyan})`,boxShadow:`0 0 30px ${color.cyan}`}} /></div>
    <div style={{position:'absolute',left:94,top:1290,width:810,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <span style={{fontSize:25,color:color.muted}}>Interface e progresso ilustrativos</span>
      <span style={{fontFamily:display,fontSize:44,color:color.white,opacity:interpolate(frame,[2.9*fps,3.3*fps],[0,1],clamp)}}>LANÇA 19/11</span>
    </div>
    <div style={{position:'absolute',left:94,top:1380,fontSize:27,color:'#b6bbce',opacity:interpolate(frame,[3.3*fps,3.6*fps],[0,1],clamp)}}>Pré-download não libera o jogo antecipadamente.</div>
  </AbsoluteFill>;
};
