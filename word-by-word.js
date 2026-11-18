// READIQ_WORD_BY_WORD_V1
(()=>{
'use strict';
const anchor=document.querySelector('.library-anchor'),reader=document.querySelector('main .reader');
// READIQ_WORD_NAV_V1
if(!anchor||!reader||document.getElementById('readiq-wbw'))return;
const root=document.createElement('section');root.id='readiq-wbw';root.hidden=true;
root.innerHTML=`<div class="wb-bar"><div><span class="wb-eyebrow">IRFAN-UL-QURAN · WORD BY WORD</span><h2>A word. A meaning. A little more understanding.</h2></div><button id="wb-exit">← Back to reading</button></div>
<div class="wb-settings"><label>Read by<select id="wb-scope"><option value="quarter">Quarter</option><option value="para">Complete Para</option><option value="surah">Surah</option></select></label><label id="wb-para-field">Para<select id="wb-para"></select></label><label id="wb-quarter-field">Quarter<select id="wb-quarter"><option value="1">First Quarter</option><option value="2">Second Quarter</option><option value="3">Third Quarter</option><option value="4">Fourth Quarter</option></select></label><label id="wb-surah-field" hidden>Surah<select id="wb-surah"></select></label><button id="wb-load" class="wb-primary">Open selection →</button></div>
<div class="wb-full-options"><fieldset><legend>Complete Ayat above the words</legend><label><input id="wb-full-ar" type="checkbox" checked> Arabic</label><label><input id="wb-full-ur" type="checkbox"> Urdu</label><label><input id="wb-full-en" type="checkbox"> English</label></fieldset><small>Choose any combination, or uncheck all to hide the complete Ayat.</small></div><div class="wb-tools"><fieldset><legend>Word meanings</legend><label><input type="checkbox" id="wb-urdu" checked> Urdu</label><label><input type="checkbox" id="wb-english" checked> English</label></fieldset><div class="wb-font"><span>Reading size</span><button id="wb-smaller" aria-label="Smaller text">−</button><input id="wb-font" type="range" min="22" max="48" value="31" aria-label="Word reading size"><button id="wb-larger" aria-label="Larger text">+</button><span id="wb-font-value">31px</span><button id="wb-font-reset">Reset</button></div></div>
<div id="wb-status" role="status" aria-live="polite"></div><div class="wb-reading-heading"><h3 id="wb-title">Choose a section to begin</h3><button id="wb-practice" class="wb-primary" disabled>☷ Word MCQs & Flashcards →</button></div><p class="wb-note">Read from right to left. Each word has its Urdu and English meaning underneath.</p><div id="wb-verses"></div>
<dialog id="wb-message" aria-labelledby="wb-message-title"><button id="wb-message-close" class="wb-close" aria-label="Close message">×</button><span class="wb-mark" aria-hidden="true">✦</span><h2 id="wb-message-title">Word-by-Word content coming soon</h2><p id="wb-message-text"></p><button id="wb-message-ok" class="wb-primary">Close</button></dialog>`;
reader.before(root);
const $=id=>root.querySelector('#'+id),cache=new Map();let index=null,active=null,request=0,size=31,opener=null;
const names=window.ReadIQWordBridge?.names()||[];
for(let p=1;p<=30;p++){const o=document.createElement('option');o.value=p;o.textContent='Para '+String(p).padStart(2,'0');$('wb-para').append(o)}
for(let s=1;s<=114;s++){const o=document.createElement('option');o.value=s;o.textContent=s+' · '+(names[s-1]||'Surah '+s);$('wb-surah').append(o)}
function notice(title,text){$('wb-message-title').textContent=title;$('wb-message-text').textContent=text;opener=document.activeElement;if(!$('wb-message').open)$('wb-message').showModal()}
function closeNotice(){$('wb-message').close();opener?.focus()}
$('wb-message-close').onclick=closeNotice;$('wb-message-ok').onclick=closeNotice;
$('wb-message').addEventListener('close',()=>opener?.focus());
function setBusy(b){$('wb-load').disabled=b;$('wb-load').textContent=b?'Opening…':'Open selection →';$('wb-practice').disabled=b||!active?.rows.length}
function hide(){++request;root.hidden=true;if($('wb-message').open)$('wb-message').close();reader.hidden=false;document.documentElement.classList.remove('readiq-wbw-open');setBusy(false)}
// READIQ_PRACTICE_MENU_V1
// READIQ_READING_PRACTICE_V1
window.ReadIQWordByWord={hide,openPractice,coverage};
queueMicrotask(() => window.dispatchEvent(new Event('readiq-word-ready')));
async function openPractice(choice){
 if (choice || root.hidden) await openWords(false, choice);
 if(!root.hidden && active && !$('wb-practice').disabled) $('wb-practice').click();
}
function reveal(){window.ReadIQPractice?.hide();root.hidden=false;reader.hidden=true;document.documentElement.classList.add('readiq-wbw-open');document.querySelectorAll('.file-menu').forEach(m=>m.hidden=true);document.querySelectorAll('[aria-controls$="Menu"]').forEach(b=>b.setAttribute('aria-expanded','false'))}
function controls(){const scope=$('wb-scope').value;$('wb-para-field').hidden=scope==='surah';$('wb-quarter-field').hidden=scope!=='quarter';$('wb-surah-field').hidden=scope!=='surah';++request;active=null;$('wb-practice').disabled=true;$('wb-verses').replaceChildren();$('wb-title').textContent='Open your selected section';$('wb-status').textContent='';setBusy(false)}
for(const id of ['wb-scope','wb-para','wb-quarter','wb-surah'])$(id).onchange=controls;
async function json(url){const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error('Content could not be loaded. Please try again.');return response.json()}
async function words(sheet){if(!sheet.url)return[];if(!cache.has(sheet.url)){const data=await json(sheet.url);if(!Array.isArray(data.words))throw Error('Invalid word content.');cache.set(sheet.url,data.words)}return cache.get(sheet.url)}
function selection(){return{mode:$('wb-scope').value,para:Number($('wb-para').value),quarter:Number($('wb-quarter').value),surah:Number($('wb-surah').value)}}
let manifestRequest;
function manifest(){
 if (!manifestRequest) {
  manifestRequest = json('word-by-word/index.json').catch(error => {
   manifestRequest = null;
   throw error;
  });
 }
 return manifestRequest;
}
function describeSelection(data, choice){
 if (choice.mode === 'surah') {
  const surah = data.surahs.find(item => item.number === choice.surah);
  if (!surah) throw Error('Surah index unavailable.');
  return {
   sheets: data.sheets.filter(sheet => surah.sheets.includes(sheet.name)),
   title: 'Surah ' + choice.surah + ' · ' + (names[choice.surah-1] || ''),
   expected: surah.expectedVerses,
   covered: surah.verseCount
  };
 }
 const sheets = data.sheets.filter(sheet => sheet.para === choice.para &&
  (choice.mode === 'para' || sheet.quarter === choice.quarter));
 const section = choice.mode === 'para' ? 'All four quarters' :
  ['First','Second','Third','Fourth'][choice.quarter-1] + ' Quarter';
 return {
  sheets,
  title: 'Para ' + String(choice.para).padStart(2,'0') + ' · ' + section,
  expected: sheets.reduce((sum, sheet) => sum + sheet.expectedVerses, 0),
  covered: sheets.reduce((sum, sheet) => sum + sheet.verseCount, 0)
 };
}
async function coverage(choice){
 const {covered, expected} = describeSelection(await manifest(), choice);
 return {covered, expected};
}
async function load(showPartial = true){
 const ticket=++request,choice=selection();active=null;setBusy(true);$('wb-status').textContent='Opening word meanings…';$('wb-verses').replaceChildren();
 try{
  const fresh = await manifest();
  if (ticket !== request) return;
  index = fresh;
  const {sheets, title, expected, covered} = describeSelection(index, choice);
  let rows=(await Promise.all(sheets.map(words))).flat();if(choice.mode==='surah')rows=rows.filter(w=>w.surah===choice.surah).sort((a,b)=>a.ayah-b.ayah||a.serial-b.serial);
  if(ticket!==request)return;
  if(!rows.length){$('wb-title').textContent=title;$('wb-status').textContent='Word-by-Word content is not available for this selection yet.';notice('Word-by-Word content coming soon','Word-by-Word content for this section is in preparation. You can open another section to read the available content.');return}
  const pending=sheets.filter(s=>!s.count).map(s=>s.name),partial=covered<expected||pending.length>0;
  active={rows,title,choice,revision:index.revision,partial,covered,expected};$('wb-title').textContent=title;
  $('wb-status').textContent=rows.length+' words · '+covered+'/'+expected+' ayat have word entries'+(partial?' · Available content only; this selection is still being prepared.':' · Word entries available for every ayat in this selection.');
  render();
  if(partial && showPartial !== false)notice('More words are on the way.','Insha Allah, the remaining content will be available soon. You can read and practise the '+rows.length+' words already prepared for this selection.');
 }catch(e){if(ticket===request){$('wb-status').textContent=e.message;notice('Could not open this section.',e.message+' Your existing reading content is unchanged.')}}
 finally{if(ticket===request)setBusy(false)}
}
function text(tag,value,cls,lang,dir){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;if(lang)e.lang=lang;if(dir)e.dir=dir;return e}
function render(){if(!active)return;const container=$('wb-verses');container.replaceChildren();const groups=new Map();for(const w of active.rows){if(!groups.has(w.code))groups.set(w.code,[]);groups.get(w.code).push(w)}
 // READIQ_BISMILLAH_SELECTIONS_V1
 const opening = window.ReadIQBismillah;
 let firstAyah = true;
 for(const [code,rows] of groups){
  if(opening.applies(code,firstAyah))container.append(opening.block());
  firstAyah = false;
 const section=document.createElement('section');section.className='wb-ayah';section.append(text('p',code,'wb-code','en','ltr'));if($('wb-full-ar').checked)section.append(text('p',rows[0].fullAr,'wb-ar wb-full','ar','rtl'));if($('wb-full-ur').checked)section.append(text('p',rows[0].fullUr,'wb-full-ur','ur','rtl'));if($('wb-full-en').checked)section.append(text('p',rows[0].fullEn,'wb-full-en','en','ltr'));const grid=document.createElement('div');grid.className='wb-word-grid';grid.dir='rtl';
  for(const w of rows){const tile=document.createElement('article');tile.className='wb-word';tile.append(text('p',w.ar,'wb-ar','ar','rtl'));if($('wb-urdu').checked)tile.append(text('p',w.ur,'wb-ur','ur','rtl'));if($('wb-english').checked)tile.append(text('p',w.en,'wb-en','en','ltr'));grid.append(tile)}section.append(grid);container.append(section)}
}
for(const id of ['wb-urdu','wb-english','wb-full-ar','wb-full-ur','wb-full-en'])$(id).onchange=render;
function font(n){size=Math.max(22,Math.min(48,n));root.style.setProperty('--wb-size',size+'px');$('wb-font').value=size;$('wb-font-value').textContent=size+'px'}
$('wb-smaller').onclick=()=>font(size-2);$('wb-larger').onclick=()=>font(size+2);$('wb-font-reset').onclick=()=>font(31);$('wb-font').oninput=()=>font(Number($('wb-font').value));
$('wb-exit').onclick=()=>{hide();document.querySelector('.iq-reading-practice button:last-child:not(:disabled)')?.focus()};$('wb-load').onclick=load;
async function openWords(showPartial = true, selection = window.ReadIQWordBridge?.selection()){if(selection){$('wb-scope').value=selection.mode;$('wb-para').value=selection.para||1;$('wb-quarter').value=selection.quarter||1;$('wb-surah').value=selection.surah||1}controls();reveal();root.scrollIntoView({block:'start',behavior:'smooth'});await load(showPartial)}
$('wb-practice').onclick=()=>{if(!active)return;const current=active,langs=['ur','en'].filter(l=>$(l==='ur'?'wb-urdu':'wb-english').checked);if(!langs.length){notice('Choose an answer language.','Select Urdu, English or both, then open Word MCQs & Flashcards.');return}
 const context={title:'Word by Word · '+current.title+(current.partial ? ' · ' + current.covered + ' of ' + current.expected + ' verses available' : ''),mode:'word',rows:current.rows,languages:langs,revision:current.revision,sourceId:JSON.stringify(current.choice),onExit(){reveal();root.scrollIntoView({block:'start'})},async extraPool(){const all=(await Promise.all(index.sheets.filter(s=>s.count).map(words))).flat();return all}};
 try{if(!window.ReadIQPractice?.openContext)throw Error('Please refresh this page to load the practice update.');hide();window.ReadIQPractice.openContext(context)}catch(e){reveal();notice('Practice could not open.',e.message)}
};
})();
