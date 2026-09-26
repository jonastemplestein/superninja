/// <reference types="node" />
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const root = join(import.meta.dirname,'..');
function files(dir:string):string[] { return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(join(dir,x.name)):x.name.endsWith('.ts')&&!x.name.endsWith('.test.ts')?[join(dir,x.name)]:[]); }
test('core runtime boundary: no React, DOM, audio, storage or ambient clock and randomness',()=>{
  const forbidden=[/\bfrom\s*['"][^'"]*(?:react|\/engine\/|\/scenes\/|\/ui\/|\/content\/(?:teach|worlds)(?=[\'"])|node:fs)[^'"]*['"]/,/\b(?:window|document|localStorage|sessionStorage|navigator|AudioContext|Audio|fetch)\s*[.(]/,/\bDate\.now\s*\(/,/\bMath\.random\s*\(/];
  for(const path of files(join(root,'core'))) {
    if(path.endsWith('types.ts')||path.endsWith('line-tags.draft.ts')) continue;
    const source=readFileSync(path,'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');
    for(const rule of forbidden) assert.equal(rule.test(source),false,`${path}: ${rule}`);
  }
});
