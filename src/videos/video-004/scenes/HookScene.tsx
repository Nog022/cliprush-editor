import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset, clamp, color, display, images} from '../theme';
import {Burst} from '../components/VisualKit';

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time=frame/fps;
  const impact=2.54;
  const hit=spring({frame:frame-impact*fps,fps,config:{damping:13,stiffness:190,mass:.8}});
  const shake=Math.exp(-Math.max(0,time-impact)*14)*(time>=impact&&time<impact+.4?1:0);
  return <AbsoluteFill style={{background:color.ink,overflow:'hidden'}}>
    <AbsoluteFill style={{translate:`${Math.sin(frame*2.3)*16*shake}px ${Math.cos(frame*2)*11*shake}px`}}>
      <Img src={asset(images.hero)} style={{position:'absolute',width:1220,height:1708,left:-90,top:-60,objectFit:'cover',scale:interpolate(frame,[0,.3*fps,5.5*fps],[1.23,1.02,1.06],clamp),translate:`${interpolate(frame,[0,5.5*fps],[-28,20],clamp)}px ${interpolate(frame,[0,5.5*fps],[40,-35],clamp)}px`}} />
      <AbsoluteFill style={{background:'linear-gradient(180deg,#080a1250 0%,transparent 25%,#080a1222 37%,#080a12d9 66%,#080a12 91%)'}} />
      <div style={{position:'absolute',left:85,top:348,fontFamily:display,fontSize:64,color:color.yellow,rotate:'-5deg',transformOrigin:'left center',opacity:interpolate(frame,[0,.1*fps,.5*fps,.72*fps],[1,1,1,0],clamp),scale:interpolate(frame,[0,.3*fps],[1.45,1],clamp)}}>MANO!</div>
      <div style={{position:'absolute',left:88,top:680,fontSize:31,fontWeight:800,letterSpacing:6,color:color.white,translate:`0px ${interpolate(frame,[.8*fps,1.3*fps],[35,0],clamp)}px`,opacity:interpolate(frame,[.8*fps,1.1*fps],[0,1],clamp)}}>GTA 6 • NO SEU CONSOLE</div>
      <Burst at={impact} y={1000} />
      <div style={{position:'absolute',left:82,top:790,width:840,opacity:time<impact?0:1,scale:2.2-1.2*hit,transformOrigin:'50% 45%',rotate:`${(1-hit)*-9}deg`}}>
        <div style={{fontFamily:display,fontSize:313,lineHeight:.95,letterSpacing:-9,color:color.yellow,textShadow:'0 4px 0 #b2861d,0 9px 0 #725619,0 15px 0 #493822,0 26px 45px #000b'}}>212<span style={{fontSize:126,letterSpacing:-4}}>GB</span></div>
        <div style={{position:'absolute',right:2,top:-72,fontFamily:display,fontSize:110,color:color.white,rotate:'10deg'}}>?!</div>
        <div style={{height:5,marginTop:19,background:`linear-gradient(90deg,transparent,${color.yellow},white,transparent)`,backgroundSize:'200% 100%',backgroundPosition:`${frame*5}% 0`}} />
      </div>
      <div style={{position:'absolute',left:90,top:1195,color:color.pink,fontSize:40,fontWeight:900,letterSpacing:3,opacity:interpolate(frame,[4.3*fps,4.6*fps],[0,1],clamp)}}>PREPARA O SSD.</div>
      <div style={{position:'absolute',left:90,top:1338,width:815,fontSize:27,color:'#c1c1d5',opacity:interpolate(frame,[3.9*fps,4.3*fps],[0,1],clamp)}}>Até 212 GB para o pré-download, conforme o dispositivo.</div>
    </AbsoluteFill>
  </AbsoluteFill>;
};
