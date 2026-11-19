import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const GOLD='#ffdc8c';
export const MINT='#bbddba';
export const INK='#091310';
export const ease={extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.2,.65,.25,1)} as const;
export const image=(pic:string)=>staticFile(`videos/biblioteca/gta6/imagens novas/grassrivers-${pic}.jpg`);

export function Heading({title,label,theory=false}:{title:string;label:string;theory?:boolean}){
 return <><div style={{position:'absolute',left:64,top:143,fontSize:23,fontWeight:700,letterSpacing:4,color:theory?GOLD:MINT}}>{theory?'HIPÓTESE • NÃO CONFIRMADA':label}</div><div style={{position:'absolute',left:60,right:60,top:198,fontSize:70,fontWeight:900,lineHeight:1.04,letterSpacing:-2}}>{title}</div></>;
}

export function Shot({pic='01',title,label,x=.5,y=.5,zoom=1.9,endZoom=2.04,duration,target=false,theory=false,note}:{pic?:string;title:string;label:string;x?:number;y?:number;zoom?:number;endZoom?:number;duration:number;target?:boolean;theory?:boolean;note?:string}){
 const f=useCurrentFrame();
 const z=interpolate(f,[0,duration],[zoom,endZoom],ease);
 const w=1080*z,h=w*9/16;
 const left=Math.max(1080-w,Math.min(0,540-x*w));
 const top=Math.max(1100-h,Math.min(0,550-y*h));
 return <AbsoluteFill style={{background:INK,overflow:'hidden'}}>
  <Img src={image(pic)} style={{width:1080,height:1920,objectFit:'cover',filter:'blur(35px) brightness(.25)',scale:1.1}}/>
  <AbsoluteFill style={{background:'linear-gradient(180deg,#091310 4%,#09131090 27%,transparent 52%,#091310 91%)'}}/>
  <div style={{position:'absolute',top:360,width:1080,height:1100,overflow:'hidden'}}>
   <Img src={image(pic)} style={{position:'absolute',width:w,height:h,maxWidth:'none',left,top,filter:'contrast(1.025) saturate(.94)'}}/>
   {target&&<svg width="1080" height="1100" style={{position:'absolute',inset:0,opacity:interpolate(f,[7,18],[0,1],ease)}}><ellipse cx={left+x*w} cy={top+y*h} rx={pic==='01'&&y>.6?175:150} ry={pic==='01'&&y>.6?140:125} stroke={GOLD} strokeWidth="5" fill="none"/><path d={`M${left+x*w+125} ${top+y*h-100}l55 -60h110`} stroke={GOLD} strokeWidth="4" fill="none"/></svg>}
   <AbsoluteFill style={{background:'linear-gradient(180deg,#09131020,transparent 20%,transparent 86%,#091310cc)'}}/>
   <div style={{position:'absolute',left:60,bottom:25,color:'#fff',fontSize:20,letterSpacing:3,textShadow:'0 2px 6px #000'}}>GRASSRIVERS / IMAGEM {pic==='01'?'01':'02'}</div>
  </div>
  <Heading title={title} label={label} theory={theory}/>
  {note&&<div style={{position:'absolute',left:64,right:64,top:1476,fontSize:24,color:theory?GOLD:MINT}}>{note}</div>}
 </AbsoluteFill>;
}

const animals=[{x:.318,y:.13},{x:.555,y:.48},{x:.56,y:.835}];
export function Alligators({reveal=false,theory=false}:{reveal?:boolean;theory?:boolean}){
 const f=useCurrentFrame();
 return <AbsoluteFill style={{background:INK}}>
  <Heading title={theory?'O perigo está ao redor.':'Um barco. Três jacarés.'} label="02 / SEGUNDA IMAGEM" theory={theory}/>
  <div style={{position:'absolute',top:400,width:1080,height:608}}>
   <Img src={image('03')} style={{width:1080,height:608}}/>
   {reveal&&<svg width="1080" height="608" style={{position:'absolute',inset:0}}>{animals.map((a,i)=><g key={i} opacity={interpolate(f,[i*13,i*13+10],[0,1],ease)}><ellipse cx={a.x*1080} cy={a.y*608} rx={49} ry={48} stroke={GOLD} strokeWidth={3} fill="none"/><circle cx={a.x*1080+36} cy={a.y*608-35} r={19} fill={GOLD}/><text x={a.x*1080+36} y={a.y*608-28} textAnchor="middle" fill={INK} fontSize={21} fontWeight={900}>{i+1}</text></g>)}</svg>}
  </div>
  {animals.map((a,i)=><div key={i} style={{position:'absolute',left:54+i*330,top:1060,width:312,height:370,overflow:'hidden',border:'1px solid #bbddba55',borderRadius:8,opacity:reveal?interpolate(f,[i*13,i*13+12],[0,1],ease):.6}}>
   <Img src={image('03')} style={{position:'absolute',width:2050,height:1153,maxWidth:'none',left:156-a.x*2050,top:175-a.y*1153,filter:'brightness(1.22)'}}/>
   <div style={{position:'absolute',left:14,top:14,padding:'7px 12px',background:GOLD,color:INK,fontSize:25,fontWeight:900}}>0{i+1}</div>
  </div>)}
  <div style={{position:'absolute',left:64,top:1476,fontSize:24,color:MINT}}>Ampliações da mesma imagem • sem elementos adicionados</div>
 </AbsoluteFill>;
}

export function CTA(){
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 return <div style={{position:'absolute',left:170,top:1110,width:740,padding:'25px 24px',borderRadius:18,border:`1px solid ${GOLD}`,background:'#091310ef',textAlign:'center',scale:spring({frame:f,fps,config:{damping:18}})}}>
  <svg width="53" height="53" viewBox="0 0 100 100" style={{verticalAlign:'middle',marginRight:20,rotate:`${interpolate(f,[0,18,35],[0,-13,0],ease)}deg`}}><path d="M36 43L53 14q13-5 10 13l-3 16h22q12 1 7 15l-10 29H36ZM13 43h16v44H13Z" fill={GOLD}/></svg>
  <span style={{fontSize:39,fontWeight:800,color:GOLD}}>CURTA O DETALHE</span>
  <div style={{marginTop:14,fontSize:31,color:MINT}}>{f>46?'✓ CLIPRUSH • MAIS DESCOBERTAS':'+ SIGA O CLIPRUSH'}</div>
  {Array.from({length:6},(_,i)=><div key={i} style={{position:'absolute',left:370+Math.cos(i)*f*2,top:30+Math.sin(i)*f,width:6,height:6,background:GOLD,borderRadius:6,opacity:interpolate(f,[10,20,35],[0,1,0],ease)}}/>)}
 </div>;
}
