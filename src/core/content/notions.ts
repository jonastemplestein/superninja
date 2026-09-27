import type { Dosage, Key, NotionInfo, NotionKind, NotionRegistry, Provider } from '../types';
import { LINES } from '../../content/lines';
const defaults: Record<NotionKind,Dosage> = {
  idea:{beforeUse:1,full:3,spacing:[{after:'beats',n:2},{after:'sessions',n:1}],minSessions:2,reminders:'short',retireAfter:8,refreshAfterDays:14,maxPerSession:2},
  concept:{beforeUse:1,full:3,spacing:[{after:'sessions',n:1},{after:'sessions',n:1}],minSessions:3,reminders:'short',retireAfter:10,refreshAfterDays:14,maxPerSession:2},
  term:{beforeUse:1,full:2,spacing:[{after:'sessions',n:1}],minSessions:2,reminders:'short',retireAfter:5,refreshAfterDays:14,maxPerSession:2},
  mech:{beforeUse:1,full:2,spacing:[{after:'sessions',n:1}],minSessions:2,reminders:'none',retireAfter:3,refreshAfterDays:21,maxPerSession:1},
  obj:{beforeUse:1,full:2,spacing:[{after:'beats',n:2}],minSessions:1,reminders:'short',retireAfter:3,refreshAfterDays:30,maxPerSession:2},
  char:{beforeUse:1,full:1,spacing:[],minSessions:1,reminders:'none',retireAfter:0,refreshAfterDays:3,maxPerSession:1},
  place:{beforeUse:1,full:1,spacing:[],minSessions:1,reminders:'none',retireAfter:0,refreshAfterDays:3,maxPerSession:1},
  fact:{beforeUse:1,full:1,spacing:[],minSessions:1,reminders:'none',retireAfter:0,refreshAfterDays:2,maxPerSession:1},
};
export const dosageFor = (kind: NotionKind): Dosage => defaults[kind];
const line = (key:Key,id:string,form:'full'|'short'='full'):Provider => ({id:`${key}:${form}:${id}`,key,form,exposition:{kind:'lines',lines:[id]},estMs:1000,needs:[]});
const demo = (key:Key,activity:Provider['exposition'] extends never?never:string,mechanic:string):Provider => ({id:`${key}:demo`,key,form:'full',exposition:{kind:'demo',activity:activity as never,mechanic:mechanic as never},estMs:2000,needs:[]});
/** a provider whose line is recorded (a line still waiting for its audio block isn't a provider yet) */
const recorded = new Set(LINES.map(l=>l.id));
const lineIf = (key:Key,id:string,form:'full'|'short'='full'):Provider[] => recorded.has(id)?[line(key,id,form)]:[];
/** "Two letters, one sound" (SCRIPT_FIXES Part E): its teach moment and the first word with the spelling in each of the
 *  next two sessions; after that, a reminder only on an error that splits a two-letter spelling (< s > for < sh >). */
const twoLettersDosage:Dosage = {beforeUse:1,full:3,spacing:[{after:'sessions',n:1},{after:'sessions',n:1}],minSessions:3,reminders:'error',retireAfter:6,maxPerSession:2};
const entries: NotionInfo[] = [
  {key:'char:sensei',kind:'char',label:'Sensei Maple',dependsOn:[],providers:[line('char:sensei','intro_8')],dosage:defaults.char},
  {key:'char:baron',kind:'char',label:'Baron Muddle',dependsOn:[],providers:[line('char:baron','film_4')],dosage:defaults.char},
  {key:'fact:petals-scattered',kind:'fact',label:'the scattered petals',dependsOn:[],providers:[line('fact:petals-scattered','film_5')],dosage:defaults.fact},
  {key:'obj:world-flower',kind:'obj',label:'World Flower',dependsOn:[],providers:[line('obj:world-flower','film_1')],dosage:defaults.obj},
  {key:'mech:help-button',kind:'mech',label:'Help button',dependsOn:['char:sensei'],providers:[line('mech:help-button','fm_help_short')],dosage:defaults.mech},
  {key:'mech:replay-button',kind:'mech',label:'Hear it again button',dependsOn:[],providers:[line('mech:replay-button','fm_speaker')],dosage:defaults.mech},
  {key:'mech:tap-picture',kind:'mech',label:'tap a picture',dependsOn:[],providers:[line('mech:tap-picture','fm_tap_sock')],dosage:defaults.mech},
  {key:'idea:fast-and-slow-saying',kind:'idea',label:'saying a word fast and slowly',dependsOn:[],providers:[line('idea:fast-and-slow-saying','fm_same_word')],dosage:defaults.idea},
  {key:'idea:words-are-made-of-sounds',kind:'idea',label:'words are made of sounds',dependsOn:['idea:fast-and-slow-saying'],providers:[line('idea:words-are-made-of-sounds','fm_hear_sounds'),line('idea:words-are-made-of-sounds','audit_made_of_sounds','short')],dosage:defaults.idea},
  {key:'idea:first-sound',kind:'idea',label:'the first sound',dependsOn:['idea:words-are-made-of-sounds'],providers:[line('idea:first-sound','fm_notice_sun_sock')],dosage:defaults.idea},
  {key:'idea:left-to-right',kind:'idea',label:'reading from left to right',dependsOn:[],providers:[line('idea:left-to-right','fm_l2_way'),line('idea:left-to-right','audit_left_right')],dosage:defaults.idea},
  {key:'idea:middle-sound',kind:'idea',label:'a sound inside a word',dependsOn:['idea:first-sound'],providers:[line('idea:middle-sound','audit_middle_place')],dosage:defaults.idea},
  {key:'idea:last-sound',kind:'idea',label:'the last sound in a word',dependsOn:['idea:first-sound'],providers:[line('idea:last-sound','audit_last_place')],dosage:defaults.idea},
  {key:'idea:sounds-have-spellings',kind:'idea',label:'sounds have spellings',dependsOn:['idea:first-sound'],providers:[line('idea:sounds-have-spellings','how_we_spell')],dosage:defaults.idea},
  {key:'term:spelling',kind:'term',label:'spelling',dependsOn:['idea:first-sound'],providers:[line('term:spelling','how_we_spell')],dosage:defaults.term},
  {key:'idea:one-line-per-sound',kind:'idea',label:'one line for each sound',dependsOn:['term:spelling'],providers:[],dosage:defaults.idea},
  {key:'mech:tile-to-line',kind:'mech',label:'putting a sound tile on a line',dependsOn:['term:spelling'],providers:[demo('mech:tile-to-line','word-building','tile-to-line')],dosage:defaults.mech},
  {key:'idea:say-the-sounds-read-the-word',kind:'idea',label:'say the sounds and read the word',dependsOn:['idea:words-are-made-of-sounds'],providers:[line('idea:say-the-sounds-read-the-word','say_sounds_read')],dosage:defaults.idea},
  {key:'term:sound-tile',kind:'term',label:'sound tile',dependsOn:['term:spelling'],providers:[],dosage:defaults.term},
  {key:'mech:tap-reader',kind:'mech',label:'choose the reader',dependsOn:['idea:say-the-sounds-read-the-word'],providers:[demo('mech:tap-reader','who-read-it-right','tap-reader')],dosage:defaults.mech},
  {key:'mech:tap-sound-buttons',kind:'mech',label:'sound buttons',dependsOn:['idea:say-the-sounds-read-the-word'],providers:[demo('mech:tap-sound-buttons','word-reading','tap-sound-buttons')],dosage:defaults.mech},
  {key:'idea:change-one-sound',kind:'idea',label:'change one sound',dependsOn:['idea:words-are-made-of-sounds'],providers:[line('idea:change-one-sound','swap_start')],dosage:defaults.idea},
  {key:'term:dojo',kind:'term',label:'dojo',dependsOn:[],providers:[line('term:dojo','dojo_hello')],dosage:defaults.term},
  {key:'obj:sticker-book',kind:'obj',label:'Sticker Book',dependsOn:[],providers:[line('obj:sticker-book','fm_rw_book'),line('obj:sticker-book','fm_rw_more','short')],dosage:defaults.obj},
  {key:'idea:stickers-for-pictures',kind:'idea',label:'stickers for pictures',dependsOn:[],providers:[line('idea:stickers-for-pictures','fm_rw_every')],dosage:defaults.idea},
  {key:'obj:petal',kind:'obj',label:'sound petal',dependsOn:['obj:world-flower'],providers:[line('obj:petal','fm_rw2_petal')],dosage:defaults.obj},
  {key:'obj:gem',kind:'obj',label:'gem',dependsOn:['obj:world-flower'],providers:[line('obj:gem','wf_i3')],dosage:defaults.obj},
  {key:'idea:gems-fill-with-practice',kind:'idea',label:'gems fill with practice',dependsOn:['obj:world-flower'],providers:[line('idea:gems-fill-with-practice','flower_i4'),line('idea:gems-fill-with-practice','wf_practised','short')],dosage:defaults.idea},
  {key:'idea:two-letters-one-sound',kind:'idea',label:'two letters, one sound',dependsOn:['term:spelling'],providers:[line('idea:two-letters-one-sound','t_two_letters'),line('idea:two-letters-one-sound','two_letters_one_sound','short'),...lineIf('idea:two-letters-one-sound','st_two_letters_too','short')],dosage:twoLettersDosage,remindOn:['split-spelling'],notBefore:'IC7'},
  {key:'idea:same-sound-different-spellings',kind:'idea',label:'same sound, different spellings',dependsOn:['idea:two-letters-one-sound'],providers:[line('idea:same-sound-different-spellings','t_same_sound'),line('idea:same-sound-different-spellings','same_sound_diff','short'),...lineIf('idea:same-sound-different-spellings','st_know_this_sound'),line('idea:same-sound-different-spellings','t_another_way')],dosage:defaults.idea,notBefore:'BR'},
];
export const notions: NotionRegistry = Object.fromEntries(entries.map(n=>[n.key,n]));
