'use strict';
const content=document.getElementById('content'),title=document.getElementById('documentTitle'),slider=document.getElementById('fontSlider'),fontValue=document.getElementById('fontValue'),search=document.getElementById('search');
const fileToggle=document.getElementById('fileToggle'),fileMenu=document.getElementById('fileMenu'),fileCards=document.getElementById('fileCards'),header=document.querySelector('header');
let catalogue={folders:[],files:[],count:0},verses=[],selected=null,revision='',token=0,polling=false;
const checks=[...document.querySelectorAll('[data-language]')];
function saved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
const languageChoice=saved('readiq-languages',['ar','ur','en']);checks.forEach(c=>c.checked=languageChoice.includes(c.dataset.language));
function positionMenu(){const b=fileToggle.getBoundingClientRect(),w=Math.min(560,innerWidth-28);document.documentElement.style.setProperty('--menu-left',Math.max(14,Math.min(b.left,innerWidth-w-14))+'px');document.documentElement.style.setProperty('--header-bottom',Math.ceil(header.getBoundingClientRect().bottom)+6+'px')}
function setFileMenu(open){fileMenu.hidden=!open;fileToggle.setAttribute('aria-expanded',String(open));positionMenu()}
fileToggle.onclick=()=>{tools(false);setFileMenu(fileMenu.hidden)};
document.addEventListener('pointerdown',e=>{if(!fileMenu.contains(e.target)&&!fileToggle.contains(e.target))setFileMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=!fileMenu.hidden;setFileMenu(false);tools(false);if(wasOpen)fileToggle.focus()}});
function renderLibrary(){const open=new Set([...fileCards.querySelectorAll('details[open]')].map(d=>d.dataset.para));fileCards.replaceChildren();
for(const para of catalogue.folders){const d=document.createElement('details');d.dataset.para=String(para);d.open=open.has(String(para))||selected?.para===para;const summary=document.createElement('summary');summary.textContent='📚 Para-'+String(para).padStart(2,'0');d.append(summary);const list=document.createElement('div');list.className='quarter-list';for(let q=1;q<=4;q++){const file=catalogue.files.find(f=>f.para===para&&f.quarter===q);const labels=[['First Quarter','پہلا ربع'],['Second Quarter','نصف'],['Third Quarter','تیسرا ربع'],['Fourth Quarter','آخری ربع']][q-1];const b=document.createElement('button');b.className='quarter-row'+(selected?.id===file?.id?' active':'');b.type='button';b.disabled=!file;const en=document.createElement('span');en.textContent=labels[0];const ur=document.createElement('span');ur.lang='ur';ur.dir='rtl';ur.textContent=labels[1];b.append(en,' — ',ur);if(file)b.onclick=()=>{setFileMenu(false);openFile(file);window.scrollTo({top:0,behavior:'smooth'})};else{b.title='File not added yet';b.setAttribute('aria-label',labels[0]+' — file not added yet')}list.append(b)}d.append(list);fileCards.append(d)}
if(!catalogue.folders.length)fileCards.textContent='No Para folders yet.';document.getElementById('fileMenuCount').textContent='('+catalogue.files.length+')';}
function selectedLanguages(){return checks.filter(c=>c.checked).map(c=>c.dataset.language)}
function render(){const langs=selectedLanguages();content.replaceChildren();document.getElementById('languageSummary').textContent=langs.map(k=>({ar:'Arabic',ur:'Urdu',en:'English'})[k]).join(' · ');document.getElementById('fileCount').textContent=verses.length+' VERSES';
if(!langs.length){const p=document.createElement('p');p.className='empty';p.textContent='Choose Arabic, Urdu or English from Library.';content.append(p);return}
if(!verses.length){const p=document.createElement('p');p.className='empty';p.textContent='Choose a quarter from Library to begin reading.';content.append(p);return}
for(const v of verses){const section=document.createElement('section');section.className='verse';section.setAttribute('aria-label',v.code);const code=document.createElement('div');code.className='verse-code';code.dir='ltr';code.textContent=v.code;section.append(code);for(const k of ['ar','ur','en']){if(!langs.includes(k))continue;const p=document.createElement('p');p.className='verse-'+k;p.lang=k;p.dir=k==='en'?'ltr':'rtl';p.textContent=k==='ar'?cleanArabicEnd(v[k]):cleanTranslationMarkers(v[k]);section.append(p)}content.append(section)}highlight();}
function highlight(){content.querySelectorAll('mark').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));content.normalize();const term=search.value.trim();if(!term)return;const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),nodes=[];let node;while(node=walker.nextNode())if(node.nodeValue.toLowerCase().includes(term.toLowerCase()))nodes.push(node);for(const n of nodes){const raw=n.nodeValue,frag=document.createDocumentFragment();let pos=0,at;while((at=raw.toLowerCase().indexOf(term.toLowerCase(),pos))!==-1){frag.append(document.createTextNode(raw.slice(pos,at)));const m=document.createElement('mark');m.className='match';m.textContent=raw.slice(at,at+term.length);frag.append(m);pos=at+term.length}frag.append(document.createTextNode(raw.slice(pos)));n.replaceWith(frag)}}
checks.forEach(c=>c.onchange=()=>{save('readiq-languages',selectedLanguages());render()});search.oninput=()=>{highlight();content.querySelector('mark')?.scrollIntoView({block:'center',behavior:'smooth'})};
async function openFile(file){readingMode='quarter';save('readiq-mode','quarter');selected=file;save('readiq-selected',file.id);renderLibrary();renderParasMenu();renderSurahsMenu();const n=++token;verses=[];search.value='';title.textContent='Para-'+String(file.para).padStart(2,'0')+' · '+file.label;content.textContent='Opening quarter…';try{const r=await fetch(file.url,{cache:'no-store'});if(!r.ok)throw Error('Cannot open quarter');const data=await r.json();if(n!==token)return;verses=data.verses;render();document.getElementById('status').textContent=verses.length+' verses in this quarter'}catch(e){if(n===token)content.textContent=e.message}}
async function refresh(){if(polling)return;polling=true;try{const r=await fetch('library.json',{cache:'no-store'});if(!r.ok)throw Error('Library unavailable');const next=await r.json();if(next.revision===revision)return;catalogue=next;revision=next.revision;renderLibrary();renderParasMenu();renderSurahsMenu();const id=selected?.id||saved('readiq-selected',null),chosen=catalogue.files.find(f=>f.id===id)||catalogue.files[0];if(readingMode==='surah')await openSurah(currentSurah);else if(readingMode==='para')await openPara(currentPara);else if(chosen)await openFile(chosen);else{selected=null;verses=[];++token;title.textContent='Irfan-ul-Quran';render();document.getElementById('status').textContent='Add quarter files to begin'}}catch{document.getElementById('status').textContent='Library unavailable. Please refresh.'}finally{polling=false}}
let font=Number(saved('readiq-font',31));if(!Number.isFinite(font))font=31;
function setFont(v){font=Math.max(18,Math.min(72,Number(v)));document.documentElement.style.setProperty('--size',font+'px');slider.value=font;fontValue.textContent=font+'px';save('readiq-font',font)}
setFont(font);slider.oninput=()=>setFont(slider.value);document.getElementById('minus').onclick=()=>setFont(font-2);document.getElementById('plus').onclick=()=>setFont(font+2);document.getElementById('reset').onclick=()=>setFont(31);
document.getElementById('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{document.getElementById('status').textContent='Full screen is unavailable in this browser.'}};
const settings=document.getElementById('mobileToolsButton');function tools(open){header.classList.toggle('mobile-tools-open',open);settings.setAttribute('aria-expanded',String(open));requestAnimationFrame(positionMenu)}settings.onclick=()=>{setFileMenu(false);tools(settings.getAttribute('aria-expanded')!=='true')};
function layout(){document.documentElement.style.setProperty('--read-header-height',header.getBoundingClientRect().height+'px');positionMenu()}
new ResizeObserver(layout).observe(header);window.addEventListener('resize',layout);layout();
function background(){const n=Math.floor(scrollY/900)%3;document.documentElement.style.setProperty('--scroll-bg',['#fff8d9','#e7f7ff','#eef9ea'][n]);document.documentElement.style.setProperty('--reader-bg',['#fffdf9','#f7fcff','#fbfff7'][n])}window.addEventListener('scroll',background,{passive:true});background();
// READIQ_PARAS_V1
let readingMode=saved('readiq-mode','quarter'),currentPara=Number(saved('readiq-para',1));
const paraNames=[
['الٓمّٓ','Alif laam meem'],['سَيَقُولُ','Sayaqoolu'],['تِلْكَ الرُّسُلُ','Tilka alrrusulu'],['لَن تَنَالُواْ','Lan tanaloo'],['وَالْمُحْصَنَاتُ','Waalmuhsanatu'],['لَا يُحِبُّ اللهُ','La yuhibbu Allahu'],['وَإِذَا سَمِعُواْ','Waidha samioo'],['وَلَوْ أَنَّنَا','Walaw annana'],['قَالَ الْمَلَأُ','Qala almalao'],['وَاعْلَمُواْ','WaiAAlamoo'],['يَعْتَذِرُونَ','YaAAtathiroona'],['وَمَا مِن دَآبَّةٍ','Wama min dabbatin'],['وَمَا أُبَرِّىءُ','Wama obarrio'],['رُبَمَا','Rubama'],['سُبْحَانَ الَّذِي','Subhana allathee'],['قَالَ أَلَمْ','Qala alam'],['إِقْتَرَبَ','Iqtaraba'],['قَدْ أَفْلَحَ','Qad aflaha'],['وَقَالَ الَّذِينَ','Waqala allatheena'],['أَمَّنْ خَلَقَ','Amman khalaqa'],['أُتْلُ مَا أُوحِيَ','Otlu ma oohiya'],['وَمَن يَقْنُتْ','Waman yaqnut'],['وَمَا لِيَ','Wama liya'],['فَمَنْ أَظْلَمُ','Faman athlamu'],['إِلَيْهِ يُرَدُّ','Ilayhi yuraddu'],['حٰمٓ','Hameem'],['قَالَ فَمَا خَطْبُكُمْ','Qala fama khatbukum'],['قَدْ سَمِعَ اللّٰهُ','Qad samiAAa Allahu'],['تَبَارَكَ الَّذِي','Tabaraka allathee'],['عَمَّ','AAamma']];
const paraToggle=document.createElement('button');paraToggle.type='button';paraToggle.className='file-toggle';paraToggle.id='paraToggle';paraToggle.textContent='📖 Paras ▾';paraToggle.setAttribute('aria-expanded','false');paraToggle.setAttribute('aria-controls','paraMenu');fileToggle.parentElement.append(paraToggle);
const paraMenu=document.createElement('div');paraMenu.className='file-menu';paraMenu.id='paraMenu';paraMenu.hidden=true;paraMenu.setAttribute('aria-label','Complete Paras');
const paraBar=document.createElement('div');paraBar.className='library-toolbar';const paraHeading=document.createElement('strong');paraHeading.textContent='📖 Paras';paraBar.append(paraHeading);paraMenu.append(paraBar);
const paraLanguages=document.createElement('fieldset');paraLanguages.className='language-picks';const paraLegend=document.createElement('legend');paraLegend.textContent='Display languages';paraLanguages.append(paraLegend);
const paraChecks=[];
checks.forEach(original=>{const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=original.checked;c.setAttribute('aria-label',({ar:'Arabic',ur:'Urdu',en:'English'})[original.dataset.language]);label.append(c,' '+({ar:'Arabic',ur:'Urdu',en:'English'})[original.dataset.language]);paraLanguages.append(label);paraChecks.push(c);c.onchange=()=>{original.checked=c.checked;original.dispatchEvent(new Event('change'))};original.addEventListener('change',()=>{c.checked=original.checked})});
paraMenu.append(paraLanguages);const paraList=document.createElement('div');paraList.className='para-list';paraMenu.append(paraList);document.body.append(paraMenu);
function positionParas(){const box=paraToggle.getBoundingClientRect(),width=Math.min(560,innerWidth-28);paraMenu.style.left=Math.max(14,Math.min(box.left,innerWidth-width-14))+'px';paraMenu.style.top=Math.ceil(header.getBoundingClientRect().bottom)+6+'px'}
function showParaMenu(open){paraMenu.hidden=!open;paraToggle.setAttribute('aria-expanded',String(open));if(open){setFileMenu(false);tools(false);positionParas()}}
paraToggle.onclick=()=>showParaMenu(paraMenu.hidden);
fileToggle.addEventListener('click',()=>showParaMenu(false));settings.addEventListener('click',()=>showParaMenu(false));
document.addEventListener('pointerdown',e=>{if(!paraMenu.contains(e.target)&&!paraToggle.contains(e.target))showParaMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!paraMenu.hidden){showParaMenu(false);paraToggle.focus()}});
window.addEventListener('resize',positionParas);new ResizeObserver(positionParas).observe(header);
function renderParasMenu(){paraList.replaceChildren();paraNames.forEach(([arabic,roman],i)=>{const para=i+1;const complete=[1,2,3,4].every(q=>catalogue.files.some(f=>f.para===para&&f.quarter===q));const b=document.createElement('button');b.type='button';b.className='para-option'+(readingMode==='para'&&currentPara===para?' active':'');b.disabled=!complete;const top=document.createElement('span');top.className='para-option-title';const num=document.createElement('span');num.textContent=String(para).padStart(2,'0')+' · ';const ar=document.createElement('span');ar.lang='ar';ar.dir='rtl';ar.textContent=arabic;top.append(num,ar);const bottom=document.createElement('small');bottom.textContent=roman;b.append(top,bottom);if(!complete)b.title='All four quarter files are required';b.onclick=()=>{showParaMenu(false);openPara(para);window.scrollTo({top:0,behavior:'smooth'})};paraList.append(b)})}
async function openPara(para){
 const n=++token;readingMode='para';currentPara=para;selected={para,id:'para-'+para};save('readiq-mode','para');save('readiq-para',para);renderLibrary();renderParasMenu();renderSurahsMenu();verses=[];search.value='';title.textContent='Para-'+String(para).padStart(2,'0')+' · '+(paraNames[para-1]?.[0]||'')+' · Complete Para';content.textContent='Opening all four quarters…';document.getElementById('fileCount').textContent='0 VERSES';
 try{
  const files=[1,2,3,4].map(q=>catalogue.files.find(f=>f.para===para&&f.quarter===q));if(files.some(f=>!f))throw Error('This Para needs all four quarter files.');
  const parts=await Promise.all(files.map(async f=>{const response=await fetch(f.url,{cache:'no-store'});if(!response.ok)throw Error('Cannot open '+f.label);const data=await response.json();if(!Array.isArray(data.verses))throw Error('Invalid quarter content');return data.verses}));
  if(n!==token)return;const combined=parts.flat(),seen=new Set();for(const v of combined){if(seen.has(v.code))throw Error('Repeated verse code '+v.code+'. Please review quarter files.');seen.add(v.code)}verses=combined;render();document.getElementById('status').textContent=verses.length+' verses · Complete Para · 4 quarters';
 }catch(e){if(n===token){content.textContent=e.message;document.getElementById('status').textContent='Complete Para could not be loaded.'}}
}
renderParasMenu();

// READIQ_SURAHS_V1
const surahNames=[["al-Fatihah", "آغاز"], ["al-Baqarah", "گائے"], ["Al-i-Imran", "عمران کی اولاد"], ["an-Nisa", "خواتین"], ["al-Maidah", "دسترخوان"], ["al-Anam", "چوپائے"], ["al-Aaraf", "بلندیاں"], ["al-Anfal", "مالِ غنیمت"], ["at-Tawbah", "معافی"], ["Yunus", "یونس"], ["Hud", "ہود"], ["Yusuf", "یوسف"], ["ar-Rad", "کڑک"], ["Ibrahim", "ابراہیم"], ["al-Hijr", "الْحِجْر"], ["an-Nahl", "شہد کی مکھی"], ["al-Isra", "رات کا سفر"], ["al-Kahf", "غار"], ["Maryam", "مریم"], ["Taha", "طهٰ"], ["al-Ambiya", "انبیاء"], ["al-Hajj", "حج"], ["al-Muminun", "ایمان والے"], ["an-Nur", "روشنی"], ["al-Furqan", "معیار، ضابطہ"], ["ash-Shuara’", "شعراء"], ["an-Naml", "چیونٹیاں"], ["al-Qasas", "واقعات"], ["al-Ankabut", "مکڑی"], ["ar-Rum", "روم"], ["Luqman", "لقمان"], ["as-Sajdah", "سجدہ"], ["al-Ahzab", "احزاب"], ["Saba", "سبا"], ["Fatir", "فَاطِر"], ["Yasīn", "یسین"], ["as-Saffat", "مدارج"], ["Sad", "ص"], ["az-Zumar", "الزُّمَر"], ["Ghafir", "معاف کرنے والا"], ["Fussilat", "تفصیلی وضاحت"], ["ash-Shura", "مشاورت"], ["az-Zukhruf", "الزُّخْرُف"], ["ad-Dukhan", "دھواں"], ["al-Jathiyah", "الْجَاثِيَة"], ["al-Ahqaf", "الْأَحْقَاف"], ["Muhammad", "محمّد"], ["al-Fath", "فتح"], ["al-Hujurat", "کمرے"], ["Qaf", "ق"], ["adh-Dhariyāt", "ذاریات"], ["at-Tur", "کوہِ طور"], ["an-Najm", "ستارہ"], ["al-Qamar", "چاند"], ["ar-Rahman", "الرحمن"], ["al-Waqiah", "واقعہ"], ["al-Hadid", "لوہا"], ["al-Mujadalah", "جھگڑا"], ["al-Hashr", "حشر"], ["al-Mumtahinah", "ممتحنہ"], ["as-Saff", "رتبہ"], ["al-Jumuah", "اجتماع"], ["al-Munafiqun", "منافق"], ["at-Taghabun", "تغابن"], ["at-Talaq", "طلاق"], ["at-Tahrim", "حرمت"], ["al-Mulk", "ملك"], ["al-Qalam", "قلم"], ["al-Haqqah", "حاقہ"], ["al-Maarij", "معارج"], ["Nuh", "نوح"], ["al-Jinn", "جن"], ["al-Muzzammil", "مزمل"], ["al-Muddaththir", "مدثر"], ["al-Qiyamah", "قیامت"], ["al-Insan", "انسان"], ["al-Mursalat", "مرسلات"], ["an-Naba", "نباء"], ["an-Naziat", "نازعات"], ["Abasa", "عبس"], ["at-Takwir", "تكویر"], ["al-Infitar", "انفطار"], ["al-Mutaffifin", "مطفّفین"], ["al-Inshiqaq", "انشقاق"], ["al-Buruj", "بروج"], ["at-Tariq", "صبح کا ستارہ"], ["al-Ala", "بلند ترین"], ["al-Ghashiyah", "غاشیہ"], ["al-Fajr", "علی الصبح"], ["al-Balad", "شہر"], ["ash-Shams", "سورج"], ["al-Layl", "رات"], ["ad-Duha", "چاشت"], ["ash-Sharh", "شرح"], ["at-Tin", "انجیر"], ["al-Alaq", "علق"], ["al-Qadr", "قدر"], ["al-Bayyinah", "بین ثبوت"], ["az-Zalzalah", "زلزلہ"], ["al-Adiyat", "عادیات"], ["al-Qariah", "قارعہ"], ["at-Takathur", "مقابلہ بازی"], ["al-Asr", "زمانہ"], ["al-Humazah", "ہمزه"], ["al-Fil", "فیل"], ["al-Quraysh", "قریش"], ["al-Maun", "مستعار اشیاء"], ["al-Kawthar", "كوثر"], ["al-Kafirun", "کفار"], ["an-Nasr", "مدد"], ["al-masad", "مسد"], ["al-Ikhlas", "اخلاص"], ["al-Falaq", "پو پھٹنا"], ["al-Nas", "لوگ"]];
let currentSurah=Number(saved('readiq-surah',1));
const surahToggle=document.createElement('button');surahToggle.type='button';surahToggle.className='file-toggle';surahToggle.id='surahToggle';surahToggle.textContent='📜 Surahs ▾';surahToggle.setAttribute('aria-expanded','false');surahToggle.setAttribute('aria-controls','surahMenu');fileToggle.parentElement.append(surahToggle);
const surahMenu=document.createElement('div');surahMenu.className='file-menu';surahMenu.id='surahMenu';surahMenu.hidden=true;surahMenu.setAttribute('aria-label','Complete Surahs');
const surahBar=document.createElement('div');surahBar.className='library-toolbar';const surahHeading=document.createElement('strong');surahHeading.textContent='📜 Surahs';surahBar.append(surahHeading);surahMenu.append(surahBar);
const surahLanguages=document.createElement('fieldset');surahLanguages.className='language-picks';const surahLegend=document.createElement('legend');surahLegend.textContent='Display languages';surahLanguages.append(surahLegend);
checks.forEach(original=>{const label=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=original.checked;const name=({ar:'Arabic',ur:'Urdu',en:'English'})[original.dataset.language];c.setAttribute('aria-label',name);label.append(c,' '+name);surahLanguages.append(label);c.onchange=()=>{original.checked=c.checked;original.dispatchEvent(new Event('change'))};original.addEventListener('change',()=>{c.checked=original.checked})});
surahMenu.append(surahLanguages);const surahList=document.createElement('div');surahList.className='surah-list';surahMenu.append(surahList);document.body.append(surahMenu);
function positionSurahs(){const box=surahToggle.getBoundingClientRect(),width=Math.min(560,innerWidth-28);surahMenu.style.left=Math.max(14,Math.min(box.left,innerWidth-width-14))+'px';surahMenu.style.top=Math.ceil(header.getBoundingClientRect().bottom)+6+'px'}
function showSurahMenu(open){surahMenu.hidden=!open;surahToggle.setAttribute('aria-expanded',String(open));if(open){setFileMenu(false);showParaMenu(false);tools(false);positionSurahs()}}
surahToggle.onclick=()=>showSurahMenu(surahMenu.hidden);
fileToggle.addEventListener('click',()=>showSurahMenu(false));paraToggle.addEventListener('click',()=>showSurahMenu(false));settings.addEventListener('click',()=>showSurahMenu(false));
document.addEventListener('pointerdown',e=>{if(!surahMenu.contains(e.target)&&!surahToggle.contains(e.target))showSurahMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!surahMenu.hidden){showSurahMenu(false);surahToggle.focus()}});
window.addEventListener('resize',positionSurahs);new ResizeObserver(positionSurahs).observe(header);
function renderSurahsMenu(){surahList.replaceChildren();surahNames.forEach(([roman,urdu],i)=>{const number=i+1,entry=catalogue.surahs?.find(s=>s.number===number);const b=document.createElement('button');b.type='button';b.className='surah-option'+(readingMode==='surah'&&currentSurah===number?' active':'');b.disabled=!entry?.complete;const top=document.createElement('span');top.className='surah-option-title';top.textContent=String(number).padStart(3,'0')+' · '+roman;const bottom=document.createElement('small');bottom.lang='ur';bottom.dir='rtl';bottom.textContent=urdu;b.append(top,bottom);if(!entry?.complete){b.title=entry?entry.count+' of '+entry.expected+' verses available':'Surah index not built yet';b.setAttribute('aria-label',number+' '+roman+' — incomplete source content')}b.onclick=()=>{showSurahMenu(false);openSurah(number);window.scrollTo({top:0,behavior:'smooth'})};surahList.append(b)})}
async function openSurah(number){
 const n=++token;readingMode='surah';currentSurah=number;selected={id:'surah-'+number};save('readiq-mode','surah');save('readiq-surah',number);renderLibrary();renderParasMenu();renderSurahsMenu();verses=[];search.value='';title.textContent='Surah '+number+' · '+(surahNames[number-1]?.[0]||'');content.textContent='Opening complete Surah…';document.getElementById('fileCount').textContent='0 VERSES';
 try{
  const entry=catalogue.surahs?.find(s=>s.number===number);if(!entry?.complete||!entry.url)throw Error('Complete Surah content is not available. Please review the source files.');
  const response=await fetch(entry.url,{cache:'no-store'});if(!response.ok)throw Error('Cannot open Surah');const data=await response.json();if(n!==token)return;
  if(!Array.isArray(data.verses)||data.verses.length!==entry.expected)throw Error('Surah content count does not match.');
  for(let i=0;i<data.verses.length;i++){const m=/^P\d+[-–]S(\d+)[-–](\d+)$/.exec(data.verses[i].code);if(!m||Number(m[1])!==number||Number(m[2])!==i+1)throw Error('Surah verse order is invalid.');}
  verses=data.verses;render();document.getElementById('status').textContent=verses.length+' verses · Complete Surah';
 }catch(e){if(n===token){content.textContent=e.message;document.getElementById('status').textContent='Complete Surah could not be loaded.'}}
}
renderSurahsMenu();

refresh();setInterval(refresh,30000);

// READIQ_VERSE_CIRCLE_V1
function cleanArabicEnd(text){
 return String(text).replace(
  /(?:[O\u25CB\u25EF\u25E6][\s\u200E\u200F\u061C]*)+$/u,
  ''
 ).trimEnd();
}

// READIQ_TRANSLATION_MARKERS_V2
function cleanTranslationMarkers(text){
 let result=String(text);

 result=result.replace(
  /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF)\]])[Oo](?=$|[\s\u200E\u200F\u061C\u2013\u2014])/gu,
  '$1'
 );

 result=result.replace(
  /(?:[\u25CB\u25EF\u25E6][\s\u200E\u200F\u061C]*)+$/u,
  ''
 );

 result=result.replace(
  /([.!?\u2026\u06D4)\]])[Oo]([\s\u200E\u200F\u061C]*)$/u,
  '$1$2'
 );

 return result.replace(
  /\s+[Oo][\s\u200E\u200F\u061C]*$/u,
  ''
 ).trimEnd();
}
