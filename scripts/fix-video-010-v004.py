from pathlib import Path
p=Path('src/videos/video-010/ClipRushVideo010V003.tsx');s=p.read_text(encoding='utf-8')
def replace(old,new):
 global s
 assert old in s,old[:100]
 s=s.replace(old,new)
replace("const Clip = ({ name, rate = 1 }: { name: string; rate?: number }) => <Video muted src={asset(name === 'coast' || name === 'flamingos' ? `edit-v003/${name}.mp4` : `edit/${name}.mp4`)} playbackRate={rate} objectFit=\"cover\" style={{ width: '100%', height: '100%' }} />;",'''const trailerFiles = {
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
/>;''')
replace("const Duel = ({ ending = false }: { ending?: boolean }) => {\n  const f = useCurrentFrame();", "const Duel = ({ ending = false }: { ending?: boolean }) => {\n  const f = useCurrentFrame();\n  const { fps } = useVideoConfig();")
replace('<Clip name={ending ? \'rdr-bison\' : \'rdr-nature\'} rate={ending ? .55 : .95} />','<Trailer source="rdr" name={ending ? "Bisões / velocidade original" : "Natureza RDR2 / velocidade original"} trimBefore={Math.round((ending ? 36.8 : 12.5) * fps)} durationInFrames={ending ? 47 : 106} />')
replace('<Clip name={ending ? \'coast\' : \'gta-wetlands\'} rate={ending ? .4 : .35} />','''{ending ? <Trailer source="gta2" name="Costa / velocidade original" trimBefore={Math.round(6.5 * fps)} durationInFrames={47} /> : <>
      <Trailer source="gta1" name="Pântano / velocidade original" trimBefore={Math.round(19.27 * fps)} durationInFrames={44} />
      <Trailer source="gta1" name="Golfinhos / velocidade original" from={44} trimBefore={Math.round(10.9 * fps)} durationInFrames={62} />
    </>}''')
replace('const Nature = () => <AbsoluteFill>', 'const Nature = () => {\n  const { fps } = useVideoConfig();\n  return <AbsoluteFill>')
replace('<Clip name="rdr-nature" rate={.85} />','<Trailer source="rdr" name="Natureza viva / velocidade original" trimBefore={Math.round(12.5 * fps)} durationInFrames={105} />')
replace('</AbsoluteFill>;\n\nconst Leonida', '</AbsoluteFill>;\n};\n\nconst Leonida')
replace('const Wetlands = () => {\n  const f = useCurrentFrame();','const Wetlands = () => {\n  const f = useCurrentFrame();\n  const { fps } = useVideoConfig();')
replace('<div style={box}>{f < 53 ? <Picture name="swamp" /> : <Clip name="flamingos" rate={.23} />}<Tag text={f < 53 ? \'IMAGEM FORNECIDA • GTA 6\' : \'AVES VISÍVEIS • TRAILER 1\'} /></div>', '''<div style={box}>
      <Sequence name="Pântano / imagem fornecida" durationInFrames={53}><Picture name="swamp" /></Sequence>
      <Trailer source="gta1" name="Aves no pântano / entrada com relógio próprio" from={53} trimBefore={Math.round(19.9 * fps)} durationInFrames={18} />
      <Trailer source="gta1" name="Flamingos / entrada com relógio próprio" from={71} trimBefore={Math.round(20.8 * fps)} durationInFrames={30} />
      <Tag text={f < 53 ? 'IMAGEM FORNECIDA • GTA 6' : 'AVES VISÍVEIS • TRAILER 1'} />
    </div>''')
replace('export const ClipRushVideo010V003', 'export const ClipRushVideo010V004')
replace('<Clip name="coast" rate={.4} /><Tag text="LEONIDA • TRAILER 2" />','''<Trailer source="gta2" name="Costa de Leonida / velocidade original" trimBefore={Math.round(6.5 * fps)} durationInFrames={48} />
        <Trailer source="gta1" name="Natureza de Leonida / velocidade original" from={48} trimBefore={Math.round(19.3 * fps)} durationInFrames={21} />
        <Tag text="LEONIDA • TRAILERS" />''')
target=Path('src/videos/video-010/ClipRushVideo010V004.tsx');assert not target.exists();target.write_text(s,encoding='utf-8')
r=Path('src/Root.tsx');s=r.read_text(encoding='utf-8');s='import { ClipRushVideo010V004 } from "./videos/video-010/ClipRushVideo010V004";\n'+s;s=s.replace('      <MyComposition />','      <MyComposition />\n      <Composition id="ClipRushVideo010V004" component={ClipRushVideo010V004} durationInFrames={1127} fps={30} width={1080} height={1920} />');r.write_text(s,encoding='utf-8')
r=Path('scripts/review-video-010-v003.mjs');s=r.read_text(encoding='utf-8').replace('reparo-v003','reparo-v004').replace('ClipRushVideo010V003','ClipRushVideo010V004').replace('video-010-v003.mp4','video-010-v004.mp4').replace('[0,40,160,229,286,338,420,522,553,593,662,711,770,850,925,980,1040,1105,1126]','[0,43,44,105,160,690,691,708,709,724,738,1011,1058,1059,1079,1080,1105,1126]');Path('scripts/review-video-010-v004.mjs').write_text(s,encoding='utf-8')
print('V004: native-speed trailers; timed video starts; prior V003 preserved.')
