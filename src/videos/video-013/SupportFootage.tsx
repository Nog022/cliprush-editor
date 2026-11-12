import React from 'react';
import {Video} from '@remotion/media';
import {AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import plan from './support-plan.json';

type SupportClip = (typeof plan)[number];
const easing = {extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const,easing:Easing.inOut(Easing.cubic)};

const SupportShot: React.FC<{clip: SupportClip}> = ({clip}) => {
  const frame=useCurrentFrame();
  const source=staticFile(`videos/biblioteca/gta6/videos/${clip.video}`);
  const opacity=interpolate(frame,[0,8],[0,1],easing)*(clip.fadeOut?interpolate(frame,[clip.duration-clip.fadeOut,clip.duration-1],[1,0],easing):1);
  return <AbsoluteFill style={{overflow:'hidden',background:'#080a14',opacity}}>
    <Video src={source} trimBefore={clip.sourceStart} playbackRate={clip.rate} muted objectFit="cover" style={{width:'100%',height:'100%',filter:'blur(38px) brightness(.29) saturate(1.08)',scale:1.13}}/>
    <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(7,8,18,.92),transparent 38%,transparent 65%,#080a14 87%)'}}/>
    <div style={{position:'absolute',left:0,right:0,top:475,height:850,overflow:'hidden',display:'flex',alignItems:'center'}}>
      <Video src={source} trimBefore={clip.sourceStart} playbackRate={clip.rate} muted objectFit="contain" style={{width:1080,height:608,scale:interpolate(frame,[0,clip.duration],[1,1.055],easing)}}/>
    </div>
  </AbsoluteFill>;
};

// These are global frame positions. Negative local offsets retain the source
// clock through a change of narrative block, including each crossfade's overlap.
export const SupportLayer: React.FC<{sceneFrom: number}> = ({sceneFrom}) => <>
  {plan.map(clip=><Sequence key={clip.id} name={`Apoio · ${clip.label}`} from={clip.from-sceneFrom} durationInFrames={clip.duration}>
    <SupportShot clip={clip}/>
  </Sequence>)}
</>;

export const supportLabelAt = (absoluteFrame: number): string | null => {
  const clips=plan.filter(clip=>absoluteFrame>=clip.from+4&&absoluteFrame<clip.from+clip.duration);
  return clips.length?clips[clips.length-1].label:null;
};
