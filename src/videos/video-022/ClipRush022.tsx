import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Alligators, CTA, GOLD, Heading, INK, Shot} from './Visuals';
import pages from './caption-pages.json';

function Captions(){
 const f=useCurrentFrame();const {fps}=useVideoConfig();const ms=f/fps*1000;
 const p=pages.find((p,i)=>ms>=p.startMs&&ms<Math.min(p.endMs+90,pages[i+1]?.startMs??Infinity));
 if(!p)return null;
 return <div style={{position:'absolute',left:76,right:76,top:1550,display:'flex',justifyContent:'center'}}><div style={{fontSize:52,fontWeight:800,textAlign:'center',lineHeight:1.18,textShadow:'0 3px 9px #000',background:'#091310ed',padding:'18px 24px',borderRadius:14}}>{p.words.map((w,i)=><span key={i} style={{color:ms>=w.startMs&&ms<w.endMs+45?GOLD:'#fff'}}>{w.text}{' '}</span>)}</div></div>;
}

export const ClipRush022:React.FC=()=>{
 const {fps}=useVideoConfig();
 return <AbsoluteFill style={{background:INK,color:'#fff',fontFamily:'Arial, sans-serif'}}>
  <Audio src={staticFile('videos/video-022/audio/narracao.mp3')}/>
  <Sequence name="Gancho: jacaré gigante" durationInFrames={72}><Shot title="Olha o tamanho dele." label="GTA VI / GRASSRIVERS" x={.28} y={.83} zoom={2.15} endZoom={2.38} duration={72}/></Sequence>
  <Sequence name="Abrir contexto sem revelar felino" from={72} durationInFrames={83}><Shot title="Mas tem algo mais estranho." label="O DETALHE ESCONDIDO" x={.45} y={.58} zoom={1.85} endZoom={1.92} duration={83}/></Sequence>
  <Sequence name="Homem sentado" from={155} durationInFrames={53}><Shot title="Atrás do homem sentado…" label="01 / OLHE O BANCO" x={.435} y={.58} zoom={2.15} endZoom={2.28} duration={53}/></Sequence>
  <Sequence name="Prova: felino sobre o banco" from={208} durationInFrames={78}><Shot title="Um felino no banco." label="01 / DETALHE AMPLIADO" x={.54} y={.655} zoom={3.4} endZoom={3.65} duration={78} target note="Animal visível atrás do homem • espécie não identificada"/></Sequence>
  <Sequence name="As três pessoas e as armas" from={286} durationInFrames={69}><Shot title="Três pessoas armadas." label="O RESTO DA CENA" x={.57} y={.44} zoom={1.86} endZoom={1.95} duration={69}/></Sequence>
  <Sequence name="Aerobarco à esquerda" from={355} durationInFrames={46}><Shot title="Um aerobarco." label="À ESQUERDA" x={.23} y={.4} zoom={2} endZoom={2.05} duration={46}/></Sequence>
  <Sequence name="Prova: placa à direita" from={401} durationInFrames={75}><Shot title="Entrada proibida." label="À DIREITA / A PLACA" x={.826} y={.275} zoom={3.1} endZoom={3.35} duration={75} target note="NO TRESPASSING = ENTRADA PROIBIDA"/></Sequence>
  <Sequence name="CTA na pausa narrativa" from={476} durationInFrames={88}><Shot title="Você teria percebido?" label="CLIPRUSH / CADA DETALHE CONTA" x={.5} y={.5} zoom={1.84} endZoom={1.9} duration={88}/><CTA/></Sequence>
  <Sequence name="Segunda imagem: contexto" from={564} durationInFrames={62}><Alligators/></Sequence>
  <Sequence name="Três jacarés e ampliações" from={626} durationInFrames={134}><Alligators reveal/></Sequence>
  <Sequence name="Começo da hipótese" from={760} durationInFrames={82}><Shot title="E se for algo maior?" label="" x={.64} y={.4} zoom={1.88} endZoom={2.03} duration={82} theory/></Sequence>
  <Sequence name="Hipótese: área de caçadores" from={842} durationInFrames={88}><Shot title="Território de caçadores?" label="" x={.70} y={.44} zoom={2.15} endZoom={2.33} duration={88} theory/></Sequence>
  <Sequence name="Hipótese: animais perigosos" from={930} durationInFrames={85}><Shot title="Animais. Encontros. Risco." label="" pic="03" x={.55} y={.48} zoom={3.2} endZoom={3.4} duration={85} theory target/></Sequence>
  <Sequence name="B-roll: aerobarco no pântano" from={1015} durationInFrames={46}>
   <AbsoluteFill style={{background:INK}}><OffthreadVideo src={staticFile('videos/biblioteca/gta6/videos/Trailer 1 GTA VI.mp4')} trimBefore={19.2*fps} muted style={{position:'absolute',top:360,width:1080,height:1100,objectFit:'cover',objectPosition:'29% 50%'}}/><Heading title="No meio do pântano." label="" theory/><div style={{position:'absolute',left:64,top:1480,color:GOLD,fontSize:23}}>Trailer 1 • plano de contexto</div></AbsoluteFill>
  </Sequence>
  <Sequence name="Hipótese: fugir do caçador" from={1061} durationInFrames={62}><Shot title="Fugir do caçador…" label="" x={.705} y={.4} zoom={2.55} endZoom={2.72} duration={62} theory/></Sequence>
  <Sequence name="Hipótese: encontrar o jacaré" from={1123} durationInFrames={75}><Shot title="…e encontrar um jacaré." label="" pic="03" x={.555} y={.48} zoom={3.5} endZoom={3.9} duration={75} theory target/></Sequence>
  <Sequence name="Ressalva explícita" from={1198} durationInFrames={133}><Shot title="Por enquanto, é teoria." label="" x={.51} y={.51} zoom={2} endZoom={1.85} duration={133} theory note="As imagens mostram detalhes; a mecânica não está confirmada."/></Sequence>
  <Sequence name="Pergunta final: perigo no pântano" from={1331} durationInFrames={125}><Alligators reveal theory/></Sequence>
  <Captions/>
  <div style={{position:'absolute',left:64,right:64,top:77,display:'flex',justifyContent:'space-between',fontSize:21,letterSpacing:4,color:'#c8d6cb'}}><span>CLIPRUSH</span><span>ARQUIVO 022</span></div>
  <div style={{position:'absolute',left:64,bottom:110,fontSize:21,letterSpacing:4,color:'#99ada1'}}>GTA VI / SEGREDOS DE GRASSRIVERS</div>
  <Sequence from={494} durationInFrames={6}><Audio src={staticFile('videos/video-022/audio/click.wav')} volume={.16}/></Sequence>
 </AbsoluteFill>;
};
