import { readProgress, saveProgress } from './game-database.js?v=moonbound-1';
import { TOTAL_ROOMS, mainRoom, secretRoom } from './moonbound-levels.js';

const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const WIDTH = canvas.width, HEIGHT = canvas.height;
const OUTFITS = [
  { name: 'Moonwalker', color: '#8ce5ef' },
  { name: 'Stardust', color: '#e5a6ff' },
  { name: 'Comet', color: '#ffbf84' },
  { name: 'Orbit', color: '#b7ef8a' }
];
const TRAILS = [
  { name: 'Blue glow', color: '#9dfaff' },
  { name: 'Violet flare', color: '#d7abff' },
  { name: 'Solar streak', color: '#ffd08a' },
  { name: 'Mint wake', color: '#b0ffcf' }
];
const TUNE = {
  gravity: 1180, maxFall: 540, runSpeed: 265, groundAccel: 2500,
  airAccel: 1700, groundFriction: 2300, airFriction: 440,
  jumpSpeed: 450, jumpCut: .48, coyote: .10, jumpBuffer: .12,
  dashSpeed: 740, dashEndSpeed: 500, dashTime: .17,
  wallSlide: 105, climbSpeed: 150, gripTime: 1.25,
  wallJumpX: 330, wallJumpY: 420
};
const keys = new Set();
const jumpKeys = new Set(['Space', 'KeyZ']);
const dashKeys = new Set(['ShiftLeft', 'ShiftRight', 'KeyX']);
const controlKeys = new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS','KeyC','KeyR','KeyE','Escape',...jumpKeys,...dashKeys]);
const press = code => keys.has(code);
const horizontal = () => Number(press('ArrowRight') || press('KeyD')) - Number(press('ArrowLeft') || press('KeyA'));
const vertical = () => Number(press('ArrowDown') || press('KeyS')) - Number(press('ArrowUp') || press('KeyW'));
const jumpHeld = () => [...jumpKeys].some(press);
const approach = (value, target, amount) => value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

const state = { room: 1, secret: -1, highest: 1, found: [], name: '', outfit: 0, trail: 0, started: false, screen: 'start', saving: false, pendingSave: false, completed: false, saveError: false };
const player = { x: 60,y: 468,w: 24,h: 32,vx: 0,vy: 0,facing: 1,grounded: true,wall: 0,coyote: 0,jumpBuffer: 0,dashLeft: 0,dashElapsed: 0,dashX: 0,dashY: 0,dashAvailable: true,grip: TUNE.gripTime,dead: 0,blip: 0 };
let room;
let dust = Array.from({length: 52}, (_,i) => ({x:(i*181)%WIDTH,y:(i*113)%HEIGHT,r:1+(i%3),speed:5+(i%7)*2}));
let trail = [];
let saveTimer;
let mapReturn = 'pause';

function setRoom(number, secret = -1) {
  state.room = number; state.secret = secret;
  room = secret < 0 ? mainRoom(number) : secretRoom(secret);
  resetPlayer(true);
  $('roomLabel').textContent = secret < 0 ? `Room ${String(number).padStart(2,'0')} / 15 · ${room.name}` : `Secret ${String(secret+1).padStart(2,'0')} / 06 · ${room.name}`;
  $('controls').classList.toggle('tutorial',number === 1 && secret < 0);
  $('status').textContent = roomHint();
}
function roomHint() {
  if (state.secret >= 0) return 'Cross the hidden room. Press E at the chest.';
  if (room.route.includes('shaft')) return 'Jump back and forth between the walls to climb.';
  if (room.route === 'return') return 'The path may turn back after the climb.';
  if (room.route === 'dash') return 'Carry your speed out of the dash.';
  if (room.route === 'slide') return 'Use the walls to control your descent.';
  return 'Reach the beacon. Look around for another path.';
}
function resetPlayer(blip = false) {
  Object.assign(player,{x:60,y:468,vx:0,vy:0,facing:1,grounded:true,wall:0,coyote:TUNE.coyote,jumpBuffer:0,dashLeft:0,dashElapsed:0,dashAvailable:true,grip:TUNE.gripTime,dead:0,blip:blip?.42:0});
  trail = [];
}
function startDash() {
  if (!state.started || state.screen !== 'game' || player.dead || !player.dashAvailable) return;
  let dx=horizontal(),dy=vertical();
  if (!dx && !dy) dx=player.facing;
  const length=Math.hypot(dx,dy);
  player.dashX=dx/length;player.dashY=dy/length;
  player.dashLeft=TUNE.dashTime;player.dashElapsed=0;
  player.dashAvailable=false;player.grounded=false;player.coyote=0;
}
function die() {
  if (player.dead) return;
  player.dead=.48;player.vx=0;player.vy=0;
  $('status').textContent='A small setback. Try again.';
}
function moveAxis(axis, distance) {
  player[axis]+=distance;
  for (const block of room.solids) {
    if (!overlap(player,block)) continue;
    if (axis==='x') {player.x=distance>0?block.x-player.w:block.x+block.w;player.vx=0;}
    else {player.y=distance>0?block.y-player.h:block.y+block.h;player.vy=0;if(distance>0)player.grounded=true;}
    player.dashLeft=0;
  }
}
function touchingWall() {
  const probe={x:player.x-2,y:player.y+3,w:2,h:player.h-6};
  if(room.solids.some(b=>overlap(probe,b)))return -1;
  probe.x=player.x+player.w;
  return room.solids.some(b=>overlap(probe,b))?1:0;
}
function update(dt) {
  dust.forEach(d=>{d.x-=d.speed*dt;if(d.x<0)d.x=WIDTH;});
  if(state.screen!=='game')return;
  player.blip=Math.max(0,player.blip-dt);
  if(player.dead){player.dead-=dt;if(player.dead<=0){resetPlayer(true);$('status').textContent=roomHint();}return;}
  player.jumpBuffer=Math.max(0,player.jumpBuffer-dt);
  player.coyote=player.grounded?TUNE.coyote:Math.max(0,player.coyote-dt);
  const inputX=horizontal();
  if(inputX)player.facing=inputX;
  const gripping=player.wall&&press('KeyC')&&player.grip>0&&!player.grounded&&!player.dashLeft;
  if(player.jumpBuffer>0&&!player.dashLeft){
    if(player.coyote>0){player.vy=-TUNE.jumpSpeed;player.grounded=false;player.coyote=0;player.jumpBuffer=0;}
    else if(player.wall){player.vx=-player.wall*TUNE.wallJumpX;player.vy=-TUNE.wallJumpY;player.jumpBuffer=0;player.wall=0;}
  }
  if(player.dashLeft>0){
    player.dashLeft=Math.max(0,player.dashLeft-dt);
    player.dashElapsed+=dt;
    const t=clamp(player.dashElapsed/TUNE.dashTime,0,1);
    const speed=TUNE.dashSpeed+(TUNE.dashEndSpeed-TUNE.dashSpeed)*(t*t*(3-2*t));
    player.vx=player.dashX*speed;player.vy=player.dashY*speed;
    trail.push({x:player.x+12,y:player.y+16,life:.3});
  } else {
    const accel=player.grounded?TUNE.groundAccel:TUNE.airAccel;
    const friction=player.grounded?TUNE.groundFriction:TUNE.airFriction;
    player.vx=approach(player.vx,inputX*TUNE.runSpeed,(inputX?accel:friction)*dt);
    if(gripping){player.vy=vertical()*TUNE.climbSpeed;player.grip=Math.max(0,player.grip-dt);}
    else {player.vy=Math.min(TUNE.maxFall,player.vy+TUNE.gravity*dt);if(player.wall&&inputX===player.wall)player.vy=Math.min(player.vy,TUNE.wallSlide);}
  }
  player.grounded=false;
  moveAxis('x',player.vx*dt);moveAxis('y',player.vy*dt);
  player.wall=touchingWall();
  if(player.grounded){player.dashAvailable=true;player.grip=TUNE.gripTime;}
  if(player.y>HEIGHT+80||room.hazards.some(h=>overlap(player,h))){die();return;}
  if(state.secret<0){
    if(room.portal&&overlap(player,room.portal)){setRoom(state.room,room.secret);return;}
    if(overlap(player,room.goal)){finishRoom();return;}
  }
  trail.forEach(p=>p.life-=dt);trail=trail.filter(p=>p.life>0);
  $('abilities').textContent=`${player.dashAvailable?'Dash ready':'Dash spent'} · Grip ${Math.ceil(player.grip/TUNE.gripTime*100)}%`;
}
function finishRoom() {
  if(state.room===TOTAL_ROOMS){
    state.completed=true;state.highest=TOTAL_ROOMS;
    queueSave();showScreen('end');$('secretsLeft').textContent=`${6-state.found.length} secrets left to find`;
  }else{
    const next=state.room+1;state.highest=Math.max(state.highest,next);
    setRoom(next);queueSave();
  }
}
function openChest() {
  if(state.screen!=='game'||state.secret<0||!room.chest)return;
  const near={x:room.chest.x-38,y:room.chest.y-30,w:room.chest.w+76,h:room.chest.h+70};
  if(!overlap(player,near))return;
  const secret=state.secret;
  const newSecret=!state.found.includes(secret);
  if(newSecret)state.found.push(secret);
  const next=Math.min(TOTAL_ROOMS,state.room+1);
  state.highest=Math.max(state.highest,next);
  setRoom(next);
  queueSave();
  $('status').textContent=newSecret?`Secret found! New ${secret%2?'dash trail':'outfit'} unlocked.`:'Secret room cleared again.';
}
function showScreen(screen) {
  state.screen=screen;
  for(const id of ['start','pause','map','inventory','end'])$(id+'Screen').hidden=screen!==id;
  $('pauseButton').hidden=!state.started||!['game','pause'].includes(screen);
  keys.clear();
}
function showMap() {
  mapReturn=state.screen;
  const target=$('roomMap');target.replaceChildren();
  for(let number=1;number<=TOTAL_ROOMS;number++){
    const button=document.createElement('button');button.type='button';
    button.textContent=String(number).padStart(2,'0');
    button.title=mainRoom(number).name;
    button.setAttribute('aria-label',`Room ${number}: ${mainRoom(number).name}`);
    button.disabled=number>state.highest;
    if(number===state.room&&state.secret<0)button.setAttribute('aria-current','location');
    button.addEventListener('click',()=>{setRoom(number);showScreen('game');queueSave();});
    target.append(button);
  }
  showScreen('map');
}
function unlocked(category) {
  const found=state.found.filter(i=>i%2===(category==='outfit'?0:1)).length;
  return Math.min(found+1,category==='outfit'?OUTFITS.length:TRAILS.length);
}
function renderInventory() {
  $('outfitValue').textContent=OUTFITS[state.outfit].name;
  $('trailValue').textContent=TRAILS[state.trail].name;
}
function cycle(category,direction) {
  const count=unlocked(category),key=category==='outfit'?'outfit':'trail';
  state[key]=(state[key]+direction+count)%count;
  renderInventory();queueSave();
}
function snapshot() {
  return {name:state.name,currentRoom:state.room,highest:state.highest,
    found:[...state.found].sort((a,b)=>a-b),outfit:state.outfit,trail:state.trail,completed:state.completed};
}
function saveLocal() {
  try{localStorage.setItem('moonbound-progress',JSON.stringify(snapshot()));}catch{}
}
function restore(data) {
  if(!data||typeof data.name!=='string'||!data.name.trim())return false;
  state.name=data.name.slice(0,24);
  state.highest=clamp(Number(data.highest)||1,1,TOTAL_ROOMS);
  state.room=clamp(Number(data.currentRoom)||1,1,state.highest);
  state.found=Array.isArray(data.found)?[...new Set(data.found.filter(n=>Number.isInteger(n)&&n>=0&&n<6))]:[];
  state.outfit=clamp(Number(data.outfit)||0,0,unlocked('outfit')-1);
  state.trail=clamp(Number(data.trail)||0,0,unlocked('trail')-1);
  state.completed=Boolean(data.completed);
  $('playerName').value=state.name;
  setRoom(state.room);
  return true;
}
async function flushSave() {
  if(state.saving)return;
  state.saving=true;
  while(state.pendingSave){
    state.pendingSave=false;
    try{
      await saveProgress(snapshot());
      state.saveError=false;$('saveStatus').textContent='';$('retrySave').hidden=true;
      const indicator=$('saveIndicator');indicator.classList.remove('show');void indicator.offsetWidth;indicator.classList.add('show');
      clearTimeout(saveTimer);saveTimer=setTimeout(()=>indicator.classList.remove('show'),2000);
    }catch(error){
      state.saveError=true;state.pendingSave=true;
      $('saveStatus').textContent='Cloud save failed. Progress is kept in this browser; retry when connected.';
      $('retrySave').hidden=false;console.warn('Progress save failed:',error);break;
    }
  }
  state.saving=false;
}
function queueSave() {saveLocal();state.pendingSave=true;flushSave();}
async function load() {
  let hasLocal=false;
  try{hasLocal=restore(JSON.parse(localStorage.getItem('moonbound-progress')));}catch{}
  try{const cloud=await readProgress();if(cloud&&!hasLocal&&restore(cloud))saveLocal();}
  catch(error){console.info('Cloud progress unavailable:',error);}
}

window.addEventListener('keydown',event=>{
  if(controlKeys.has(event.code)&&state.screen==='game')event.preventDefault();
  if(event.code==='Escape'&&state.started){if(state.screen==='game')showScreen('pause');else if(state.screen==='pause')showScreen('game');else if(state.screen==='map'||state.screen==='inventory')showScreen('pause');return;}
  if(state.screen!=='game'||event.repeat||keys.has(event.code))return;
  keys.add(event.code);
  if(jumpKeys.has(event.code))player.jumpBuffer=TUNE.jumpBuffer;
  if(dashKeys.has(event.code))startDash();
  if(event.code==='KeyE')openChest();
  if(event.code==='KeyR')resetPlayer(true);
});
window.addEventListener('keyup',event=>{keys.delete(event.code);if(jumpKeys.has(event.code)&&!jumpHeld()&&player.vy<0&&!player.dashLeft)player.vy*=TUNE.jumpCut;});
window.addEventListener('blur',()=>keys.clear());
$('startButton').addEventListener('click',()=>{
  const name=$('playerName').value.trim();
  if(!name){$('playerName').classList.remove('shake');void $('playerName').offsetWidth;$('playerName').classList.add('shake');$('startHint').textContent='Enter a name to begin.';$('playerName').focus();return;}
  state.name=name;$('startHint').textContent='';state.started=true;
  setRoom(state.room);
  if(state.completed){$('secretsLeft').textContent=`${6-state.found.length} secrets left to find`;showScreen('end');}
  else showScreen('game');
  queueSave();
});
$('playerName').addEventListener('keydown',event=>{if(event.key==='Enter')$('startButton').click();});
$('pauseButton').addEventListener('click',()=>showScreen(state.screen==='game'?'pause':'game'));
$('resumeButton').addEventListener('click',()=>showScreen('game'));
$('mapButton').addEventListener('click',showMap);
$('mapBack').addEventListener('click',()=>showScreen(mapReturn));
$('inventoryButton').addEventListener('click',()=>{renderInventory();showScreen('inventory');});
$('inventoryBack').addEventListener('click',()=>showScreen('pause'));
$('outfitPrev').addEventListener('click',()=>cycle('outfit',-1));
$('outfitNext').addEventListener('click',()=>cycle('outfit',1));
$('trailPrev').addEventListener('click',()=>cycle('trail',-1));
$('trailNext').addEventListener('click',()=>cycle('trail',1));
$('keepPlaying').addEventListener('click',showMap);
$('retrySave').addEventListener('click',()=>flushSave());

function drawMoonBlock(block) {
  ctx.fillStyle='#768aa1';ctx.fillRect(block.x,block.y,block.w,block.h);
  ctx.fillStyle='#b7c7cd';ctx.fillRect(block.x,block.y,block.w,5);
  ctx.fillStyle='#65798f';
  for(let i=12;i<block.w-8;i+=28){const x=block.x+i,y=block.y+12+(i%3)*7;ctx.beginPath();ctx.ellipse(x,y,7+(i%3)*2,3+(i%2)*2,0,0,Math.PI*2);ctx.fill();}
}
function draw() {
  ctx.fillStyle='#101a32';ctx.fillRect(0,0,WIDTH,HEIGHT);
  const glow=ctx.createRadialGradient(710,90,5,710,90,430);glow.addColorStop(0,'#395c78');glow.addColorStop(1,'#101a3200');ctx.fillStyle=glow;ctx.fillRect(0,0,WIDTH,HEIGHT);
  ctx.fillStyle='#e8f7ff';ctx.beginPath();ctx.arc(755,110,42,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#aac1cf';for(const [x,y,r] of [[738,98,8],[771,123,11],[761,84,5]]){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  dust.forEach(d=>{ctx.fillStyle='rgba(177,213,224,.35)';ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#20344b';ctx.beginPath();ctx.moveTo(0,455);for(let x=0;x<=960;x+=80)ctx.lineTo(x,430+Math.sin(x*.013)*20);ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.fill();
  if(!room)return;
  room.solids.forEach(drawMoonBlock);
  room.hazards.forEach(h=>{ctx.fillStyle='#f09b9b';for(let x=h.x;x<h.x+h.w;x+=12){ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+6,h.y);ctx.lineTo(x+12,h.y+h.h);ctx.fill();}});
  if(room.goal){ctx.fillStyle='#f5d674';ctx.fillRect(room.goal.x,room.goal.y,room.goal.w,room.goal.h);ctx.fillStyle='#fff5b8';ctx.fillRect(room.goal.x+8,room.goal.y+8,12,18);}
  if(room.portal){ctx.strokeStyle='#bb91f7';ctx.lineWidth=5;ctx.strokeRect(room.portal.x,room.portal.y,room.portal.w,room.portal.h);ctx.fillStyle='#b496ff55';ctx.fillRect(room.portal.x,room.portal.y,room.portal.w,room.portal.h);}
  if(room.chest){ctx.fillStyle=state.found.includes(state.secret)?'#70818d':'#a8784d';ctx.fillRect(room.chest.x,room.chest.y,room.chest.w,room.chest.h);ctx.fillStyle='#ffdd8b';ctx.fillRect(room.chest.x+13,room.chest.y+10,8,10);}
  trail.forEach(p=>{ctx.globalAlpha=p.life/.3;ctx.fillStyle=TRAILS[state.trail].color;ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  if(!player.dead||player.dead>.18){
    ctx.globalAlpha=player.dead?player.dead/.48:1;
    ctx.fillStyle=OUTFITS[state.outfit].color;ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.fillStyle='#27354d';ctx.fillRect(player.x+(player.facing>0?15:5),player.y+8,4,5);
    ctx.globalAlpha=1;
  }
  if(player.blip){ctx.strokeStyle=`rgba(176,249,255,${player.blip/.42})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x+12,player.y+16,28*(1-player.blip/.42)+10,0,Math.PI*2);ctx.stroke();}
  if(state.started&&state.room===1&&state.secret<0){
    ctx.fillStyle='rgba(10,26,43,.56)';ctx.fillRect(23,25,300,96);
    ctx.fillStyle='rgba(227,247,255,.72)';ctx.font='15px system-ui';
    ctx.fillText('A / D  ·  move',42,55);ctx.fillText('Z/SPACE  ·  jump',42,79);ctx.fillText('X/SHIFT  ·  dash toward a direction',42,103);
  }
}
setRoom(1);
let previous=performance.now(),accumulator=0;
function frame(now){accumulator+=Math.min((now-previous)/1000,.05);previous=now;while(accumulator>=1/120){update(1/120);accumulator-=1/120;}draw();requestAnimationFrame(frame);}
requestAnimationFrame(frame);
$('startButton').disabled=true;
load().finally(()=>$('startButton').disabled=false);
