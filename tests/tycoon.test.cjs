'use strict';
/** Tycoon regression tests; run with: node --test tests/tycoon.test.cjs */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const engine=fs.readFileSync(path.join(__dirname,'..','tycoon-engine.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function section(start,end){
 const from=engine.indexOf(start),to=engine.indexOf(end,from+start.length);
 assert.ok(from>=0&&to>from,'Source section missing: '+start);
 return engine.slice(from,to);
}
const constants=section('const CITIES=[','function migrate(');
const migrations=section('function migrate(','let S=loadGame()');
const routing=section('function networkRoute(','function availableTrains(');
const operations=section('function availableTrains(','const GOALS=[');
function model(rand=0){
 return new Function('rand',constants+migrations+
 'const Math=Object.create(globalThis.Math);Math.random=()=>rand;let S=newGame();let worldTime=390;let selected={type:"track",id:"nt"};let notice="";'+
 'function ownedEdge(id){return !!S.tracks[id];}function linked(e){return !!(S.stations[e.a]||S.stations[e.b]);}function costEdge(e){return e.km*2450+18000;}function spend(n){if(S.money<n)return false;S.money-=n;return true;}'+
 'function showNotice(msg){notice=msg;}'+
 'function log(msg){S.log.unshift(msg);}'+
 'function persist(){}function render(){}'+
 routing+operations+
 'return {get S(){return S;},get notice(){return notice;},networkRoute,timetableDepartures,timetableTurnaroundMinutes,updateTimetable,performDay,regionWon,regionReserve,regionBidChance,bidForRegion,resolveRegionBids,buildTrack,normalizeRegions};'
 )(rand);
}
test('Standalone app has valid syntax and the correct script',()=>{
 assert.doesNotThrow(()=>new Function(engine));
 assert.match(html,/src="\.\/tycoon-engine\.js\?v=2\.3"/);
 assert.match(html,/https:\/\/jktzhitrl\.github\.io\/stellwerk\.sim\//);
});
test('Original stations and Tycoon game data are retained',()=>{
 const m=model();
 assert.equal(m.S.version,2);
 assert.equal(m.S.fleet.length,2);
 assert.equal(m.S.lines.length,1);
 assert.equal(m.networkRoute('neustadt','teutschenthal').km,32);
 assert.equal(m.networkRoute('neustadt','burgstadt'),null);
});
test('Old saves and lines without timetable fields retain their previous departure times',()=>{
 const m=model();
 assert.deepEqual(m.timetableDepartures(m.S.lines[0]),[360,660,960]);
});
test('Player may save a concrete departure time and frequency',()=>{
 const m=model();
 assert.equal(m.updateTimetable(1,'06:30','120'),true);
 assert.deepEqual(m.timetableDepartures(m.S.lines[0]),[390,510,630]);
 assert.equal(m.S.lines[0].startMin,390);
 assert.equal(m.S.lines[0].headwayMin,120);
});
test('Tycoon rejects invalid times, short turnarounds, and departures beyond 22:00',()=>{
 const m=model();
 for(const [start,headway] of [['04:00','120'],['06:30','30'],['21:00','120'],['garbage','120'],['06:30','2.5']]){
  assert.equal(m.updateTimetable(1,start,headway),false,'Invalid time accepted: '+start+' '+headway);
 }
 assert.equal(m.S.lines[0].startMin,undefined);
 assert.equal(m.S.lines[0].headwayMin,undefined);
});
test('Business simulation advances a day and keeps finances finite',()=>{
 const m=model();
 m.performDay();
 assert.equal(m.S.day,2);
 assert.equal(m.S.finance.length,1);
 assert.ok(Number.isFinite(m.S.money));
 assert.ok(m.S.finance[0].revenue>0);
});
test('Impossible overlapping trips are counted as canceled',()=>{
 const m=model();
 m.S.lines[0].startMin=390;
 m.S.lines[0].headwayMin=30;
 m.performDay();
 assert.equal(m.S.finance[0].cancelled,2);
});
test('Timetable editor and animation share the planned departures',()=>{
 assert.match(engine,/class="lineSchedule formgrid"/);
 assert.match(engine,/timetableDepartures\(l\)\.map\(fmtTime\)/);
 assert.match(engine,/const depart=departures\[k\]/);
 assert.match(engine,/updateTimetable\(Number\(ev\.target\.dataset\.line\)/);
});


test('Region tiles initially unlock only the starter network',()=>{
 const m=model();
 assert.deepEqual([...m.S.regionWins].sort(),['neustadt','teutschenthal']);
 assert.equal(m.regionWon('waldheim'),false);
 assert.equal(m.S.regionBids.length,0);
 assert.match(engine,/const REGION_TILES=\[/);
 assert.match(engine,/GESPERRT/);
 assert.match(html,/data-view="tenders"/);
});

test('Track construction is blocked until both regions have been won',()=>{
 const m=model();
 const money=m.S.money;
 m.buildTrack('nw');
 assert.equal(m.S.tracks.nw,undefined);
 assert.equal(m.S.stations.waldheim,undefined);
 assert.equal(m.S.money,money);
 assert.match(m.notice,/Baurecht fehlt/);
});

test('Winning a regional tender unlocks the tile and enables construction',()=>{
 const m=model(0);
 const reserve=m.regionReserve('waldheim');
 const starting=m.S.money;
 assert.equal(m.bidForRegion('waldheim',reserve),true);
 assert.equal(m.S.money,starting-900);
 assert.equal(m.S.regionBids.length,1);
 assert.equal(m.regionWon('waldheim'),false);
 assert.equal(m.bidForRegion('waldheim',reserve),false);
 m.performDay();
 assert.equal(m.S.regionBids.length,0);
 assert.equal(m.regionWon('waldheim'),true);
 assert.equal(m.S.regionWins.filter(x=>x==='waldheim').length,1);
 m.buildTrack('nw');
 assert.ok(m.S.tracks.nw);
 assert.ok(m.S.stations.waldheim);
 assert.ok(m.networkRoute('neustadt','waldheim'));
});

test('Losing a regional tender keeps the tile locked and permits another bid',()=>{
 const m=model(.999);
 const reserve=m.regionReserve('waldheim');
 assert.equal(m.bidForRegion('waldheim',reserve),true);
 m.performDay();
 assert.equal(m.regionWon('waldheim'),false);
 assert.equal(m.S.regionBids.length,0);
 assert.equal(m.bidForRegion('waldheim',reserve),true);
});

test('Tender validation blocks invalid cities, bids and insufficient money',()=>{
 const m=model();
 assert.equal(m.bidForRegion('not-a-city',15000),false);
 assert.equal(m.bidForRegion('neustadt',15000),false);
 assert.equal(m.bidForRegion('hafenau',1000),false);
 m.S.money=500;
 assert.equal(m.bidForRegion('hafenau',m.regionReserve('hafenau')),false);
 assert.equal(m.S.regionBids.length,0);
 assert.equal(m.S.money,500);
});

test('Existing built stations and tracks remain unlocked during migration',()=>{
 const m=model();
 const legacy=m.S;
 delete legacy.regionWins;delete legacy.regionBids;
 legacy.stations.burgstadt={level:2};
 legacy.tracks.tb={double:false,electric:false,signals:0,condition:100};
 const migrated=m.normalizeRegions(legacy);
 assert.ok(migrated.regionWins.includes('burgstadt'));
 assert.ok(migrated.regionWins.includes('teutschenthal'));
 assert.equal(migrated.regionWins.length,3);
 assert.deepEqual(migrated.regionBids,[]);
});

test('Newly won regions remain awarded in normalized saved games',()=>{
 const m=model();
 m.S.regionWins.push('waldheim');
 const saved=JSON.parse(JSON.stringify(m.S));
 assert.ok(m.normalizeRegions(saved).regionWins.includes('waldheim'));
 assert.match(engine,/tenders:tendersPanel/);
 assert.match(engine,/regionBid/);
 assert.match(engine,/if\(!regionWon\(e\.a\)\|\|!regionWon\(e\.b\)\)/);
});


test('SVG map paints every region and switches its visual state after winning',()=>{
 const painting=section('function drawWorld(){','function coordsOnRoute(');
 const paint=new Function(constants+
 'let S=newGame();const selected={type:"track",id:"nt"};const viewBox={x:0,y:0,w:1180,h:680};'+
 'const elements={worldStatic:{innerHTML:""},world:{setAttribute(){}},worldTrains:{innerHTML:""}};'+
 'function $(id){return elements[id];}function linked(e){return !!(S.stations[e.a]||S.stations[e.b]);}'+
 'function ownedEdge(id){return !!S.tracks[id];}function regionWon(id){return S.regionWins.includes(id);}'+
 'function drawMovingTrains(){}'+painting+
 'drawWorld();const locked=elements.worldStatic.innerHTML;'+
 'S.regionWins.push("waldheim");S.regionBids.push({id:"altheim",offer:16000,submitted:1});'+
 'drawWorld();return {locked,updated:elements.worldStatic.innerHTML};'
 )();
 const group=(markup,id)=>markup.match(new RegExp('<g data-inspect="city" data-id="'+id+'" class="regionTile"[\\s\\S]*?<\\/g>'))?.[0]||'';
 assert.equal((paint.locked.match(/class="regionTile"/g)||[]).length,10);
 assert.match(group(paint.locked,'waldheim'),/GESPERRT/);
 assert.match(group(paint.updated,'waldheim'),/FREIGESCHALTET/);
 assert.match(group(paint.updated,'altheim'),/BEWORBEN/);
 assert.match(group(paint.updated,'neustadt'),/FREIGESCHALTET/);
});
