import {siteWindBearings} from './launch-wind.js?v=20261021-1';
export {windBearings} from './launch-wind.js?v=20261021-1';
// Presentation derived from the existing canonical data; no geographic facts are added.
export const DIFFICULTY_COLORS={Leicht:'#54b85f',Mittel:'#f5d94c',Schwer:'#f28b34',Unbekannt:'#c3ced0'};
export function markerProperties(point,issues=[]){
 const site=point.site;
 const difficulty=Object.hasOwn(DIFFICULTY_COLORS,site.schwierigkeit_kanonisch)?site.schwierigkeit_kanonisch:'Unbekannt';
 const directions=siteWindBearings(site,issues);
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
