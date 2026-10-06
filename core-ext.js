/* Road to 1000: shared game core (cards, rules, computer player, table rendering).
 * Used by both the family version (index.html) and the members version (members/). */
/* ---------- Card data ---------- */
const META = {
  D25:{k:'dist',n:25,nm:'25 km',fr:'Escargot',band:'Snail'},
  D50:{k:'dist',n:50,nm:'50 km',fr:'Canard',band:'Duck'},
  D75:{k:'dist',n:75,nm:'75 km',fr:'Papillon',band:'Butterfly'},
  D100:{k:'dist',n:100,nm:'100 km',fr:'Lièvre',band:'Hare'},
  D200:{k:'dist',n:200,nm:'200 km',fr:'Hirondelle',band:'Swallow'},
  ACC:{k:'haz',nm:'Accident',fr:'Accident',ic:'crash'},
  OUT:{k:'haz',nm:'Out of Gas',fr:"Panne d'essence",ic:'pump'},
  FLAT:{k:'haz',nm:'Flat Tire',fr:'Crevaison',ic:'tire'},
  LIMIT:{k:'haz',nm:'Speed Limit',fr:'Limite de vitesse',ic:'limit'},
  STOP:{k:'haz',nm:'Stop',fr:'Feu rouge',ic:'red'},
  REP:{k:'fix',nm:'Repairs',fr:'Réparations',ic:'wrench'},
  GAS:{k:'fix',nm:'Gasoline',fr:'Essence',ic:'pump'},
  SPARE:{k:'fix',nm:'Spare Tire',fr:'Roue de secours',ic:'tire'},
  ENDLIM:{k:'fix',nm:'End of Limit',fr:'Fin de limite',ic:'endlim'},
  ROLL:{k:'fix',nm:'Roll',fr:'Feu vert',ic:'green'},
  ACE:{k:'safe',nm:'Driving Ace',fr:'As du volant',ic:'wheel'},
  TANK:{k:'safe',nm:'Extra Tank',fr:"Citerne d'essence",ic:'tank'},
  PUNCT:{k:'safe',nm:'Puncture-Proof',fr:'Increvable',ic:'shield'},
  ROW:{k:'safe',nm:'Right of Way',fr:'Véhicule prioritaire',ic:'siren'},
};
const COUNTS = {D25:10,D50:10,D75:10,D100:12,D200:4,ACC:3,OUT:3,FLAT:3,LIMIT:4,STOP:5,REP:6,GAS:6,SPARE:6,ENDLIM:6,ROLL:14,ACE:1,TANK:1,PUNCT:1,ROW:1};
const BAND = {haz:'Hazard',fix:'Remedy',safe:'Safety'};
const HAZ = {ACC:1,OUT:1,FLAT:1,STOP:1};
const SAFE_FOR = {ACC:'ACE',OUT:'TANK',FLAT:'PUNCT',STOP:'ROW',LIMIT:'ROW'};
const FIX = {ACC:'REP',OUT:'GAS',FLAT:'SPARE',STOP:'ROLL',LIMIT:'ENDLIM'};
const GOAL = 1000, GAME_GOAL = 5000;

const K='#1c1e23', R='#e0312b', B='#2f8fd8', L='#b5d334', G='#2e9a4a', W='#fff';
const ln=(d,c=K,w=2)=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const car=(x,y,s,col,rot=0)=>`<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M1 17c0-4 2-6 6-6.5l7-1.5 5-6h15l6 6.5 7 1c3 .4 4 2.5 4 6V20H1z" fill="${col}" stroke="${K}" stroke-width="1.4" stroke-linejoin="round"/><path d="M20.5 5h12.5l4.5 4.6H17z" fill="#dff1ff" stroke="${K}" stroke-width="1"/><path d="M27 5v4.6" stroke="${K}" stroke-width="1"/><circle cx="13" cy="20" r="4.6" fill="${K}"/><circle cx="13" cy="20" r="1.8" fill="${W}"/><circle cx="40" cy="20" r="4.6" fill="${K}"/><circle cx="40" cy="20" r="1.8" fill="${W}"/><rect x="48" y="12" width="3" height="2.4" rx="1" fill="#ffe27a" stroke="${K}" stroke-width=".8"/></g>`;
const lightArt=(disc,lit)=>`<circle cx="22" cy="26" r="18" fill="${disc}"/><rect x="40" y="0" width="4" height="8" fill="${K}"/><rect x="33" y="7" width="18" height="50" rx="3" fill="${K}"/>${[17,31,45].map((cy,i)=>`<circle cx="42" cy="${cy}" r="5.5" fill="${(lit==='top'&&i===0)||(lit==='bot'&&i===2)?disc:K}" stroke="${W}" stroke-width="1.2"/>`).join('')}<rect x="40" y="57" width="4" height="7" fill="${K}"/>`;
const sign50=(ring,num,txt)=>`<rect x="40" y="30" width="3.5" height="34" fill="${K}"/><circle cx="41.5" cy="24" r="17" fill="${W}" stroke="${ring}" stroke-width="${ring===R?5.5:1.5}"/>${txt?`<text x="41.5" y="31" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="19" fill="${num}">50</text>`:''}`;
const nBand=`<path d="M6 0h11v30L47 4h11v60H47V36L17 62H6z" fill="${G}"/>`;
const wheelFront=(cx,cy,r,rim)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${K}"/><circle cx="${cx}" cy="${cy}" r="${r*.62}" fill="${rim}" stroke="${W}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${r*.2}" fill="${W}" stroke="${K}"/>${[0,60,120].map(a=>`<path d="M${cx} ${cy-r*.58}V${cy+r*.58}" stroke="${W}" stroke-width="1" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}`;
const tireSide=(cx,cy,col,rot)=>`<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="14" ry="23" fill="${col}" stroke="${K}" stroke-width="1.4"/><ellipse cx="${cx}" cy="${cy}" rx="11.5" ry="20" fill="none" stroke="${W}" stroke-width="2" stroke-dasharray="2 2.4"/><ellipse cx="${cx+1}" cy="${cy}" rx="7.5" ry="13" fill="${W}" stroke="${K}" stroke-width="1.2"/><ellipse cx="${cx+1.5}" cy="${cy}" rx="3.5" ry="6.5" fill="${col===R?B:R}"/></g>`;
const puff=(x,y,c)=>`<g fill="${W}" stroke="${c}" stroke-width="1.2"><circle cx="${x}" cy="${y}" r="3.6"/><circle cx="${x+4.5}" cy="${y-2}" r="4.4"/><circle cx="${x+8.5}" cy="${y+.5}" r="3.4"/></g>`;
const ANIMAL = {
  25: `<path d="M1 17h15c2 0 3-1.5 3-3" fill="#8b6a4a" stroke="${K}" stroke-width="1"/><path d="M0 17c0-2 2-3 4-3h12v3z" fill="#a9845c" stroke="${K}" stroke-width="1"/><circle cx="8" cy="10" r="6.2" fill="#c98a4a" stroke="${K}" stroke-width="1.2"/>${ln('M8 10a1.5 1.5 0 0 1 2 1.6 3.5 3.5 0 0 1-4.6 2.6 5 5 0 0 1-2.6-6 6 6 0 0 1 7.6-3',K,1)}${ln('M15 14l1.5-6M17.5 14.5l3-5',K,1)}<circle cx="16.5" cy="7.6" r="1" fill="${K}"/><circle cx="20.6" cy="9.4" r="1" fill="${K}"/>`,
  50: `<path d="M1 10l-1-4 4 3z" fill="#1f7a5a" stroke="${K}" stroke-width=".8"/><ellipse cx="8" cy="12" rx="8" ry="5" fill="#2e9a6e" stroke="${K}" stroke-width="1"/><path d="M13 9c1-3 1-6 3-7 2 0 3 1.5 3 3" fill="#1f7a5a" stroke="${K}" stroke-width="1"/><circle cx="16.5" cy="3.5" r="3" fill="#1f7a5a" stroke="${K}" stroke-width="1"/><path d="M19 3l3.5 1-3.5 1.4z" fill="#f2c94c" stroke="${K}" stroke-width=".7"/><circle cx="17" cy="2.8" r=".7" fill="${W}"/><path d="M4 11c3-2 7-2 9 0-3 2-6 2-9 0z" fill="#61b88f" stroke="${K}" stroke-width=".7"/>${ln('M7 17l-1 3M10 17l1 3','#e9902b',1.2)}`,
  75: `<ellipse cx="5.5" cy="6" rx="5" ry="4" transform="rotate(-25 5.5 6)" fill="${L}" stroke="${K}" stroke-width="1"/><ellipse cx="14.5" cy="6" rx="5" ry="4" transform="rotate(25 14.5 6)" fill="${L}" stroke="${K}" stroke-width="1"/><ellipse cx="6.5" cy="13" rx="3.6" ry="3" transform="rotate(25 6.5 13)" fill="${R}" stroke="${K}" stroke-width="1"/><ellipse cx="13.5" cy="13" rx="3.6" ry="3" transform="rotate(-25 13.5 13)" fill="${R}" stroke="${K}" stroke-width="1"/><circle cx="5" cy="5.6" r="1.3" fill="${B}"/><circle cx="15" cy="5.6" r="1.3" fill="${B}"/><rect x="9.1" y="3" width="1.8" height="13" rx=".9" fill="${K}"/>${ln('M9.6 3.4C9 1.5 8 .6 6.5 0M10.4 3.4C11 1.5 12 .6 13.5 0',K,.8)}`,
  100: `<path d="M1 12c2-5 8-7 13-5l3-1c2 0 3 1 3 3-1 1-2 1-3 1l-3 4c-3 2-8 2-11 1z" fill="#9a6a3e" stroke="${K}" stroke-width="1"/><path d="M15 6l1-6 2 1-1 5zM17 6l3-5 1.6 1.4-3 4.4z" fill="#9a6a3e" stroke="${K}" stroke-width=".8"/>${ln('M3 15l-3 4M6 15l-1 4M14 13l4 5M12 14l1.5 5','#6b4523',1.3)}<circle cx="1.5" cy="11" r="1.6" fill="${W}" stroke="${K}" stroke-width=".6"/><circle cx="18.2" cy="7.6" r=".7" fill="${K}"/>`,
  200: `<path d="M10 8L0 1c4 0 8 2 11 5z" fill="${K}"/><path d="M11 8L22 0c-2 4-5 7-9 9z" fill="${K}"/><path d="M5 11c2-3 7-4 11-3l3-1-1.5 2.4c-3 3-8 4-12 3z" fill="#1d2a6b" stroke="${K}" stroke-width=".8"/><path d="M7 12c3 .6 6 0 9-2" stroke="${W}" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M6 11L0 12l4 1-4 3 7-3z" fill="${K}"/><circle cx="16.6" cy="8.4" r=".9" fill="${R}"/>`,
};
function distArt(n){
  return `<path d="M0 46C2 24 16 12 36 14c-6 10-6 22-4 34z" fill="${L}"/>${[[6,40,R],[12,30,B],[20,42,W],[7,26,W]].map(([x,y,c])=>`${ln(`M${x} ${y+2}v5`,G,1)}<circle cx="${x}" cy="${y}" r="2.2" fill="${c}" stroke="${K}" stroke-width=".7"/>`).join('')}${ln('M4 10l9 3M8 5l9 3',B,1.4)}<path d="M18 22a13 10 0 0 1 26 0z" fill="${R}" stroke="${K}" stroke-width="1.4"/><path d="M44 22l5-3.5a13 10 0 0 0-8-6.5" fill="#b82720" stroke="${K}" stroke-width="1.2"/><rect x="18" y="22" width="26" height="24" fill="${W}" stroke="${K}" stroke-width="1.4"/><path d="M44 22l5-3.5V42l-5 4z" fill="#e7e2d4" stroke="${K}" stroke-width="1.2"/><text x="31" y="${n>99?40:41.5}" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="${n>99?14:17}" fill="${K}">${n}</text><g transform="translate(39 ${n===200?0:1}) scale(1.1)">${ANIMAL[n]}</g>`;
}
const ART = {
  STOP: lightArt(R,'top'),
  ROLL: lightArt(L,'bot'),
  LIMIT: `<rect x="8" y="22" width="30" height="30" fill="${B}"/>${sign50(R,B,1)}`,
  ENDLIM: `<rect x="8" y="22" width="30" height="30" fill="${L}"/>${sign50(B,B,0)}<path d="M32 33.5L51 14.5" stroke="${B}" stroke-width="9"/><circle cx="41.5" cy="24" r="17" fill="none" stroke="${B}" stroke-width="1.5"/>`,
  OUT: `<path d="M0 44L64 26v10L0 54z" fill="${B}"/>${car(16,16,.9,R)}<circle cx="10" cy="22" r="3" fill="${K}"/>${ln('M9 25L5 36M8 27l8 3M8 29l8 3M5 36l-3 9M5 36l4 8',K,2.2)}`,
  FLAT: `${ln('M38 30h22M40 36h20M42 42h18',B,2.4)}${tireSide(28,36,R,-22)}${puff(4,14,B)}${puff(44,56,B)}${ln('M52 4l-3 10',R,3)}<circle cx="48.4" cy="18" r="1.6" fill="${R}"/>`,
  ACC: `<path d="M0 36L64 18v12L0 48z" fill="${B}"/>${ln('M50 62L42 6',K,2.4)}<rect x="37" y="2" width="9" height="7" rx="1" fill="#ffe27a" stroke="${K}" stroke-width="1.2"/>${car(4,20,.78,R,18)}<path d="M38 36l4-6 2 7 5-3-3 7" fill="none" stroke="${R}" stroke-width="2"/>`,
  GAS: `<rect x="3" y="8" width="17" height="44" rx="3" fill="${B}" stroke="${K}" stroke-width="1.4"/><rect x="7" y="13" width="9" height="11" rx="1" fill="${W}" stroke="${K}"/><rect x="1" y="52" width="21" height="4" fill="${K}"/>${ln('M20 20c9 0 12 6 14 12',K,1.6)}${car(22,30,.74,L)}${ln('M30 22l-2-6M38 21v-6M46 22l2-6',L,1.8)}`,
  SPARE: `<path d="M0 28L64 8v14L0 42z" fill="${L}"/>${car(2,2,.4,K)}${car(44,52,.36,K)}${tireSide(34,36,B,18)}`,
  REP: `<path d="M8 40h48" stroke="${R}" stroke-width="1.6"/>${car(4,22,.88,L)}<path d="M46 30.5l12-10 2.5 3z" fill="${L}" stroke="${K}" stroke-width="1.2"/><circle cx="56" cy="8" r="3.2" fill="${K}"/><path d="M53.5 11.5h5l1 12h-7z" fill="${B}" stroke="${K}" stroke-width="1"/>${ln('M54 24l-1 10M58 24l1 10',B,2.2)}${ln('M53.5 14l-5 6',B,2)}<g transform="rotate(-40 18 12)"><rect x="16.5" y="6" width="3" height="16" rx="1.5" fill="${R}" stroke="${K}" stroke-width=".8"/><circle cx="18" cy="5" r="4" fill="${R}" stroke="${K}" stroke-width=".8"/><rect x="16.8" y="0" width="2.4" height="4.5" fill="#fffdf6"/></g>`,
  ROW: `${nBand}<g transform="translate(4 24)"><rect x="0" y="8" width="40" height="16" rx="2" fill="${R}" stroke="${K}" stroke-width="1.3"/><path d="M40 10h10l6 7v7H40z" fill="${R}" stroke="${K}" stroke-width="1.3"/><path d="M43 12h6l4 5h-10z" fill="#dff1ff"/><path d="M2 6h34M2 2h34" stroke="${K}" stroke-width="1.2"/>${[4,10,16,22,28,34].map(x=>`<path d="M${x} 2v4" stroke="${K}" stroke-width="1"/>`).join('')}<rect x="45" y="6" width="5" height="3" rx="1" fill="${B}"/>${[9,25,47].map(x=>`<circle cx="${x}" cy="25" r="4.6" fill="${K}"/><circle cx="${x}" cy="25" r="1.8" fill="${W}"/>`).join('')}</g>`,
  TANK: `${nBand}<g transform="translate(3 22)"><rect x="0" y="4" width="38" height="16" rx="8" fill="${B}" stroke="${K}" stroke-width="1.3"/><path d="M4 8h30" stroke="${W}" stroke-width="2"/><path d="M38 6h9l7 8v8H38z" fill="${B}" stroke="${K}" stroke-width="1.3"/><path d="M41 8h5l5 6H41z" fill="#dff1ff"/><rect x="0" y="20" width="56" height="3" fill="${K}"/>${[8,20,46].map(x=>`<circle cx="${x}" cy="25" r="4.4" fill="${K}"/><circle cx="${x}" cy="25" r="1.7" fill="${W}"/>`).join('')}</g>`,
  PUNCT: `${nBand}${wheelFront(32,34,17,B)}${ln('M32 2v10',R,2.4)}<path d="M28 6l4-6 4 6z" fill="${R}"/>${ln('M32 56v8',R,2.4)}`,
  ACE: `${nBand}<circle cx="32" cy="32" r="19" fill="none" stroke="${B}" stroke-width="5"/><circle cx="32" cy="32" r="5" fill="${B}"/>${ln('M14 34h13M37 34h13M32 37v13',B,4)}<path d="M32 29l1 2 2.2.2-1.7 1.4.6 2.2-2.1-1.2-2.1 1.2.6-2.2-1.7-1.4 2.2-.2z" fill="${W}"/><path d="M9 20c-2-6 2-10 6-9l4 4-4 6z" fill="${R}" stroke="${K}" stroke-width="1"/><path d="M55 20c2-6-2-10-6-9l-4 4 4 6z" fill="${R}" stroke="${K}" stroke-width="1"/>`,
};
function borne(n){
  return `<svg viewBox="0 0 48 52" aria-hidden="true"><path d="M7 50V21a17 17 0 0 1 34 0v29z" fill="#fff" stroke="#1c1e23" stroke-width="2"/><path d="M7 21a17 17 0 0 1 34 0z" fill="#d23a2e" stroke="#1c1e23" stroke-width="2"/><text x="24" y="${n>99?41:42}" text-anchor="middle" font-family="Anton,Impact,sans-serif" font-size="${n>99?15:18}" fill="#1c1e23">${n}</text></svg>`;
}
const IDX = {ACC:'A',OUT:'P',FLAT:'C',LIMIT:'L',STOP:'S',REP:'R',GAS:'E',SPARE:'RS',ENDLIM:'F',ROLL:'V',ACE:'★',TANK:'★',PUNCT:'★',ROW:'★'};
const FT = {ACC:'Accident',OUT:"Panne d'essence",FLAT:'Crevé !',LIMIT:'Limite de vitesse',STOP:'Stop',REP:'Réparations',GAS:'Essence',SPARE:'Roue de secours',ENDLIM:'Fin de limite',ROLL:'Roulez',ACE:'as du volant',TANK:"citerne d'essence",PUNCT:'increvable',ROW:'véhicule prioritaire'};
const DIGITS = {25:[B,B],50:[R,R],75:[K,B],100:[K,B,B],200:[R,K,B]};
function cardHTML(c, cls='', attrs=''){
  const m = META[c];
  if (attrs) attrs += ' role="button" tabindex="0"';
  let inner;
  if (m.k==='dist'){
    const big = String(m.n).split('').map((d,i)=>`<span style="color:${DIGITS[m.n][i]}">${d}</span>`).join('');
    inner = `<span class="idx">${m.n}</span><svg class="art" viewBox="0 0 64 50" aria-hidden="true">${distArt(m.n)}</svg><div class="big">${big}</div><div class="km">KM</div>`;
  } else {
    inner = `<span class="idx">${IDX[c]}</span><div class="ft">${FT[c]}</div><svg class="art" viewBox="0 0 64 64" aria-hidden="true">${ART[c]}</svg><div class="nm">${m.nm}</div><div class="chip">${BAND[m.k]}</div>`;
  }
  return `<div class="card k-${m.k} ${cls}" ${attrs} aria-label="${m.nm}"><div class="face">${inner}</div></div>`;
}
const carSVG = col => `<svg class="car-svg" viewBox="0 0 44 30" width="44" height="30" aria-hidden="true"><path d="M3 20l3-8 8-2 5-6h12l5 6 5 1 1 9z" fill="${col}" stroke="#111" stroke-width="1.5"/><rect x="21" y="6" width="9" height="5" rx="1" fill="#cfe3ff"/><circle cx="12" cy="22" r="5" fill="#111"/><circle cx="34" cy="22" r="5" fill="#111"/><circle cx="12" cy="22" r="2" fill="#bbb"/><circle cx="34" cy="22" r="2" fill="#bbb"/></svg>`;

/* ---------- Rules engine ---------- */
const other = s => s==='A' ? 'B' : 'A';
const clone = o => JSON.parse(JSON.stringify(o));
const has = (p,s) => p.safeties.includes(s);
function moving(p){
  if (p.battle && HAZ[p.battle]) return false;
  if (p.battle==='ROLL') return true;
  return has(p,'ROW');
}
function newPlayer(){ return {hand:[],battle:null,limit:false,miles:0,n200:0,dists:[],safeties:[],coups:[]}; }
function blankTable(){ return {v:1,phase:'lobby',seats:{},totals:{A:0,B:0},handNo:0,starter:'B',rev:0}; }
function seededShuffle(arr, seed){
  let h=1779033703^seed.length;
  for (let i=0;i<seed.length;i++){ h=Math.imul(h^seed.charCodeAt(i),3432918353); h=h<<13|h>>>19; }
  const rnd=()=>{ h=Math.imul(h^h>>>16,2246822507); h=Math.imul(h^h>>>13,3266489909); h^=h>>>16; return (h>>>0)/4294967296; };
  const d=arr.slice();
  for (let i=d.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
  return d;
}
// House rule: when the draw pile runs out, shuffle the discards into a new draw pile.
// Stops once nobody has played a card since the last reshuffle, so a hand can't go on forever.
function refill(s){
  if (s.deck.length || !s.discard?.length) return;
  if ((s.shuffles||0)>0 && !s.playsSinceShuffle) return;
  s.shuffles=(s.shuffles||0)+1; s.playsSinceShuffle=0;
  s.deck=seededShuffle(s.discard,(s.seed||'rt')+':'+s.shuffles); s.discard=[];
  s.log=(s.log||[]).concat(`The draw pile ran out, so the ${s.deck.length} thrown-away cards were shuffled into a new draw pile.`).slice(-60);
}
function shuffled(){
  const d=[]; for (const [c,n] of Object.entries(COUNTS)) for (let i=0;i<n;i++) d.push(c);
  for (let i=d.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [d[i],d[j]]=[d[j],d[i]]; }
  return d;
}
function dealHand(prev){
  const s = clone(prev);
  s.phase='play'; s.deck=shuffled(); s.discard=[];
  s.players={A:newPlayer(),B:newPlayer()};
  for (let i=0;i<6;i++){ s.players.A.hand.push(s.deck.pop()); s.players.B.hand.push(s.deck.pop()); }
  s.starter = other(prev.starter||'B'); s.turn=s.starter; s.drawn=false; s.coup=null;
  s.goal=1000;
  s.seed=Math.random().toString(36).slice(2,10); s.shuffles=0; s.playsSinceShuffle=0;
  s.last=`Hand ${(prev.handNo||0)+1} is dealt. First turn: %${s.starter}.`;
  s.log=[s.last];
  s.handNo=(prev.handNo||0)+1; s.result=null; s.champion=null;
  if (!s.totals) s.totals={A:0,B:0};
  return s;
}
function newGame(prev){ const s=clone(prev); s.totals={A:0,B:0}; s.handNo=0; s.champion=null; return dealHand(s); }

function whyNot(s, seat, c){
  const me=s.players[seat], op=s.players[other(seat)], m=META[c], them=nameOf(other(seat),s);
  if (m.k==='dist'){
    if (!moving(me)) return me.battle && HAZ[me.battle] ? `You have a ${META[me.battle].nm}. Fix it with ${META[FIX[me.battle]].nm} first.` : 'You need a green light (Roll) before you can drive.';
    if (me.limit && m.n>50) return 'Speed limit! Only 25 or 50 until you play End of Limit.';
    const goal=s.goal||GOAL;
    if (me.miles+m.n>goal && !(goal===1000 && me.miles<1000)) return `That would go past ${goal} km.`;
    if (goal===1000 && me.miles+m.n>1500) return 'too far even for 1500';
    if (m.n===200 && me.n200>=2) return 'Only two 200s are allowed per hand.';
    return null;
  }
  if (m.k==='safe') return null;
  if (m.k==='haz'){
    if (has(op,SAFE_FOR[c])) return `${them} has ${META[SAFE_FOR[c]].nm}, so this can't hurt them.`;
    if (c==='LIMIT') return op.limit ? `${them} already has a speed limit.` : null;
    if (op.battle && HAZ[op.battle]) return `${them} is already stuck. Wait until they fix it.`;
    if (!moving(op)) return `You can only do this while ${them} is rolling (green light).`;
    return null;
  }
  if (c==='ENDLIM') return me.limit ? null : 'You have no speed limit to end.';
  if (c==='ROLL'){
    if (has(me,'ROW')) return 'You have Right of Way, so you never need a green light.';
    if (me.battle==='ROLL') return 'You already have a green light.';
    if (me.battle && HAZ[me.battle] && me.battle!=='STOP') return `Fix your ${META[me.battle].nm} with ${META[FIX[me.battle]].nm} first.`;
    return null;
  }
  const need = Object.keys(HAZ).find(h=>FIX[h]===c);
  return me.battle===need ? null : `Only useful when you have a ${META[need].nm}.`;
}
function whyNotDiscard(s, seat, i){
  return (s.took!=null && s.turn===seat && i===s.took) ? "You just took this card from the discard pile, so you can't throw it straight back. Play it or throw away a different card." : null;
}
function applySafety(p, c){
  p.safeties.push(c);
  for (const h of Object.keys(HAZ)) if (SAFE_FOR[h]===c && p.battle===h) p.battle='SAFE';
  if (c==='ROW') p.limit=false;
}
function nextTurn(s, again){
  if (!again) s.turn=other(s.turn);
  refill(s);
  for (let k=0;k<2;k++){ if (s.deck.length || s.players[s.turn].hand.length) break; s.turn=other(s.turn); }
  if (!s.deck.length && !s.players.A.hand.length && !s.players.B.hand.length) return endHand(s);
  s.drawn = s.deck.length===0; s.took=null;
  return s;
}
function scoreHand(s){
  const out={};
  for (const x of ['A','B']){
    const p=s.players[x], o=s.players[other(x)], items=[['Distance',p.miles]];
    if (p.safeties.length) items.push([`Safeties ×${p.safeties.length}`,100*p.safeties.length]);
    if (p.safeties.length===4) items.push(['All four safeties',300]);
    if (p.coups.length) items.push([`Coup fourré ×${p.coups.length}`,300*p.coups.length]);
    if (p.miles===(s.goal||GOAL)){
      items.push(['Trip complete',400]);
      if (!s.deck.length && !s.discard?.length) items.push(['Delayed action',300]);
      if (!p.n200) items.push(['Safe trip (no 200s)',300]);
      if (!o.miles) items.push(['Shutout',500]);
    }
    out[x]={items,total:items.reduce((a,b)=>a+b[1],0)};
  }
  return out;
}
function endHand(s){
  s.phase='over'; s.result=scoreHand(s);
  s.totals={A:(s.totals?.A||0)+s.result.A.total, B:(s.totals?.B||0)+s.result.B.total};
  const a=s.totals.A, b=s.totals.B;
  s.champion = (a>=GAME_GOAL||b>=GAME_GOAL) && a!==b ? (a>b?'A':'B') : null;
  return s;
}
function apply(s0, seat, a){
  const s=applyMove(s0,seat,a);
  if (s!==s0 && a.t!=='draw' && s.last) s.log=(s.log||[]).concat(s.last).slice(-60);
  return s;
}
function applyMove(s0, seat, a){
  if (!s0 || s0.phase!=='play' || s0.turn!==seat) return s0;
  const s=clone(s0), me=s.players[seat], op=s.players[other(seat)];
  if (a.t==='coup'){
    if (!(s.coup && s.coup.seat===seat && !s.drawn)) return s0;
    const i=me.hand.indexOf(s.coup.card); if (i<0) return s0;
    me.hand.splice(i,1); applySafety(me,s.coup.card); me.coups.push(s.coup.card);
    if (s.coup.haz==='LIMIT') me.limit=false;
    s.last=`COUP FOURRÉ! %${seat} blocked the ${META[s.coup.haz].nm} with ${META[s.coup.card].nm} (+400).`;
    s.playsSinceShuffle=(s.playsSinceShuffle||0)+1;
    refill(s); if (s.deck.length) me.hand.push(s.deck.pop());
    s.coup=null; refill(s); s.drawn = s.deck.length===0;
    return s;
  }
  if (a.t==='draw'){
    if (s.drawn || !s.deck.length) return s0;
    me.hand.push(s.deck.pop()); s.drawn=true; s.coup=null; s.took=null;
    return s;
  }
  // House rule: instead of drawing, take the top card of the discard pile (only while the draw pile has cards).
  if (a.t==='take'){
    if (s.drawn || !s.deck.length || !s.discard?.length) return s0;
    const t=s.discard.pop(); me.hand.push(t); s.drawn=true; s.coup=null; s.took=me.hand.length-1;
    s.last=`%${seat} took ${META[t].nm} from the discard pile.`;
    return s;
  }
  if (!s.drawn && s.deck.length) return s0;
  const c=me.hand[a.i]; if (!c) return s0;
  const tookIdx=s.took;
  s.coup=null; s.took=null;
  if (a.t==='discard'){
    if (tookIdx!=null && a.i===tookIdx) return s0;   // can't throw back the card just taken from the discard pile
    me.hand.splice(a.i,1); s.discard.push(c);
    s.last=`%${seat} threw away ${META[c].nm}.`;
    return nextTurn(s,false);
  }
  if (a.t!=='play' || whyNot(s,seat,c)) return s0;
  me.hand.splice(a.i,1);
  const m=META[c]; let again=false;
  s.playsSinceShuffle=(s.playsSinceShuffle||0)+1;
  if (m.k==='dist'){
    me.miles+=m.n; if (m.n===200) me.n200++; if ((s.goal||GOAL)===1000 && me.miles>1000){ s.goal=1500; s.extendedBy=seat; s.extendedAt=me.miles; } (me.dists=me.dists||[]).push(m.n);
    s.last=`%${seat} drove ${m.n} km (now ${me.miles}).`;
  } else if (m.k==='safe'){
    applySafety(me,c); again=true;
    s.last=`%${seat} played the safety ${m.nm} and gets another turn.`;
  } else if (m.k==='haz'){
    if (c==='LIMIT'){ op.limit=true; op.speedTop='LIMIT'; } else op.battle=c;
    s.last=`%${seat} played ${m.nm} on %${other(seat)}!`;
    if (op.hand.includes(SAFE_FOR[c])) s.coup={seat:other(seat),card:SAFE_FOR[c],haz:c};
  } else {
    if (c==='ENDLIM'){ me.limit=false; me.speedTop='ENDLIM'; } else me.battle=c;
    s.last=`%${seat} played ${m.nm}.`;
  }
  if (me.miles===(s.goal||GOAL)){ s.last=`%${seat} reached ${GOAL} km!`; return endHand(s); }
  if (again){ refill(s); s.drawn = s.deck.length===0; if (!me.hand.length && !s.deck.length) return nextTurn(s,false); return s; }
  return nextTurn(s,false);
}

/* ---------- Computer opponent ---------- */
function aiAction(s, seat){
  if (s.coup && s.coup.seat===seat && !s.drawn) return {t:'coup'};
  const me=s.players[seat], op=s.players[other(seat)];
  const value=c=>{
    const m=META[c];
    if (m.k==='dist') return 40+m.n/10;
    if (m.k==='safe') return ((me.battle && SAFE_FOR[me.battle]===c) || (c==='ROW' && me.limit)) ? 95 : (s.deck.length<12 ? 35 : 20);
    if (m.k==='haz') return (c==='LIMIT'?50:70)+(op.miles>=me.miles?8:0);
    return c==='ROLL'?88:90;
  };
  if (!s.drawn && s.deck.length){
    const top=s.discard?.[s.discard.length-1];
    if (top && !whyNot(s,seat,top) && (value(top)>=70 || META[top].n>=100)) return {t:'take'};
    return {t:'draw'};
  }
  let best=-1, bi=-1;
  me.hand.forEach((c,i)=>{
    if (whyNot(s,seat,c)) return;
    const v=value(c);
    if (v>best){best=v;bi=i;}
  });
  if (bi>=0 && best>=30) return {t:'play',i:bi};
  let worst=1e9, wi=me.hand.findIndex((c,i)=>!whyNotDiscard(s,seat,i));
  me.hand.forEach((c,i)=>{
    if (whyNotDiscard(s,seat,i)) return;
    const m=META[c]; let v;
    if (m.k==='safe') v=1000;
    else if (m.k==='dist') v=(me.miles+m.n>GOAL || (m.n===200 && me.n200>=2)) ? 0 : m.n/5;
    else if (m.k==='haz') v=has(op,SAFE_FOR[c]) ? 1 : 45;
    else if (c==='ROLL') v=has(me,'ROW') ? 1 : 60;
    else { const h=Object.keys(FIX).find(k=>FIX[k]===c); v=has(me,SAFE_FOR[h]) ? 1 : 30-8*(me.hand.filter(x=>x===c).length-1); }
    if (v<worst){worst=v;wi=i;}
  });
  if (bi>=0 && worst>=20) return {t:'play',i:bi};
  return {t:'discard',i:wi};
}

/* ---------- Shared helpers ---------- */
const $ = id => document.getElementById(id);
const esc = t => String(t??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function save(k,v){ try{ v==null ? localStorage.removeItem(k) : localStorage.setItem(k, typeof v==='string'?v:JSON.stringify(v)); }catch(e){} }
function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function loadJSON(k){ try{ return JSON.parse(load(k)||'null'); }catch(e){ return null; } }
function toast(t){ const el=$('toast'); el.textContent=t; el.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>el.hidden=true,3500); }

/* ---------- Shared rendering ---------- */
const DISCLAIMER='Road to 1000 is an independent fan project inspired by Mille Bornes. It is not affiliated with or endorsed by Dujardin, Asmodee or Hasbro. Mille Bornes is a trademark of its owner.';
function disclaimerHTML(){ return `<p class="disclaimer">${DISCLAIMER}</p>`; }
function rulesHTML(){
  return `<details class="rules"><summary>How to play</summary><ul>
  <li>Race your car to exactly <b>1000 km</b>. Each turn: draw a card, then play one card or throw one away.</li>
  <li>You can't drive until you play a green light (<span class="kw-f">Roll</span>). Then play <b>distance cards</b> (25 to 200 km). Only two 200s per hand.</li>
  <li>Slow your opponent down with <span class="kw-h">Hazards</span>: Accident, Out of Gas, Flat Tire, Stop, and Speed Limit (max 50 km cards).</li>
  <li>Fix a hazard with its <span class="kw-f">Remedy</span>: Repairs, Gasoline, Spare Tire, Roll, or End of Limit. After a fix you need a Roll again.</li>
  <li><span class="kw-s">Safeties</span> protect you for the rest of the hand and give you another turn: Driving Ace, Extra Tank, Puncture-Proof, Right of Way (no more Stops or Speed Limits, and you never need Roll).</li>
  <li><b>Coup fourré:</b> if someone hits you with a hazard and you are holding its safety, play it right away at the start of your turn for a big bonus.</li>
  <li>House rule: at the start of your turn you can take the top card of the discard pile instead of drawing. You can't throw that card straight back the same turn.</li>
  <li>When the draw pile runs out, the thrown-away cards are shuffled into a new draw pile. If nobody plays a card through a whole pile, there's no more reshuffling: play out your hands without drawing.</li>
  <li>Scoring: 1 point per km, 100 per safety, 300 per coup fourré, 400 for finishing, plus bonuses. First to ${GAME_GOAL} points wins the game.</li>
  </ul></details>`;
}
function coverHTML(s){
  const who=esc(nameOf(s.turn,s)), log=s.log||[];
  const plays = log.length ? `<div class="event"><div class="ev-title">Latest plays</div><ul class="plays recent">${log.slice(-3).reverse().map((t,i)=>`<li class="${i===0?'now':''}">${fmt(t,s)}</li>`).join('')}</ul></div>` : '';
  return topBar()+`<div class="cover"><span class="lbl">Pass the device to</span><span class="who">${who}</span>
    <div class="scoreline"><span>${esc(nameOf('A',s))}: <b>${s.players.A.miles} km</b></span><span>${esc(nameOf('B',s))}: <b>${s.players.B.miles} km</b></span></div>
    ${plays}<button class="btn green" data-act="reveal">I'm ${who}. Show my cards</button>
    <span class="small" style="color:var(--muted);font-size:.85rem">Cards stay hidden until ${who} taps the button.</span></div>`+roadHTML(s,other(s.turn),s.turn);
}
function statusChip(p){
  if (p.battle && HAZ[p.battle]) return `<span class="status stop">Stopped: ${META[p.battle].nm}</span>`;
  if (moving(p)) return `<span class="status go">${p.limit?'Rolling (max 50)':'Rolling!'}</span>`;
  return `<span class="status wait">Needs a green light${p.limit?' · limit 50':''}</span>`;
}
function stripHTML(s, seat, mine){
  const p=s.players[seat];
  const battle = p.battle && p.battle!=='SAFE' ? cardHTML(p.battle,'mini') : `<div class="empty">${has(p,'ROW')?'Right of Way':'No light yet'}</div>`;
  const speed = p.limit ? cardHTML('LIMIT','mini') : has(p,'ROW') ? `<div class="empty">Right of Way</div>` : p.speedTop==='ENDLIM' ? cardHTML('ENDLIM','mini') : `<div class="empty">No limit</div>`;
  const safes = p.safeties.map(c=>`<div class="slot">${cardHTML(c,'mini')}${p.coups.includes(c)?'Coup!':'Safety'}</div>`).join('');
  const groups = [25,50,75,100,200].map(n=>[n,(p.dists||[]).filter(x=>x===n).length]).filter(g=>g[1]);
  const dist = groups.length ? groups.map(([n,c])=>`<div class="dstack ${c>1?'multi':''}" aria-label="${c} × ${n} km">${cardHTML('D'+n,'mini')}${c>1?`<span class="cnt">×${c}</span>`:''}</div>`).join('') : `<div class="empty">No km played yet</div>`;
  const turn = s.phase==='play' && s.turn===seat;
  return `<section class="strip ${mine?'mine':''} ${turn?'turn':''}" aria-label="${esc(nameOf(seat,s))}">
    <div class="strip-head"><span class="pname">${mine && mode==='online' ? esc(nameOf(seat,s))+' (you)' : esc(nameOf(seat,s))} · <small style="color:var(--muted)">${s.totals?.[seat]||0} pts</small></span><span class="km">${p.miles}<small> / ${GOAL} km</small></span></div>
    <div>${statusChip(p)}</div>
    <div class="piles"><div class="slot">${battle}Battle</div><div class="slot">${speed}Speed</div><div class="slot dist"><div class="dstacks">${dist}</div>Distance</div></div>
    ${safes || !mine ? `<div class="extras">${safes}${mine?'':`<div class="backs" aria-label="${p.hand.length} cards in hand">${'<i></i>'.repeat(Math.min(p.hand.length,7))} ${p.hand.length} cards</div>`}</div>` : ''}
  </section>`;
}
function roadHTML(s, top, bottom){
  const lane = (seat,col) => `<div class="lane"><span class="flag"></span><div class="car" style="left:calc((100% - 66px) * ${s.players[seat].miles/GOAL})">${carSVG(col)}</div></div>`;
  return `<div class="road" aria-hidden="true">${lane(top,'#7fa8ff')}${lane(bottom,'#f2c94c')}<div class="ticks"><span>0</span><span>250</span><span>500</span><span>750</span><span>1000 km</span></div></div>`;
}
function tableHTML(s){
  const me=mySeat(s), view=me||'A', opp=other(view), mine=s.players[view];
  const myTurn = !!me && s.phase==='play' && s.turn===me;
  const canCoup = myTurn && s.coup && s.coup.seat===me && !s.drawn;
  const topCard = s.discard?.length ? s.discard[s.discard.length-1] : null;
  const canTake = myTurn && !s.drawn && s.deck.length>0 && !!topCard;
  if (sel>=mine.hand.length) sel=-1;
  let big, small='';
  if (!me) { big='Both seats are taken. You are watching.'; }
  else if (s.phase!=='play') big='Hand over.';
  else if (!myTurn) big=`Waiting for ${esc(nameOf(opp,s))}…`;
  else if (canCoup) big='Coup fourré chance!';
  else if (!s.drawn) { big = canTake ? `Your turn! Tap the deck to draw, or take the ${META[topCard].nm} from the discard pile.` : 'Your turn! Tap the deck to draw.'; }
  else if (sel<0) { big='Pick a card to play or throw away.'; small='Cards with a green dot can be played now.'; }
  else { const r=whyNot(s,me,mine.hand[sel]), rd=whyNotDiscard(s,me,sel); big=r?esc(r):`Ready: ${META[mine.hand[sel]].nm}`; small = rd ? "You took this from the discard pile, so you can't throw it away this turn." : r ? 'You can still throw it away.' : ''; }
  if (busy) small='Saving…';
  const pulse = myTurn && !s.drawn && !canCoup && s.deck.length;
  const top = !topCard ? `<div class="empty">Discard</div>`
    : canTake ? `<button class="pile ${pulse?'pulse':''}" data-act="take" aria-label="Take ${META[topCard].nm} from the discard pile" ${busy?'disabled':''}>${cardHTML(topCard,'mini')}</button>`
    : cardHTML(topCard,'mini');
  const log = (s.log && s.log.length) ? s.log : (s.last ? [s.last] : []);
  const recent = log.slice(-3).reverse();
  const event = log.length ? `<div class="event" role="status"><div class="ev-title">Latest plays</div><ul class="plays recent">${recent.map((t,i)=>`<li class="${i===0?'now':''}">${fmt(t,s)}</li>`).join('')}</ul>${log.length>3?`<button class="linkish" data-act="log">${showLog?'Hide':'Show'} all ${log.length} plays this hand</button>`:''}${showLog&&log.length>3?`<ol class="plays all" reversed>${log.slice().reverse().map(t=>`<li>${fmt(t,s)}</li>`).join('')}</ol>`:''}</div>` : '';
  const coup = canCoup ? `<div class="coup"><b>Coup fourré!</b><span>${esc(nameOf(opp,s))} hit you with ${META[s.coup.haz].nm}, but you are holding ${META[s.coup.card].nm}. Block it now for a bonus and keep your turn.</span>
    <div class="row"><button class="btn" data-act="coup">Coup fourré! (+400)</button><button class="btn dark" data-act="draw">No thanks, draw</button>${canTake?`<button class="btn dark" data-act="take">No thanks, take the ${META[topCard].nm}</button>`:''}</div></div>` : '';
  const hand = me ? `<div class="hand">${mine.hand.map((c,i)=>{
      const cls=[i===sel?'sel':''];
      if (myTurn && s.drawn) cls.push(whyNot(s,me,c)?'no':'ok');
      return cardHTML(c,cls.join(' '),`data-act="pick" data-i="${i}" aria-pressed="${i===sel}"`);
    }).join('')}</div>` : '';
  let actions='';
  if (myTurn && s.drawn && sel>=0){
    const c=mine.hand[sel], r=whyNot(s,me,c), hz=META[c].k==='haz';
    actions=`<div class="actions"><button class="btn ${hz?'red':'green'}" data-act="play" ${r||busy?'disabled':''}>${hz?'Play on '+esc(nameOf(opp,s)):'Play card'}</button><button class="btn dark" data-act="discard" ${busy||whyNotDiscard(s,me,sel)?'disabled':''}>Throw away</button></div>`;
  }
  return topBar()+stripHTML(s,opp,false)+roadHTML(s,opp,view)+
    `<div class="mid"><button class="deck ${pulse?'pulse':''}" data-act="draw" aria-label="Draw a card, ${s.deck.length} left" ${pulse&&!busy?'':'disabled'}><div class="back"><span>1000</span></div><span class="count">${s.deck.length}</span></button>
    <div class="slot">${top}${canTake?'Tap to take':''}</div>
    <div class="msg"><span class="big">${big}</span>${small?`<span class="small">${small}</span>`:''}</div></div>`+
    event+coup+stripHTML(s,view,true)+hand+actions+
    (s.phase==='over'?resultHTML(s,me):'');
}
function resultHTML(s, me){
  const seat0=me; if (mode==='pass') me=null;
  const col = x => `<div class="col"><h3>${esc(x===me?'You':nameOf(x,s))}</h3><table>${s.result[x].items.map(([l,v])=>`<tr><td>${l}</td><td>${v}</td></tr>`).join('')}<tr class="tot"><td>This hand</td><td>${s.result[x].total}</td></tr><tr><td>Game total</td><td>${s.totals[x]}</td></tr></table></div>`;
  const champ = s.champion ? `${s.champion===me?'You win the game':esc(nameOf(s.champion,s))+' wins the game'}!` : `Hand ${s.handNo} done`;
  const btns = (me||seat0) ? (s.champion
      ? `<button class="btn green" data-act="newgame" ${busy?'disabled':''}>Start a new game</button>`
      : `<button class="btn green" data-act="deal" ${busy?'disabled':''}>Deal next hand</button>`) : '';
  return `<div class="overlay" role="dialog" aria-modal="true" aria-label="Scores"><div class="panel"><h2>${champ}</h2>
    <div style="color:var(--muted)">${mode==='pass' ? esc(s.last||'').replace(/%([AB])/g,(_,x)=>esc(nameOf(x,s))) : fmt(s.last,s)} First to ${GAME_GOAL} points wins.</div>
    <div class="scores">${col('A')}${col('B')}</div>${btns}</div></div>`;
}

function scheduleAI(){
  if (mode!=='local' || !local || local.phase!=='play' || local.turn!=='B' || aiTimer) return;
  aiTimer=setTimeout(()=>{
    aiTimer=null;
    if (mode!=='local' || local.turn!=='B' || local.phase!=='play') return;
    const n=apply(local,'B',aiAction(local,'B'));
    local = n===local ? apply(local,'B',{t:'discard',i:0}) : n;
    render();
  }, local.drawn ? 1500 : 700);
}
