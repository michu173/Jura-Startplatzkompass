// Presentation derived from the existing canonical data; no geographic facts are added.
export const DIFFICULTY_COLORS={Leicht:'#54b85f',Mittel:'#f5d94c',Schwer:'#f28b34',Unbekannt:'#c3ced0'};
const bearings={N:0,NE:45,E:90,SE:135,S:180,SW:225,W:270,NW:315,NO:45,O:90,SO:135};

export function windBearings(value){
 // Only the leading direction list is authoritative here. Parenthetical conditions
 // can contain excluded winds (e.g. "N (... NW nicht ...)") and must not become fans.
 const head=String(value??'').split(/[;(]/,1)[0].trim().toUpperCase().replace(/\s+/g,'');
 if(!head)return [];
 const result=new Set();
 for(const part of head.split(/[,/]/)){
  const range=part.split(/[–—-]/);
  if(range.length>2||range.some(d=>!Object.hasOwn(bearings,d)))return [];
  const start=bearings[range[0]],end=bearings[range.at(-1)];
  const span=(end-start+360)%360;
  // Do not guess the intended path for a long/ambiguous compass range.
  if(span>=180)return [];
  for(let offset=0;offset<=span;offset+=45)result.add((start+offset)%360);
 }
 return [...result].sort((a,b)=>a-b);
}

export function markerProperties(point,issues=[]){
 const site=point.site;
 const difficulty=Object.hasOwn(DIFFICULTY_COLORS,site.schwierigkeit_kanonisch)?site.schwierigkeit_kanonisch:'Unbekannt';
 const unresolved=issues.some(i=>i.site===site.Startplatz&&i.status==='unresolved'&&/wind|wetterrichtung/i.test(i.field));
 const directions=unresolved?[]:windBearings(site.Startwind);
 return {difficulty,windKnown:directions.length>0,windIcon:directions.length?`wind-${directions.join('-')}`:'',directions};
}

export function windImage(directions){
 // 2× RGBA sprite: north is up and the fan points toward where wind comes FROM.
 // Each named compass direction is shown schematically as a 45° sector.
 const width=160,height=160,data=new Uint8Array(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const dx=(x+.5-width/2)/2,dy=(y+.5-height/2)/2,r=Math.hypot(dx,dy);
  if(r<11||r>35)continue;
  const angle=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
  const delta=Math.min(...directions.map(d=>Math.abs((angle-d+540)%360-180)));
  if(delta>22.5)continue;
  const p=(y*width+x)*4;
  const divider=delta>21.8;
  data[p]=divider?255:245;data[p+1]=divider?207:138;data[p+2]=divider?159:50;
  data[p+3]=Math.round(210*Math.min(1,(35-r)*2,(r-11)*2,(22.5-delta)*2));
 }
 return {width,height,data};
}
