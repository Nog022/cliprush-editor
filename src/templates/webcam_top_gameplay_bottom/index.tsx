import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Video} from '@remotion/media';
import {assertRegion, coverRegion, intersects, type Region, type SourceSize} from './geometry';
import {gameplayFocusAt, type GameplayFocus} from '../../../shared/gameplay-focus';

export type WebcamTopGameplayBottomProps = {
  /** Path relative to public/, or an absolute HTTP URL. */
  src: string;
  /** Optional lossless audio excerpt prepared from the same source interval. */
  audioSrc?: string;
  sourceSize: SourceSize;
  startSeconds: number;
  durationSeconds: number;
  webcamRegion: Region;
  gameplayRegion: Region;
  webcamHeightRatio: number;
  /** Stable face center in source pixels, obtained from cached face detections. */
  webcamFocus?: {x: number; y: number};
  layout?: {webcam: {x: number; y: number; width: number; height: number}; gameplay: {x: number; y: number; width: number; height: number}};
  volume?: number;
  gameplayFocus?: GameplayFocus;
};

export const WebcamTopGameplayBottom: React.FC<WebcamTopGameplayBottomProps> = (props) => {
  const {width, height, fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const {src, sourceSize, webcamRegion, gameplayRegion, startSeconds, durationSeconds, webcamHeightRatio} = props;
  assertRegion(webcamRegion, sourceSize);
  assertRegion(gameplayRegion, sourceSize);
  if (!Number.isFinite(startSeconds) || startSeconds < 0 || !Number.isFinite(durationSeconds) || durationSeconds <= 0 ||
    !Number.isFinite(webcamHeightRatio) || webcamHeightRatio <= 0 || webcamHeightRatio >= 1) {
    throw new Error('Invalid timing or panel ratio.');
  }
  const topHeight = Math.round(height * webcamHeightRatio);
  const panels = props.layout ?? {webcam: {x: 0, y: 0, width, height: topHeight},
    gameplay: {x: 0, y: topHeight, width, height: height - topHeight}};
  const webcam = coverRegion(webcamRegion, panels.webcam.width, panels.webcam.height, props.webcamFocus);
  const focus = props.gameplayFocus ? gameplayFocusAt(props.gameplayFocus, frame * 1000 / fps) : undefined;
  const gameplay = coverRegion(gameplayRegion, panels.gameplay.width, panels.gameplay.height,
    focus ? {x: focus.x * sourceSize.width, y: focus.y * sourceSize.height} : undefined, props.gameplayFocus?.zoom ?? 1);
  // Refuse manual framing that would reintroduce the original webcam.
  if (intersects(gameplay.visible, webcamRegion)) throw new Error('Gameplay crop overlaps the original webcam. Adjust gameplayRegion.');
  const mediaSrc = /^(https?:|cliprush:|blob:|data:)/.test(src) ? src : staticFile(src);
  const startFrom = Math.round(startSeconds * fps);
  const endAt = startFrom + Math.round(durationSeconds * fps);
  return <AbsoluteFill style={{backgroundColor: 'black'}}>
    <div style={{position: 'absolute', left: panels.webcam.x, top: panels.webcam.y,
      width: panels.webcam.width, height: panels.webcam.height, borderRadius: props.layout ? 50 : 0, overflow: 'hidden'}}>
      <Video src={mediaSrc} trimBefore={startFrom} trimAfter={endAt} muted disallowFallbackToOffthreadVideo
        style={{position: 'absolute', width: sourceSize.width * webcam.scale,
          height: sourceSize.height * webcam.scale, left: webcam.left, top: webcam.top}} />
    </div>
    <div style={{position: 'absolute', left: panels.gameplay.x, top: panels.gameplay.y,
      width: panels.gameplay.width, height: panels.gameplay.height, borderRadius: props.layout ? 50 : 0, overflow: 'hidden'}}>
      <Video src={mediaSrc} trimBefore={startFrom} trimAfter={endAt} muted disallowFallbackToOffthreadVideo
        style={{position: 'absolute', width: sourceSize.width * gameplay.scale,
          height: sourceSize.height * gameplay.scale, left: gameplay.left, top: gameplay.top}} />
    </div>
    <Audio src={props.audioSrc ?? mediaSrc} startFrom={startFrom} endAt={endAt} volume={props.volume ?? 1} />
  </AbsoluteFill>;
};
