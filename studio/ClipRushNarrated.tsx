import {AbsoluteFill, Easing, OffthreadVideo, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Asset, Clip, Project, Scene} from '../shared/model';
import {coverRegion} from '../src/templates/webcam_top_gameplay_bottom/geometry';
import {NeonCaptions} from '../src/components/NeonCaptions';

const accent = '#47eaff';

/** The existing uniform cover geometry, driven by inspected subject coordinates. */
export function NarratedFootage({clip, asset, src}: {clip: Clip; asset: Asset; src: string}) {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const camera = clip.narratedFraming;
  if (!camera || !asset.width || !asset.height) throw new Error('Enquadramento narrado ausente.');
  const t = interpolate(frame, [0, Math.max(1, clip.durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad),
  });
  const mix = (a: number, b: number) => a + (b - a) * t;
  const crop = coverRegion({x: 0, y: 0, w: asset.width, h: asset.height}, width, height,
    {x: mix(camera.start.x, camera.end.x) * asset.width, y: mix(camera.start.y, camera.end.y) * asset.height},
    mix(camera.start.zoom, camera.end.zoom));
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <OffthreadVideo src={src} trimBefore={clip.trimBefore ?? 0} playbackRate={camera.playbackRate}
      muted style={{position: 'absolute', width: asset.width * crop.scale, height: asset.height * crop.scale,
        maxWidth: 'none', left: crop.left, top: crop.top}} />
  </AbsoluteFill>;
}

function Heading({scene}: {scene: Scene}) {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', top: 178, left: 76, right: 95,
    fontFamily: 'Arial, sans-serif', fontSize: 72, lineHeight: 1.04, letterSpacing: -2, color: '#fff', fontWeight: 900,
    textShadow: '0 3px 20px #000', opacity: interpolate(frame, [0, 7], [.5, 1], {extrapolateRight: 'clamp'}),
    translate: `0 ${interpolate(frame, [0, 12], [12, 0], {extrapolateRight: 'clamp'})}px`}}>
    {scene.title}<div style={{marginTop: 20, fontSize: 25, letterSpacing: 3, color: accent}}>{scene.subtitle}</div>
  </div>;
}

function NarratedCTA({scene}: {scene: Scene}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 17, stiffness: 220}});
  const exit = scene.durationInFrames - 1;
  return <div style={{position: 'absolute', top: 1640, left: 140, right: 140, height: 95,
    borderRadius: 48, background: '#071b23f0', border: `2px solid ${accent}`, color: accent,
    fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontSize: 32, fontWeight: 900,
    scale: enter, opacity: interpolate(frame, [0, 4, exit - 7, exit], [0, 1, 1, 0], {extrapolateRight: 'clamp'})}}>
    <svg width="43" height="43" viewBox="0 0 24 24" fill={frame > 17 ? accent : 'none'} stroke={accent} strokeWidth="1.7">
      <path d="M7 10v11H3V10h4Zm0 0 5-8c2 0 3 2 2 5l-1 3h6c2 0 3 1 2 3l-2 7c0 1-1 1-2 1H7"/>
    </svg>
    {frame > 25 ? '✓ SIGA O CLIPRUSH' : scene.title}
    {Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute',
      left: 94 + Math.cos(i * Math.PI / 3) * frame * 1.4,
      top: 44 + Math.sin(i * Math.PI / 3) * frame * 1.4, width: 6, height: 6, borderRadius: 4,
      background: accent, opacity: interpolate(frame, [8, 16, 29], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}/>)}
  </div>;
}

export function NarratedScene({scene}: {scene: Scene}) {
  return scene.narratedRole === 'cta' ? <NarratedCTA scene={scene}/> : <Heading scene={scene}/>;
}

export function NarratedOverlay({project}: {project: Project}) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none', fontFamily: 'Arial, sans-serif'}}>
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#05101bdf,transparent 25%,transparent 68%,#05101b9c)'}}/>
    <div style={{position: 'absolute', top: 102, left: 78, fontSize: 25, fontWeight: 800, letterSpacing: 5, color: accent}}>CLIPRUSH <span style={{color: '#d0dce0'}}>/ MISTÉRIOS</span></div>
    <NeonCaptions captions={project.captions}/>
    <div style={{position: 'absolute', bottom: 75, left: 78, right: 78, height: 3, background: '#ffffff24'}}>
      <div style={{width: `${100 * frame / Math.max(1, project.durationInFrames - 1)}%`, height: '100%', background: accent}}/>
    </div>
  </AbsoluteFill>;
}
