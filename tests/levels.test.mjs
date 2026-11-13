import test from 'node:test';
import assert from 'node:assert/strict';
import { TOTAL_ROOMS, SECRET_ROOMS, mainRoom, secretRoom } from '../public/scripts/moonbound-levels.js';

const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x &&
  a.y < b.y + b.h && a.y + a.h > b.y;
const inBounds = shape => shape.x >= 0 && shape.y >= 0 &&
  shape.w > 0 && shape.h > 0 && shape.x + shape.w <= 960 && shape.y + shape.h <= 540;
const spawn = { x: 60, y: 468, w: 24, h: 32 };

test('all fifteen main rooms have distinct, valid geometry and supported goals', () => {
  const signatures = new Set();
  for (let number = 1; number <= TOTAL_ROOMS; number++) {
    const room = mainRoom(number);
    assert.ok(room.name);
    assert.ok(room.solids.every(inBounds), `Room ${number}: out-of-bounds solid`);
    assert.ok(room.hazards.every(inBounds), `Room ${number}: out-of-bounds hazard`);
    assert.ok(inBounds(room.goal), `Room ${number}: missing goal`);
    assert.ok(!room.solids.some(shape => overlaps(shape, spawn)), `Room ${number}: blocked spawn`);
    assert.ok(room.solids.some(shape => Math.abs(room.goal.y + room.goal.h - shape.y) < 2 &&
      room.goal.x >= shape.x && room.goal.x + room.goal.w <= shape.x + shape.w),
    `Room ${number}: unsupported goal`);
    assert.equal(Boolean(room.portal), SECRET_ROOMS.includes(number), `Room ${number}: secret entrance`);
    if (room.portal) {
      assert.ok(inBounds(room.portal), `Room ${number}: portal out of bounds`);
      assert.ok(!room.solids.some(shape => overlaps(shape, room.portal)),
        `Room ${number}: portal buried in terrain`);
    }
    signatures.add(JSON.stringify(room.solids));
  }
  assert.equal(TOTAL_ROOMS, 15);
  assert.equal(signatures.size, TOTAL_ROOMS);
});

test('six secret rooms have reachable chest interaction areas', () => {
  assert.equal(SECRET_ROOMS.length, 6);
  for (let index = 0; index < SECRET_ROOMS.length; index++) {
    const room = secretRoom(index);
    assert.ok(room.solids.every(inBounds), `Secret ${index + 1}: terrain out of bounds`);
    assert.ok(inBounds(room.chest), `Secret ${index + 1}: chest out of bounds`);
    assert.ok(!room.solids.some(shape => overlaps(shape, spawn)), `Secret ${index + 1}: blocked spawn`);
    assert.ok(room.solids.some(shape => room.chest.x >= shape.x &&
      room.chest.x + room.chest.w <= shape.x + shape.w &&
      room.chest.y + room.chest.h <= shape.y &&
      shape.y - (room.chest.y + room.chest.h) <= 26),
    `Secret ${index + 1}: chest has no nearby landing`);
  }
});

test('the campaign includes climbs, returns, and dash routes', () => {
  const routes = Array.from({ length: TOTAL_ROOMS }, (_, index) => mainRoom(index + 1).route);
  assert.ok(routes.filter(route => route.includes('shaft')).length >= 4);
  assert.ok(routes.filter(route => route === 'return').length >= 2);
  assert.ok(routes.filter(route => route === 'dash').length >= 2);
  assert.ok(mainRoom(5).goal.x < 300);
  assert.ok(mainRoom(13).goal.y < 100);
});
