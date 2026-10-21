// Shared, conservative interpretation of stored launch-wind directions.
export const LAUNCH_WIND_DIRECTIONS=['N','NE','E','SE','S','SW','W','NW'];
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


export function siteWindBearings(site,issues=[]){
 const unresolved=issues.some(i=>i.site===site.Startplatz&&i.status==='unresolved'&&/wind|wetterrichtung/i.test(i.field));
 return unresolved?[]:windBearings(site.Startwind);
}

export function matchesLaunchWind(site,direction,issues=[]){
 if(!direction)return true;
 if(!LAUNCH_WIND_DIRECTIONS.includes(direction))return false;
 return siteWindBearings(site,issues).includes(bearings[direction]);
}
