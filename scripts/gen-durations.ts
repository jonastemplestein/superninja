import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = join(import.meta.dir, '../public/a');
const out: Record<string, number> = {};
function files(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir,e.name)) : e.name.endsWith('.mp3') ? [join(dir,e.name)] : []); }
/** Sum MPEG Layer III frame durations when ffprobe is unavailable. */
export function mp3Duration(bytes: Uint8Array): number {
  let at=0, ms=0, frames=0;
  if(bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33) at=10+((bytes[6]&0x7f)<<21)+((bytes[7]&0x7f)<<14)+((bytes[8]&0x7f)<<7)+(bytes[9]&0x7f);
  const rates=[0,32000,40000,48000,56000,64000,80000,96000,112000,128000,160000,192000,224000,256000,320000,0];
  const lowRates=[0,8000,16000,24000,32000,40000,48000,56000,64000,80000,96000,112000,128000,144000,160000,0];
  while(at+4<=bytes.length){
    const h=(bytes[at]*0x1000000+bytes[at+1]*0x10000+bytes[at+2]*0x100+bytes[at+3])>>>0;
    const version=(h>>>19)&3,layer=(h>>>17)&3,bitrateIndex=(h>>>12)&15,sampleIndex=(h>>>10)&3;
    if(((h>>>21)&0x7ff)!==0x7ff || version===1 || layer!==1 || !bitrateIndex || bitrateIndex===15 || sampleIndex===3){at++;continue;}
    const sampleRate=([44100,48000,32000][sampleIndex])/(version===3?1:version===2?2:4);
    const bitrate=(version===3?rates:lowRates)[bitrateIndex];
    const samples=version===3?1152:576;
    const size=Math.floor((version===3?144:72)*bitrate/sampleRate)+((h>>>9)&1);
    if(size<=4||at+size>bytes.length){at++;continue;}
    ms+=samples/sampleRate*1000;frames++;at+=size;
  }
  if(!frames) throw new Error('No MPEG Layer III frames found');
  return Math.round(ms);
}
if (import.meta.main) {
for (const group of ['l','w','x','p','s']) for (const file of files(join(root,group))) {
  const result = spawnSync('ffprobe', ['-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',file], { encoding:'utf8' });
  const seconds = result.status === 0 ? Number(result.stdout.trim()) : NaN;
  out[file.slice(root.length + 1, -4)] = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds * 1000) : mp3Duration(readFileSync(file));
}
writeFileSync(join(root,'durations.json'), JSON.stringify(Object.fromEntries(Object.entries(out).sort(([a],[b]) => a.localeCompare(b))),null,2) + '\n');
console.log(`Measured ${Object.keys(out).length} clips`);
}
