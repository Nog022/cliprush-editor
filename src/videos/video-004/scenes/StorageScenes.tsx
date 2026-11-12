import React from 'react';
import {AbsoluteFill, Easing, Freeze, Img, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {asset, clamp, color, display, images} from '../theme';
import {Ambient, ArtPlane, Burst, Headline, Kicker, StorageBar} from '../components/VisualKit';

export const StorageScene: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const fill=interpolate(frame,[.5*fps,2.3*fps,4.3*fps,5.9*fps],[.05,.92,.92,.79],clamp);
  const tint=frame<1.2*fps?color.cyan:color.yellow;
  return <AbsoluteFill style={{background:color.ink,overflow:'hidden'}}>
    <Ambient tint={color.red} />
    <Kicker tint={color.red}>Atenção ao detalhe</Kicker>
    <Headline size={91}>{'É UM LIMITE.\nO TAMANHO VARIA.'}</Headline>
    <div style={{position:'absolute',left:80,top:650,width:840,perspective:1200,scale:interpolate(frame,[0,5.9*fps],[.95,1.025],clamp)}}>
      <div style={{fontSize:40,fontWeight:900,letterSpacing:6,color:color.yellow,opacity:interpolate(frame,[.8*fps,1.2*fps],[0,1],clamp)}}>ATÉ</div>
      <div style={{fontFamily:display,fontSize:239,letterSpacing:-5,lineHeight:1.08,color:color.yellow,textShadow:'0 6px 0 #85611c,0 16px 40px #0007'}}>212<span style={{fontSize:117,marginLeft:16}}>GB</span></div>
      <div style={{position:'relative',marginTop:55,padding:30,background:'linear-gradient(150deg,#1e293b,#0b1521)',border:'2px solid #68798a',borderRadius:16,transform:`rotateX(${interpolate(frame,[0,1*fps,5.9*fps],[32,10,0],clamp)}deg) rotateY(-6deg)`,boxShadow:'20px 24px 0 #02050b'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:24,fontSize:26,fontWeight:800,color:'#cad3df',letterSpacing:3}}><span>SSD / PRÉ-DOWNLOAD</span><span style={{color:color.red}}>!</span></div>
        <StorageBar progress={fill} tint={tint}/>
        <div style={{display:'flex',gap:14,marginTop:26}}>{[0,1,2,3].map(i=><div key={i} style={{height:28,width:82,background:'#070e17',border:'1px solid #ffffff22'}} />)}</div>
      </div>
    </div>
    <div style={{position:'absolute',left:90,top:1340,width:820,fontFamily:display,fontSize:55,color:color.white,opacity:interpolate(frame,[3.75*fps,4.05*fps],[0,1],clamp)}}>PODE VARIAR POR CONSOLE</div>
    <div style={{position:'absolute',left:92,top:1420,fontSize:25,color:color.muted}}>Visualização ilustrativa • limite do pré-download</div>
  </AbsoluteFill>;
};

const FinalQuestionVisual: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  // Hold the visual for the final .2s; the narration continues untrimmed.
  const hold=Math.min(frame,4.6*fps);
  const fill=interpolate(hold,[0,1.9*fps],[.3,.95],{...clamp,easing:Easing.out(Easing.cubic)});
  const enter=spring({frame:hold,fps,config:{damping:18,stiffness:140}});
  return <AbsoluteFill style={{background:color.ink,overflow:'hidden'}}>
    <Ambient tint={color.pink} warm/>
    <ArtPlane file={images.duo} left={-180} top={100} width={1400} height={1300} tilt={2}/>
    <AbsoluteFill style={{background:'linear-gradient(180deg,#080a12c9,#080a12cf 40%,#080a12ee 66%,#080a12)'}} />
    <Kicker tint={color.pink}>Agora me conta</Kicker>
    <Headline size={121}>{'TEM ESPAÇO\nNO SSD?!'}</Headline>
    <div style={{position:'absolute',left:88,top:772,translate:`${(1-enter)*-400}px 0px`}}>
      <div style={{fontFamily:display,fontSize:119,color:color.yellow,lineHeight:1}}>212<span style={{fontSize:66,marginLeft:8}}>GB</span></div>
      <div style={{fontSize:28,fontWeight:800,color:'#c1b6cb',marginTop:15}}>QUEM VAI SAIR?</div>
    </div>
    <div style={{position:'absolute',left:560,top:710,width:315,height:315,rotate:'6deg',background:'#fff',boxShadow:'15px 20px 0 #ff63bd33',overflow:'hidden',translate:`${(1-enter)*500}px 0px`}}>
      <Img src={asset(images.consoles)} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
    </div>
    <div style={{position:'absolute',left:90,top:1068,width:810}}><StorageBar progress={fill} tint={color.red}/></div>
    <div style={{position:'absolute',left:90,top:1205,width:810,display:'flex',gap:19}}>
      {[{name:'CORRIDA',tint:color.cyan,icon:'01'},{name:'MUNDO ABERTO',tint:color.violet,icon:'02'},{name:'ONLINE',tint:color.pink,icon:'03'}].map((game,i)=>{
        const reaction=spring({frame:hold-(2.6+i*.2)*fps,fps,config:{damping:13,stiffness:130}});
        return <div key={game.name} style={{width:257,height:200,boxSizing:'border-box',padding:24,background:`linear-gradient(135deg,${game.tint}22,#0b101e)`,border:`2px solid ${game.tint}88`,transform:`perspective(900px) rotateY(${(i-1)*-12}deg) rotateZ(${(i-1)*3*reaction}deg)`,translate:`0px ${-16*reaction}px`,boxShadow:'0 18px 35px #0008'}}>
          <div style={{fontFamily:display,fontSize:68,lineHeight:1,color:game.tint,opacity:.8}}>{game.icon}<span style={{float:'right',fontFamily:'Arial',fontSize:32,color:color.red,opacity:reaction}}>×</span></div>
          <div style={{fontSize:21,fontWeight:900,letterSpacing:1,marginTop:24,color:color.white}}>{game.name}</div>
        </div>;
      })}
    </div>
    <Burst at={1.96} tint={color.red} y={1100}/>
    <div style={{position:'absolute',left:94,top:1425,color:color.muted,fontSize:21}}>Biblioteca e espaço disponível fictícios.</div>
    <div style={{position:'absolute',left:90,top:1638,width:810,fontFamily:display,fontSize:50,color:color.yellow,opacity:interpolate(hold,[3.3*fps,3.6*fps],[0,1],clamp)}}>QUAL JOGO VOCÊ APAGARIA?</div>
  </AbsoluteFill>;
};

export const FinalQuestionScene: React.FC = () => {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <Freeze frame={Math.round(4.6*fps)} active={frame>=Math.round(4.6*fps)}><FinalQuestionVisual/></Freeze>;
};
