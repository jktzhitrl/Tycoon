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
const routing=section('function networkRoute(','function availableTrains(');
const operations=section('function availableTrains(','const GOALS=[');
function model(){
 return new Function(constants+
 'let S=newGame();let worldTime=390;let notice="";'+
 'function ownedEdge(id){return !!S.tracks[id];}'+
 'function showNotice(msg){notice=msg;}'+
 'function log(msg){S.log.unshift(msg);}'+
 'function persist(){}function render(){}'+
 routing+operations+
 'return {get S(){return S;},get notice(){return notice;},networkRoute,timetableDepartures,timetableTurnaroundMinutes,updateTimetable,performDay};'
 )();
}
test('Standalone app has valid syntax and the correct script',()=>{
 assert.doesNotThrow(()=>new Function(engine));
 assert.match(html,/src="\.\/tycoon-engine\.js\?v=2\.2"/);
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
