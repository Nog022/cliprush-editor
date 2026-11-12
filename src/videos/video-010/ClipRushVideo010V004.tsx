import type { CSSProperties } from 'react';
import { Audio, Video } from '@remotion/media';
import { AbsoluteFill, CanvasImage, Sequence, Track, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import captions from './captions-v003.json';

const asset = (p: string) => staticFile(`videos/video-010/${p}`);
const cream = '#fff4df', mint = '#b5f2cf', pink = '#ffae98', bg = '#091d21';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const images = {
  cat: 'gato_comendo_passaro.jpg', hawk: 'gaviao_pegando_peixe_rdr2.jpg', horses: 'cavalos_rdr2.jpg',
  gator: 'carros_passando ao lado de um jacare gta 6.jpg', lizard: 'lagarto__gta6.jpg',
  puma: 'puma_gta6.jpg', fish: 'peixe_leao_gta6.jpg', swamp: 'pantano_gta6.jpg',
};
type ImageKey = keyof typeof images;
const box: CSSProperties = { position: 'absolute', left: 60, right: 110, top: 455, height: 900, overflow: 'hidden', borderRadius: 24 };

const Picture = ({ name, focus = '50% 50%', fit = 'contain' }: { name: ImageKey; focus?: string; fit?: 'contain' | 'cover' }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <AbsoluteFill style={{ overflow: 'hidden', background: '#132a2b' }}>
    <CanvasImage src={asset(`imagens/${images[name]}`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(30px)', opacity: .25 }} />
    <CanvasImage src={asset(`imagens/${images[name]}`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, objectPosition: focus, scale: interpolate(f, [0, 10, durationInFrames], [1, 1.025, 1.065], clamp), translate: `${interpolate(f, [0, durationInFrames], [0, -8], clamp)}px 0` }} />
  </AbsoluteFill>;
};
const trailerFiles = {
  rdr: 'Red Dead Redemption 2 Trailer [gmA6MrX81z4].mp4',
  gta1: 'Trailer 1 GTA VI.mp4',
  gta2: 'Trailer 2 GTA VI.mp4',
} as const;
type TrailerProps = {
  source: keyof typeof trailerFiles;
  name: string;
  trimBefore: number;
  durationInFrames: number;
  from?: number;
};
// Each shot owns its start time. Native speed preserves the source cadence;
// explicit durations stop before a different shot or the end of the source.
const Trailer = ({ source, name, trimBefore, durationInFrames, from = 0 }: TrailerProps) => <Video
  name={name} muted src={asset(`videos-complementar/${trailerFiles[source]}`)}
  from={from} trimBefore={trimBefore} durationInFrames={durationInFrames}
  objectFit="cover" style={{ width: '100%', height: '100%' }}
/>;
const Tag = ({ text, color = mint }: { text: string; color?: string }) => <div style={{ position: 'absolute', left: 26, top: 25, padding: '12px 18px', background: bg, borderLeft: `5px solid ${color}`, fontSize: 29, fontWeight: 800, color }}>{text}</div>;

const Title = ({ kicker, title, color = mint }: { kicker: string; title: string; color?: string }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 24, stiffness: 220 } });
  return <div style={{ position: 'absolute', top: 175, left: 65, right: 115, opacity: .35 + enter * .65, translate: `0 ${18 * (1 - enter)}px` }}>
    <div style={{ color, fontWeight: 800, letterSpacing: 3, fontSize: 29, marginBottom: 20 }}>{kicker}</div>
    <div style={{ fontWeight: 900, fontSize: 89, letterSpacing: -4, lineHeight: 1.02, whiteSpace: 'pre-line' }}>{title}</div>
  </div>;
};

const Evidence = ({ name, title, kicker, note, target }: { name: ImageKey; title: string; kicker: string; note: string; target?: { x: number; y: number; w: number; h: number } }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <Title kicker={kicker} title={title} color={['cat', 'hawk', 'horses'].includes(name) ? pink : mint} />
    <div style={box}><Picture name={name} />
      {target && <div style={{ position: 'absolute', left: `${target.x}%`, top: `${target.y}%`, width: `${target.w}%`, height: `${target.h}%`, border: `4px solid ${mint}`, borderRadius: 30, opacity: interpolate(f, [4, 12], [0, .85], clamp), scale: interpolate(f, [4, 14], [1.06, 1], clamp) }} />}
      <div style={{ position: 'absolute', left: 25, bottom: 20, fontSize: 23, background: '#091d21dd', padding: '9px 13px' }}>IMAGEM FORNECIDA • {['cat', 'hawk', 'horses'].includes(name) ? 'RDR2' : 'GTA 6'}</div>
    </div>
    <div style={{ position: 'absolute', top: 1390, left: 70, right: 125, fontSize: 33, lineHeight: 1.2, color: '#c4d7d4' }}>{note}</div>
  </AbsoluteFill>;
};

const Duel = ({ ending = false }: { ending?: boolean }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <AbsoluteFill>
    <Title kicker={ending ? 'QUAL DOS DOIS VENCE?' : 'VIDA SELVAGEM'} title={ending ? 'RDR2 OU\nGTA 6?' : 'GTA 6\nVS RDR2'} />
    <div style={{ ...box, top: 465, height: 420, scale: interpolate(f, [0, 8, 20], [1.045, 1, 1], clamp) }}><Trailer source="rdr" name={ending ? "Bisões / velocidade original" : "Natureza RDR2 / velocidade original"} trimBefore={Math.round((ending ? 36.2 : 12.5) * fps)} durationInFrames={ending ? 47 : 106} /><Tag text="RED DEAD REDEMPTION 2" color={pink} /></div>
    <div style={{ ...box, top: 910, height: 420 }}>{ending ? <Trailer source="gta2" name="Costa / velocidade original" trimBefore={Math.round(6.5 * fps)} durationInFrames={47} /> : <>
      <Trailer source="gta1" name="Pântano / velocidade original" trimBefore={Math.round(19.3 * fps)} durationInFrames={42} />
      <Trailer source="gta1" name="Flamingos / velocidade original" from={42} trimBefore={Math.round(20.8 * fps)} durationInFrames={27} />
      <Trailer source="gta1" name="Golfinhos / velocidade original" from={69} trimBefore={Math.round(11.067 * fps)} durationInFrames={37} />
    </>}<Tag text="GTA 6" /></div>
    <div style={{ position: 'absolute', top: 1365, left: 70, right: 130, fontSize: 32, color: '#c4d7d4' }}>{ending ? 'Comportamento ou variedade?' : 'Dois mundos. Uma comparação.'}</div>
  </AbsoluteFill>;
};

const Nature = () => {
  const { fps } = useVideoConfig();
  return <AbsoluteFill>
  <Title kicker="RED DEAD REDEMPTION 2" title={'NATUREZA\nVIVA'} color={pink} />
  <div style={box}><Trailer source="rdr" name="Natureza viva / velocidade original" trimBefore={Math.round(12.5 * fps)} durationInFrames={105} /><Tag text="CENAS DO TRAILER • RDR2" color={pink} /></div>
  <div style={{ position: 'absolute', top: 1390, left: 70, fontSize: 35, color: pink }}>O cenário também participa.</div>
</AbsoluteFill>;
};

const Leonida = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ translate: `${interpolate(f, [0, 6], [90, 0], clamp)}px 0` }}>
    <Title kicker="AGORA OLHA LEONIDA" title={'JACARÉ\nENTRE CARROS'} />
    <div style={box}><Picture name="gator" />
      <svg viewBox="0 0 910 900" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: interpolate(f, [42, 54], [0, 1], clamp) }}><path d="M 780 430 Q 760 505 680 545" fill="none" stroke={mint} strokeWidth="6" /><path d="m 680 545 12 -28 m -12 28 30 -2" stroke={mint} strokeWidth="6" /><ellipse cx="645" cy="555" rx="65" ry="45" fill="none" stroke={mint} strokeWidth="4" /></svg>
      <Tag text="IMAGEM FORNECIDA • GTA 6" />
    </div>
    <div style={{ position: 'absolute', top: 1390, left: 70, fontSize: 34, color: mint }}>Trânsito e fauna dividindo espaço.</div>
  </AbsoluteFill>;
};

const Wetlands = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <AbsoluteFill>
    <Title kicker="PÂNTANOS DE LEONIDA" title={'VIDA POR\nTODOS OS LADOS'} />
    <div style={box}>
      <Sequence name="Pântano / imagem fornecida" durationInFrames={53}><Picture name="swamp" /></Sequence>
      <Trailer source="gta1" name="Aves no pântano / entrada com relógio próprio" from={53} trimBefore={Math.round(19.9 * fps)} durationInFrames={21} />
      <Trailer source="gta1" name="Flamingos / entrada com relógio próprio" from={74} trimBefore={Math.round(20.8 * fps)} durationInFrames={27} />
      <Tag text={f < 53 ? 'IMAGEM FORNECIDA • GTA 6' : 'AVES VISÍVEIS • TRAILER 1'} />
    </div>
  </AbsoluteFill>;
};

const Comparison = () => {
  const f = useCurrentFrame();
  const stage = f < 41 ? 'O DESAFIO' : f < 104 ? 'MOSTRAR IMPRESSIONA' : 'INTERAGIR É OUTRA HISTÓRIA';
  return <AbsoluteFill>
    <Title kicker="VISUAL × COMPORTAMENTO" title={'PARECER VIVO\nÉ SÓ O COMEÇO'} color={pink} />
    <div style={{ position: 'absolute', top: 475, left: 60, right: 110, display: 'flex', gap: 22 }}>
      {(['rdr', 'gta'] as const).map((game) => <div key={game} style={{ width: 444, opacity: interpolate(f, [41, 62, 104, 126], game === 'rdr' ? [.7, .7, .7, 1] : [1, 1, 1, .7], clamp) }}>
        <div style={{ fontSize: 39, fontWeight: 900, color: game === 'rdr' ? pink : mint, marginBottom: 20 }}>{game === 'rdr' ? 'RDR2' : 'GTA 6'}</div>
        {(game === 'rdr' ? ['cat', 'hawk'] as const : ['puma', 'swamp'] as const).map((name) => <div key={name} style={{ height: 310, position: 'relative', marginBottom: 18, overflow: 'hidden', borderRadius: 16 }}><Picture name={name} /></div>)}
        <div style={{ borderTop: `5px solid ${game === 'rdr' ? pink : mint}`, paddingTop: 22, fontSize: 32, fontWeight: 800, lineHeight: 1.15 }}>{game === 'rdr' ? 'COMPORTAMENTO\nOBSERVADO' : 'VARIEDADE\nMOSTRADA'}</div>
      </div>)}
    </div>
    <div style={{ position: 'absolute', top: 1380, left: 60, right: 110, fontSize: 32, textAlign: 'center', color: mint }}>{stage}</div>
    <div style={{ position: 'absolute', top: 1440, left: 60, right: 110, fontSize: 25, color: '#c4d7d4', textAlign: 'center' }}>As imagens não confirmam a profundidade da IA de GTA 6.</div>
  </AbsoluteFill>;
};

const Captions = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const ms = f / fps * 1000;
  // Short word groups preserve the supplied narration's clock across all cuts.
  const groups: typeof captions[] = []; let group: typeof captions = [];
  for (const word of captions) {
    group.push(word);
    if (group.length >= 5 || /[.!?:,]$/.test(word.text)) { groups.push(group); group = []; }
  }
  if (group.length) groups.push(group);
  const active = groups.find((g, i) => ms >= g[0].startMs && ms < Math.min((groups[i + 1]?.[0].startMs ?? 37564), g[g.length - 1].endMs + 220));
  return <div data-safe="captions" style={{ position: 'absolute', top: 1550, left: 65, right: 125, minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 53, lineHeight: 1.16, fontWeight: 800, textShadow: '0 3px 10px #000' }}>
    <div>{active?.map((w, i) => <span key={i} style={{ color: ms >= w.startMs && ms < w.endMs ? mint : cream }}>{w.text}{' '}</span>)}</div>
  </div>;
};

export const ClipRushVideo010V004 = () => {
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ background: bg, color: cream, fontFamily: 'Arial, Helvetica, sans-serif' }}>
    <div style={{ position: 'absolute', left: 65, top: 95, fontSize: 25, letterSpacing: 4, color: '#b8d1c9' }}>VIDA SELVAGEM / RDR2 × GTA 6</div>
    <Track name="Storyboard atualizado / alinhado à narração">
      <Sequence name="Gancho / trailers RDR2 e GTA 6" durationInFrames={Math.round(3.54 * fps)}><Duel /></Sequence>
      <Sequence name="Natureza viva / trailer RDR2" from={Math.round(3.54 * fps)} durationInFrames={Math.round(7.02 * fps) - Math.round(3.54 * fps)}><Nature /></Sequence>
      <Sequence name="Gato e pássaro" from={Math.round(7.02 * fps)} durationInFrames={Math.round(8.84 * fps) - Math.round(7.02 * fps)}><Evidence name="cat" kicker="RED DEAD REDEMPTION 2" title={'INTERAÇÃO\nANIMAL'} note="Gato e pássaro no mesmo enquadramento." target={{ x: 26, y: 32, w: 43, h: 35 }} /></Sequence>
      <Sequence name="Gavião e peixe" from={Math.round(8.84 * fps)} durationInFrames={Math.round(10.38 * fps) - Math.round(8.84 * fps)}><Evidence name="hawk" kicker="RED DEAD REDEMPTION 2" title={'GAVIÃO\nE PEIXE'} note="A interação está no detalhe." target={{ x: 38, y: 47, w: 24, h: 26 }} /></Sequence>
      <Sequence name="Cavalos / mundo vivo" from={Math.round(10.38 * fps)} durationInFrames={Math.round(12.78 * fps) - Math.round(10.38 * fps)}><Evidence name="horses" kicker="RED DEAD REDEMPTION 2" title={'UM MUNDO\nCOM VIDA'} note="Até os cavalos participam da paisagem." /></Sequence>
      <Sequence name="Virada / Leonida e jacaré" from={Math.round(12.78 * fps)} durationInFrames={Math.round(17.06 * fps) - Math.round(12.78 * fps)}><Leonida /></Sequence>
      <Sequence name="Lagarto" from={Math.round(17.06 * fps)} durationInFrames={Math.round(17.88 * fps) - Math.round(17.06 * fps)}><Evidence name="lizard" kicker="FAUNA DE LEONIDA" title="LAGARTO" note="Da costa…" /></Sequence>
      <Sequence name="Puma" from={Math.round(17.88 * fps)} durationInFrames={Math.round(19.08 * fps) - Math.round(17.88 * fps)}><Evidence name="puma" kicker="FAUNA DE LEONIDA" title="PUMA" note="…ao interior…" /></Sequence>
      <Sequence name="Mergulho / peixe-leão" from={Math.round(19.08 * fps)} durationInFrames={Math.round(21.26 * fps) - Math.round(19.08 * fps)}><Evidence name="fish" kicker="NO FUNDO DO MAR" title="PEIXE-LEÃO" note="…e até debaixo d’água." target={{ x: 62, y: 52, w: 29, h: 26 }} /></Sequence>
      <Sequence name="Pântanos / imagem e aves do trailer" from={Math.round(21.26 * fps)} durationInFrames={Math.round(24.62 * fps) - Math.round(21.26 * fps)}><Wetlands /></Sequence>
      <Sequence name="Virada / comparação didática" from={Math.round(24.62 * fps)} durationInFrames={Math.round(31.66 * fps) - Math.round(24.62 * fps)}><Comparison /></Sequence>
      <Sequence name="Conclusão / gato e gavião" from={Math.round(31.66 * fps)} durationInFrames={Math.round(33.70 * fps) - Math.round(31.66 * fps)}><Evidence name="cat" kicker="RED DEAD 2 JÁ FAZ ISSO" title={'A FORÇA DAS\nINTERAÇÕES'} note="Comportamento observado nas imagens fornecidas." /></Sequence>
      <Sequence name="Conclusão / natureza do trailer 2" from={Math.round(33.70 * fps)} durationInFrames={Math.round(36 * fps) - Math.round(33.70 * fps)}><AbsoluteFill><Title kicker="SERÁ QUE GTA 6 VAI MAIS LONGE?" title={'O PRÓXIMO\nPASSO?'} /><div style={box}><Trailer source="gta2" name="Costa de Leonida / velocidade original" trimBefore={Math.round(6.5 * fps)} durationInFrames={48} />
        <Trailer source="gta1" name="Natureza de Leonida / velocidade original" from={48} trimBefore={Math.round(19.3 * fps)} durationInFrames={21} />
        <Tag text="LEONIDA • TRAILERS" /></div></AbsoluteFill></Sequence>
      <Sequence name="Pergunta final / comparação" from={36 * fps} durationInFrames={1127 - 36 * fps}><Duel ending /></Sequence>
    </Track>
    <Captions />
    <Audio name="Nova narração integral / sem alteração" src={asset('audio/narracao.mp3')} />
    <Audio name="Ambiente sutil e impactos" src={asset('edit-v003/ambiente-sutil.wav')} />
  </AbsoluteFill>;
};
