// READIQ_PRACTICE_MODULE_V1
(()=>{
'use strict';
const markup="<div id=\"iq-practice-live\" hidden>\n<header class=\"ip-brandbar\"><div class=\"ip-brand\">IRFAN-UL-QURAN<small>DeTLeng Read IQ · PRACTICE EACH AYAT</small></div><button id=\"ip-exit\" type=\"button\">← Back to reading</button></header>\n<main class=\"ip-shell\">\n<section id=\"ip-groups\" hidden><span class=\"ip-eyebrow\">Choose your next step</span><h2>One group. A little more understanding.</h2><p class=\"ip-sub\">Practice your selected reading section. Progress stays in this page only.</p><div class=\"ip-group-panel\"><div class=\"ip-form-grid\"><div><span>Reading selection</span><output id=\"ip-scope-label\" class=\"ip-source-label\"></output></div><label>Questions per group<select id=\"ip-size\"><option>10</option><option>15</option><option>20</option><option>25</option><option>30</option></select></label><label>Start question<input id=\"ip-start-range\" type=\"number\" min=\"1\" value=\"1\"></label><label>End question<input id=\"ip-end-range\" type=\"number\" min=\"1\" value=\"1\"></label></div><fieldset class=\"ip-language\"><legend>Answer translations</legend><label><input id=\"ip-urdu\" type=\"checkbox\" checked>Urdu</label><label><input id=\"ip-english\" type=\"checkbox\" checked>English</label></fieldset><p class=\"ip-message\" id=\"ip-validation\" role=\"status\"></p><div id=\"ip-group-buttons\" class=\"ip-group-grid\"></div><p class=\"ip-info\">Green: 100% correct · Red: needs practice · Blue: in progress · Blank: unattempted</p><label><input id=\"ip-order\" type=\"checkbox\"> Shuffle question order</label><button class=\"ip-primary ip-start\" id=\"ip-generate\" style=\"margin-top:18px\">Start selected group →</button></div></section>\n<section id=\"ip-play\"><div class=\"ip-bar\"><button id=\"ip-back\">← Back to Question Groups</button><button id=\"ip-restart\">↻ Restart attempt</button></div><div class=\"ip-bar\"><div><span class=\"ip-eyebrow\">Practice, flip, remember</span><h2 id=\"ip-title\">Para 01 · First Quarter</h2></div><span id=\"ip-position\" class=\"ip-number-badge\"></span></div><div class=\"ip-tabs\"><button id=\"ip-mcq\" class=\"ip-mode\" aria-pressed=\"true\">☷ MCQ · 3 options</button><button id=\"ip-flash\" class=\"ip-mode\" aria-pressed=\"false\">▣ Classic Flashcards · Q & A</button></div><div class=\"ip-learning\" id=\"ip-mode-row\"><button id=\"ip-learn\" aria-pressed=\"true\"><strong>Learning Mode</strong><small>Instant feedback · First answer locks</small></button><button id=\"ip-test\" aria-pressed=\"false\"><strong>Test Mode</strong><small>Change answers · Results at the end</small></button></div><div class=\"ip-minirow\"><span class=\"ip-info\" id=\"ip-state\"></span><button id=\"ip-finish\">Finish Test</button></div><div class=\"ip-controls\"><span>Reading size</span><button id=\"ip-smaller\" aria-label=\"Smaller text\">−</button><input id=\"ip-fontsize\" type=\"range\" min=\"22\" max=\"40\" value=\"28\" aria-label=\"Reading font size\"><button id=\"ip-larger\" aria-label=\"Larger text\">+</button><span id=\"ip-fontvalue\">28px</span><button id=\"ip-reset-font\">Reset</button></div><section class=\"ip-question\" id=\"ip-card\"><div class=\"ip-q-meta\"><span id=\"ip-side\">Question side</span><span id=\"ip-qnumber\"></span></div><button id=\"ip-verse\" class=\"ip-verse\" aria-label=\"Flip this verse to its answer\"><span id=\"ip-arabic\" class=\"ip-ar\" lang=\"ar\" dir=\"rtl\" style=\"display:block\"></span></button><p id=\"ip-code\" class=\"ip-code\"></p><div id=\"ip-answer-area\"></div><p id=\"ip-feedback\" class=\"ip-feedback\" aria-live=\"polite\"></p></section><p id=\"ip-hint\" class=\"ip-hint\"></p><div class=\"ip-nav\"><button id=\"ip-prev\">← Previous</button><button id=\"ip-flip\">↻ Flip card</button><button id=\"ip-next\" class=\"ip-primary\">Next →</button></div><div class=\"ip-shuffle\"><button id=\"ip-shuffle-options\">⇄ Shuffle options</button><button id=\"ip-shuffle-questions\">⤨ Shuffle questions</button></div><div class=\"ip-navigation\"><h3>Question navigation</h3><p class=\"ip-info\">Choose a number to revisit a question.</p><div id=\"ip-numbers\" class=\"ip-question-numbers\"></div><p class=\"ip-info\" id=\"ip-legend\"></p></div></section>\n</main>\n<p class=\"ip-font\">Al_Mushaf · Session-only practice · No scores stored</p>\n<dialog id=\"ip-result\"><button class=\"ip-close\" id=\"ip-close-result\" aria-label=\"Close results\">×</button><div style=\"clear:both\"></div><span style=\"font-size:32px;color:var(--ip-accent)\" aria-hidden=\"true\">✦</span><p class=\"ip-eyebrow\">Your practice, your progress</p><h2 class=\"ip-result-title\" id=\"ip-result-title\"></h2><div id=\"ip-score\" class=\"ip-result-score\"></div><strong id=\"ip-percent\"></strong><p id=\"ip-counts\" class=\"ip-result-message\"></p><p id=\"ip-motivation\" class=\"ip-result-message\"></p><div class=\"ip-result-actions\"><button id=\"ip-review\">Review Answers</button><button id=\"ip-again\" class=\"ip-primary\">Try Again →</button><button id=\"ip-result-back\">← Back to Question Groups</button></div></dialog>\n<dialog id=\"ip-confirm\"><h2 id=\"ip-confirm-title\" class=\"ip-result-title\">Restart this attempt?</h2><p id=\"ip-confirm-text\" class=\"ip-result-message\"></p><div class=\"ip-result-actions\"><button id=\"ip-confirm-yes\" class=\"ip-primary\">Restart attempt</button><button id=\"ip-confirm-no\">Cancel</button></div></dialog>\n</div>\n";
const bridge=window.ReadIQPracticeBridge;
if(!bridge)return;
const anchor=document.querySelector('.library-anchor'),reader=document.querySelector('main .reader');
if(!anchor||!reader||document.getElementById('iqPracticeLaunch'))return;
const button=document.createElement('button');button.type='button';button.id='iqPracticeLaunch';button.className='file-toggle';button.textContent='☷ Practice';button.title='MCQs and Flashcards for the opened Quarter, Para or Surah';anchor.append(button);
let root=null,mounted=null,identity=null;
function hide(){if(root)root.hidden=true;if(mounted)mounted.destroy();reader.hidden=false;document.documentElement.classList.remove('readiq-practice-open');button.setAttribute('aria-expanded','false')}
window.ReadIQPractice={hide,openContext};button.setAttribute('aria-expanded','false');
function availability(){try{const snap=bridge.snapshot();button.disabled=!snap.rows.length;button.title='Practice '+snap.title}catch{button.disabled=true;button.title='Open a Quarter, Para or Surah to practise'}}
function openContext(context){
 window.ReadIQWordByWord?.hide();
 const id=JSON.stringify([context.revision,context.mode,context.sourceId,context.languages,context.rows.map(v=>v.id||v.code)]);
 if(!root||id!==identity){if(mounted)mounted.destroy();if(root)root.remove();const temp=document.createElement('div');temp.innerHTML=markup;root=temp.firstElementChild;reader.before(root);mounted=mountPractice(root,context);identity=id;}
 root.hidden=false;reader.hidden=true;document.documentElement.classList.add('readiq-practice-open');button.setAttribute('aria-expanded','true');
 document.querySelectorAll('.file-menu').forEach(m=>m.hidden=true);document.querySelectorAll('[aria-controls$="Menu"]').forEach(b=>b.setAttribute('aria-expanded','false'));
 root.scrollIntoView({block:'start',behavior:'smooth'});
}
button.onclick=()=>{try{openContext(bridge.snapshot())}catch(e){window.alert(e.message)}};
new MutationObserver(availability).observe(document.getElementById('content'),{childList:true,subtree:true});availability();

function mountPractice(root,context){
const $=id=>root.querySelector('#'+id),data=context.rows;let available=[...data];
const rowId=v=>v.id||v.code;
if(context.mode==='word'){
 root.classList.add('ip-word-mode');
 const picks=document.createElement('fieldset');picks.className='ip-full-options';
 const legend=document.createElement('legend');legend.textContent='Complete Ayat above the word';picks.append(legend);
 for(const [key,name] of [['ar','Arabic'],['ur','Urdu'],['en','English']]){const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.id='ip-full-'+key;check.checked=key==='ar';label.append(check,' '+name);picks.append(label);check.onchange=()=>{render()}}
 $('ip-card').insertBefore(picks,$('ip-verse'));
 const box=document.createElement('div');box.id='ip-full-context';box.className='ip-word-context';
 const label=document.createElement('small');label.textContent='Complete Ayat · Word in context';
 const ar=document.createElement('p');ar.id='ip-word-context-ar';ar.className='ip-word-context-ar';ar.lang='ar';ar.dir='rtl';box.append(label,ar);for(const [key,lang,dir] of [['ur','ur','rtl'],['en','en','ltr']]){const p=document.createElement('p');p.id='ip-word-context-'+key;p.className='ip-full-'+key;p.lang=lang;p.dir=dir;box.append(p)}
 $('ip-card').insertBefore(box,$('ip-verse'));
 $('ip-verse').setAttribute('aria-label','Flip this word to its meaning');
} 

// READIQ_BISMILLAH_SELECTIONS_V1
const opening = window.ReadIQBismillah;
const groupOpening = document.createElement('div');
const questionOpening = document.createElement('div');
const sectionOpening = document.createElement('div');
$('ip-groups').prepend(sectionOpening);
$('ip-play').prepend(groupOpening);
$('ip-card').before(questionOpening);
if(opening.applies(data[0]?.code,true))sectionOpening.append(opening.block());

$('ip-scope-label').textContent=context.title;
const sessions=new Map();let scope='current',size=10,start=1,end=data.length,langs=context.languages.length?[...context.languages]:['ur','en'],kind='mcq',mode='learn',selectedGroup='all',attempt=null,index=0,flipped=false,pendingAction=null,fontSize=28;
const titles={current:context.title};
const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function pool(){return data}
function groups(){const max=pool().length,lo=Math.max(1,Math.min(max,start)),hi=Math.max(lo,Math.min(max,end)),arr=[{id:'all',from:lo,to:hi}];for(let n=lo,g=1;n<=hi;n+=size,g++)arr.push({id:String(g),from:n,to:Math.min(hi,n+size-1)});return arr}
function key(group=selectedGroup){return [scope,size,start,end,langs.join(','),kind,mode,group].join('|')}
function makeOptions(v){const signature=x=>langs.map(l=>x[l].normalize('NFC').replace(/\s+/g,' ').trim()).join('\u0001');const seen=new Set([signature(v)]);const wrong=[];for(const other of shuffle(available)){const sig=signature(other);if(rowId(other)!==rowId(v)&&!seen.has(sig)){seen.add(sig);wrong.push(other);if(wrong.length===2)break}}if(wrong.length!==2)throw Error('Not enough distinct translations');return shuffle([v,...wrong])}
function fresh(){const group=groups().find(g=>g.id===selectedGroup)||groups()[0];selectedGroup=group.id;let rows=pool().slice(group.from-1,group.to).map((v,i)=>({v,number:group.from+i,options:kind==='mcq'?makeOptions(v):[],answer:null,seen:false}));if($('ip-order').checked)rows=shuffle(rows);attempt={rows,done:false};sessions.set(key(),attempt);index=0;flipped=false;render()}
function openGroup(){attempt=sessions.get(key());if(!attempt)fresh();else{index=0;flipped=false;render()}$('ip-groups').hidden=true;$('ip-play').hidden=false}
function translation(node,v){for(const l of ['ur','en'])if(langs.includes(l)){const p=document.createElement('p');p.className='ip-'+l;p.lang=l;p.dir=l==='ur'?'rtl':'ltr';p.textContent=v[l];node.append(p)}}
function correctness(q){return q.answer===null?false:rowId(q.options[q.answer])===rowId(q.v)}
function resultState(a){if(!a)return'';if(a.done)return a.rows.every(correctness)?'ip-good':'ip-bad';if(mode==='learn'&&kind==='mcq'&&a.rows.every(q=>q.answer!==null))return a.rows.every(correctness)?'ip-good':'ip-bad';return a.rows.some(q=>q.answer!==null||q.seen)?'ip-progress':''}
function renderGroups(){const max=pool().length;$('ip-start-range').max=max;$('ip-end-range').max=max;$('ip-start-range').value=start;$('ip-end-range').value=end;const box=$('ip-group-buttons');box.replaceChildren();for(const g of groups()){const b=document.createElement('button');b.type='button';b.className=resultState(sessions.get(key(g.id)));b.setAttribute('aria-pressed',String(g.id===selectedGroup));if(g.id===selectedGroup)b.style.outline='2px solid var(--ip-accent)';const name=document.createElement('strong');name.textContent=g.id==='all'?'All questions':'Group '+g.id;const small=document.createElement('small');small.textContent=g.from+'–'+g.to+' · '+(g.to-g.from+1)+' questions';b.append(name,small);b.onclick=()=>{selectedGroup=g.id;renderGroups()};box.append(b)}}
function back(){if($('ip-result').open)$('ip-result').close();$('ip-play').hidden=true;$('ip-groups').hidden=false;renderGroups()}
function choose(n){const q=attempt.rows[index];if(attempt.done||kind!=='mcq'||mode==='learn'&&q.answer!==null)return;q.answer=n;render()}
function flip(){if(kind==='mcq'&&mode==='test'&&!attempt.done)return;flipped=!flipped;attempt.rows[index].seen=true;render()}
function render(){const q=attempt.rows[index];
const first = attempt.rows.reduce((a,b)=>a.number<b.number?a:b);
const showGroupOpening = opening.applies(first.v.code,true);
groupOpening.replaceChildren(...(showGroupOpening?[opening.block()]:[]));
const isFirstWord = !attempt.rows.some(row=>row.v.code===q.v.code && row.number<q.number);
const showSurahOpening = q.v.code!==first.v.code && isFirstWord && opening.applies(q.v.code);
questionOpening.replaceChildren(...(showSurahOpening?[opening.block()]:[]));
const feedback=mode==='learn'||attempt.done,answered=attempt.rows.filter(x=>x.answer!==null).length;
$('ip-title').textContent=titles[scope];$('ip-position').textContent=(index+1)+' / '+attempt.rows.length;$('ip-qnumber').textContent='Question '+String(q.number).padStart(2,'0');$('ip-arabic').textContent=q.v.ar;$('ip-code').textContent=q.v.code+(context.mode==='word'?' · Word '+q.v.serial:'');if(context.mode==='word'){for(const [key,field] of [['ar','fullAr'],['ur','fullUr'],['en','fullEn']]){const node=$('ip-word-context-'+key);node.textContent=q.v[field]||'';node.hidden=!$('ip-full-'+key).checked}$('ip-full-context').hidden=!['ar','ur','en'].some(key=>$('ip-full-'+key).checked)}
$('ip-mcq').setAttribute('aria-pressed',String(kind==='mcq'));$('ip-flash').setAttribute('aria-pressed',String(kind==='flash'));$('ip-learn').setAttribute('aria-pressed',String(mode==='learn'));$('ip-test').setAttribute('aria-pressed',String(mode==='test'));$('ip-mode-row').hidden=kind==='flash';
$('ip-state').textContent=kind==='flash'?'Classic Flashcards · Think, then flip to reveal':attempt.done?'Test complete · '+attempt.rows.filter(correctness).length+'/'+attempt.rows.length+' correct':mode==='learn'?'Learning Mode · Instant feedback · First answer locks':'Test Mode · '+answered+'/'+attempt.rows.length+' answered';
$('ip-finish').hidden=kind!=='mcq'||mode!=='test';$('ip-finish').textContent=attempt.done?'View result':'Finish Test';
$('ip-side').textContent=flipped?'Answer side':'Question side';$('ip-card').classList.toggle('ip-answer-side',flipped);const area=$('ip-answer-area');area.replaceChildren();
if(flipped){const answer=document.createElement('div');answer.className='ip-answer-box';const tick=document.createElement('div');tick.className='ip-tick';tick.textContent='✓';const label=document.createElement('p');label.className='ip-eyebrow';label.textContent='Correct answer';answer.append(tick,label);translation(answer,q.v);area.append(answer)}
else if(kind==='mcq'){const options=document.createElement('div');options.className='ip-options';q.options.forEach((v,n)=>{const b=document.createElement('button');b.type='button';b.className='ip-option';b.setAttribute('aria-pressed',String(q.answer===n));if(feedback&&(q.answer!==null||attempt.done)){if(rowId(v)===rowId(q.v))b.classList.add('ip-correct');else if(q.answer===n)b.classList.add('ip-wrong')}b.disabled=attempt.done||mode==='learn'&&q.answer!==null;const letter=document.createElement('span');letter.className='ip-letter';letter.textContent='ABC'[n];const body=document.createElement('div');body.className='ip-option-body';translation(body,v);b.append(letter,body);b.onclick=()=>choose(n);options.append(b)});area.append(options)}
else{const text=document.createElement('p');text.className='ip-hint';text.textContent='Think of the meaning, then flip the card.';area.append(text)}
$('ip-feedback').textContent=kind==='mcq'&&feedback&&q.answer!==null?(correctness(q)?'✓ Correct answer. Keep going.':'✕ Needs practice. The correct answer is highlighted in green.') :kind==='mcq'&&mode==='test'&&!attempt.done?'Your choice is saved for this attempt. Answers appear after Finish Test.':'';
const flipAllowed=kind==='flash'||mode==='learn'||attempt.done;$('ip-flip').disabled=!flipAllowed;$('ip-verse').disabled=!flipAllowed;$('ip-hint').textContent=flipAllowed?'Click the Arabic or Flip card to turn the card.':'Test Mode · Answer side is locked until you finish.';
$('ip-prev').disabled=index===0;$('ip-next').disabled=index===attempt.rows.length-1&&(kind==='flash'||attempt.done);$('ip-next').textContent=index===attempt.rows.length-1?(kind==='flash'?'Last card ✓':attempt.done?'Last question ✓':mode==='test'?'Finish Test ✓':'View result ✓'):'Next →';
$('ip-shuffle-options').disabled=kind==='flash'||attempt.done||attempt.rows.some(x=>x.answer!==null);$('ip-shuffle-questions').disabled=attempt.done||attempt.rows.some(x=>x.answer!==null);
const numbers=$('ip-numbers');numbers.replaceChildren();attempt.rows.forEach((row,i)=>{const b=document.createElement('button');b.textContent=row.number;b.setAttribute('aria-current',String(i===index));let status='Unanswered';if(kind==='mcq'&&(mode==='learn'||attempt.done)&&(row.answer!==null||attempt.done)){b.className=correctness(row)?'ip-good':'ip-bad';status=correctness(row)?'Correct':'Needs practice'}else if(row.answer!==null||row.seen){b.className='ip-progress';status=row.answer!==null?'Answered':'Viewed'}b.setAttribute('aria-label','Question '+row.number+' · '+status);b.onclick=()=>{index=i;flipped=false;render()};numbers.append(b)});
$('ip-legend').textContent=kind==='flash'?'Blue: viewed · Blank: not yet viewed':mode==='test'&&!attempt.done?'Blue: answered · Blank: unanswered · Results remain hidden':'Green: correct · Red: needs practice · Blank: unanswered';
}
function showResult(){if(kind==='flash')return;const total=attempt.rows.length,correct=attempt.rows.filter(correctness).length,missing=attempt.rows.filter(q=>q.answer===null).length;const perfect=correct===total;
$('ip-result-title').textContent=perfect?'Outstanding!':'Keep going—you’re making progress.';$('ip-score').textContent=correct+'/'+total;$('ip-percent').textContent=Math.round(100*correct/total)+'% correct';$('ip-counts').textContent=correct+' correct · '+(total-correct)+' to review'+(missing?' · '+missing+' unanswered':'');$('ip-motivation').textContent=perfect?'You’ve mastered this set. Carry that confidence into your next challenge.':'Take your time, review the answers, and try again. Every attempt builds understanding.';$('ip-result').showModal()}
function confirmAction(title,text,action,button='Restart attempt'){pendingAction=action;$('ip-confirm-title').textContent=title;$('ip-confirm-text').textContent=text;$('ip-confirm-yes').textContent=button;$('ip-confirm').showModal()}
function finish(){if(attempt.done){showResult();return}const missing=attempt.rows.filter(q=>q.answer===null).length;const complete=()=>{attempt.done=true;flipped=false;render();showResult()};if(missing)confirmAction('Finish this test?',missing+' unanswered question(s) will count as incorrect. Results will then be revealed.',complete,'Finish Test');else complete()}
function switchSetting(field,value){if(field==='kind'&&kind===value||field==='mode'&&mode===value)return;const action=()=>{const oldKind=kind,oldMode=mode;try{if(field==='kind')kind=value;else mode=value;fresh()}catch(e){kind=oldKind;mode=oldMode;$('ip-feedback').textContent=e.message}};if(attempt.rows.some(q=>q.answer!==null||q.seen)&&!attempt.done)confirmAction('Start a fresh attempt?','Changing mode clears the current attempt in the selected group.',action,'Change mode');else action()}
$('ip-back').onclick=back;$('ip-restart').onclick=()=>confirmAction('Restart this attempt?','Your current answers will be cleared and options will be reshuffled. This cannot be undone.',fresh);
$('ip-mcq').onclick=()=>switchSetting('kind','mcq');$('ip-flash').onclick=()=>switchSetting('kind','flash');$('ip-learn').onclick=()=>switchSetting('mode','learn');$('ip-test').onclick=()=>switchSetting('mode','test');
$('ip-verse').onclick=flip;$('ip-flip').onclick=flip;$('ip-prev').onclick=()=>{if(index>0){index--;flipped=false;render()}};$('ip-next').onclick=()=>{if(index<attempt.rows.length-1){index++;flipped=false;render()}else if(kind==='mcq'){if(mode==='test')finish();else showResult()}};
$('ip-finish').onclick=finish;$('ip-close-result').onclick=()=>$('ip-result').close();$('ip-review').onclick=()=>{$('ip-result').close();index=Math.max(0,attempt.rows.findIndex(q=>!correctness(q)));flipped=false;render()};$('ip-result-back').onclick=back;$('ip-again').onclick=()=>{$('ip-result').close();fresh()};
$('ip-confirm-no').onclick=()=>{$('ip-confirm').close();pendingAction=null};$('ip-confirm-yes').onclick=()=>{const action=pendingAction;pendingAction=null;$('ip-confirm').close();if(action)action()};
$('ip-shuffle-options').onclick=()=>{if(attempt.rows.some(q=>q.answer!==null)||attempt.done)return;for(const q of attempt.rows)q.options=shuffle(q.options);render()};$('ip-shuffle-questions').onclick=()=>{if(attempt.rows.some(q=>q.answer!==null)||attempt.done)return;attempt.rows=shuffle(attempt.rows);index=0;flipped=false;render()};
$('ip-size').onchange=()=>{size=Number($('ip-size').value);selectedGroup='all';renderGroups()};
function rangeChange(){const max=pool().length;start=Math.max(1,Math.min(max,Math.floor(Number($('ip-start-range').value)||1)));end=Math.max(start,Math.min(max,Math.floor(Number($('ip-end-range').value)||max)));selectedGroup='all';renderGroups()}
$('ip-start-range').onchange=rangeChange;$('ip-end-range').onchange=rangeChange;
function languageChange(){langs=['ur','en'].filter(l=>$(l==='ur'?'ip-urdu':'ip-english').checked);$('ip-generate').disabled=!langs.length;$('ip-validation').textContent=langs.length?'':'Select Urdu, English or both to begin.';renderGroups()}
$('ip-urdu').onchange=languageChange;$('ip-english').onchange=languageChange;$('ip-generate').onclick=async()=>{
 if(!langs.length)return;
 const button=$('ip-generate');button.disabled=true;button.textContent='Preparing questions…';$('ip-validation').textContent='';
 try{
  const signature=x=>langs.map(l=>x[l].normalize('NFC').replace(/\s+/g,' ').trim()).join('\u0001');
  available=[...data];if(kind==='mcq'&&new Set(available.map(signature)).size<3)available.push(...await context.extraPool(langs));
  if(kind==='mcq'&&new Set(available.map(signature)).size<3)throw Error('Three distinct translations are needed for MCQ options.');
  openGroup();
 }catch(e){$('ip-validation').textContent=e.message}
 finally{button.disabled=!langs.length;button.textContent='Start selected group →'}
};
function setSize(n){fontSize=Math.max(22,Math.min(40,n));root.style.setProperty('--ip-size',fontSize+'px');$('ip-fontsize').value=fontSize;$('ip-fontvalue').textContent=fontSize+'px'}$('ip-smaller').onclick=()=>setSize(fontSize-2);$('ip-larger').onclick=()=>setSize(fontSize+2);$('ip-reset-font').onclick=()=>setSize(28);$('ip-fontsize').oninput=()=>setSize(Number($('ip-fontsize').value));
root.addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===$('ip-verse')){e.preventDefault();flip()}});
$('ip-urdu').checked=langs.includes('ur');$('ip-english').checked=langs.includes('en');
$('ip-exit').onclick=()=>{window.ReadIQPractice.hide();if(context.onExit)context.onExit()};
$('ip-groups').hidden=false;$('ip-play').hidden=true;renderGroups();
root.hidden=false;
return {destroy(){for(const d of root.querySelectorAll('dialog[open]'))d.close()}};
}

})();
