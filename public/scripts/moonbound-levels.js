// Hand-built movement routes. Coordinates use the 960 × 540 canvas.
// Every room starts on the lower-left floor; goals and secret entrances vary.
export const TOTAL_ROOMS = 15;
export const SECRET_ROOMS = [2, 4, 6, 9, 12, 14];
const b = (x, y, w, h = 20) => ({ x, y, w, h });
const floor = w => b(0, 500, w, 40);
const farFloor = x => b(x, 500, 960 - x, 40);
const goal = (x, platformY) => b(x, platformY - 58, 28, 58);

const MAIN = [
  { name: 'First Footprints', route: 'cross',
    solids: [floor(555), farFloor(760), b(280, 310, 62, 190), b(440, 350, 140), b(620, 315, 100), b(805, 390, 155)],
    goal: goal(904, 500) },
  { name: 'Broken Arc', route: 'stair',
    solids: [floor(380), farFloor(800), b(390, 430, 95), b(510, 355, 100), b(630, 290, 105), b(780, 330, 120)],
    goal: goal(866, 330), portal: b(652, 160, 32, 52) },
  { name: 'Between the Walls', route: 'shaft',
    solids: [floor(420), farFloor(780), b(250, 170, 28, 250), b(370, 170, 28, 330), b(405, 200, 125), b(555, 245, 120), b(705, 330, 105), b(810, 400, 150)],
    goal: goal(900, 400) },
  { name: 'The High Road', route: 'stair',
    solids: [floor(315), farFloor(820), b(340, 430, 95), b(470, 360, 105), b(590, 285, 105), b(730, 245, 140)],
    goal: goal(840, 245), portal: b(604, 175, 32, 52) },
  { name: 'Turn Back', route: 'return',
    solids: [floor(430), farFloor(780), b(250, 170, 28, 250), b(370, 170, 28, 330), b(430, 185, 115), b(120, 205, 120)],
    goal: goal(145, 205) },
  { name: 'Carry the Dash', route: 'dash',
    solids: [floor(270), farFloor(780), b(300, 430, 88), b(445, 355, 92), b(600, 295, 100), b(770, 340, 105)],
    goal: goal(885, 500), portal: b(618, 185, 32, 52) },
  { name: 'Two Chimneys', route: 'double-shaft',
    solids: [floor(360), farFloor(780), b(220, 220, 28, 200), b(320, 220, 28, 280), b(350, 240, 115), b(450, 275, 70), b(510, 425, 80), b(540, 135, 28, 210), b(640, 135, 28, 365), b(680, 160, 95), b(790, 210, 160)],
    goal: goal(870, 210) },
  { name: 'Crater Rim', route: 'arc',
    solids: [floor(255), farFloor(835), b(280, 430, 95), b(400, 350, 105), b(530, 275, 105), b(655, 350, 95), b(760, 430, 85)],
    goal: goal(904, 500) },
  { name: 'Far Side, Near Side', route: 'return',
    solids: [floor(320), farFloor(800), b(260, 185, 28, 235), b(370, 185, 28, 315), b(410, 205, 105), b(540, 165, 105), b(650, 230, 95), b(95, 225, 120)],
    goal: goal(120, 225), portal: b(670, 105, 32, 52) },
  { name: 'Long Exposure', route: 'dash',
    solids: [floor(300), farFloor(810), b(340, 455, 75), b(500, 400, 85), b(670, 345, 85), b(800, 390, 145)],
    goal: goal(865, 390), hazards: [b(275, 487, 25, 13)] },
  { name: 'Drop Beyond', route: 'over-and-down',
    solids: [floor(390), farFloor(840), b(260, 190, 28, 235), b(375, 190, 28, 310), b(420, 205, 105), b(550, 245, 105), b(695, 310, 95), b(775, 275, 28, 225)],
    goal: goal(890, 500), hazards: [b(840, 487, 32, 13)] },
  { name: 'The Offset Shaft', route: 'shaft',
    solids: [floor(340), farFloor(820), b(360, 420, 90), b(480, 330, 85), b(570, 150, 28, 250), b(670, 150, 28, 350), b(705, 180, 95), b(820, 240, 140)],
    goal: goal(870, 240), portal: b(724, 50, 32, 52) },
  { name: 'Orbit and Return', route: 'return',
    solids: [floor(300), farFloor(820), b(330, 425, 90), b(450, 340, 90), b(590, 260, 90), b(720, 190, 90), b(500, 130, 115)],
    goal: goal(540, 130) },
  { name: 'Thin Air', route: 'slide',
    solids: [floor(280), farFloor(820), b(315, 400, 85), b(440, 180, 28, 320), b(490, 430, 80), b(630, 130, 28, 260), b(670, 310, 90), b(810, 230, 145)],
    goal: goal(865, 230), portal: b(676, 195, 32, 52), hazards: [b(820, 487, 32, 13)] },
  { name: 'The Far Side', route: 'double-shaft',
    solids: [floor(335), farFloor(840), b(250, 200, 28, 220), b(350, 200, 28, 300), b(385, 210, 105), b(490, 280, 75), b(580, 110, 28, 240), b(680, 110, 28, 390), b(710, 150, 100), b(820, 185, 135)],
    goal: goal(880, 185) }
];

const SECRETS = [
  { name: 'Hidden Steps', solids: [floor(250), farFloor(800), b(290, 425, 80), b(430, 345, 90), b(600, 280, 85), b(745, 355, 90)], chest: b(875, 448, 34, 34) },
  { name: 'Small Shaft', solids: [floor(390), farFloor(800), b(260, 220, 28, 210), b(360, 220, 28, 280), b(405, 235, 110), b(550, 250, 100), b(740, 320, 135)], chest: b(825, 265, 34, 34) },
  { name: 'Comet Crossing', solids: [floor(300), farFloor(820), b(365, 430, 80), b(540, 350, 85), b(735, 300, 105)], chest: b(800, 245, 34, 34) },
  { name: 'Backtrack', solids: [floor(320), farFloor(800), b(260, 200, 28, 225), b(370, 200, 28, 300), b(410, 215, 105), b(110, 180, 120)], chest: b(155, 125, 34, 34) },
  { name: 'Quiet Drop', solids: [floor(270), farFloor(800), b(350, 230, 28, 270), b(420, 320, 90), b(570, 390, 90), b(710, 310, 95)], chest: b(875, 448, 34, 34) },
  { name: 'Final Echo', solids: [floor(330), farFloor(820), b(250, 200, 28, 220), b(350, 200, 28, 300), b(400, 210, 100), b(540, 270, 75), b(620, 115, 28, 230), b(710, 115, 28, 385), b(750, 155, 95), b(840, 205, 110)], chest: b(875, 150, 34, 34) }
];

export function mainRoom(number) {
  const layout = MAIN[number - 1];
  if (!layout) throw new RangeError(`Unknown main room ${number}`);
  return { ...layout, hazards: layout.hazards || [], portal: layout.portal || null,
    secret: SECRET_ROOMS.indexOf(number) };
}

export function secretRoom(index) {
  const layout = SECRETS[index];
  if (!layout) throw new RangeError(`Unknown secret room ${index}`);
  return { ...layout, hazards: layout.hazards || [], goal: null, portal: null, secret: index };
}
