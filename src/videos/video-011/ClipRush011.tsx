import {Audio} from '@remotion/media';
import {AbsoluteFill, Easing, Freeze, interpolate, OffthreadVideo as Video, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const original = 'videos/biblioteca/gta6/videos/gta6-extended.mp4';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const pink = '#ff5cab';
const gold = '#ffe0a1';

// Camera math recovered from TesteBiblioteca011 v002 and TestePortaMalas011 v001.
// Those validated tests and their original media remain untouched.
const Camera: React.FC<{start: number; rate?: number; zoom: [number, number]; x: number[]; y: number[]; freeze?: boolean; motionFrames?: number}> = ({start, rate = 1, zoom, x, y, freeze = false, motionFrames}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const p = interpolate(frame, [0, 20, motionFrames ?? durationInFrames - 18, durationInFrames - 1], [0, 0, 1, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const keys = x.length === 3 ? [0, .5, 1] : [0, 1];
  const scale = Math.max(width / 1920, height / 1080) * interpolate(p, [0, 1], zoom);
  const focusX = interpolate(p, keys, x);
  const focusY = interpolate(p, keys, y);
  const video = <Video src={staticFile(original)} trimBefore={Math.round(start * fps)} playbackRate={rate} muted style={{position:'absolute', width:1920 * scale, height:1080 * scale, left:Math.max(width - 1920 * scale, Math.min(0, width / 2 - focusX * scale)), top:Math.max(height - 1080 * scale, Math.min(0, height / 2 - focusY * scale))}} />;
  return <AbsoluteFill style={{overflow:'hidden'}}>{freeze ? <Freeze frame={0}>{video}</Freeze> : video}</AbsoluteFill>;
};

// Manual references only. Source limits are exclusive; retiming affects muted
// footage alone, leaving every sequence boundary and the narration untouched.
const ManualCamera: React.FC<{start: number; end: number; zoom: [number, number]; x: number[]; y: number[]; liftBottom?: boolean}> = ({start, end, zoom, x, y, liftBottom = false}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);
  const keys = x.map((_, i) => i / (x.length - 1));
  const scale = Math.max(width / 1920, height / 1080) * interpolate(p, [0, 1], zoom);
  const focusX = interpolate(p, keys, x);
  const focusY = interpolate(p, keys, y);
  return <AbsoluteFill style={{overflow:'hidden'}}>
    <Video src={staticFile(original)} trimBefore={Math.round(start * fps)} trimAfter={Math.round(end * fps)} playbackRate={Math.round((end - start) * fps) / durationInFrames} muted style={{position:'absolute',width:1920 * scale,height:1080 * scale,left:Math.max(width - 1920 * scale,Math.min(0,width / 2 - focusX * scale)),top:liftBottom ? height / 2 - focusY * scale : Math.max(height - 1080 * scale,Math.min(0,height / 2 - focusY * scale))}}/>
  </AbsoluteFill>;
};

// Follow the right-hand NPC, then reframe at the source's own reverse-angle cut.
// The full requested interval is slowed into the existing 197-frame block.
const NpcReaction: React.FC = () => {
  const frame = useCurrentFrame();
  const focusX = frame < 169 ? interpolate(frame, [0, 75, 168], [1370, 1800, 1640], clamp) : interpolate(frame, [169, 196], [1250, 1130], clamp);
  const focusY = frame < 169 ? interpolate(frame, [0, 75, 168], [570, 630, 610], clamp) : interpolate(frame, [169, 196], [520, 500], clamp);
  return <ManualCamera start={692.999} end={695.8} zoom={[1,1.24]} x={[focusX,focusX]} y={[focusY,focusY]}/>;
};

const Label: React.FC<{number?: string; title: string; note?: string; bottom?: boolean}> = ({number, title, note, bottom}) => {
  const f = useCurrentFrame();
  return <div style={{position:'absolute', left:76, right:112, top:bottom ? 1360 : 230, opacity:interpolate(f,[0,7],[0,1],clamp), translate:`0 ${interpolate(f,[0,12],[18,0],clamp)}px`, textShadow:'0 3px 18px #000'}}>
    {number && <div style={{color:gold, fontSize:29, fontWeight:800, letterSpacing:4, marginBottom:16}}>DETALHE {number} / 07</div>}
    <div style={{fontSize:67,fontWeight:900,lineHeight:1.04,letterSpacing:-2,maxWidth:880}}>{title}</div>
    {note && <div style={{fontSize:30,lineHeight:1.28,color:'#fff1da',marginTop:18,maxWidth:780}}>{note}</div>}
  </div>;
};

const Shade: React.FC = () => <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(7,8,17,.68),transparent 28%,transparent 64%,rgba(7,8,17,.65))'}}/>;

// Keep the original title, number, alignment and animation. The user approved
// removing only the obsolete absence notices after supplying the manual shots.
const ManualDetail: React.FC<{number:string; title:string; captionTop?:boolean; children:React.ReactNode}> = ({number,title,captionTop=false,children}) => {
  const f=useCurrentFrame();
  return <AbsoluteFill>
    {children}
    <AbsoluteFill style={{background:captionTop ? 'linear-gradient(180deg,#080b12dc, #080b12a0 36%,transparent 58%)' : 'linear-gradient(180deg,#080b1245,transparent 30%,transparent 52%,#080b12eb 75%,#080b12 100%)'}}/>
    <div style={{position:'absolute',left:80,right:120,top:captionTop ? 340 : 1140,borderLeft:`5px solid ${pink}`,paddingLeft:36,textShadow:'0 2px 10px #000'}}>
      <div style={{fontSize:28,color:gold,letterSpacing:4,marginBottom:24}}>DETALHE {number} / 07</div>
      <div style={{fontSize:64,fontWeight:900,letterSpacing:-2,lineHeight:1.03}}>{title}</div>
      <div style={{height:3,width:interpolate(f,[0,24],[0,160],clamp),background:pink,marginTop:20,marginBottom:20}}/>
    </div>
  </AbsoluteFill>;
};

const Hook: React.FC = () => <>
  <Camera start={706.8} rate={.6} zoom={[1,1.14]} x={[900,900]} y={[600,600]}/><Shade/>
  <div style={{position:'absolute',left:78,top:510,fontSize:320,lineHeight:1,fontWeight:900,color:gold,textShadow:'0 12px 65px #000'}}>7</div>
  <div style={{position:'absolute',left:88,right:130,top:850,fontSize:102,fontWeight:900,lineHeight:.98,letterSpacing:-5}}>DETALHES<br/><span style={{color:pink}}>DO GTA 6</span></div>
  <div style={{position:'absolute',left:90,top:1150,fontSize:30,letterSpacing:5}}>UM OLHAR MAIS PERTO</div>
</>;

const Painting: React.FC = () => {
  const f=useCurrentFrame(); const {fps}=useVideoConfig();
  return <>
    <Camera start={385.533333} freeze zoom={[1,1.12]} x={[510,330]} y={[440,400]}/><Shade/>
    <AbsoluteFill style={{background:'#080b1690',opacity:interpolate(f,[23,42],[0,1],clamp)}}/>
    <div style={{position:'absolute',left:240,top:620,width:600,height:710,overflow:'hidden',border:`3px solid ${gold}`,borderRadius:8,boxShadow:'0 18px 80px #0008',opacity:interpolate(f,[23,42],[0,1],clamp),scale:interpolate(f,[23,68],[.93,1],clamp)}}>
      <Freeze frame={0}><Video src={staticFile(original)} trimBefore={Math.round(385.533333*fps)} muted style={{position:'absolute',width:1920*2.75,height:1080*2.75,left:-176*2.75,top:-3*2.75}}/></Freeze>
    </div>
    <Label number="02" title="LEMBRA VICE CITY?"/>
    <div style={{position:'absolute',top:1410,left:140,right:150,textAlign:'center',fontSize:31,color:gold,opacity:interpolate(f,[50,65],[0,1],clamp)}}>O quadro no apartamento</div>
  </>;
};

const Trunk: React.FC = () => <>
  <ManualCamera start={507} end={508.8} zoom={[1.08,1.3]} x={[960,945]} y={[670,650]}/><Shade/>
  <Label number="03" title="REPAROU NESSE DETALHE?" note="As marcas de uso não foram confirmadas na fonte."/>
</>;

const Fridge: React.FC = () => {
  const f=useCurrentFrame();
  return <>
    <Camera start={437.166667} rate={.76} zoom={[1,2.1]} x={[1327,1410,1475]} y={[605,670,495]}/><Shade/>
    <Label number="04" title={f<62 ? 'NA GELADEIRA…' : 'UM CACHORRO?!'} note={f>95 ? 'Pets? Por enquanto, só uma hipótese.' : undefined}/>
    <div style={{position:'absolute',left:interpolate(f,[142,152,155],[95,195,225],clamp),top:interpolate(f,[142,152,155],[460,590,630],clamp),width:550,height:520,rotate:'17deg',border:`3px solid ${gold}`,borderRadius:14,boxShadow:`0 0 18px ${gold}60`,opacity:interpolate(f,[136,144],[0,1],clamp)}}/>
  </>;
};

const Earrings: React.FC = () => <>
  <ManualCamera start={391.4} end={391.4 + 94 / 30} zoom={[1.3,1.5]} x={[1180,930,960,1110,1180]} y={[480,420,420,430,470]}/><Shade/>
  <Label number="05" title="OS BRINCOS DA LUCIA" bottom note="Movimento independente não confirmado."/>
</>;

const Cords: React.FC = () => <>
  <ManualCamera start={828.5} end={829} zoom={[1.2,1.45]} x={[1380,1350]} y={[790,800]}/><Shade/>
  <Label number="05" title="CORDÕES DA ROUPA"/>
</>;

const Closing: React.FC = () => {
  const f=useCurrentFrame();
  return <>
    <AbsoluteFill style={{filter:'blur(18px)',scale:1.08}}><Camera start={510} rate={.45} zoom={[1,1.08]} x={[975,960]} y={[740,740]}/></AbsoluteFill>
    <AbsoluteFill style={{background:'#0a0c19be'}}/>
    <div style={{position:'absolute',left:88,right:130,top:640,fontSize:102,fontWeight:900,lineHeight:1.03,letterSpacing:-4}}>QUAL VOCÊ<br/><span style={{color:gold}}>NÃO VIU?</span></div>
    <div style={{position:'absolute',left:88,right:130,top:1040,padding:'30px 32px',background:pink,color:'#180c22',fontSize:49,fontWeight:900,borderRadius:10,opacity:interpolate(f,[53,66],[0,1],clamp)}}>SEGUE O CLIPRUSH</div>
  </>;
};

const Brand:React.FC=()=> <div style={{position:'absolute',top:180,left:78,fontSize:24,fontWeight:900,letterSpacing:4,color:'white',textShadow:'0 2px 8px #000'}}>CLIP<span style={{color:pink}}>RUSH</span></div>;

export const ClipRush011:React.FC=()=> <AbsoluteFill style={{background:'#080b12',color:'white',fontFamily:'Arial, sans-serif',overflow:'hidden'}}>
  <Sequence name="Gancho • prévia do porta-malas" durationInFrames={102}><Hook/></Sequence>
  <Sequence name="01 • NPCs • referência manual 099" from={102} durationInFrames={197}><ManualDetail number="01" title="REAÇÕES DOS NPCs"><NpcReaction/></ManualDetail></Sequence>
  <Sequence name="02 • quadro • original 06:25.533" from={299} durationInFrames={148}><Painting/></Sequence>
  <Sequence name="03 • porta-malas • teste v001" from={447} durationInFrames={197}><Trunk/></Sequence>
  <Sequence name="04 • geladeira • teste v002" from={644} durationInFrames={156}><Fridge/></Sequence>
  <Sequence name="05A • brincos • quarto rosa" from={800} durationInFrames={94}><Earrings/></Sequence>
  <Sequence name="05B • cordões • original 13:48.500–13:49" from={894} durationInFrames={43}><Cords/></Sequence>
  <Sequence name="05C • mochila • referência manual 165" from={937} durationInFrames={75}><ManualDetail number="05" title="A MOCHILA" captionTop><ManualCamera start={1084 + 11 / 30} end={1085} zoom={[1.2,1.28]} x={[640,655]} y={[800,800]}/></ManualDetail></Sequence>
  <Sequence name="06 • molotov • original 16:01.100–16:01.700" from={1012} durationInFrames={102}><ManualDetail number="06" title="O LÍQUIDO DO MOLOTOV"><ManualCamera start={961.1} end={961.7} zoom={[1.45,1.7]} x={[425,425]} y={[960,970]} liftBottom/></ManualDetail></Sequence>
  <Sequence name="07 • rato • referência manual 072" from={1114} durationInFrames={159}><ManualDetail number="07" title="EMBAIXO DA MÁQUINA"><ManualCamera start={545.1} end={546} zoom={[2.5,3.1]} x={[1245,1245]} y={[815,815]}/></ManualDetail></Sequence>
  <Sequence name="CTA • original desfocado" from={1273} durationInFrames={128}><Closing/></Sequence>
  <Audio name="Narração integral • sem cortes" src={staticFile('videos/video-011/audio/narracao.mp3')}/>
  <Brand/>
</AbsoluteFill>;
