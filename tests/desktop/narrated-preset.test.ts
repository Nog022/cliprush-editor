import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {Project} from '../../shared/model';
import {assertNarratedProjectReady, NARRATED_PRESET} from '../../shared/narrated-preset';
import {project as validateProject} from '../../shared/validation';
import {applyComposition} from '../../shared/production';

const fixture = (): Project => ({
  schemaVersion: 2, id: 'portrait', revision: 0, channelId: 'cliprush', name: 'Portrait',
  language: 'pt-BR', category: 'Games', createdAt: '2026-11-19T00:00:00Z', updatedAt: '2026-11-19T00:00:00Z',
  archived: false, type: 'narrated', visualPreset: NARRATED_PRESET,
  width: 1080, height: 1920, fps: 30, durationInFrames: 120, captions: [], scenes: [],
  exportSettings: {preset: 'portrait', width: 1080, height: 1920, fps: 30, quality: 'high', audio: true, captions: true},
  assets: [{id: 'footage', name: 'footage.mp4', mode: 'reference', kind: 'video', path: 'footage.mp4',
    hash: 'a'.repeat(64), bytes: 100, width: 1920, height: 1080, duration: 3}],
  clips: [{id: 'clip', assetId: 'footage', from: 0, durationInFrames: 120, trimBefore: 15, volume: 0,
    narratedFraming: {start: {x: .4, y: .5, zoom: 1}, end: {x: .6, y: .5, zoom: 1.04}, playbackRate: .5}}],
});

test('narrated framing survives project validation and validates actual consumed source time', () => {
  const p = fixture();
  const saved = validateProject(p);
  assert.deepEqual(saved.clips[0].narratedFraming, p.clips[0].narratedFraming);
  assert.equal(saved.visualPreset, NARRATED_PRESET);
  assert.doesNotThrow(() => assertNarratedProjectReady(saved));
  assert.doesNotThrow(() => applyComposition(p, p));
  saved.clips[0].narratedFraming!.playbackRate = 1;
  assert.throws(() => assertNarratedProjectReady(saved), /excede/);
  assert.throws(() => applyComposition(saved, saved), /excede/);
});

test('narrated preset rejects gaps, overlaps, invalid focus and unsupported output dimensions', () => {
  const p = fixture();
  p.clips[0].from = 1;
  assert.throws(() => assertNarratedProjectReady(p), /lacuna/);
  p.clips[0].from = 0;
  p.clips[0].narratedFraming!.start.x = Number.NaN;
  assert.throws(() => validateProject(p), /Enquadramento/);
  p.clips[0].narratedFraming!.start.x = .5;
  p.width = 1920;
  assert.throws(() => validateProject(p), /1080/);
});

test('generic landscape, square and live project settings retain their existing behavior', () => {
  for (const [width, height] of [[1920, 1080], [1080, 1080]]) {
    const p = fixture();
    delete p.visualPreset;
    p.width = width; p.height = height;
    const saved = validateProject(p);
    assert.equal(saved.visualPreset, undefined);
    assert.equal(saved.width, width);
    assert.doesNotThrow(() => assertNarratedProjectReady(saved));
  }
  const p = fixture();
  p.visualPreset = 'corte-live-cliprush';
  assert.equal(validateProject(p).visualPreset, 'corte-live-cliprush');
});
