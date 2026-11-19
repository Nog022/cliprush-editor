import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertLiveProjectReady, LIVE_PRESET, framingFromAnalysis} from '../../shared/live-preset';
import * as validate from '../../shared/validation';
import type {Project, Asset, Clip} from '../../shared/model';
import type {VisualAnalysis} from '../../shared/visual-analysis';
import {assertGameplayFocus, gameplayFocusAt} from '../../shared/gameplay-focus';
import {coverRegion, intersects} from '../../src/templates/webcam_top_gameplay_bottom/geometry';

const asset: Asset = {id: 'source', name: 'local.mp4', path: 'local.mp4', hash: 'a'.repeat(64), bytes: 1234,
  kind: 'video', mode: 'reference', width: 1920, height: 1080, duration: 1333};
const clip: Clip = {id: 'clip', assetId: asset.id, from: 0, durationInFrames: 480, trimBefore: 36420, volume: 1};
const project = validate.project({schemaVersion: 2, id: 'live', revision: 0, channelId: 'cliprush', name: 'Live',
  language: 'pt-BR', category: 'Games', width: 1080, height: 1920, fps: 30, durationInFrames: 480,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), archived: false,
  assets: [asset], clips: [clip], scenes: [], captions: [], visualPreset: LIVE_PRESET, customCaption: 'Teste'});

test('live preset and caption survive save/load; traditional projects retain their shape', () => {
  assert.equal(validate.project(JSON.parse(JSON.stringify(project))).visualPreset, LIVE_PRESET);
  assert.equal(validate.project(project).customCaption, 'Teste');
  assert.throws(() => validate.newProject({...project, fps: 60}), /30 FPS/);
  assert.throws(() => validate.project({...project, customCaption: 'a'.repeat(301)}));
  const traditional = {...project} as Partial<Project>;
  delete traditional.visualPreset; delete traditional.customCaption;
  assert.equal('visualPreset' in validate.project(traditional), false);
  assert.doesNotThrow(() => assertLiveProjectReady(validate.project(traditional), {width: 1920, height: 1080, fps: 60}));
});

test('gameplay centers the source subject without moving webcam or admitting its original overlay', () => {
  const region = {x: 0, y: 0, w: 1488, h: 1080};
  const crop = coverRegion(region, 1040, 865, {x: 960, y: 648}, 1.25);
  assert.ok(Math.abs(960 * crop.scale + crop.left - 520) < 1e-6);
  assert.equal(intersects(crop.visible, {x: 1488, y: 754, w: 424, h: 268}), false);
  assert.ok(crop.visible.y >= 0 && crop.visible.y + crop.visible.h <= 1080);
  assert.throws(() => coverRegion(region, 1040, 865, undefined, .5));
  assert.throws(() => assertGameplayFocus({mode: 'manual', x: NaN, y: .5, zoom: 1.25}));
});

test('focus interpolation is deterministic, slow, ignores low confidence and holds through cuts', () => {
  const f = {mode: 'auto' as const, x: .5, y: .6, zoom: 1.25, samples: [
    {atMs: 0, x: .6, y: .6, confidence: .9}, {atMs: 1000, x: .61, y: .6, confidence: .9},
    {atMs: 2000, x: .62, y: .6, confidence: .9}, {atMs: 3000, x: .1, y: .1, confidence: .99},
    {atMs: 4000, x: .7, y: .6, confidence: .1},
  ]};
  const atEnd = gameplayFocusAt(f, 5000);
  assert.deepEqual(gameplayFocusAt(f, 5000), atEnd);
  assert.ok(atEnd.x < .6 && atEnd.x > .5);
  let previous = gameplayFocusAt(f, 0).x;
  for (let frame = 1; frame < 150; frame++) {
    const next = gameplayFocusAt(f, frame * 1000 / 30).x;
    assert.ok(Math.abs(next - previous) < .0015);
    previous = next;
  }
  assert.deepEqual(gameplayFocusAt({...f, samples: f.samples.slice(-1)}, 5000), {x: .5, y: .6});
  assert.deepEqual(gameplayFocusAt({...f, mode: 'manual'}, 5000), {x: .5, y: .6});
});

test('existing detector regions feed existing cover geometry; stale and overlapping crops fail', () => {
  const webcam = {x: .75, y: 0, width: .25, height: .3};
  const analysis = {samplingComplete: true, startMs: 1214000, endMs: 1230000,
    webcam: {regions: [webcam]}, gameplay: {regions: [{x: 0, y: 0, width: .75, height: 1}]}, faces: []} as unknown as VisualAnalysis;
  const f = framingFromAnalysis(analysis, asset, clip, project);
  assert.deepEqual(f.webcamRegion, {x: 1440, y: 0, w: 480, h: 324});
  const applied = {...project, clips: [{...clip, liveFraming: f}]};
  assert.deepEqual(validate.project(applied).clips[0].liveFraming, f);
  assert.doesNotThrow(() => assertLiveProjectReady(applied));
  assert.throws(() => assertLiveProjectReady({...applied, clips: [{...applied.clips[0], trimBefore: 36421}]}), /trecho atual/);
  assert.throws(() => validate.project({...applied, clips: [{...clip, liveFraming: {...f, gameplayRegion: f.webcamRegion}}]}), /sobrepõe/);
  assert.throws(() => framingFromAnalysis({...analysis, startMs: 0}, asset, clip, project), /novamente/);
});
