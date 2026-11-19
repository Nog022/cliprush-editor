import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assertRegion, coverRegion, intersects} from '../src/templates/webcam_top_gameplay_bottom/geometry.ts';

test('stable face focus stays inside detected webcam and preserves aspect ratio', () => {
  const region = {x:1473,y:9,w:435,h:252};
  const crop = coverRegion(region,1080,768,{x:1649.25,y:151.5});
  assert.ok(crop.visible.x >= region.x && crop.visible.x + crop.visible.w <= region.x + region.w);
  assert.equal(crop.visible.y,9);
  assert.equal(crop.visible.w / crop.visible.h,1080/768);
  assert.equal(crop.visible.w * crop.scale,1080);
});

test('gameplay excludes embedded webcam and retains the player region', () => {
  const crop = coverRegion({x:0,y:160,w:1465,h:920},1080,1152);
  assert.equal(intersects(crop.visible,{x:1473,y:9,w:435,h:252}),false);
  assert.ok(crop.visible.x < 800 && crop.visible.x + crop.visible.w > 800);
});

test('invalid source bounds and nonfinite focus fail explicitly', () => {
  assert.throws(() => assertRegion({x:1900,y:0,w:100,h:100},{width:1920,height:1080}));
  assert.throws(() => coverRegion({x:0,y:0,w:100,h:100},1080,768,{x:NaN,y:0}));
});
