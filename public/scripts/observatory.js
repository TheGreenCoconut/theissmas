'use strict';
(() => {
const canvas=document.querySelector('#game'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
const $=s=>document.querySelector(s),W=960,H=480;
let save={found:[],outfit:'Wanderer',trail:'Stardust',sky:'Midnight',complete:false};try{Object.assign(save,JSON.parse(localStorage.getItem('astral-v1')||'{}'))}catch{}
const persist=()=>{try{localStorage.setItem('astral-v1',JSON.stringify(save))}catch{toast('Saving unavailable in this browser; discoveries last this session.')}};
const rooms=[
{name:'LANTERN GARDEN',hint:'Jump toward the lanterns. Hold jump to go higher.',spawn:[45,400],platforms:[[0,440,235,40],[285,410,100,70],[430,365,100,115],[580,315,125,165],[760,365,200,115],[105,325,75,16],[20,250,75,16]],spikes:[[235,464,50,16],[385,464,45,16],[530,464,50,16],[705,464,55,16]],items:[['scarf',49,222],['mint',635,280]],spring:[470,365],crystal:[552,290],exit:[915,320],lanterns:[[190,440],[325,410],[620,315],[875,365]]},
{name:'THE GLASSHOUSE',hint:'Pink plants launch you. Blue crystals restore your dash.',spawn:[35,390],platforms:[[0,430,170,50],[240,370,100,110],[410,310,100,170],[590,365,100,115],[760,300,200,180],[305,210,90,14],[115,155,105,14],[5,85,65,14]],spikes:[[170,464,70,16],[340,464,70,16],[510,464,80,16],[690,464,70,16]],items:[['trail',355,180]],spring:[275,370],crystal:[552,250],exit:[915,255],secret:[35,52],lanterns:[[100,430],[450,310],[820,300]]},
{name:'STARFALL SUMMIT',hint:'Fading platforms return after a moment. Reach the telescope; press E.',spawn:[35,395],platforms:[[0,435,170,45],[245,380,85,14,'fade'],[405,325,85,14,'fade'],[565,270,85,14,'fade'],[745,315,215,165],[490,155,95,14],[680,125,90,14]],spikes:[[170,464,575,16]],items:[['sunset',730,95]],spring:[110,435],crystal:[530,245],exit:[890,270],lanterns:[[55,435],[800,315]]},
{name:'THE FORGOTTEN ALCOVE',hint:'A hidden room. Follow the high ledges; the doorway leads back.',spawn:[30,395],platforms:[[0,435,165,45],[230,365,70,115],[370,290,65,190],[525,215,75,265],[700,145,220,335]],spikes:[[165,464,65,16],[300,464,70,16],[435,464,90,16],[600,464,100,16]],items:[['cloak',815,110],['aurora',555,180]],spring:[265,365],crystal:[470,220],exit:[65,390],lanterns:[[60,435],[740,145]]}
];
const rewards={scarf:['Amber scarf','outfit','Amber'],mint:['Fern palette','outfit','Fern'],trail:['Comet trail','trail','Comet'],sunset:['Dusk sky','sky','Dusk'],cloak:['Moon cloak','outfit','Moon'],aurora:['Aurora trail','trail','Aurora']};
let room=0,keys={},pressed={},active=false,paused=false,modal='',t=0,last=0,death=0,particles=[],fades={},trail=[],toastTimer;
let p={x:45,y:400,vx:0,vy:0,w:14,h:23,ground:false,wall:0,coyote:0,buffer:0,dash:true,dashTime:0,face:1};
function toast(s){$('#toast').textContent=s;$('#toast').style.opacity=1;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.opacity=0,4200)}
function hud(){$('#room').textContent=`${room===3?'?':String(room+1).padStart(2,'0')} / ${rooms[room].name}`;$('#progress').textContent=`${save.found.length} / 6 discoveries`;$('#objective').textContent=save.complete?'✦  Observatory restored · keep exploring':'✦  Follow the lanterns to the summit'}
function enter(n,back=false){room=n;fades={};const s=rooms[n].spawn;p.x=back?870:s[0];p.y=back?rooms[n].platforms.find(a=>a[0]===760||a[0]===745)?.[1]-24||270:s[1];p.vx=p.vy=p.dashTime=0;p.dash=true;trail=[];hud();toast(rooms[n].hint)}
function respawn(){death++;for(let i=0;i<15;i++)particles.push({x:p.x+7,y:p.y+10,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,life:25,color:'#e6c58d'});enter(room)}
function overlap(a,b){return a.x<b[0]+b[2]&&a.x+a.w>b[0]&&a.y<b[1]+b[3]&&a.y+a.h>b[1]}
function near(x,y,r=42){return Math.hypot(p.x+7-x,p.y+12-y)<r}
function update(){t++;if(!active||paused)return;const r=rooms[room];let dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);if(dir)p.face=dir;
if(pressed.Space||pressed.KeyZ||pressed.ArrowUp)p.buffer=8;else p.buffer=Math.max(0,p.buffer-1);
p.coyote=p.ground?7:Math.max(0,p.coyote-1);
if(p.buffer&&(p.coyote||p.wall)){p.vy=-10.7;if(!p.coyote){p.vx=-p.wall*6;p.face=-p.wall}p.buffer=0;p.coyote=0;p.ground=false}
if((pressed.KeyX||pressed.ShiftLeft||pressed.ShiftRight)&&p.dash){let dx=dir,dy=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0);if(!dx&&!dy)dx=p.face;let len=Math.hypot(dx,dy);p.vx=dx/len*12;p.vy=dy/len*12;p.dashTime=12;p.dash=false}
if(p.dashTime>0){p.dashTime--;trail.push({x:p.x,y:p.y,life:16})}else{p.vx+=(dir*3.7-p.vx)*.24;p.vy=Math.min(p.vy+.48,11);if(!keys.Space&&!keys.KeyZ&&!keys.ArrowUp&&p.vy<-4)p.vy+=.5;if(p.wall&&dir===p.wall&&p.vy>2)p.vy=2}
const solids=r.platforms.filter((a,i)=>!fades[i]||fades[i]>0);p.wall=0;p.x+=p.vx;for(const a of solids)if(overlap(p,a)){if(p.vx>0){p.x=a[0]-p.w;p.wall=1}else if(p.vx<0){p.x=a[0]+a[2];p.wall=-1}p.vx=0;p.dashTime=0}p.x=Math.max(0,Math.min(W-p.w,p.x));p.y+=p.vy;p.ground=false;
for(const a of solids)if(overlap(p,a)){if(p.vy>=0){p.y=a[1]-p.h;p.ground=true;p.dash=true;let i=r.platforms.indexOf(a);if(a[4]&&!fades[i])fades[i]=28}else p.y=a[1]+a[3];p.vy=0;p.dashTime=0}
for(const i in fades){fades[i]--;if(fades[i]<-130)delete fades[i]}
if(r.spring&&p.vy>=0&&Math.abs(p.x+7-r.spring[0])<22&&Math.abs(p.y+p.h-r.spring[1])<9){p.vy=-15;p.ground=false;p.dash=true;toast('Spring bloom · reach for the next ledge')}
if(r.crystal&&near(...r.crystal,23)&&!p.dash){p.dash=true;toast('Dash restored ✦')}
for(const [id,x,y]of r.items)if(!save.found.includes(id)&&near(x,y,23)){save.found.push(id);persist();hud();toast(`Discovered: ${rewards[id][0]} · open Wardrobe to equip`)}
if(p.y>H+25||r.spikes.some(a=>overlap(p,a)))respawn();
if(pressed.KeyR)respawn();
if(pressed.KeyE){if(room===1&&near(...r.secret,45))enter(3);else if(near(...r.exit,55)){if(room===2){save.complete=true;persist();hud();openModal('win')}else if(room===3)enter(1);else enter(room+1)}else if(p.x<70&&room>0&&room<3)enter(room-1,true)}
}
function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)}
function text(s,x,y,c='#b2c7d0',size=10){g.fillStyle=c;g.font=`${size}px monospace`;g.fillText(s,Math.round(x),Math.round(y))}
function lantern(x,y){rect(x-2,y-41,4,41,'#39495a');rect(x-7,y-44,14,3,'#697683');rect(x-5,y-40,10,14,'#f3ca82');rect(x-2,y-38,4,9,'#ffe4ad');g.fillStyle='#edc7890c';g.fillRect(x-20,y-52,40,40)}
function draw(){let dusk=save.sky==='Dusk';rect(0,0,W,H,dusk?'#30283d':'#142336');for(let i=0;i<90;i++){let x=(i*137+43)%960,y=(i*71+19)%330;rect(x,y,i%9===0?2:1,i%9===0?2:1,`rgba(191,213,223,${.2+Math.sin(t*.025+i)*.15})`)}
rect(784,45,35,35,dusk?'#edb78f':'#c5d8d4');rect(774,43,32,29,dusk?'#30283d':'#142336');
// Distant peaks and the observatory dome.
g.fillStyle=dusk?'#3d354a':'#1b3041';g.beginPath();g.moveTo(0,370);for(let x=0;x<=1050;x+=90)g.lineTo(x,230+Math.sin(x*3)*65);g.lineTo(960,480);g.lineTo(0,480);g.fill();
rect(630,175,140,190,'#223849');g.fillStyle='#223849';g.beginPath();g.arc(700,175,70,Math.PI,0);g.fill();rect(695,94,6,20,'#516273');for(let i=0;i<4;i++)rect(647+i*30,203,12,27,'#102434');rect(620,268,160,7,'#314959');
for(let i=0;i<8;i++){let x=(i*163+70)%960;rect(x,330+i%3*18,34,150,'#203746');rect(x-4,327+i%3*18,42,8,'#2c4553')}
const r=rooms[room];for(let i=0;i<r.platforms.length;i++){let a=r.platforms[i];if(fades[i]<0){g.globalAlpha=.15}let[x,y,w,h]=a;rect(x,y,w,h,a[4]?'#637781':'#334952');rect(x,y,w,5,a[4]?'#b2c7c8':'#83958c');rect(x,y+5,w,4,'#4f6c61');for(let xx=x+8;xx<x+w-8;xx+=24){rect(xx,y+14,13,3,'#405861');if(h>35)rect(xx+5,y+37,14,3,'#293f4a')}if(!a[4])for(let xx=x+4;xx<x+w;xx+=19){rect(xx,y-3,2,4,'#809d80');rect(xx+3,y-5,2,6,'#557b70')}g.globalAlpha=1}
for(const [x,y,w]of r.spikes)for(let xx=x;xx<x+w;xx+=10){g.fillStyle='#c18090';g.beginPath();g.moveTo(xx,y+16);g.lineTo(xx+5,y);g.lineTo(xx+10,y+16);g.fill()}
for(const [x,y]of r.lanterns)lantern(x,y);
if(r.spring){let[x,y]=r.spring;rect(x-15,y-5,30,5,'#71987a');rect(x-10,y-13,20,7,'#d893b4');rect(x-4,y-17,8,5,'#f1bbcb')}
if(r.crystal){let[x,y]=r.crystal;y+=Math.sin(t*.05)*4;g.fillStyle='#7de1d3';g.beginPath();g.moveTo(x,y-13);g.lineTo(x+9,y);g.lineTo(x,y+13);g.lineTo(x-9,y);g.fill();rect(x-2,y-5,3,8,'#d6fff1')}
for(const[id,x,base]of r.items)if(!save.found.includes(id)){let y=base+Math.sin(t*.04)*3;g.fillStyle='#eac589';g.beginPath();g.moveTo(x,y-10);g.lineTo(x+4,y-3);g.lineTo(x+10,y);g.lineTo(x+4,y+3);g.lineTo(x,y+10);g.lineTo(x-4,y+3);g.lineTo(x-10,y);g.lineTo(x-4,y-3);g.fill();rect(x-1,y-2,3,4,'#fff3ca')}
let[ex,ey]=r.exit;if(room===2){rect(ex-20,ey+20,40,6,'#9da6a0');rect(ex-3,ey,6,32,'#8c9e9d');g.save();g.translate(ex,ey);g.rotate(-.45);rect(-25,-10,50,13,'#b2c3b9');rect(17,-13,10,19,'#e6c58d');g.restore()}else{rect(ex-16,ey-8,32,52,'#101d2b');rect(ex-20,ey-12,40,5,'#788c8d');rect(ex-20,ey-8,5,52,'#526b74');rect(ex+15,ey-8,5,52,'#526b74');text(room===3?'RETURN':'ASCEND',ex-21,ey-23,'#e6c58d',9)}
if(r.secret){let[x,y]=r.secret;rect(x-12,y-11,24,42,'#101b2b');rect(x-14,y-14,28,4,'#536879');text('✦',x-4,y+6,'#b9acd0',13)}
if(near(ex,ey,55))text(room===2?'[E] Wake the telescope':'[E] Enter',ex-58,ey-40,'#f5daa0',11);else if(room===1&&near(...r.secret,45))text('[E] Something here…',12,32,'#f5daa0',10);else if(p.x<65&&room>0&&room<3)text('[E] Return',12,395);
for(let i=trail.length-1;i>=0;i--){let a=trail[i];g.globalAlpha=a.life/32;rect(a.x,a.y,14,23,save.trail==='Aurora'?'#9ce6c0':save.trail==='Comet'?'#eaa9d5':'#a6c7e8');if(--a.life<=0)trail.splice(i,1)}g.globalAlpha=1;
let color={Wanderer:'#b1c9c0',Amber:'#e2b272',Fern:'#88b391',Moon:'#bcb5da'}[save.outfit]||'#b1c9c0';let x=p.x,y=p.y;rect(x+3,y,9,4,'#4b657b');rect(x+1,y+4,12,9,color);rect(x+3,y+7,9,7,'#f0cfb0');rect(x+(p.face>0?9:3),y+8,2,2,'#203444');rect(x+1,y+13,12,8,color);rect(x+2,y+21,4,2,'#273746');rect(x+9,y+21,4,2,'#273746');rect(x-3*p.face,y+13,13,3,save.outfit==='Amber'?'#efb264':'#c97b83');if(p.dash)rect(x+5,y+15,3,3,'#b7f0df');
for(let i=particles.length-1;i>=0;i--){let a=particles[i];a.x+=a.vx;a.y+=a.vy;rect(a.x,a.y,3,3,a.color);if(--a.life<=0)particles.splice(i,1)}
// Foreground foliage frames the scene.
for(let i=0;i<30;i++){let x=i*37;rect(x,474,3,6,'#46685d');rect(x+3,470-i%4*3,3,10,'#38584f')}
}
function closeModal(){modal='';paused=false;$('#modal').hidden=true;$('#pause').innerHTML='Pause <kbd>Esc</kbd>';canvas.focus()}
function openModal(type){if(!active&&type!=='wardrobe')return;paused=true;modal=type;const el=$('#modal');el.hidden=false;
if(type==='wardrobe'){el.innerHTML='<span class="eyebrow">MAKE YOURSELF AT HOME</span><h2>Your wardrobe</h2><p>Explore hidden paths to discover new looks.</p><div class="choices"></div><button id="close-modal">Back to the stars</button>';let choices=el.querySelector('.choices');for(const category of ['outfit','trail','sky']){let defaults={outfit:'Wanderer',trail:'Stardust',sky:'Midnight'};let options=[defaults[category],...save.found.filter(id=>rewards[id][1]===category).map(id=>rewards[id][2])];for(const value of options){let b=document.createElement('button');b.textContent=`${category}: ${value}`;b.className=save[category]===value?'selected':'';b.onclick=()=>{save[category]=value;persist();openModal('wardrobe')};choices.append(b)}}}
else if(type==='win'){el.innerHTML='<span class="eyebrow">A LIGHT IN THE DARK</span><h2>The stars are awake.</h2><p>You brought the observatory back to life.<br>'+save.found.length+' of 6 discoveries found. There may still be paths you missed.</p><button id="close-modal">Keep exploring</button>'}
else el.innerHTML='<span class="eyebrow">A MOMENT TO BREATHE</span><h2>Journey paused.</h2><p>Arrows / A D: move · Space: jump · X: dash<br>Hold a direction to aim your dash. E: interact · R: retry</p><button id="close-modal">Continue exploring</button>';
$('#close-modal').onclick=closeModal;$('#close-modal').focus();$('#pause').innerHTML='Resume <kbd>Esc</kbd>'}
$('#play').onclick=()=>{active=true;$('#start').hidden=true;enter(0);canvas.focus()};$('#wardrobe').onclick=()=>openModal('wardrobe');$('#pause').onclick=()=>paused?closeModal():openModal('pause');canvas.onclick=()=>canvas.focus();
window.addEventListener('keydown',e=>{if(e.target.closest('button')&&['Space','Enter'].includes(e.code))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;if(!e.repeat&&e.code==='Escape'){if(paused)closeModal();else openModal('pause')}if(!e.repeat&&e.code==='KeyC'){if(modal==='wardrobe')closeModal();else openModal('wardrobe')}});
window.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{keys={};if(active&&!paused)openModal('pause')});document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused){keys={};openModal('pause')}});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;pressed[b.dataset.key]=true});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys[b.dataset.key]=false)}
let acc=0;function frame(now){acc+=Math.min((now-last)/1000,0.05);last=now;while(acc>=1/60){update();pressed={};acc-=1/60}draw();requestAnimationFrame(frame)}hud();requestAnimationFrame(frame);
})();
