'use strict';
const content=document.getElementById('content'),title=document.getElementById('documentTitle'),slider=document.getElementById('fontSlider'),fontValue=document.getElementById('fontValue'),search=document.getElementById('search');
const fileToggle=document.getElementById('fileToggle'),fileMenu=document.getElementById('fileMenu'),fileCards=document.getElementById('fileCards'),header=document.querySelector('header');
let catalogue={folders:[],files:[],count:0},verses=[],selected=null,revision='',token=0,polling=false;
const checks=[...document.querySelectorAll('[data-language]')];
function saved(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
const languageChoice=saved('readiq-languages',['ar','ur','en']);checks.forEach(c=>c.checked=languageChoice.includes(c.dataset.language));
function positionMenu(){const b=exploreAnchor(fileToggle).getBoundingClientRect(),w=Math.min(560,innerWidth-28);document.documentElement.style.setProperty('--menu-left',Math.max(14,Math.min(b.left,innerWidth-w-14))+'px');document.documentElement.style.setProperty('--header-bottom',Math.ceil(header.getBoundingClientRect().bottom)+6+'px')}
function setFileMenu(open){fileMenu.hidden=!open;fileToggle.setAttribute('aria-expanded',String(open));positionMenu()}
fileToggle.onclick=()=>{tools(false);setFileMenu(fileMenu.hidden)};
document.addEventListener('pointerdown',e=>{if(!fileMenu.contains(e.target)&&!fileToggle.contains(e.target))setFileMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const wasOpen=!fileMenu.hidden;setFileMenu(false);tools(false);if(wasOpen)fileToggle.focus()}});
function renderLibrary(){const open=new Set([...fileCards.querySelectorAll('details[open]')].map(d=>d.dataset.para));fileCards.replaceChildren();
for(const para of catalogue.folders){const d=document.createElement('details');d.dataset.para=String(para);d.open=open.has(String(para))||selected?.para===para;const summary=document.createElement('summary');summary.textContent='📚 Para-'+String(para).padStart(2,'0');d.append(summary);const list=document.createElement('div');list.className='quarter-list';for(let q=1;q<=4;q++){const file=catalogue.files.find(f=>f.para===para&&f.quarter===q);const labels=[['First Quarter','پہلا ربع'],['Second Quarter','نصف'],['Third Quarter','تیسرا ربع'],['Fourth Quarter','آخری ربع']][q-1];const b=document.createElement('button');b.className='quarter-row'+(selected?.id===file?.id?' active':'');b.type='button';b.disabled=!file;const en=document.createElement('span');en.textContent=labels[0];const ur=document.createElement('span');ur.lang='ur';ur.dir='rtl';ur.textContent=labels[1];b.append(en,' — ',ur);if(file)b.onclick=()=>{setFileMenu(false);openFile(file);window.scrollTo({top:0,behavior:'smooth'})};else{b.title='File not added yet';b.setAttribute('aria-label',labels[0]+' — file not added yet')}list.append(b)}d.append(list);fileCards.append(d)}
if(!catalogue.folders.length)fileCards.textContent='No Para folders yet.';document.getElementById('fileMenuCount').textContent='('+catalogue.files.length+')';}
function selectedLanguages(){return checks.filter(c=>c.checked).map(c=>c.dataset.language)}

// READIQ_PARA_TITLE_V2
const paraCardDetails = [
 ["Alif Lam Mim", "Quranic initials", "Al-Fatihah and Al-Baqarah"],
 ["Sayaqul", "They will say", "Al-Baqarah"],
 ["Tilkar Rusul", "Those messengers", "Al-Baqarah and Ali ‘Imran"],
 ["Lan Tanalu", "You will never attain", "Ali ‘Imran and An-Nisa"],
 ["Wal Muhsanat", "And married women", "An-Nisa"],
 ["La Yuhibbullah", "Allah does not like", "An-Nisa and Al-Ma’idah"],
 ["Wa Idha Sami‘u", "And when they hear", "Al-Ma’idah and Al-An‘am"],
 ["Wa Law Annana", "And even if We had", "Al-An‘am and Al-A‘raf"],
 ["Qalal Mala’u", "The chiefs said", "Al-A‘raf and Al-Anfal"],
 ["Wa‘lamu", "And know", "Al-Anfal and At-Tawbah"],
 ["Ya‘tadhirun", "They will make excuses", "At-Tawbah to Hud · 3 Surahs"],
 ["Wa Ma Min Dabbah", "And there is no living creature", "Hud and Yusuf"],
 ["Wa Ma Ubarri’u", "And I do not absolve", "Yusuf to Ibrahim · 3 Surahs"],
 ["Rubama", "Perhaps", "Al-Hijr and An-Nahl"],
 ["Subhanalladhi", "Glory be to Him who", "Al-Isra and Al-Kahf"],
 ["Qala Alam", "He said, “Did I not…?”", "Al-Kahf to Ta-Ha · 3 Surahs"],
 ["Iqtaraba", "Has drawn near", "Al-Anbiya and Al-Hajj"],
 ["Qad Aflaha", "Has certainly succeeded", "Al-Mu’minun to Al-Furqan · 3 Surahs"],
 ["Wa Qalalladhina", "And those who … said", "Al-Furqan to An-Naml · 3 Surahs"],
 ["Amman Khalaq", "Or who created…?", "An-Naml to Al-‘Ankabut · 3 Surahs"],
 ["Utlu Ma Uhiya", "Recite what has been revealed", "Al-‘Ankabut to Al-Ahzab · 5 Surahs"],
 ["Wa Man Yaqnut", "And whoever devoutly obeys", "Al-Ahzab to Ya-Sin · 4 Surahs"],
 ["Wa Ma Li", "And what reason have I…?", "Ya-Sin to Az-Zumar · 4 Surahs"],
 ["Fa Man Azlam", "Then who is more unjust?", "Az-Zumar to Fussilat · 3 Surahs"],
 ["Ilayhi Yuraddu", "To Him it is referred", "Fussilat to Al-Jathiyah · 5 Surahs"],
 ["Ha Mim", "Ha, Mim · Quranic initials", "Al-Ahqaf to Adh-Dhariyat · 6 Surahs"],
 ["Qala Fa Ma Khatbukum", "He said, “Then what is your mission?”", "Adh-Dhariyat to Al-Hadid · 7 Surahs"],
 ["Qad Sami‘ Allah", "Allah has indeed heard", "Al-Mujadilah to At-Tahrim · 9 Surahs"],
 ["Tabarakalladhi", "Blessed is He who", "Al-Mulk to Al-Mursalat · 11 Surahs"],
 ["‘Amma", "About what?", "An-Naba to An-Nas · 37 Surahs"]
];
function appendParaTitle() {
 if (readingMode !== 'para') return;
 const index = Number(currentPara) - 1;
 const names = paraNames[index];
 const details = paraCardDetails[index];
 if (!names || !details) return;
 const [romanName, meaning, coverage] = details;
 const card = document.createElement('section');
 card.className = 'iq-para-title';
 const heading = document.createElement('h2');
 heading.className = 'iq-para-head';
 const number = document.createElement('span');
 number.className = 'iq-para-number';
 number.textContent = 'Para ' + String(currentPara).padStart(2,'0');
 const arabic = document.createElement('span');
 arabic.className = 'iq-para-ar';
 arabic.lang = 'ar';
 arabic.dir = 'rtl';
 arabic.textContent = names[0];
 heading.append(number,arabic,romanName);
 const detail = document.createElement('div');
 detail.className = 'iq-para-detail';
 const surahs = document.createElement('strong');
 surahs.textContent = coverage;
 detail.append(meaning,surahs);
 card.append(heading,detail);
 content.append(card);
}


// READIQ_SURAH_HEADING_V1
// READIQ_SURAH_HEADING_V2
const surahEnglishInfo = {"1": "Makki · Recitation order: 1 · Revelation order: 5 · Rukus: 1 · Verses: 7 · Para: 1", "2": "Madani · Recitation order: 2 · Revelation order: 87 · Rukus: 40 · Verses: 286 · Paras: 1, 2, 3", "3": "Madani · Recitation order: 3 · Revelation order: 89 · Rukus: 20 · Verses: 200 · Paras: 4, 3", "4": "Madani · Recitation order: 4 · Revelation order: 92 · Rukus: 24 · Verses: 176 · Paras: 4, 5, 6", "5": "Madani · Recitation order: 5 · Revelation order: 112 · Rukus: 16 · Verses: 120 · Paras: 6, 7", "6": "Madani · Recitation order: 6 · Revelation order: 55 · Rukus: 20 · Verses: 165 · Paras: 7, 8", "7": "Makki · Recitation order: 7 · Revelation order: 39 · Rukus: 24 · Verses: 206 · Paras: 8, 9", "8": "Makki · Recitation order: 8 · Revelation order: 88 · Rukus: 10 · Verses: 75 · Paras: 9, 10", "9": "Makki · Recitation order: 9 · Revelation order: 113 · Rukus: 16 · Verses: 129 · Paras: 10, 11", "10": "Makki · Recitation order: 10 · Revelation order: 51 · Rukus: 11 · Verses: 109 · Para: 11", "11": "Makki · Recitation order: 11 · Revelation order: 52 · Rukus: 10 · Verses: 123 · Paras: 11, 12", "12": "Makki · Recitation order: 12 · Revelation order: 53 · Rukus: 12 · Verses: 111 · Paras: 12, 13", "13": "Madani · Recitation order: 13 · Revelation order: 93 · Rukus: 6 · Verses: 43 · Para: 13", "14": "Makki · Recitation order: 14 · Revelation order: 72 · Rukus: 7 · Verses: 52 · Para: 13", "15": "Makki · Recitation order: 15 · Revelation order: 54 · Rukus: 6 · Verses: 99 · Paras: 14, 13", "16": "Makki · Recitation order: 16 · Revelation order: 70 · Rukus: 16 · Verses: 128 · Para: 14", "17": "Makki · Recitation order: 17 · Revelation order: 50 · Rukus: 12 · Verses: 111 · Para: 15", "18": "Makki · Recitation order: 18 · Revelation order: 69 · Rukus: 12 · Verses: 110 · Paras: 15, 16", "19": "Makki · Recitation order: 19 · Revelation order: 44 · Rukus: 6 · Verses: 98 · Para: 16", "20": "Makki · Recitation order: 20 · Revelation order: 45 · Rukus: 8 · Verses: 135 · Para: 16", "21": "Makki · Recitation order: 21 · Revelation order: 73 · Rukus: 7 · Verses: 112 · Para: 17", "22": "Madani · Recitation order: 22 · Revelation order: 103 · Rukus: 10 · Verses: 78 · Para: 17", "23": "Makki · Recitation order: 23 · Revelation order: 74 · Rukus: 6 · Verses: 118 · Para: 18", "24": "Madani · Recitation order: 24 · Revelation order: 102 · Rukus: 9 · Verses: 64 · Para: 18", "25": "Makki · Recitation order: 25 · Revelation order: 42 · Rukus: 6 · Verses: 77 · Paras: 18, 19", "26": "Makki · Recitation order: 26 · Revelation order: 47 · Rukus: 11 · Verses: 227 · Para: 19", "27": "Makki · Recitation order: 27 · Revelation order: 48 · Rukus: 7 · Verses: 93 · Paras: 19, 20", "28": "Makki · Recitation order: 28 · Revelation order: 49 · Rukus: 9 · Verses: 88 · Para: 20", "29": "Makki · Recitation order: 29 · Revelation order: 85 · Rukus: 7 · Verses: 69 · Paras: 20, 21", "30": "Makki · Recitation order: 30 · Revelation order: 84 · Rukus: 6 · Verses: 60 · Para: 21", "31": "Makki · Recitation order: 31 · Revelation order: 57 · Rukus: 4 · Verses: 34 · Para: 21", "32": "Makki · Recitation order: 32 · Revelation order: 75 · Rukus: 3 · Verses: 30 · Para: 21", "33": "Madani · Recitation order: 33 · Revelation order: 90 · Rukus: 9 · Verses: 73 · Paras: 21, 22", "34": "Makki · Recitation order: 34 · Revelation order: 58 · Rukus: 6 · Verses: 54 · Para: 22", "35": "Makki · Recitation order: 35 · Revelation order: 43 · Rukus: 5 · Verses: 45 · Para: 22", "36": "Makki · Recitation order: 36 · Revelation order: 41 · Rukus: 5 · Verses: 83 · Paras: 22, 23", "37": "Makki · Recitation order: 37 · Revelation order: 56 · Rukus: 5 · Verses: 182 · Para: 23", "38": "Makki · Recitation order: 38 · Revelation order: 38 · Rukus: 5 · Verses: 88 · Para: 23", "39": "Makki · Recitation order: 39 · Revelation order: 59 · Rukus: 8 · Verses: 75 · Paras: 23, 24", "40": "Makki · Recitation order: 40 · Revelation order: 60 · Rukus: 9 · Verses: 85 · Para: 24", "41": "Makki · Recitation order: 41 · Revelation order: 61 · Rukus: 6 · Verses: 54 · Paras: 24, 25", "42": "Makki · Recitation order: 42 · Revelation order: 62 · Rukus: 5 · Verses: 53 · Para: 25", "43": "Makki · Recitation order: 43 · Revelation order: 63 · Rukus: 7 · Verses: 89 · Para: 25", "44": "Makki · Recitation order: 44 · Revelation order: 64 · Rukus: 3 · Verses: 59 · Para: 25", "45": "Makki · Recitation order: 45 · Revelation order: 65 · Rukus: 4 · Verses: 37 · Para: 25", "46": "Makki · Recitation order: 46 · Revelation order: 66 · Rukus: 4 · Verses: 35 · Para: 26", "47": "Madani · Recitation order: 47 · Revelation order: 95 · Rukus: 4 · Verses: 38 · Para: 26", "48": "Madani · Recitation order: 48 · Revelation order: 111 · Rukus: 4 · Verses: 29 · Para: 26", "49": "Madani · Recitation order: 49 · Revelation order: 106 · Rukus: 2 · Verses: 18 · Para: 26", "50": "Makki · Recitation order: 50 · Revelation order: 34 · Rukus: 3 · Verses: 45 · Para: 26", "51": "Makki · Recitation order: 51 · Revelation order: 67 · Rukus: 3 · Verses: 60 · Paras: 26, 27", "52": "Makki · Recitation order: 52 · Revelation order: 76 · Rukus: 2 · Verses: 49 · Para: 27", "53": "Makki · Recitation order: 53 · Revelation order: 23 · Rukus: 3 · Verses: 62 · Para: 27", "54": "Makki · Recitation order: 54 · Revelation order: 37 · Rukus: 3 · Verses: 55 · Para: 27", "55": "Madani · Recitation order: 55 · Revelation order: 97 · Rukus: 3 · Verses: 78 · Para: 27", "56": "Makki · Recitation order: 56 · Revelation order: 46 · Rukus: 3 · Verses: 96 · Para: 27", "57": "Madani · Recitation order: 57 · Revelation order: 94 · Rukus: 4 · Verses: 29 · Para: 27", "58": "Madani · Recitation order: 58 · Revelation order: 105 · Rukus: 3 · Verses: 22 · Para: 28", "59": "Madani · Recitation order: 59 · Revelation order: 101 · Rukus: 3 · Verses: 24 · Para: 28", "60": "Madani · Recitation order: 60 · Revelation order: 91 · Rukus: 2 · Verses: 13 · Para: 28", "61": "Madani · Recitation order: 61 · Revelation order: 109 · Rukus: 2 · Verses: 14 · Para: 28", "62": "Madani · Recitation order: 62 · Revelation order: 110 · Rukus: 2 · Verses: 11 · Para: 28", "63": "Madani · Recitation order: 63 · Revelation order: 104 · Rukus: 2 · Verses: 11 · Para: 28", "64": "Madani · Recitation order: 64 · Revelation order: 108 · Rukus: 2 · Verses: 18 · Para: 28", "65": "Madani · Recitation order: 65 · Revelation order: 99 · Rukus: 2 · Verses: 12 · Para: 28", "66": "Madani · Recitation order: 66 · Revelation order: 107 · Rukus: 2 · Verses: 12 · Para: 28", "67": "Makki · Recitation order: 67 · Revelation order: 77 · Rukus: 2 · Verses: 30 · Para: 29", "68": "Makki · Recitation order: 68 · Revelation order: 2 · Rukus: 2 · Verses: 52 · Para: 29", "69": "Makki · Recitation order: 69 · Revelation order: 78 · Rukus: 2 · Verses: 52 · Para: 29", "70": "Makki · Recitation order: 70 · Revelation order: 79 · Rukus: 2 · Verses: 44 · Para: 29", "71": "Makki · Recitation order: 71 · Revelation order: 71 · Rukus: 2 · Verses: 28 · Para: 29", "72": "Makki · Recitation order: 72 · Revelation order: 40 · Rukus: 2 · Verses: 28 · Para: 29", "73": "Makki · Recitation order: 73 · Revelation order: 3 · Rukus: 2 · Verses: 20 · Para: 29", "74": "Makki · Recitation order: 74 · Revelation order: 4 · Rukus: 2 · Verses: 56 · Para: 29", "75": "Makki · Recitation order: 75 · Revelation order: 31 · Rukus: 2 · Verses: 40 · Para: 29", "76": "Madani · Recitation order: 76 · Revelation order: 98 · Rukus: 2 · Verses: 31 · Para: 29", "77": "Makki · Recitation order: 77 · Revelation order: 33 · Rukus: 2 · Verses: 50 · Para: 29", "78": "Makki · Recitation order: 78 · Revelation order: 80 · Rukus: 2 · Verses: 40 · Para: 30", "79": "Makki · Recitation order: 79 · Revelation order: 81 · Rukus: 2 · Verses: 46 · Para: 30", "80": "Makki · Recitation order: 80 · Revelation order: 24 · Rukus: 1 · Verses: 42 · Para: 30", "81": "Makki · Recitation order: 81 · Revelation order: 7 · Rukus: 1 · Verses: 29 · Para: 30", "82": "Makki · Recitation order: 82 · Revelation order: 82 · Rukus: 1 · Verses: 19 · Para: 30", "83": "Makki · Recitation order: 83 · Revelation order: 86 · Rukus: 1 · Verses: 36 · Para: 30", "84": "Makki · Recitation order: 84 · Revelation order: 83 · Rukus: 1 · Verses: 25 · Para: 30", "85": "Makki · Recitation order: 84 · Revelation order: 27 · Rukus: 1 · Verses: 22 · Para: 30", "86": "Makki · Recitation order: 86 · Revelation order: 36 · Rukus: 1 · Verses: 17 · Para: 30", "87": "Makki · Recitation order: 87 · Revelation order: 8 · Rukus: 1 · Verses: 19 · Para: 30", "88": "Makki · Recitation order: 88 · Revelation order: 68 · Rukus: 1 · Verses: 26 · Para: 30", "89": "Makki · Recitation order: 89 · Revelation order: 10 · Rukus: 1 · Verses: 30 · Para: 30", "90": "Makki · Recitation order: 90 · Revelation order: 35 · Rukus: 1 · Verses: 20 · Para: 30", "91": "Makki · Recitation order: 91 · Revelation order: 26 · Rukus: 1 · Verses: 15 · Para: 30", "92": "Makki · Recitation order: 92 · Revelation order: 9 · Rukus: 1 · Verses: 21 · Para: 30", "93": "Makki · Recitation order: 93 · Revelation order: 11 · Rukus: 1 · Verses: 11 · Para: 30", "94": "Makki · Recitation order: 94 · Revelation order: 12 · Rukus: 1 · Verses: 8 · Para: 30", "95": "Makki · Recitation order: 95 · Revelation order: 28 · Rukus: 1 · Verses: 8 · Para: 30", "96": "Makki · Recitation order: 96 · Revelation order: 1 · Rukus: 1 · Verses: 19 · Para: 30", "97": "Makki · Recitation order: 97 · Revelation order: 25 · Rukus: 1 · Verses: 5 · Para: 30", "98": "Makki · Recitation order: 98 · Revelation order: 100 · Rukus: 1 · Verses: 8 · Para: 30", "99": "Madani · Recitation order: 99 · Revelation order: 93 · Rukus: 1 · Verses: 8 · Para: 30", "100": "Makki · Recitation order: 100 · Revelation order: 14 · Rukus: 1 · Verses: 11 · Para: 30", "101": "Makki · Recitation order: 101 · Revelation order: 30 · Rukus: 1 · Verses: 11 · Para: 30", "102": "Makki · Recitation order: 102 · Revelation order: 16 · Rukus: 1 · Verses: 8 · Para: 30", "103": "Makki · Recitation order: 103 · Revelation order: 13 · Rukus: 1 · Verses: 3 · Para: 30", "104": "Makki · Recitation order: 104 · Revelation order: 32 · Rukus: 1 · Verses: 9 · Para: 30", "105": "Makki · Recitation order: 105 · Revelation order: 19 · Rukus: 1 · Verses: 5 · Para: 30", "106": "Makki · Recitation order: 106 · Revelation order: 29 · Rukus: 1 · Verses: 4 · Para: 30", "107": "Makki · Recitation order: 107 · Revelation order: 17 · Rukus: 1 · Verses: 7 · Para: 30", "108": "Makki · Recitation order: 108 · Revelation order: 15 · Rukus: 1 · Verses: 3 · Para: 30", "109": "Makki · Recitation order: 109 · Revelation order: 18 · Rukus: 1 · Verses: 6 · Para: 30", "110": "Makki · Recitation order: 110 · Revelation order: 114 · Rukus: 1 · Verses: 3 · Para: 30", "111": "Makki · Recitation order: 111 · Revelation order: 6 · Rukus: 1 · Verses: 5 · Para: 30", "112": "Makki · Recitation order: 112 · Revelation order: 22 · Rukus: 1 · Verses: 4 · Para: 30", "113": "Makki · Recitation order: 113 · Revelation order: 20 · Rukus: 1 · Verses: 5 · Para: 30", "114": "Makki · Recitation order: 114 · Revelation order: 21 · Rukus: 1 · Verses: 6 · Para: 30"};
const surahHeadingData = {"1": ["الْفَاتِحَة", "al-Fatihah — the Opening", "سورت : مکي    ،     ترتيب تلاوت : 1    ،       ترتيب نزولي : 5     ،       رکوع : 1     ،       آيات : 7      ،      پارہ نمبر : 1"], "2": ["البقرہ", "al-Baqarah — the Cow", "سورت : مدنی    ،     ترتيب تلاوت : 2     ،       ترتيب نزولي : 87     ،       رکوع : 40     ،       آيات : 286      ،      پارہ نمبر : 1, 2, 3"], "3": ["آل عِمْرَان", "Al-i-Imran — the Family of ‘Imrān", "سورت : مدنی    ،     ترتيب تلاوت :3     ،       ترتيب نزولي : 89     ،       رکوع :20      ،       آيات :200       ،      پارہ نمبر :4,3"], "4": ["النساء", "an-Nisa — Women", "سورت : مدنی    ،     ترتيب تلاوت : 4    ،       ترتيب نزولي : 92     ،       رکوع : 24     ،       آيات : 176      ،      پارہ نمبر : 4, 5, 6"], "5": ["الْمَآئِدَة", "al-Maidah — the Table spread", "سورت : مدنی    ،     ترتيب تلاوت : 5    ،       ترتيب نزولي : 112     ،       رکوع : 16     ،       آيات : 120      ،      پارہ نمبر : 6, 7"], "6": ["الْأَنْعَام", "al-Anam — the Cattle", "سورت : مدنی    ،     ترتيب تلاوت : 6    ،       ترتيب نزولي : 55     ،       رکوع : 20     ،       آيات : 165      ،      پارہ نمبر : 7, 8"], "7": ["الْأَعْرَاف", "al-Aaraf — the Heights", "سورت : مکی    ،     ترتيب تلاوت : 7    ،       ترتيب نزولي : 39     ،       رکوع : 24     ،       آيات : 206      ،      پارہ نمبر : 8, 9"], "8": ["الْأَنْفَال", "al-Anfal — Spoils of war", "سورت : مکی    ،     ترتيب تلاوت : 8    ،       ترتيب نزولي : 88     ،       رکوع : 10     ،       آيات : 75      ،      پارہ نمبر : 9, 10"], "9": ["التَّوْبَة", "at-Tawbah — Repentance", "سورت : مکی    ،     ترتيب تلاوت : 9    ،       ترتيب نزولي : 113     ،       رکوع : 16     ،       آيات : 129    ،      پارہ نمبر : 10, 11"], "10": ["يُوْنـُس", "Yunus — Jonah", "سورت : مکی    ،     ترتيب تلاوت : 10    ،       ترتيب نزولي : 51    ،       رکوع : 11     ،       آيات : 109      ،      پارہ نمبر : 11"], "11": ["هُوْد", "Hud — Hud", "سورت : مکی    ،     ترتيب تلاوت : 11    ،       ترتيب نزولي : 52    ،       رکوع : 10     ،       آيات : 123      ،      پارہ نمبر : 11 , 12"], "12": ["يُوْسُف", "Yusuf — Joseph", "سورت : مکی    ،     ترتيب تلاوت : 12    ،       ترتيب نزولي : 53    ،       رکوع : 12     ،       آيات : 111      ،      پارہ نمبر : 12 , 13"], "13": ["الرَّعْد", "ar-Rad — Thunder", "سورت : مدني    ،     ترتيب تلاوت : 13    ،       ترتيب نزولي : 93    ،       رکوع : 6     ،       آيات : 43      ،      پارہ نمبر : 13"], "14": ["إِبْرَاهِيْم", "Ibrahim — Abraham", "سورت : مکی    ،     ترتيب تلاوت : 14    ،       ترتيب نزولي : 72    ،       رکوع : 7     ،       آيات : 52      ،      پارہ نمبر : 13"], "15": ["الْحِجْر", "al-Hijr — the Rocky tract", "سورت : مکی    ،     ترتيب تلاوت : 15    ،       ترتيب نزولي : 54    ،       رکوع : 6     ،       آيات : 99      ،      پارہ نمبر :  14, 13"], "16": ["النَّحْل", "an-Nahl — the Bee", "سورت : مکی    ،     ترتيب تلاوت : 16    ،       ترتيب نزولي : 70    ،       رکوع : 16     ،       آيات : 128      ،      پارہ نمبر :  14"], "17": ["بَنِيْ إِسْرَآءِيْل", "al-Isra — the Night journey", "سورت : مکی    ،     ترتيب تلاوت : 17    ،       ترتيب نزولي : 50   ،       رکوع : 12     ،       آيات : 111      ،      پارہ نمبر :  15"], "18": ["الْكَهْف", "al-Kahf — the Cave", "سورت : مکی    ،     ترتيب تلاوت : 18    ،       ترتيب نزولي : 69   ،       رکوع : 12     ،       آيات : 110      ،      پارہ نمبر :  15, 16"], "19": ["مَرْيَم", "Maryam — Mary", "سورت : مکی    ،     ترتيب تلاوت : 19    ،       ترتيب نزولي : 44   ،       رکوع : 6     ،       آيات :  98      ،      پارہ نمبر : 16"], "20": ["طهٰ", "Taha — Ta-Ha", "سورت : مکی    ،     ترتيب تلاوت : 20    ،       ترتيب نزولي : 45   ،       رکوع : 8     ،       آيات : 135      ،      پارہ نمبر :  16"], "21": ["الْأَنْبِيَآء", "al-Ambiya — the Prophets", "سورت : مکی    ،     ترتيب تلاوت : 21    ،       ترتيب نزولي : 73   ،       رکوع : 7     ،       آيات : 112      ،      پارہ نمبر :  17"], "22": ["الْحَجّ", "al-Hajj — the Pilgrimage", "سورت : مدني    ،     ترتيب تلاوت : 22    ،       ترتيب نزولي : 103   ،       رکوع : 10     ،       آيات : 78      ،      پارہ نمبر :  17"], "23": ["الْمُؤْمِنُوْن", "al-Muminun — the Believers", "سورت : مکی    ،     ترتيب تلاوت : 23    ،       ترتيب نزولي : 74   ،       رکوع : 6     ،       آيات : 118      ،      پارہ نمبر  :  18  "], "24": ["النُّوْر", "an-Nur — the Light", "سورت : مدني    ،     ترتيب تلاوت : 24    ،       ترتيب نزولي : 102   ،       رکوع : 9     ،       آيات : 64      ،      پارہ نمبر : 18 "], "25": ["الْفُرْقَان", "al-Furqan — the Criterion", "سورت : مکی    ،     ترتيب تلاوت : 25    ،       ترتيب نزولي :  42   ،       رکوع : 6     ،       آيات : 77      ،      پارہ نمبر :  18, 19"], "26": ["الشُّعَرَآء", "ash-Shuara’ — the Poets", "سورت : مکی    ،     ترتيب تلاوت : 26    ،       ترتيب نزولي : 47   ،       رکوع : 11     ،       آيات : 227      ،      پارہ نمبر : 19 "], "27": ["النَّمْل", "an-Naml — the Ants", "سورت : مکی    ،     ترتيب تلاوت : 27    ،       ترتيب نزولي : 48   ،       رکوع : 7     ،       آيات : 93      ،      پارہ نمبر : 19, 20"], "28": ["الْقَصَص", "al-Qasas — the Narratives", "سورت : مکی    ،     ترتيب تلاوت : 28    ،       ترتيب نزولي : 49   ،       رکوع : 9     ،       آيات : 88      ،      پارہ نمبر :  20"], "29": ["الْعَنْکَبُوْت", "al-Ankabut — the Spider", "سورت : مکی    ،     ترتيب تلاوت : 29    ،       ترتيب نزولي : 85   ،       رکوع : 7     ،       آيات : 69      ،      پارہ نمبر :   20, 21"], "30": ["الرُّوْم", "ar-Rum — the Roman Empire", "سورت : مکی    ،     ترتيب تلاوت : 30    ،       ترتيب نزولي : 84   ،       رکوع : 6   ،       آيات : 60      ،      پارہ نمبر : 21"], "31": ["لُقْمَان", "Luqman — Luqman", "سورت : مکی    ،     ترتيب تلاوت : 31    ،       ترتيب نزولي : 57   ،       رکوع : 4   ،       آيات : 34      ،      پارہ نمبر : 21"], "32": ["السَّجْدَة", "as-Sajdah — Prostration", "سورت : مکی    ،     ترتيب تلاوت : 32    ،       ترتيب نزولي : 75   ،       رکوع : 3   ،       آيات : 30      ،      پارہ نمبر : 21"], "33": ["الْأَحْزَاب", "al-Ahzab — the Confederates", "سورت : مدني    ،     ترتيب تلاوت : 33    ،       ترتيب نزولي : 90   ،       رکوع : 9   ،       آيات : 73      ،      پارہ نمبر :  21, 22"], "34": ["سَبـَا", "Saba — Sheba", "سورت : مکي    ،     ترتيب تلاوت : 34    ،       ترتيب نزولي : 58   ،       رکوع : 6   ،       آيات : 54      ،      پارہ نمبر : 22"], "35": ["فَاطِر", "Fatir — the Originator", "سورت : مکي    ،     ترتيب تلاوت : 35    ،       ترتيب نزولي : 43   ،       رکوع : 5   ،       آيات : 45      ،      پارہ نمبر : 22"], "36": ["يٰس", "Yasīn — Ya-Sin", "سورت : مکي    ،     ترتيب تلاوت : 36    ،       ترتيب نزولي : 41   ،       رکوع : 5   ،       آيات : 83      ،      پارہ نمبر : 22, 23"], "37": ["الصَّافَّات", "as-Saffat — Those ranged in ranks", "سورت : مکي    ،     ترتيب تلاوت : 37    ،       ترتيب نزولي : 56   ،       رکوع : 5   ،       آيات : 182      ،      پارہ نمبر : 23"], "38": ["ص", "Sad — Sad", "سورت : مکي    ،     ترتيب تلاوت : 38    ،       ترتيب نزولي : 38   ،       رکوع : 5   ،       آيات : 88      ،      پارہ نمبر : 23"], "39": ["الزُّمَر", "az-Zumar — the Crowds", "سورت : مکي    ،     ترتيب تلاوت : 39    ،       ترتيب نزولي : 59   ،       رکوع : 8   ،       آيات : 75      ،      پارہ نمبر : 23, 24"], "40": ["غَافِر  - الْمُؤْمِن", "Ghafir — The Forgiving", "سورت : مکي    ،     ترتيب تلاوت : 40    ،       ترتيب نزولي : 60   ،       رکوع : 9   ،       آيات : 85      ،      پارہ نمبر : 24"], "41": ["فُصِّلَت - حٰم السَّجْدَة", "Fussilat — Clearly spelled out", "سورت : مکي    ،     ترتيب تلاوت : 41    ،       ترتيب نزولي : 61   ،       رکوع : 6   ،       آيات : 54      ،      پارہ نمبر :  24, 25"], "42": ["الشُّوْرٰی", "ash-Shura — the Consultation", "سورت : مکي    ،     ترتيب تلاوت : 42    ،       ترتيب نزولي : 62   ،       رکوع : 5   ،       آيات : 53      ،      پارہ نمبر : 25"], "43": ["الزُّخْرُف", "az-Zukhruf — Ornaments of gold", "سورت : مکي    ،     ترتيب تلاوت : 43    ،       ترتيب نزولي : 63   ،       رکوع : 7   ،       آيات : 89      ،      پارہ نمبر : 25"], "44": ["الدُّخَان", "ad-Dukhan — Smoke", "سورت : مکي    ،     ترتيب تلاوت : 44    ،       ترتيب نزولي : 64   ،       رکوع : 3   ،       آيات : 59      ،      پارہ نمبر : 25"], "45": ["الْجَاثِيَة", "al-Jathiyah — the Kneeling", "سورت : مکي    ،     ترتيب تلاوت : 45    ،       ترتيب نزولي : 65   ،       رکوع : 4   ،       آيات : 37      ،      پارہ نمبر : 25"], "46": ["الْأَحْقَاف", "al-Ahqaf — the Sand-dunes", "سورت : مکي    ،     ترتيب تلاوت : 46    ،       ترتيب نزولي : 66   ،       رکوع : 4   ،       آيات : 35      ،      پارہ نمبر : 26"], "47": ["مُحَمَّد", "Muhammad — Muhammad", "سورت : مدني    ،     ترتيب تلاوت : 47    ،       ترتيب نزولي : 95   ،       رکوع : 4   ،       آيات : 38      ،      پارہ نمبر : 26"], "48": ["الْفَتْح", "al-Fath — Victory", "سورت : مدني    ،     ترتيب تلاوت : 48    ،       ترتيب نزولي : 111   ،       رکوع : 4   ،       آيات : 29      ،      پارہ نمبر : 26"], "49": ["الْحُجُرَات", "al-Hujurat — The Apartments", "سورت : مدني    ،     ترتيب تلاوت : 49    ،       ترتيب نزولي : 106   ،       رکوع : 2   ،       آيات : 18      ،      پارہ نمبر : 26"], "50": ["ق", "Qaf — Qaf", "سورت : مکي    ،     ترتيب تلاوت : 50    ،       ترتيب نزولي : 34   ،       رکوع : 3   ،       آيات : 45      ،      پارہ نمبر : 26"], "51": ["الذَّارِيَات", "adh-Dhariyāt — the Scattering winds", "سورت : مکي    ،     ترتيب تلاوت : 51    ،       ترتيب نزولي : 67   ،       رکوع : 3   ،       آيات : 60      ،      پارہ نمبر :  26, 27"], "52": ["الطُّوْر", "at-Tur — Mount Sinai", "سورت : مکي    ،     ترتيب تلاوت : 52    ،       ترتيب نزولي : 76   ،       رکوع : 2   ،       آيات : 49      ،      پارہ نمبر :  27"], "53": ["النَّجْم", "an-Najm — the Star", "سورت : مکي    ،     ترتيب تلاوت : 53    ،       ترتيب نزولي : 23   ،       رکوع : 3   ،       آيات : 62      ،      پارہ نمبر :  27"], "54": ["الْقَمَر", "al-Qamar — the Moon", "سورت : مکي    ،     ترتيب تلاوت : 54    ،       ترتيب نزولي : 37   ،       رکوع : 3   ،       آيات : 55      ،      پارہ نمبر :  27"], "55": ["الرَّحْمٰن", "ar-Rahman — the Most Merciful", "سورت : مدني    ،     ترتيب تلاوت : 55    ،       ترتيب نزولي : 97   ،       رکوع : 3   ،       آيات : 78      ،      پارہ نمبر :  27"], "56": ["الْوَاقِعَة", "al-Waqiah — the Inevitable event", "سورت : مکي    ،     ترتيب تلاوت : 56    ،       ترتيب نزولي : 46   ،       رکوع : 3   ،       آيات : 96      ،      پارہ نمبر :  27"], "57": ["الْحَدِيْد", "al-Hadid — Iron", "سورت : مدني    ،     ترتيب تلاوت : 57    ،       ترتيب نزولي : 94   ،       رکوع : 4   ،       آيات : 29      ،      پارہ نمبر :  27"], "58": ["الْمُجَادَلَة", "al-Mujadalah — the Quarrel", "سورت : مدني    ،     ترتيب تلاوت : 58    ،       ترتيب نزولي : 105   ،       رکوع : 3   ،       آيات : 22      ،      پارہ نمبر :  28"], "59": ["الْحَشْر", "al-Hashr — the Gathering", "سورت : مدني    ،     ترتيب تلاوت : 59    ،       ترتيب نزولي : 101   ،       رکوع : 3   ،       آيات : 24      ،      پارہ نمبر :  28"], "60": ["الْمُمْتَحِنَة", "al-Mumtahinah — the Woman to be examined", "سورت : مدني    ،     ترتيب تلاوت : 60    ،       ترتيب نزولي : 91   ،       رکوع : 2   ،       آيات : 13      ،      پارہ نمبر :  28"], "61": ["الصَّفّ", "as-Saff — Battle array", "سورت : مدني    ،     ترتيب تلاوت : 61    ،       ترتيب نزولي : 109   ،       رکوع : 2   ،       آيات : 14      ،      پارہ نمبر :  28"], "62": ["الْجُمُعَة", "al-Jumuah — Friday, the Congregation", "سورت : مدني    ،     ترتيب تلاوت : 62    ،       ترتيب نزولي : 110   ،       رکوع : 2   ،       آيات : 11      ،      پارہ نمبر :  28"], "63": ["الْمُنَافِقُوْن", "al-Munafiqun — the Hypocrites", "سورت : مدني    ،     ترتيب تلاوت : 63    ،       ترتيب نزولي : 104   ،       رکوع : 2   ،       آيات : 11      ،      پارہ نمبر :  28"], "64": ["التَّغَابُن", "at-Taghabun — Mutual loss and gain", "سورت : مدني    ،     ترتيب تلاوت : 64    ،       ترتيب نزولي : 108   ،       رکوع : 2   ،       آيات : 18      ،      پارہ نمبر :  28"], "65": ["الطَّلاَق", "at-Talaq — Divorce", "سورت : مدني    ،     ترتيب تلاوت : 65    ،       ترتيب نزولي : 99   ،       رکوع : 2   ،       آيات : 12      ،      پارہ نمبر :  28"], "66": ["التَّحْرِيْم", "at-Tahrim — Prohibition", "سورت : مدني    ،     ترتيب تلاوت : 66    ،       ترتيب نزولي : 107   ،       رکوع : 2   ،       آيات : 12 ،      پارہ نمبر :  28"], "67": ["الْمُلْک", "al-Mulk — Dominion", "سورت : مکي    ،     ترتيب تلاوت : 67    ،       ترتيب نزولي : 77   ،       رکوع : 2   ،       آيات : 30 ،      پارہ نمبر :  29"], "68": ["الْقَلَم", "al-Qalam — the Pen", "سورت : مکي    ،     ترتيب تلاوت : 68    ،       ترتيب نزولي : 2   ،       رکوع : 2   ،       آيات : 52 ،      پارہ نمبر :  29"], "69": ["الْحَآقَّة", "al-Haqqah — the Concrete reality", "سورت : مکي    ،     ترتيب تلاوت : 69    ،       ترتيب نزولي : 78   ،       رکوع : 2   ،       آيات : 52 ،      پارہ نمبر :  29"], "70": ["الْمَعَارِج", "al-Maarij — the Ways of ascent", "سورت : مکي    ،     ترتيب تلاوت : 70    ،       ترتيب نزولي : 79   ،       رکوع : 2   ،       آيات : 44     ،         پارہ نمبر :  29"], "71": ["نُوْح", "Nuh — Noah", "سورت : مکي    ،     ترتيب تلاوت : 71    ،       ترتيب نزولي : 71   ،       رکوع : 2   ،       آيات : 28     ،         پارہ نمبر :  29"], "72": ["الْجِنّ", "al-Jinn — the Jinn", "سورت : مکي    ،     ترتيب تلاوت : 72    ،       ترتيب نزولي : 40   ،       رکوع : 2   ،       آيات : 28     ،         پارہ نمبر :  29"], "73": ["الْمُزَّمِّل", "al-Muzzammil — Folded in garments", "سورت : مکي    ،     ترتيب تلاوت : 73    ،       ترتيب نزولي : 3   ،       رکوع : 2   ،       آيات : 20     ،         پارہ نمبر :  29"], "74": ["الْمُدَّثِّر", "al-Muddaththir — the Enwrapped", "سورت : مکي    ،     ترتيب تلاوت : 74    ،       ترتيب نزولي : 4   ،       رکوع : 2   ،       آيات : 56     ،         پارہ نمبر :  29"], "75": ["الْقِيَامَة", "al-Qiyamah — the Resurrection", "سورت : مکي    ،     ترتيب تلاوت : 75    ،       ترتيب نزولي : 31   ،       رکوع : 2   ،       آيات : 40     ،         پارہ نمبر :  29"], "76": ["الْإِنْسَان - الدَّهْر", "al-Insan — Man", "سورت : مدني    ،     ترتيب تلاوت : 76    ،       ترتيب نزولي : 98   ،       رکوع : 2   ،       آيات : 31     ،         پارہ نمبر :  29"], "77": ["الْمُرْسَلاَت", "al-Mursalat — the Emissaries", "سورت : مکي    ،     ترتيب تلاوت : 77    ،       ترتيب نزولي : 33   ،       رکوع : 2   ،       آيات : 50     ،         پارہ نمبر :  29"], "78": ["النَّبَا", "an-Naba — the News", "سورت : مکي    ،     ترتيب تلاوت : 78    ،       ترتيب نزولي : 80   ،       رکوع : 2   ،       آيات : 40     ،         پارہ نمبر :  30"], "79": ["النَّازِعَات", "an-Naziat — Those who pull", "سورت : مکي    ،     ترتيب تلاوت : 79    ،       ترتيب نزولي : 81   ،       رکوع : 2   ،       آيات : 46     ،         پارہ نمبر :  30"], "80": ["عَبَسَ", "Abasa — He frowned", "سورت : مکي    ،     ترتيب تلاوت : 80    ،       ترتيب نزولي : 24   ،       رکوع : 1   ،       آيات : 42     ،         پارہ نمبر :  30"], "81": ["التَّکْوِيْر", "at-Takwir — Shrouding in darkness", "سورت : مکي    ،     ترتيب تلاوت : 81    ،       ترتيب نزولي : 7   ،       رکوع : 1   ،       آيات : 29     ،         پارہ نمبر :  30"], "82": ["الْإِنْفِطَار", "al-Infitar — the Cleaving asunder", "سورت : مکي    ،     ترتيب تلاوت : 82    ،       ترتيب نزولي : 82   ،       رکوع : 1   ،       آيات : 19     ،         پارہ نمبر :  30"], "83": ["الْمُطَفِّفِيْن", "al-Mutaffifin — Dealing in fraud", "سورت : مکي    ،     ترتيب تلاوت : 83    ،       ترتيب نزولي : 86   ،       رکوع : 1   ،       آيات : 36     ،         پارہ نمبر :  30"], "84": ["الْإِنْشِقَاق", "al-Inshiqaq — the Splitting asunder", "سورت : مکي    ،     ترتيب تلاوت : 84    ،       ترتيب نزولي : 83   ،       رکوع : 1   ،       آيات : 25     ،         پارہ نمبر :  30"], "85": ["الْبُرُوْج", "al-Buruj — the Zodiac", "سورت : مکي    ،     ترتيب تلاوت : 84    ،       ترتيب نزولي : 27   ،       رکوع : 1   ،       آيات : 22     ،         پارہ نمبر :  30"], "86": ["الطَّارِق", "at-Tariq — That which seems at night", "سورت : مکي    ،     ترتيب تلاوت : 86    ،       ترتيب نزولي : 36   ،       رکوع : 1   ،       آيات : 17     ،         پارہ نمبر :  30"], "87": ["الْأَعْلیٰ", "al-Ala — the Most High", "سورت : مکي    ،     ترتيب تلاوت : 87    ،       ترتيب نزولي : 8   ،       رکوع : 1   ،       آيات : 19     ،         پارہ نمبر :  30"], "88": ["الْغَاشِيَة", "al-Ghashiyah — the Overwhelming event", "سورت : مکي    ،     ترتيب تلاوت : 88    ،       ترتيب نزولي : 68   ،       رکوع : 1   ،       آيات : 26     ،         پارہ نمبر :  30"], "89": ["الْفَجْر", "al-Fajr — the Dawn", "سورت : مکي    ،     ترتيب تلاوت : 89    ،       ترتيب نزولي : 10   ،       رکوع : 1   ،       آيات : 30     ،         پارہ نمبر :  30"], "90": ["الْبَلَد", "al-Balad — the City", "سورت : مکي    ،     ترتيب تلاوت : 90    ،       ترتيب نزولي : 35   ،       رکوع : 1   ،       آيات : 20     ،         پارہ نمبر :  30"], "91": ["الشَّمْس", "ash-Shams — the Sun", "سورت : مکي    ،     ترتيب تلاوت : 91    ،       ترتيب نزولي : 26   ،       رکوع : 1   ،       آيات : 15     ،         پارہ نمبر :  30"], "92": ["اللَّيْل", "al-Layl — the Night", "سورت : مکي    ،     ترتيب تلاوت : 92    ،       ترتيب نزولي : 9   ،       رکوع : 1   ،       آيات : 21     ،         پارہ نمبر :  30"], "93": ["الضُّحٰی", "ad-Duha — the Forenoon", "سورت : مکي    ،     ترتيب تلاوت : 93    ،       ترتيب نزولي : 11   ،       رکوع : 1   ،       آيات : 11     ،         پارہ نمبر :  30"], "94": ["الشَّرْح", "ash-Sharh — the Opening up", "سورت : مکي    ،     ترتيب تلاوت : 94     ،       ترتيب نزولي : 12     ،       رکوع : 1     ،       آيات : 8      ،      پارہ نمبر : 30"], "95": ["التِّيْن", "at-Tin — the Fig", "سورت : مکي    ،     ترتيب تلاوت : 95     ،       ترتيب نزولي : 28     ،       رکوع : 1     ،       آيات : 8      ،      پارہ نمبر : 30"], "96": ["الْعَلَق", "al-Alaq — the Hanging mass", "سورت : مکي    ،     ترتيب تلاوت : 96     ،       ترتيب نزولي : 1     ،       رکوع : 1     ،       آيات : 19      ،      پارہ نمبر : 30"], "97": ["الْقَدْر", "al-Qadr — Determination", "سورت : مکي    ،     ترتيب تلاوت : 97     ،       ترتيب نزولي : 25     ،       رکوع : 1     ،       آيات : 5      ،      پارہ نمبر : 30"], "98": ["الْبَـيِّـنَة", "al-Bayyinah — the Clear evidence", "سورت : مکي    ،     ترتيب تلاوت : 98     ،       ترتيب نزولي : 100     ،       رکوع : 1     ،       آيات : 8      ،      پارہ نمبر : 30"], "99": ["الزَّلْزَلَة", "az-Zalzalah — the Earthquake", "سورت : مدني    ،     ترتيب تلاوت : 99     ،       ترتيب نزولي : 93     ،       رکوع : 1     ،       آيات : 8      ،      پارہ نمبر : 30"], "100": ["الْعَادِيَات", "al-Adiyat — Those that run", "سورت : مکي    ،     ترتيب تلاوت : 100     ،       ترتيب نزولي : 14     ،       رکوع : 1     ،       آيات : 11      ،      پارہ نمبر : 30"], "101": ["الْقَارِعَة", "al-Qariah — Rattling violent jerk and thunder", "سورت : مکي    ،     ترتيب تلاوت : 101     ،       ترتيب نزولي : 30     ،       رکوع : 1     ،       آيات : 11      ،      پارہ نمبر : 30"], "102": ["التَّکَاثُر", "at-Takathur — Piling up", "سورت : مکي    ،     ترتيب تلاوت : 102     ،       ترتيب نزولي : 16     ،       رکوع : 1     ،       آيات : 8      ،      پارہ نمبر : 30"], "103": ["الْعَصْر", "al-Asr — the Time", "سورت : مکي    ،     ترتيب تلاوت : 103     ،       ترتيب نزولي : 13     ،       رکوع : 1     ،       آيات : 3      ،      پارہ نمبر : 30"], "104": ["الْهُمَزَة", "al-Humazah — the Slanderer", "سورت : مکي    ،     ترتيب تلاوت : 104     ،       ترتيب نزولي : 32     ،       رکوع : 1     ،       آيات : 9      ،      پارہ نمبر : 30"], "105": ["الْفِيل", "al-Fil — the Elephant", "سورت : مکي    ،     ترتيب تلاوت : 105     ،       ترتيب نزولي : 19     ،       رکوع : 1     ،       آيات : 5      ،      پارہ نمبر : 30"], "106": ["قُرَيْش", "al-Quraysh — Quraish", "سورت : مکي    ،     ترتيب تلاوت : 106     ،       ترتيب نزولي : 29     ،       رکوع : 1     ،       آيات : 4      ،      پارہ نمبر : 30"], "107": ["الْمَاعُوْن", "al-Maun — Things of common use", "سورت : مکي    ،     ترتيب تلاوت : 107     ،       ترتيب نزولي : 17     ،       رکوع : 1     ،       آيات : 7      ،      پارہ نمبر : 30"], "108": ["الْکَوْثَر", "al-Kawthar — the Abundance", "سورت : مکي    ،     ترتيب تلاوت : 108     ،       ترتيب نزولي : 15     ،       رکوع : 1     ،       آيات : 3      ،      پارہ نمبر : 30"], "109": ["الْکَافِرُوْن", "al-Kafirun — the Unbelievers", "سورت : مکي    ،     ترتيب تلاوت : 109     ،       ترتيب نزولي : 18     ،       رکوع : 1     ،       آيات : 6      ،      پارہ نمبر : 30"], "110": ["النَّصْر", "an-Nasr — Help", "سورت : مکي    ،     ترتيب تلاوت : 110     ،       ترتيب نزولي : 114     ،       رکوع : 1     ،       آيات : 3      ،      پارہ نمبر : 30"], "111": ["الْمَسَد-اللَّهَب", "al-masad — the Twisted strands", "سورت : مکي    ،     ترتيب تلاوت : 111     ،       ترتيب نزولي : 6     ،       رکوع : 1     ،       آيات : 5      ،      پارہ نمبر : 30"], "112": ["الْإِخْلاَص", "al-Ikhlas — Purity", "سورت : مکي    ،     ترتيب تلاوت : 112     ،       ترتيب نزولي : 22     ،       رکوع : 1     ،       آيات : 4      ،      پارہ نمبر : 30"], "113": ["الْفَلَق", "al-Falaq — the Fission", "سورت : مکي    ،     ترتيب تلاوت : 113     ،       ترتيب نزولي : 20     ،       رکوع : 1     ،       آيات : 5      ،      پارہ نمبر : 30"], "114": ["النَّاس", "al-Nas — Men", "سورت : مکي    ،     ترتيب تلاوت : 114     ،       ترتيب نزولي : 21     ،       رکوع : 1     ،       آيات : 6      ،      پارہ نمبر : 30"]};
function appendSurahHeading(code) {
 const match = /^P\d+[-–]S(\d+)[-–]0*1$/u.exec(code);
 if (!match) return;
 const number = Number(match[1]);
 const data = surahHeadingData[number];
 if (!data) return;
 const [arabic, title, info] = data;
 const heading = document.createElement('details');
 heading.className = 'iq-surah-heading';
 const summary = document.createElement('summary');
 const name = document.createElement('span');
 name.className = 'iq-surah-name';
 name.dir = 'ltr';
 const arabicName = document.createElement('bdi');
 arabicName.lang = 'ar';
 arabicName.dir = 'rtl';
 arabicName.textContent = arabic;
 
 const [romanTitle, ...meaningParts] = title.split(' — ');
 const roman = document.createElement('span');
 roman.className = 'iq-surah-roman';
 roman.textContent = romanTitle;
 const meaning = document.createElement('span');
 meaning.className = 'iq-surah-meaning';
 meaning.textContent = meaningParts.join(' — ');
 const badge = document.createElement('span');
 badge.className = 'iq-surah-number';
 badge.textContent = String(number).padStart(2,'0');
 // READIQ_JADE_BANNER_V1
 arabicName.className = 'iq-surah-ar';
 const icon = document.createElement('span');
 icon.className = 'iq-surah-info-icon';
 icon.textContent = 'i';
 const description = document.createElement('span');
 description.className = 'iq-surah-sr';
 description.textContent = ' — Surah information';
 name.append(badge, roman, meaning, icon);
 summary.append(arabicName, name, description);
 const details = document.createElement('div');
 details.className = 'iq-surah-info';
 details.lang = 'ur';
 details.dir = 'rtl';
 details.textContent = info;
 
 const english = document.createElement('div');
 english.className = 'iq-surah-info-en';
 english.lang = 'en';
 english.dir = 'ltr';
 english.textContent = surahEnglishInfo[number];
 heading.append(summary, details, english);
 content.append(heading);
}

function render(){updateLanguageRow();if(readingMode==='asma'){renderAsma();return}content.classList.remove('asma-mode');if(readingMode==='about'){renderAbout();return}content.classList.remove('about-mode');const langs=selectedLanguages();content.replaceChildren();document.getElementById('languageSummary').textContent=langs.map(k=>({ar:'Arabic',ur:'Urdu',en:'English'})[k]).join(' · ');document.getElementById('fileCount').textContent=verses.length+' VERSES';
appendSurahHeading(verses[0]?.code);
if(window.ReadIQBismillah.applies(verses[0]?.code,true))content.append(window.ReadIQBismillah.block());
appendParaTitle();
if(!langs.length){const p=document.createElement('p');p.className='empty';p.textContent='Choose Arabic, Urdu or English from Library.';content.append(p);return}
if(!verses.length){const p=document.createElement('p');p.className='empty';p.textContent='Choose a quarter from Library to begin reading.';content.append(p);return}
for(const [index,v] of verses.entries()){
if(index>0)appendSurahHeading(v.code);
if(index>0 && window.ReadIQBismillah.applies(v.code))content.append(window.ReadIQBismillah.block());
const section=document.createElement('section');section.className='verse';section.setAttribute('aria-label',v.code);const code=document.createElement('div');code.className='verse-code';code.dir='ltr';code.textContent=v.code;section.append(code);for(const k of ['ar','ur','en']){if(!langs.includes(k))continue;const p=document.createElement('p');p.className='verse-'+k;p.lang=k;p.dir=k==='en'?'ltr':'rtl';p.textContent=k==='ar'?cleanArabicEnd(v[k]):cleanTranslationMarkers(v[k]);section.append(p)}content.append(section)}highlight();}
function highlight(){content.querySelectorAll('mark').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));content.normalize();const term=search.value.trim();if(!term)return;const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),nodes=[];let node;while(node=walker.nextNode())if(node.nodeValue.toLowerCase().includes(term.toLowerCase()))nodes.push(node);for(const n of nodes){const raw=n.nodeValue,frag=document.createDocumentFragment();let pos=0,at;while((at=raw.toLowerCase().indexOf(term.toLowerCase(),pos))!==-1){frag.append(document.createTextNode(raw.slice(pos,at)));const m=document.createElement('mark');m.className='match';m.textContent=raw.slice(at,at+term.length);frag.append(m);pos=at+term.length}frag.append(document.createTextNode(raw.slice(pos)));n.replaceWith(frag)}}
checks.forEach(c=>c.onchange=()=>{save('readiq-languages',selectedLanguages());render()});search.oninput=()=>{highlight();content.querySelector('mark')?.scrollIntoView({block:'center',behavior:'smooth'})};
async function openFile(file){window.ReadIQWordByWord?.hide();window.ReadIQPractice?.hide();clearAsmaHash();readingMode='quarter';save('readiq-mode','quarter');selected=file;save('readiq-selected',file.id);renderLibrary();renderParasMenu();renderSurahsMenu();const n=++token;verses=[];search.value='';title.textContent='Para-'+String(file.para).padStart(2,'0')+' · '+file.label;content.textContent='Opening quarter…';try{const r=await fetch(file.url,{cache:'no-store'});if(!r.ok)throw Error('Cannot open quarter');const data=await r.json();if(n!==token)return;verses=data.verses;render();document.getElementById('status').textContent=verses.length+' verses in this quarter'}catch(e){if(n===token)content.textContent=e.message}}
async function refresh(){if(polling)return;polling=true;try{const r=await fetch('library.json',{cache:'no-store'});if(!r.ok)throw Error('Library unavailable');const next=await r.json();if(next.revision===revision)return;catalogue=next;revision=next.revision;renderLibrary();renderParasMenu();renderSurahsMenu();const id=selected?.id||saved('readiq-selected',null),chosen=catalogue.files.find(f=>f.id===id)||catalogue.files[0];if(readingMode==='asma')openAsma(asmaKind);else if(readingMode==='about')await openAbout();else if(readingMode==='surah')await openSurah(currentSurah);else if(readingMode==='para')await openPara(currentPara);else if(chosen)await openFile(chosen);else{selected=null;verses=[];++token;title.textContent='Irfan-ul-Quran';render();document.getElementById('status').textContent='Add quarter files to begin'}}catch{document.getElementById('status').textContent='Library unavailable. Please refresh.'}finally{polling=false}}
let font=Number(saved('readiq-font',31));if(!Number.isFinite(font))font=31;
function setFont(v){font=Math.max(18,Math.min(72,Number(v)));document.documentElement.style.setProperty('--size',font+'px');slider.value=font;fontValue.textContent=font+'px';save('readiq-font',font)}
setFont(font);slider.oninput=()=>setFont(slider.value);document.getElementById('minus').onclick=()=>setFont(font-2);document.getElementById('plus').onclick=()=>setFont(font+2);document.getElementById('reset').onclick=()=>setFont(31);
document.getElementById('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch{document.getElementById('status').textContent='Full screen is unavailable in this browser.'}};
// READIQ_SETTINGS_PANEL_V1
const settings=document.getElementById('mobileToolsButton');
const settingsPanel=document.getElementById('readingSettingsPanel');
document.addEventListener('pointerdown',event=>{
 if(!settingsPanel.hidden&&!settingsPanel.contains(event.target)&&!settings.contains(event.target))tools(false);
});
header.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&!settingsPanel.hidden){
  tools(false);
  settings.focus();
 }
},{capture:true});function tools(open){settingsPanel.hidden=!open;settings.setAttribute('aria-expanded',String(open));requestAnimationFrame(positionMenu)}settings.onclick=()=>{setFileMenu(false);tools(settings.getAttribute('aria-expanded')!=='true')};
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
const paraList=document.createElement('div');paraList.className='para-list';paraMenu.append(paraList);document.body.append(paraMenu);
function positionParas(){const box=exploreAnchor(paraToggle).getBoundingClientRect(),width=Math.min(560,innerWidth-28);paraMenu.style.left=Math.max(14,Math.min(box.left,innerWidth-width-14))+'px';paraMenu.style.top=Math.ceil(header.getBoundingClientRect().bottom)+6+'px'}
function showParaMenu(open){paraMenu.hidden=!open;paraToggle.setAttribute('aria-expanded',String(open));if(open){setFileMenu(false);tools(false);positionParas()}}
paraToggle.onclick=()=>showParaMenu(paraMenu.hidden);
fileToggle.addEventListener('click',()=>showParaMenu(false));settings.addEventListener('click',()=>showParaMenu(false));
document.addEventListener('pointerdown',e=>{if(!paraMenu.contains(e.target)&&!paraToggle.contains(e.target))showParaMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!paraMenu.hidden){showParaMenu(false);paraToggle.focus()}});
window.addEventListener('resize',positionParas);new ResizeObserver(positionParas).observe(header);
function renderParasMenu(){paraList.replaceChildren();paraNames.forEach(([arabic,roman],i)=>{const para=i+1;const complete=[1,2,3,4].every(q=>catalogue.files.some(f=>f.para===para&&f.quarter===q));const b=document.createElement('button');b.type='button';b.className='para-option'+(readingMode==='para'&&currentPara===para?' active':'');b.disabled=!complete;const top=document.createElement('span');top.className='para-option-title';const num=document.createElement('span');num.textContent=String(para).padStart(2,'0')+' · ';const ar=document.createElement('span');ar.lang='ar';ar.dir='rtl';ar.textContent=arabic;top.append(num,ar);const bottom=document.createElement('small');bottom.textContent=roman;b.append(top,bottom);if(!complete)b.title='All four quarter files are required';b.onclick=()=>{showParaMenu(false);openPara(para);window.scrollTo({top:0,behavior:'smooth'})};paraList.append(b)})}
async function openPara(para){window.ReadIQWordByWord?.hide();window.ReadIQPractice?.hide();clearAsmaHash();
 const n=++token;readingMode='para';currentPara=para;selected={para,id:'para-'+para};save('readiq-mode','para');save('readiq-para',para);renderLibrary();renderParasMenu();renderSurahsMenu();verses=[];search.value='';title.textContent='Para-'+String(para).padStart(2,'0')+' · '+(paraNames[para-1]?.[0]||'')+' · Complete Para';content.replaceChildren();appendParaTitle();content.append('Opening all four quarters…');document.getElementById('fileCount').textContent='0 VERSES';
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
const surahList=document.createElement('div');surahList.className='surah-list';surahMenu.append(surahList);document.body.append(surahMenu);
function positionSurahs(){const box=exploreAnchor(surahToggle).getBoundingClientRect(),width=Math.min(560,innerWidth-28);surahMenu.style.left=Math.max(14,Math.min(box.left,innerWidth-width-14))+'px';surahMenu.style.top=Math.ceil(header.getBoundingClientRect().bottom)+6+'px'}
function showSurahMenu(open){surahMenu.hidden=!open;surahToggle.setAttribute('aria-expanded',String(open));if(open){setFileMenu(false);showParaMenu(false);tools(false);positionSurahs()}}
surahToggle.onclick=()=>showSurahMenu(surahMenu.hidden);
fileToggle.addEventListener('click',()=>showSurahMenu(false));paraToggle.addEventListener('click',()=>showSurahMenu(false));settings.addEventListener('click',()=>showSurahMenu(false));
document.addEventListener('pointerdown',e=>{if(!surahMenu.contains(e.target)&&!surahToggle.contains(e.target))showSurahMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!surahMenu.hidden){showSurahMenu(false);surahToggle.focus()}});
window.addEventListener('resize',positionSurahs);new ResizeObserver(positionSurahs).observe(header);
function renderSurahsMenu(){surahList.replaceChildren();surahNames.forEach(([roman,urdu],i)=>{const number=i+1,entry=catalogue.surahs?.find(s=>s.number===number);const b=document.createElement('button');b.type='button';b.className='surah-option'+(readingMode==='surah'&&currentSurah===number?' active':'');b.disabled=!entry?.complete;const top=document.createElement('span');top.className='surah-option-title';top.textContent=String(number).padStart(3,'0')+' · '+roman;const bottom=document.createElement('small');bottom.lang='ur';bottom.dir='rtl';bottom.textContent=urdu;b.append(top,bottom);if(!entry?.complete){b.title=entry?entry.count+' of '+entry.expected+' verses available':'Surah index not built yet';b.setAttribute('aria-label',number+' '+roman+' — incomplete source content')}b.onclick=()=>{showSurahMenu(false);openSurah(number);window.scrollTo({top:0,behavior:'smooth'})};surahList.append(b)})}
async function openSurah(number){window.ReadIQWordByWord?.hide();window.ReadIQPractice?.hide();clearAsmaHash();
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

// READIQ_ABOUT_READER_V2
let aboutSource=null;
// READIQ_ABOUT_LANG_V1
// READIQ_FURTHER_READING_V1
const savedAboutLanguage = saved('readiq-about-language','en');
let aboutLanguage = ['en','ur','further'].includes(savedAboutLanguage) ? savedAboutLanguage : 'en';
function buildFurtherReading() {
 const section = document.createElement('section');
 section.className = 'iq-further-reading';
 const title = document.createElement('h2');
 title.textContent = 'مزید مطالعہ / Further Reading';
 section.append(title);
 const articles = [
  ['تعارف عرفان القرآن', 'https://replay.minhaj.tv/urdu/tid/45084/'],
  ['عرفان القرآن اور جدید سائنسی علوم: دیگر تراجم کے ساتھ ایک تقابلی مطالعہ — شیخ عبدالعزیز دباغ', 'https://www.vision.minhaj.org/urdu/tid/45085/']
 ];
 const list = document.createElement('ul');
 list.lang = 'ur';
 list.dir = 'rtl';
 for(const [label,url] of articles){
  const item = document.createElement('li');
  const link = document.createElement('a');
  link.href = url;
  link.textContent = label;
  item.append(link);
  list.append(item);
 }
 section.append(list);
 return section;
}
function renderAbout(){content.classList.remove('asma-mode');
 content.classList.add('about-mode');content.replaceChildren();
 const article = aboutSource?.find(item=>item.id===(aboutLanguage==='ur'?'urdu':'english'));
 if(aboutLanguage==='further')content.append(buildFurtherReading());
 else if(article){
  const copy = article.cloneNode(true);
  copy.querySelectorAll('.language-label a').forEach(link=>link.remove());
  content.append(copy);
 }
 title.textContent='About Irfan-ul-Quran Read IQ';
 document.getElementById('languageSummary').textContent=({ur:'اردو',en:'English',further:'Further Reading'})[aboutLanguage];
 document.getElementById('fileCount').textContent='ABOUT';
 document.getElementById('status').textContent='About Read IQ';
 highlight();
}
async function openAbout(){window.ReadIQWordByWord?.hide();window.ReadIQPractice?.hide();
 const request=++token;readingMode='about';updateLanguageRow();search.value='';
 setFileMenu(false);showParaMenu(false);showSurahMenu(false);tools(false);
 title.textContent='About Irfan-ul-Quran Read IQ';content.textContent='Opening About…';
 try{
  if(aboutLanguage!=='further'&&!aboutSource){const r=await fetch('about.html',{cache:'no-store'});if(!r.ok)throw Error('About page unavailable');const doc=new DOMParser().parseFromString(await r.text(),'text/html');const articles=[...doc.querySelectorAll('article.language-document')];if(articles.length!==2)throw Error('About content could not be read');aboutSource=articles;}
  if(request!==token)return;renderAbout();
 }catch(e){if(request===token)content.textContent=e.message;}
}
const aboutLink=document.querySelector('.readiq-about-link');
const aboutLanguageMenu = document.createElement('div');
aboutLanguageMenu.id = 'iqAboutLanguageMenu';
aboutLanguageMenu.className = 'file-menu';
aboutLanguageMenu.hidden = true;
aboutLanguageMenu.setAttribute('aria-label','About language');
function showAboutLanguages(open) {
 aboutLanguageMenu.hidden = !open;
 aboutLink?.setAttribute('aria-expanded',String(open));
 if(!open)return;
 tools(false);
 positionAboutLanguages();
}
function positionAboutLanguages() {
 if(aboutLanguageMenu.hidden)return;
 const control = document.getElementById('iqExploreToggle') || aboutLink;
 const width = aboutLanguageMenu.getBoundingClientRect().width;
 aboutLanguageMenu.style.left = Math.max(14,Math.min(control.getBoundingClientRect().left,innerWidth-width-14))+'px';
 aboutLanguageMenu.style.top = Math.ceil(header.getBoundingClientRect().bottom)+6+'px';
}
if(aboutLink){
 aboutLink.setAttribute('aria-controls',aboutLanguageMenu.id);
 aboutLink.setAttribute('aria-expanded','false');
 aboutLink.onclick = event=>{
  event.preventDefault();
  const open = aboutLanguageMenu.hidden;
  document.querySelectorAll('.file-menu').forEach(panel=>{if(panel!==aboutLanguageMenu)panel.hidden=true});
  document.querySelectorAll('[aria-controls$="Menu"]').forEach(control=>control.setAttribute('aria-expanded','false'));
  showAboutLanguages(open);
 };
 for(const [lang,label] of [['en','English'],['ur','اردو'],['further','مزید مطالعہ / Further Reading']]){
  const choice = document.createElement('button');
  choice.type = 'button';
  if(lang!=='further')choice.lang = lang;
  choice.textContent = label;
  choice.onclick = ()=>{
   aboutLanguage = lang;
   save('readiq-about-language',lang);
   showAboutLanguages(false);
   history.replaceState(null,'','#about');
   (document.getElementById('iqExploreToggle') || aboutLink).focus();
   openAbout();
   window.scrollTo({top:0,behavior:'smooth'});
  };
  aboutLanguageMenu.append(choice);
 }
 document.body.append(aboutLanguageMenu);
 document.addEventListener('pointerdown',event=>{
  if(!aboutLanguageMenu.contains(event.target)&&!aboutLink.contains(event.target))showAboutLanguages(false);
 });
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!aboutLanguageMenu.hidden){
   showAboutLanguages(false);
   (document.getElementById('iqExploreToggle') || aboutLink).focus();
  }
 });
 window.addEventListener('resize',positionAboutLanguages);
 window.addEventListener('scroll',positionAboutLanguages,{passive:true});
}
window.addEventListener('hashchange',()=>{if(location.hash==='#about')openAbout()});
if(location.hash==='#about')readingMode='about';

// READIQ_ASMA_V1
const asmaData={"allah":[{"ar":"اللَّهُ","ur":"اللہ، معبودِ برحق","en":"The One God","pronunciation":"Allah"},{"ar":"الرَّحْمَنُ","ur":"بہت مہربان","en":"The Most Gracious","pronunciation":"ar-Rahman"},{"ar":"الرَّحِيمُ","ur":"نہایت رحم کرنے والا","en":"The Most Merciful","pronunciation":"ar-Rahim"},{"ar":"الْمَلِكُ","ur":"بادشاہ","en":"The King","pronunciation":"al-Malik"},{"ar":"الْقُدُّوسُ","ur":"نہایت پاک","en":"The Most Holy","pronunciation":"al-Quddus"},{"ar":"السَّلَامُ","ur":"سلامتی دینے والا","en":"The Source of Peace","pronunciation":"as-Salam"},{"ar":"الْمُؤْمِنُ","ur":"امن دینے والا","en":"The Granter of Security","pronunciation":"al-Mu’min"},{"ar":"الْمُهَيْمِنُ","ur":"نگہبان","en":"The Guardian","pronunciation":"al-Muhaymin"},{"ar":"الْعَزِيزُ","ur":"غالب، زبردست","en":"The Almighty","pronunciation":"al-‘Aziz"},{"ar":"الْجَبَّارُ","ur":"بڑی قوت اور اقتدار والا","en":"The Compeller","pronunciation":"al-Jabbar"},{"ar":"الْمُتَكَبِّرُ","ur":"بڑائی والا","en":"The Supreme in Greatness","pronunciation":"al-Mutakabbir"},{"ar":"الْخَالِقُ","ur":"پیدا کرنے والا","en":"The Creator","pronunciation":"al-Khaliq"},{"ar":"الْبَارِئُ","ur":"بنانے والا","en":"The Maker","pronunciation":"al-Bari’"},{"ar":"الْمُصَوِّرُ","ur":"صورت بنانے والا","en":"The Fashioner","pronunciation":"al-Musawwir"},{"ar":"الْغَفَّارُ","ur":"بہت بخشنے والا","en":"The Oft-Forgiving","pronunciation":"al-Ghaffar"},{"ar":"الْقَهَّارُ","ur":"سب پر غالب","en":"The Subduer","pronunciation":"al-Qahhar"},{"ar":"الْوَهَّابُ","ur":"بہت عطا کرنے والا","en":"The Bestower","pronunciation":"al-Wahhab"},{"ar":"الرَّزَّاقُ","ur":"روزی دینے والا","en":"The Provider","pronunciation":"ar-Razzaq"},{"ar":"الْفَتَّاحُ","ur":"کھولنے والا، فیصلہ کرنے والا","en":"The Opener","pronunciation":"al-Fattah"},{"ar":"الْعَلِيمُ","ur":"سب کچھ جاننے والا","en":"The All-Knowing","pronunciation":"al-‘Alim"},{"ar":"الْقَابِضُ","ur":"تنگی دینے والا","en":"The Withholder","pronunciation":"al-Qabid"},{"ar":"الْبَاسِطُ","ur":"کشادگی دینے والا","en":"The Expander","pronunciation":"al-Basit"},{"ar":"الْخَافِضُ","ur":"پست کرنے والا","en":"The Abaser","pronunciation":"al-Khafid"},{"ar":"الرَّافِعُ","ur":"بلند کرنے والا","en":"The Exalter","pronunciation":"ar-Rafi‘"},{"ar":"الْمُعِزُّ","ur":"عزت دینے والا","en":"The Giver of Honour","pronunciation":"al-Mu‘izz"},{"ar":"الْمُذِلُّ","ur":"ذلت دینے والا","en":"The Giver of Dishonour","pronunciation":"al-Mudhill"},{"ar":"السَّمِيعُ","ur":"سب کچھ سننے والا","en":"The All-Hearing","pronunciation":"as-Sami‘"},{"ar":"الْبَصِيرُ","ur":"سب کچھ دیکھنے والا","en":"The All-Seeing","pronunciation":"al-Basir"},{"ar":"الْحَكَمُ","ur":"فیصلہ کرنے والا","en":"The Judge","pronunciation":"al-Hakam"},{"ar":"الْعَدْلُ","ur":"بہت عدل والا","en":"The Utterly Just","pronunciation":"al-‘Adl"},{"ar":"اللَّطِيفُ","ur":"باریک بین، مہربان","en":"The Subtle, the Kind","pronunciation":"al-Latif"},{"ar":"الْخَبِيرُ","ur":"پوری خبر رکھنے والا","en":"The All-Aware","pronunciation":"al-Khabir"},{"ar":"الْحَلِيمُ","ur":"بردبار","en":"The Forbearing","pronunciation":"al-Halim"},{"ar":"الْعَظِيمُ","ur":"بڑی عظمت والا","en":"The Magnificent","pronunciation":"al-‘Azim"},{"ar":"الْغَفُورُ","ur":"بہت بخشنے والا","en":"The Most Forgiving","pronunciation":"al-Ghafur"},{"ar":"الشَّكُورُ","ur":"قدر دان","en":"The Most Appreciative","pronunciation":"ash-Shakur"},{"ar":"الْعَلِيُّ","ur":"بلند مرتبہ","en":"The Most High","pronunciation":"al-‘Ali"},{"ar":"الْكَبِيرُ","ur":"بہت بڑا","en":"The Most Great","pronunciation":"al-Kabir"},{"ar":"الْحَفِيظُ","ur":"حفاظت کرنے والا","en":"The Preserver","pronunciation":"al-Hafiz"},{"ar":"الْمُقِيتُ","ur":"رزق اور قوت دینے والا، نگہبان","en":"The Sustainer","pronunciation":"al-Muqit"},{"ar":"الْحَسِيبُ","ur":"حساب لینے والا، کافی","en":"The Reckoner","pronunciation":"al-Hasib"},{"ar":"الْجَلِيلُ","ur":"بڑی شان والا","en":"The Majestic","pronunciation":"al-Jalil"},{"ar":"الْكَرِيمُ","ur":"کرم کرنے والا","en":"The Generous","pronunciation":"al-Karim"},{"ar":"الرَّقِيبُ","ur":"نگران","en":"The Watchful","pronunciation":"ar-Raqib"},{"ar":"الْمُجِيبُ","ur":"دعا قبول کرنے والا","en":"The Responsive","pronunciation":"al-Mujib"},{"ar":"الْوَاسِعُ","ur":"وسعت والا","en":"The All-Encompassing","pronunciation":"al-Wasi‘"},{"ar":"الْحَكِيمُ","ur":"حکمت والا","en":"The All-Wise","pronunciation":"al-Hakim"},{"ar":"الْوَدُودُ","ur":"محبت کرنے والا","en":"The Most Loving","pronunciation":"al-Wadud"},{"ar":"الْمَجِيدُ","ur":"بزرگی والا","en":"The Glorious","pronunciation":"al-Majid"},{"ar":"الْبَاعِثُ","ur":"دوبارہ زندہ کرنے والا","en":"The Resurrector","pronunciation":"al-Ba‘ith"},{"ar":"الشَّهِيدُ","ur":"ہر چیز پر گواہ","en":"The Witness","pronunciation":"ash-Shahid"},{"ar":"الْحَقُّ","ur":"برحق","en":"The Truth","pronunciation":"al-Haqq"},{"ar":"الْوَكِيلُ","ur":"کارساز","en":"The Trustee","pronunciation":"al-Wakil"},{"ar":"الْقَوِيُّ","ur":"قوت والا","en":"The All-Strong","pronunciation":"al-Qawi"},{"ar":"الْمَتِينُ","ur":"بہت مضبوط","en":"The Firm","pronunciation":"al-Matin"},{"ar":"الْوَلِيُّ","ur":"دوست، مددگار","en":"The Protecting Friend","pronunciation":"al-Wali"},{"ar":"الْحَمِيدُ","ur":"تعریف کے لائق","en":"The Praiseworthy","pronunciation":"al-Hamid"},{"ar":"الْمُحْصِي","ur":"ہر چیز کا شمار کرنے والا","en":"The Reckoner of All","pronunciation":"al-Muhsi"},{"ar":"الْمُبْدِئُ","ur":"پہلی بار پیدا کرنے والا","en":"The Originator","pronunciation":"al-Mubdi’"},{"ar":"الْمُعِيدُ","ur":"دوبارہ لوٹانے والا","en":"The Restorer","pronunciation":"al-Mu‘id"},{"ar":"الْمُحْيِي","ur":"زندگی دینے والا","en":"The Giver of Life","pronunciation":"al-Muhyi"},{"ar":"الْمُمِيتُ","ur":"موت دینے والا","en":"The Giver of Death","pronunciation":"al-Mumit"},{"ar":"الْحَيُّ","ur":"ہمیشہ زندہ","en":"The Ever-Living","pronunciation":"al-Hayy"},{"ar":"الْقَيُّومُ","ur":"خود قائم اور سب کو قائم رکھنے والا","en":"The Self-Subsisting","pronunciation":"al-Qayyum"},{"ar":"الْوَاجِدُ","ur":"پانے والا","en":"The Finder","pronunciation":"al-Wajid"},{"ar":"الْمَاجِدُ","ur":"بزرگی والا","en":"The Noble","pronunciation":"al-Majid"},{"ar":"الْوَاحِدُ","ur":"ایک","en":"The One","pronunciation":"al-Wahid"},{"ar":"الصَّمَدُ","ur":"بے نیاز","en":"The Self-Sufficient, the Eternal Refuge","pronunciation":"as-Samad"},{"ar":"الْقَادِرُ","ur":"قدرت والا","en":"The All-Able","pronunciation":"al-Qadir"},{"ar":"الْمُقْتَدِرُ","ur":"بڑی قدرت والا","en":"The All-Powerful","pronunciation":"al-Muqtadir"},{"ar":"الْمُقَدِّمُ","ur":"آگے کرنے والا","en":"The Advancer","pronunciation":"al-Muqaddim"},{"ar":"الْمُؤَخِّرُ","ur":"پیچھے کرنے والا","en":"The Delayer","pronunciation":"al-Mu’akhkhir"},{"ar":"الأَوَّلُ","ur":"سب سے پہلے","en":"The First","pronunciation":"al-Awwal"},{"ar":"الآخِرُ","ur":"سب کے بعد","en":"The Last","pronunciation":"al-Akhir"},{"ar":"الظَّاهِرُ","ur":"ظاہر","en":"The Manifest","pronunciation":"az-Zahir"},{"ar":"الْبَاطِنُ","ur":"پوشیدہ","en":"The Hidden","pronunciation":"al-Batin"},{"ar":"الْوَالِي","ur":"کارساز، حاکم","en":"The Governor","pronunciation":"al-Wali"},{"ar":"الْمُتَعَالِي","ur":"بہت بلند","en":"The Most Exalted","pronunciation":"al-Muta‘ali"},{"ar":"الْبَرُّ","ur":"بڑا احسان کرنے والا","en":"The Source of Goodness","pronunciation":"al-Barr"},{"ar":"التَّوَّابُ","ur":"توبہ قبول کرنے والا","en":"The Acceptor of Repentance","pronunciation":"at-Tawwab"},{"ar":"الْمُنْتَقِمُ","ur":"بدلہ لینے والا","en":"The Avenger","pronunciation":"al-Muntaqim"},{"ar":"الْعَفُوُّ","ur":"معاف کرنے والا","en":"The Pardoner","pronunciation":"al-‘Afuww"},{"ar":"الرَّءُوفُ","ur":"نہایت شفیق","en":"The Most Kind","pronunciation":"ar-Ra’uf"},{"ar":"مَالِكُ الْمُلْكِ","ur":"بادشاہی کا مالک","en":"The Owner of Sovereignty","pronunciation":"Malik al-Mulk"},{"ar":"ذُو الْجَلَالِ وَالإِكْرَامِ","ur":"عظمت اور بزرگی والا","en":"The Lord of Majesty and Honour","pronunciation":"Dhul-Jalali wal-Ikram"},{"ar":"الْمُقْسِطُ","ur":"انصاف کرنے والا","en":"The Just","pronunciation":"al-Muqsit"},{"ar":"الْجَامِعُ","ur":"جمع کرنے والا","en":"The Gatherer","pronunciation":"al-Jami‘"},{"ar":"الْغَنِيُّ","ur":"بے نیاز","en":"The Self-Sufficient","pronunciation":"al-Ghani"},{"ar":"الْمُغْنِي","ur":"غنی کرنے والا","en":"The Enricher","pronunciation":"al-Mughni"},{"ar":"الْمَانِعُ","ur":"روکنے والا","en":"The Preventer","pronunciation":"al-Mani‘"},{"ar":"الضَّارُّ","ur":"اپنی حکمت سے نقصان پہنچانے والا","en":"The Creator of Harm, by His wisdom","pronunciation":"ad-Darr"},{"ar":"النَّافِعُ","ur":"نفع پہنچانے والا","en":"The Creator of Benefit","pronunciation":"an-Nafi‘"},{"ar":"النُّورُ","ur":"نور","en":"The Light","pronunciation":"an-Nur"},{"ar":"الْهَادِي","ur":"ہدایت دینے والا","en":"The Guide","pronunciation":"al-Hadi"},{"ar":"الْبَدِيعُ","ur":"بے مثال پیدا کرنے والا","en":"The Incomparable Originator","pronunciation":"al-Badi‘"},{"ar":"الْبَاقِي","ur":"ہمیشہ باقی رہنے والا","en":"The Everlasting","pronunciation":"al-Baqi"},{"ar":"الْوَارِثُ","ur":"وارث","en":"The Inheritor","pronunciation":"al-Warith"},{"ar":"الرَّشِيدُ","ur":"راہ دکھانے والا","en":"The Guide to the Right Path","pronunciation":"ar-Rashid"},{"ar":"الصَّبُورُ","ur":"بہت صبر کرنے والا","en":"The Most Patient","pronunciation":"as-Sabur"}],"nabi":[{"ar":"مُحَمَّدٌ ﷺ","ur":"بے حد تعریف کیا گیا، جس کی تعریف زمین و آسمان میں مسلسل کی جائے","en":"The Most Praised One, Repeatedly Extolled","pronunciation":"Muhammad ﷺ"},{"ar":"أَحْمَدُ ﷺ","ur":"اللہ کی سب سے زیادہ حمد و ثناء کرنے والا","en":"The Most Praiseworthy, The Greatest Praiser of Allah","pronunciation":"Ahmad ﷺ"},{"ar":"حَامِدٌ ﷺ","ur":"ہر حال میں اللہ تعالیٰ کا شکر اور حمد کرنے والا","en":"The Praiser and Thankful Servant of Allah","pronunciation":"Haamid ﷺ"},{"ar":"مَحْمُودٌ ﷺ","ur":"مقامِ محمود والا، تمام مخلوق میں سراہا گیا","en":"The Praised One Granted the Station of Maqam-e-Mahmood","pronunciation":"Mahmood ﷺ"},{"ar":"قَاسِمٌ ﷺ","ur":"اللہ کی عطا کردہ نعمتیں اور علمِ نبوت تقسیم فرمانے والا","en":"The Distributor of Divine Knowledge and Blessings","pronunciation":"Qaasim ﷺ"},{"ar":"عَاقِبٌ ﷺ","ur":"سب انبیاء کے آخر میں تشریف لانے والا جس کے بعد کوئی نبی نہیں","en":"The Last Prophet After Whom There Is No Prophet","pronunciation":"'Aaqib ﷺ"},{"ar":"فَاتِحٌ ﷺ","ur":"ہدایت، رحمت اور شفاعت کے دروازے کھولنے والا","en":"The Opener of Guidance, Victory, and Intercession","pronunciation":"Faatih ﷺ"},{"ar":"شَاهِدٌ ﷺ","ur":"حق اور امت کے اعمال پر گواہی دینے والا","en":"The Witness Over Mankind for Truth","pronunciation":"Shaahid ﷺ"},{"ar":"حَاشِرٌ ﷺ","ur":"جن کے قدموں کے پیچھے قیامت کے دن تمام لوگوں کا حشر ہوگا","en":"The Gatherer Before Whom Mankind Will Be Resurrected","pronunciation":"Haashir ﷺ"},{"ar":"رَشِيدٌ ﷺ","ur":"ہدایت یافتہ اور سیدھی راہ پر قائم","en":"The Rightly Guided and Wise Leader","pronunciation":"Rasheed ﷺ"},{"ar":"مَشْهُودٌ ﷺ","ur":"جس کی رسالت کی گواہی اللہ، فرشتے اور مومنین دیتے ہیں","en":"The One Testified To by Allah and Creation","pronunciation":"Mash-hood ﷺ"},{"ar":"بَشِيرٌ ﷺ","ur":"ایمان والوں کو جنت اور رحمتِ الٰہی کی خوشخبری سنانے والا","en":"The Bringer of Glad Tidings of Paradise","pronunciation":"Basheer ﷺ"},{"ar":"نَذِيرٌ ﷺ","ur":"نافرمانوں کو آخرت کی پکڑ سے خبردار کرنے والا","en":"The Warner Against Divine Punishment","pronunciation":"Nadheer ﷺ"},{"ar":"دَاعٍ ﷺ","ur":"اللہ کے حکم سے اس کی توحید کی طرف بلانے والا","en":"The Caller to Allah by His Permission","pronunciation":"Daa'ee ﷺ"},{"ar":"شَافٍ ﷺ","ur":"دلوں کے روحانی امراض اور شرک و جہالت کا علاج فرمانے والا","en":"The Healer of Spiritual Hearts Through Revelation","pronunciation":"Shaafee ﷺ"},{"ar":"هَادٍ ﷺ","ur":"سیدھے راستے (صراطِ مستقیم) کی طرف رہنمائی فرمانے والا","en":"The Guide to the Straight Path","pronunciation":"Haadee ﷺ"},{"ar":"مَهْدِيٌّ ﷺ","ur":"اللہ کی طرف سے کامل ہدایت عطا کیا گیا","en":"The Divinely Guided One","pronunciation":"Mahdiyy ﷺ"},{"ar":"مَاحٍ ﷺ","ur":"جس کے ذریعے اللہ تعالیٰ کفر اور شرک کو مٹاتا ہے","en":"The Effacer Through Whom Allah Eradicates Disbelief","pronunciation":"Maahee ﷺ"},{"ar":"مُنْجٍ ﷺ","ur":"اتباعِ سنت کے ذریعے ہلاکت سے نجات کا سبب بننے والا","en":"The Deliverer from Ruin Through His Sunnah","pronunciation":"Munjee ﷺ"},{"ar":"نَاهٍ ﷺ","ur":"برائی، ظلم اور حرام کاموں سے روکنے والا","en":"The Forbidder of Evil and Injustice","pronunciation":"Naahee ﷺ"},{"ar":"رَسُولٌ ﷺ","ur":"اللہ تعالیٰ کا سچا پیغام پہنچانے والا رسول","en":"The Messenger of Allah","pronunciation":"Rasool ﷺ"},{"ar":"نَبِيٌّ ﷺ","ur":"اللہ کی طرف سے وحی اور غیب کی خبریں پانے والا نبی","en":"The Prophet of Allah","pronunciation":"Nabiyy ﷺ"},{"ar":"أُمِّيٌّ ﷺ","ur":"مخلوق میں سے کسی سے پڑھے بغیر ربِّ علیم سے براہِ راست علم پانے والا","en":"The Unlettered Prophet Taught Directly by Allah","pronunciation":"Ummiyy ﷺ"},{"ar":"تِهَامِيٌّ ﷺ","ur":"سرزمینِ تہامہ (مکہ مکرمہ) سے نسبت رکھنے والا","en":"Belonging to the Blessed Land of Tihamah (Makkah)","pronunciation":"Tihaamiyy ﷺ"},{"ar":"هَاشِمِيٌّ ﷺ","ur":"قریش کے معزز ترین خاندان بنو ہاشم کا چشم و چراغ","en":"Descendant of the Noble Clan of Banu Hashim","pronunciation":"Haashimiyy ﷺ"},{"ar":"أَبْطَحِيٌّ ﷺ","ur":"مکہ کی وادیِ بطحاء سے نسبت رکھنے والا","en":"Associated with the Valley of Batha in Makkah","pronunciation":"Abtahiyy ﷺ"},{"ar":"عَزِيزٌ ﷺ","ur":"جس پر امت کی تکلیف اور مشقت بہت گراں گزرتی ہے","en":"The Noble One Deeply Concerned for His Ummah's Hardship","pronunciation":"'Azeez ﷺ"},{"ar":"حَرِيصٌ عَلَيْكُمْ ﷺ","ur":"تمہاری ہدایت، بھلائی اور نجات کا بے حد خواہشمند","en":"Ardently Desirous for Your Guidance and Well-Being","pronunciation":"Hareesun 'Alaykum ﷺ"},{"ar":"رَءُوفٌ ﷺ","ur":"مومنوں پر نہایت شفیق اور نرمی فرمانے والا","en":"Full of Pity, Kindness, and Compassion for Believers","pronunciation":"Ra'oof ﷺ"},{"ar":"رَحِيمٌ ﷺ","ur":"اہلِ ایمان پر بے حد مہربان اور رحم دل","en":"Merciful and Tender-Hearted Toward the Believers","pronunciation":"Raheem ﷺ"},{"ar":"طٰهٰ ﷺ","ur":"سورۃ طٰہٰ کے مخاطبِ اول (اے کامل انسان)","en":"Ta-Ha (Addressee of Surah Taha)","pronunciation":"Taa-Haa ﷺ"},{"ar":"مُجْتَبٰى ﷺ","ur":"اللہ کی طرف سے چنا ہوا اور برگزیدہ","en":"The Chosen and Elect of Allah","pronunciation":"Mujtabaa ﷺ"},{"ar":"طٰسٓ ﷺ","ur":"سورۃ النمل کے مخاطبِ کریم","en":"Ta-Seen (Addressee of Surah An-Naml)","pronunciation":"Taa-Seen ﷺ"},{"ar":"مُرْتَضٰى ﷺ","ur":"جس سے اللہ راضی ہوا اور جسے راضی کرنے کا وعدہ فرمایا","en":"The One With Whom Allah Is Well-Pleased","pronunciation":"Murtadaa ﷺ"},{"ar":"حٰمٓ ﷺ","ur":"حوامیم (سورۃ المومن تا الاحقاف) کے مخاطبِ اعظم","en":"Ha-Meem (Recipient of the Ha-Meem Surahs)","pronunciation":"Haa-Meem ﷺ"},{"ar":"مُصْطَفٰى ﷺ","ur":"تمام اولادِ آدم میں سب سے خالص اور منتخب کردہ","en":"The Purely Chosen One Among All Creation","pronunciation":"Mustafaa ﷺ"},{"ar":"يٰسٓ ﷺ","ur":"سورۃ یٰسٓ کے مخاطب (اے سید المرسلین)","en":"Ya-Seen (O Chief of the Messengers)","pronunciation":"Yaa-Seen ﷺ"},{"ar":"أَوْلٰى ﷺ","ur":"مومنوں کے لیے ان کی اپنی جانوں سے بھی زیادہ حق دار اور قریب","en":"Closer and More Worthy to the Believers Than Their Own Selves","pronunciation":"Awlaa ﷺ"},{"ar":"مُزَّمِّلٌ ﷺ","ur":"چادر اوڑھ کر راتوں کو تہجد میں کھڑے ہونے والا نبی","en":"The One Wrapped in Garments Standing in Night Prayer","pronunciation":"Muzzammil ﷺ"},{"ar":"وَلِيٌّ ﷺ","ur":"ہر مومن کا سچا خیر خواہ اور دینی رفیق","en":"The Beloved Patron and Spiritual Ally of Every Believer","pronunciation":"Waliyy ﷺ"},{"ar":"مُدَّثِّرٌ ﷺ","ur":"کپڑا لپیٹنے والا جسے اٹھ کر دنیا کو خبردار کرنے کا حکم ملا","en":"The Cloaked One Commanded to Arise and Warn","pronunciation":"Muddaththir ﷺ"},{"ar":"مَتِينٌ ﷺ","ur":"دینِ حق پر مضبوطی اور استقامت کے ساتھ قائم رہنے والا","en":"Steadfast, Firm, and Unshakable in Truth","pronunciation":"Mateen ﷺ"},{"ar":"مُصَدِّقٌ ﷺ","ur":"پچھلے تمام سچے انبیاء اور آسمانی کتابوں کی تصدیق کرنے والا","en":"The Confirmer of Previous Prophets and Scriptures","pronunciation":"Musaddiq ﷺ"},{"ar":"طَيِّبٌ ﷺ","ur":"پاک و طاہر سیرت، پاکیزہ گفتگو اور پاکیزہ اخلاق والا","en":"The Pure, Goodly, and Fragrant in Character","pronunciation":"Tayyib ﷺ"},{"ar":"نَاصِرٌ ﷺ","ur":"حق، مظلوموں اور دینِ الٰہی کی مدد کرنے والا","en":"The Helper of the Truth and the Oppressed","pronunciation":"Naasir ﷺ"},{"ar":"مَنْصُورٌ ﷺ","ur":"اللہ تعالیٰ کی خاص نصرت اور فرشتوں سے مدد دیا گیا","en":"The Divinely Aided and Victorious Prophet","pronunciation":"Mansoor ﷺ"},{"ar":"مِصْبَاحٌ ﷺ","ur":"تاریکیوں میں ہدایت کی روشنی پھیلانے والا چراغ","en":"The Guiding Lamp in Darkness","pronunciation":"Misbaah ﷺ"},{"ar":"آمِرٌ ﷺ","ur":"نیکی، عدل اور تقویٰ کا حکم دینے والا","en":"The Commander of Righteousness and Justice","pronunciation":"Aamir ﷺ"},{"ar":"حِجَازِيٌّ ﷺ","ur":"ارضِ مقدس حجاز (مکہ و مدینہ) سے نسبت رکھنے والا","en":"Of the Sacred Land of Hijaz (Makkah & Madinah)","pronunciation":"Hijaaziyy ﷺ"},{"ar":"نَزَارِيٌّ ﷺ","ur":"حضرت اسماعیل علیہ السلام کی اولاد میں نزار بن معد کی نسلِ پاک سے","en":"Descendant of the Noble Lineage of Nizar ibn Ma'add","pronunciation":"Nazaariyy ﷺ"},{"ar":"قُرَشِيٌّ ﷺ","ur":"عرب کے معزز قبیلہ قریش کے سردار","en":"Leader of the Noble Tribe of Quraysh","pronunciation":"Qurashiyy ﷺ"},{"ar":"مُضَرِيٌّ ﷺ","ur":"مضر بن نزار کی پاک اور منتخب شاخ سے تعلق رکھنے والا","en":"Of the Pure Lineage of Mudar","pronunciation":"Mudariyy ﷺ"},{"ar":"نَبِيُّ التَّوْبَةِ ﷺ","ur":"توبہ اور استغفار کا دروازہ کھولنے والا نبی","en":"The Prophet of Repentance","pronunciation":"Nabiyyut-Tawbah ﷺ"},{"ar":"حَافِظٌ ﷺ","ur":"اللہ کی وحی، امانت اور حدودِ الٰہی کی کامل حفاظت کرنے والا","en":"The Preserver of Divine Revelation and Trust","pronunciation":"Haafiz ﷺ"},{"ar":"كَامِلٌ ﷺ","ur":"اخلاق، سیرت اور بشری اوصاف میں کامل ترین انسان","en":"The Most Complete Human Being in Character and Virtue","pronunciation":"Kaamil ﷺ"},{"ar":"صَادِقٌ ﷺ","ur":"ہزار فیصد سچا جس کی سچائی کی گواہی دشمنوں نے بھی دی","en":"The Truthful One in Every Word and Promise","pronunciation":"Saadiq ﷺ"},{"ar":"أَمِينٌ ﷺ","ur":"وحیِ الٰہی اور لوگوں کی امانتوں کا سب سے بڑا امین","en":"The Perfectly Trustworthy Custodian","pronunciation":"Ameen ﷺ"},{"ar":"عَبْدُ اللّٰهِ ﷺ","ur":"اللہ تعالیٰ کا سب سے کامل اور محبوب بندہ","en":"The Supreme Servant and Worshipper of Allah","pronunciation":"'Abdullaah ﷺ"},{"ar":"كَلِيمُ اللّٰهِ ﷺ","ur":"جس سے اللہ تعالیٰ نے وحی اور شبِ معراج میں کلام فرمایا","en":"The One Addressed Directly by Allah","pronunciation":"Kaleemullaah ﷺ"},{"ar":"حَبِيبُ اللّٰهِ ﷺ","ur":"اللہ تعالیٰ کا پیارا اور محبوب ترین رسول","en":"The Most Beloved of Allah","pronunciation":"Habeebullaah ﷺ"},{"ar":"نَجِيُّ اللّٰهِ ﷺ","ur":"شبِ معراج اپنے رب کے حضور راز و نیاز اور قربِ خاص پانے والا","en":"The Intimate Converse-Partner of Allah on the Night of Mi'raj","pronunciation":"Najiyyullaah ﷺ"},{"ar":"صَفِيُّ اللّٰهِ ﷺ","ur":"اللہ کا خالص اور برگزیدہ دوست","en":"The Sincerely Chosen Friend of Allah","pronunciation":"Safiyyullaah ﷺ"},{"ar":"خَاتَمُ الْأَنْبِيَاءِ ﷺ","ur":"نبوت کی عمارت کی آخری اینٹ اور تمام انبیاء کے خاتم","en":"The Seal of the Prophets","pronunciation":"Khaatamul-Anbiyaa' ﷺ"},{"ar":"حَسِيبٌ ﷺ","ur":"بلند حسب و نسب اور عالی شرف والا","en":"Noble in Lineage, Sufficiency, and Honor","pronunciation":"Haseeb ﷺ"},{"ar":"مُجِيبٌ ﷺ","ur":"اللہ کی پکار پر لبیک کہنے والا اور پکارنے والوں کی داد رسی کرنے والا","en":"Responsive to Allah's Call and Generous to Those Who Seek Help","pronunciation":"Mujeeb ﷺ"},{"ar":"شَكُورٌ ﷺ","ur":"اللہ تعالیٰ کی نعمتوں کا سب سے زیادہ شکر ادا کرنے والا عبدِ شکور","en":"The Most Grateful and Appreciative Servant of Allah","pronunciation":"Shakoor ﷺ"},{"ar":"مُقْتَصِدٌ ﷺ","ur":"ہر معاملے میں اعتدال، میانہ روی اور عدل کی راہ دکھانے والا","en":"Balanced, Moderate, and Just in Every Matter","pronunciation":"Muqtasid ﷺ"},{"ar":"رَسُولُ الرَّحْمَةِ ﷺ","ur":"تمام جہانوں کے لیے سراپا رحمت بن کر آنے والا رسول","en":"The Messenger of Mercy","pronunciation":"Rasoolur-Rahmah ﷺ"},{"ar":"قَوِيٌّ ﷺ","ur":"ایمان، ارادے، شجاعت اور جسمانی و روحانی قوت میں کامل","en":"Strong and Resolute in Faith, Courage, and Mission","pronunciation":"Qawiyy ﷺ"},{"ar":"حَفِيٌّ ﷺ","ur":"امت پر بے حد مہربان اور ان کے حال کی خبر گیری کرنے والا","en":"Deeply Caring, Kind, and Attentive to His Ummah","pronunciation":"Hafiyy ﷺ"},{"ar":"مَأْمُونٌ ﷺ","ur":"جس کی ذات سے ہر شخص امن و امان میں ہو اور وحی پر مامون","en":"Trusted and Safe from Every Blemish and Betrayal","pronunciation":"Ma'moon ﷺ"},{"ar":"مَعْلُومٌ ﷺ","ur":"جن کی صداقت اور نشانیاں پچھلی کتابوں اور اہلِ علم میں معروف تھیں","en":"Well-Known by Clear Signs in Earlier Scriptures","pronunciation":"Ma'loom ﷺ"},{"ar":"حَقٌّ ﷺ","ur":"جن کی نبوت، رسالت اور پیغام سراسر حق اور سچ ہے","en":"Whose Prophethood and Message Are Absolute Truth","pronunciation":"Haqq ﷺ"},{"ar":"مُبِينٌ ﷺ","ur":"حق و باطل کو کھول کر واضح بیان فرمانے والا رسول","en":"The Clear and Manifest Warner and Expositor","pronunciation":"Mubeen ﷺ"},{"ar":"مُطِيعٌ ﷺ","ur":"اپنے رب کے ہر حکم کی کامل اطاعت کرنے والا اور واجب الاطاعت","en":"Completely Obedient to Allah and Worthy of Obedience","pronunciation":"Mutee' ﷺ"},{"ar":"أَوَّلٌ ﷺ","ur":"تخلیقِ نورانی، میثاقِ انبیاء، شفاعت اور دخولِ جنت میں سب سے اول","en":"First in the Covenant of Prophets, Intercession, and Entering Paradise","pronunciation":"Awwal ﷺ"},{"ar":"آخِرٌ ﷺ","ur":"بعثت کے اعتبار سے سب کے آخر میں آنے والے خاتم النبیین","en":"The Final Prophet Sent in Time (Seal of Prophethood)","pronunciation":"Aakhir ﷺ"},{"ar":"ظَاهِرٌ ﷺ","ur":"روشن معجزات، کھلی دلیل اور غالب دین کے ساتھ ظاہر ہونے والا","en":"Manifest Through Clear Miracles and Prevailing Truth","pronunciation":"Zaahir ﷺ"},{"ar":"بَاطِنٌ ﷺ","ur":"باطن کی پاکیزگی، اخلاص اور اسرارِ معرفت سے معمور قلب والا","en":"Pure in Inner Heart, Sincerity, and Spiritual Insight","pronunciation":"Baatin ﷺ"},{"ar":"يَتِيمٌ ﷺ","ur":"درِّ یتیم جسے ربِّ کائنات نے خود پناہ اور بے مثال مقام عطا فرمایا","en":"The Precious Orphan Sheltered and Exalted by Allah Himself","pronunciation":"Yateem ﷺ"},{"ar":"كَرِيمٌ ﷺ","ur":"بے انتہا سخی، فیاض اور بلند اخلاق والا رسولِ کریم","en":"The Most Generous and Noble Messenger","pronunciation":"Kareem ﷺ"},{"ar":"حَكِيمٌ ﷺ","ur":"کتاب و حکمت کی تعلیم دینے والا دانا و حکیم پیغمبر","en":"Endowed with Prophetic Wisdom and Sound Judgment","pronunciation":"Hakeem ﷺ"},{"ar":"سَيِّدٌ ﷺ","ur":"اولادِ آدم اور تمام انبیاء و مرسلین کے سردار","en":"The Master and Leader of All the Children of Adam","pronunciation":"Sayyid ﷺ"},{"ar":"سِرَاجٌ ﷺ","ur":"تاریکیوں کو مٹانے والا ہدایت کا چراغ","en":"The Lamp of Guidance Dispelling Darkness","pronunciation":"Siraaj ﷺ"},{"ar":"مُنِيرٌ ﷺ","ur":"دلوں اور عالم کو نورِ ایمان سے منور کرنے والا","en":"The Illuminating One Who Radiates Guidance","pronunciation":"Muneer ﷺ"},{"ar":"مُحَرَّمٌ ﷺ","ur":"واجِب الاحترام جن کی بے ادبی حرام اور جن کی عزت فرض ہے","en":"Sacred in Honor and Inviolable in Respect","pronunciation":"Muharram ﷺ"},{"ar":"مُكَرَّمٌ ﷺ","ur":"اللہ تعالیٰ اور فرشتوں کے نزدیک بے حد معزز و مکرم","en":"Honored and Venerated in the Sight of Allah and the Angels","pronunciation":"Mukarram ﷺ"},{"ar":"مُبَشِّرٌ ﷺ","ur":"اہلِ ایمان کو جنت اور مغفرت کی بشارت دینے والا","en":"The Bringer of Glad Tidings to the Believers","pronunciation":"Mubashshir ﷺ"},{"ar":"مُذَكِّرٌ ﷺ","ur":"اللہ کی نشانیوں اور آخرت کی نصیحت یاد دلانے والا","en":"The Reminder of Allah and the Hereafter","pronunciation":"Mudhakkir ﷺ"},{"ar":"مُطَهَّرٌ ﷺ","ur":"ظاہری و باطنی ہر عیب اور گناہ سے پاک و مطہر","en":"Purified Inside and Out from Every Blemish","pronunciation":"Mutahhar ﷺ"},{"ar":"قَرِيبٌ ﷺ","ur":"مومنوں سے مشفقانہ محبت میں ان کی جانوں سے بھی زیادہ قریب","en":"Near and Dear to the Hearts of the Believers","pronunciation":"Qareeb ﷺ"},{"ar":"خَلِيلٌ ﷺ","ur":"اللہ رحمٰن کا خلیل اور سب سے گہرا دوست","en":"The Intimate Friend (Khalil) of Allah","pronunciation":"Khaleel ﷺ"},{"ar":"مَدْعُوٌّ ﷺ","ur":"دعائے ابراہیمیؑ اور بشارتِ عیسویؑ کا مصداق اور حق کی طرف مدعو","en":"The Fulfillment of Prophet Ibrahim's Prayer and Called to Divine Honor","pronunciation":"Mad'uww ﷺ"},{"ar":"جَوَّادٌ ﷺ","ur":"تیز چلتی ہوا سے بھی زیادہ سخاوت اور عطا فرمانے والا","en":"More Generous Than the Freely Blowing Wind","pronunciation":"Jawwaad ﷺ"},{"ar":"خَاتِمٌ ﷺ","ur":"نبوت و رسالت کو کمال پر ختم فرمانے والا آخری نبی","en":"The Final Seal Who Perfected the Chain of Prophethood","pronunciation":"Khaatim ﷺ"},{"ar":"عَادِلٌ ﷺ","ur":"اپنے اور بیگانے سب کے درمیان کامل انصاف قائم کرنے والا","en":"Supremely Just and Equitable Among All People","pronunciation":"'Aadil ﷺ"},{"ar":"شَهِيرٌ ﷺ","ur":"جس کے ذکرِ مبارک کو اللہ نے مشرق و مغرب اور عرش و فرش پر بلند کر دیا","en":"Renowned and Exalted in Mention Across Heaven and Earth","pronunciation":"Shaheer ﷺ"},{"ar":"شَهِيدٌ ﷺ","ur":"پوری امت اور انسانیت کے اعمال پر حق کا گواہ","en":"The Truthful Witness Over All the Ummah","pronunciation":"Shaheed ﷺ"},{"ar":"رَسُولُ الْمَلَاحِمِ ﷺ","ur":"حق و باطل کے عظیم معرکوں میں غلبۂ حق کے لیے بھیجا گیا رسول","en":"The Messenger of the Decisive Battles for Truth","pronunciation":"Rasoolul-Malaahim ﷺ"}]};
let asmaKind=saved('readiq-asma-kind','allah');if(!['allah','nabi'].includes(asmaKind))asmaKind='allah';
const asmaFields=['ar','ur','en','pronunciation'];
let asmaChoice=saved('readiq-asma-fields',asmaFields);if(!Array.isArray(asmaChoice))asmaChoice=[...asmaFields];asmaChoice=asmaChoice.filter(k=>asmaFields.includes(k));
function clearAsmaHash(){if(/^#asma-(allah|nabi)$/.test(location.hash))history.replaceState(null,'',location.pathname+location.search)}
const asmaToggle=document.createElement('button');asmaToggle.type='button';asmaToggle.id='asmaToggle';asmaToggle.className='file-toggle';asmaToggle.textContent='✧ اسماء ▾';asmaToggle.lang='ur';asmaToggle.setAttribute('aria-expanded','false');asmaToggle.setAttribute('aria-controls','asmaMenu');fileToggle.parentElement.append(asmaToggle);
const asmaMenu=document.createElement('div');asmaMenu.id='asmaMenu';asmaMenu.className='file-menu';asmaMenu.hidden=true;asmaMenu.setAttribute('aria-label','Names reading');
const asmaToolbar=document.createElement('div');asmaToolbar.className='library-toolbar';const asmaHeading=document.createElement('strong');asmaHeading.lang='ur';asmaHeading.textContent='اسماء';asmaToolbar.append(asmaHeading);asmaMenu.append(asmaToolbar);
const asmaLabels={ar:'Arabic',ur:'Urdu',en:'English',pronunciation:'Pronunciation'};
const asmaOptions=document.createElement('div');asmaOptions.className='asma-options';
for(const [key,urdu,en] of [['allah','اسماء الحسنیٰ','99 Names of Allah'],['nabi','اسماء النبی ﷺ','Asma-ul-Nabi ﷺ']]){const button=document.createElement('button');button.type='button';button.className='asma-option';button.dataset.asmaKind=key;const ar=document.createElement('strong');ar.lang='ur';ar.dir='rtl';ar.textContent=urdu;const sub=document.createElement('small');sub.textContent=en;button.append(ar,sub);button.onclick=()=>{showAsmaMenu(false);openAsma(key);window.scrollTo({top:0,behavior:'smooth'})};asmaOptions.append(button)}
asmaMenu.append(asmaOptions);document.body.append(asmaMenu);
function positionAsma(){const box=exploreAnchor(asmaToggle).getBoundingClientRect(),width=Math.min(560,innerWidth-28);asmaMenu.style.width=width+'px';asmaMenu.style.left=Math.max(14,Math.min(box.left,innerWidth-width-14))+'px';asmaMenu.style.top=Math.ceil(header.getBoundingClientRect().bottom)+6+'px'}
function showAsmaMenu(open){asmaMenu.hidden=!open;asmaToggle.setAttribute('aria-expanded',String(open));if(open){setFileMenu(false);showParaMenu(false);showSurahMenu(false);tools(false);positionAsma()}}
asmaToggle.onclick=()=>showAsmaMenu(asmaMenu.hidden);
for(const other of [fileToggle,paraToggle,surahToggle,settings,document.querySelector('.readiq-about-link')])if(other)other.addEventListener('click',()=>showAsmaMenu(false));
document.addEventListener('pointerdown',e=>{if(!asmaMenu.contains(e.target)&&!asmaToggle.contains(e.target))showAsmaMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!asmaMenu.hidden){showAsmaMenu(false);asmaToggle.focus()}});
window.addEventListener('resize',positionAsma);new ResizeObserver(positionAsma).observe(header);
// READIQ_COMMON_LANGUAGES_V1
const readingLanguages = document.getElementById('readingLanguages');
const pronunciationOption = document.getElementById('pronunciationOption');
const includePronunciation = document.getElementById('includePronunciation');
includePronunciation.checked = asmaChoice.includes('pronunciation');
includePronunciation.onchange = () => {
 save('readiq-asma-fields', includePronunciation.checked ? ['pronunciation'] : []);
 renderAsma();
};
function updateLanguageRow() {
 readingLanguages.hidden = readingMode === 'about';
 pronunciationOption.hidden = readingMode !== 'asma';
}
function renderAsma(){
 updateLanguageRow();
 const asmaChoice = selectedLanguages();
 if(includePronunciation.checked) asmaChoice.push('pronunciation');
 content.classList.remove('about-mode');content.classList.add('asma-mode');content.replaceChildren();
 const rows=asmaData[asmaKind],isNabi=asmaKind==='nabi';
 title.textContent=isNabi?'اسماء النبی ﷺ · Asma-ul-Nabi ﷺ':'اسماء الحسنیٰ · 99 Names of Allah';
 document.getElementById('languageSummary').textContent=asmaChoice.map(k=>asmaLabels[k]).join(' · ');
 document.getElementById('fileCount').textContent=rows.length+' NAMES';
 document.getElementById('status').textContent=rows.length+' names · '+(isNabi?'Asma-ul-Nabi ﷺ':'Asma-ul-Husna');
 asmaOptions.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.asmaKind===asmaKind);b.setAttribute('aria-pressed',String(b.dataset.asmaKind===asmaKind))});
 if(!asmaChoice.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='Select Arabic, Urdu, English or Pronunciation from the display language row.';content.append(empty);return}
 const list=document.createElement('div');list.className='asma-cards';
 rows.forEach((name,i)=>{const card=document.createElement('section');card.className='asma-card';const number=document.createElement('span');number.className='asma-number';number.dir='ltr';number.textContent=String(i+1);card.append(number);
 // Arabic stays central. The number aligns with the first displayed line, even without Arabic.
 let row=1;
 for(const k of ['ar','pronunciation','ur','en']){if(!asmaChoice.includes(k))continue;const p=document.createElement('p');p.className='asma-'+k;p.lang=k==='ar'?'ar':k==='ur'?'ur':'en';p.dir=(k==='ar'||k==='ur')?'rtl':'ltr';p.textContent=name[k];p.style.gridRow=String(row++);card.append(p)}
 list.append(card)});content.append(list);highlight();
}
function openAsma(kind){window.ReadIQWordByWord?.hide();window.ReadIQPractice?.hide();if(!['allah','nabi'].includes(kind))return;++token;readingMode='asma';asmaKind=kind;verses=[];selected={id:'asma-'+kind};search.value='';save('readiq-mode','asma');save('readiq-asma-kind',kind);history.replaceState(null,'','#asma-'+kind);setFileMenu(false);showParaMenu(false);showSurahMenu(false);showAsmaMenu(false);tools(false);renderLibrary();renderParasMenu();renderSurahsMenu();renderAsma()}
window.addEventListener('hashchange',()=>{const m=/^#asma-(allah|nabi)$/.exec(location.hash);if(m)openAsma(m[1])});
const asmaHash=/^#asma-(allah|nabi)$/.exec(location.hash);if(asmaHash){readingMode='asma';asmaKind=asmaHash[1]}

// READIQ_WORD_BRIDGE_V1
window.ReadIQWordBridge={
 names(){return surahNames.map(s=>s[0])},
 selection(){return {mode:['quarter','para','surah'].includes(readingMode)?readingMode:'quarter',para:selected?.para||currentPara||1,quarter:selected?.quarter||1,surah:currentSurah||1}}
};
// READIQ_WORD_BRIDGE_END

// READIQ_PRACTICE_BRIDGE_V1
window.ReadIQPracticeBridge={
 snapshot(){
  if(!['quarter','para','surah'].includes(readingMode)||!Array.isArray(verses)||!verses.length)throw Error('Open a Quarter, Para or Surah and wait for its verses to load first.');
  const clean=v=>({code:String(v.code),ar:cleanArabicEnd(v.ar),ur:cleanTranslationMarkers(v.ur),en:cleanTranslationMarkers(v.en)});
  const rows=verses.map(clean);
  if(rows.some(v=>!v.code||!v.ar||!v.ur||!v.en))throw Error('Some verse fields are missing. Practice cannot start with incomplete content.');
  return {title:title.textContent,mode:readingMode,rows,languages:selectedLanguages().filter(k=>k==='ur'||k==='en'),revision,sourceId:selected?.id||title.textContent,
   async extraPool(languages){
    const extras=[],seen=new Set(rows.map(v=>languages.map(l=>v[l].normalize('NFC').replace(/\s+/g,' ').trim()).join('\u0001')));
    const files=[...catalogue.files];for(let i=files.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[files[i],files[j]]=[files[j],files[i]]}
    for(const file of files){
     if(seen.size>=3)break;
     const response=await fetch(file.url,{cache:'no-store'});if(!response.ok)continue;const payload=await response.json();if(!Array.isArray(payload.verses))continue;
     for(const raw of payload.verses){const v=clean(raw);if(!v.code||!v.ar||!v.ur||!v.en)continue;extras.push(v);seen.add(languages.map(l=>v[l].normalize('NFC').replace(/\s+/g,' ').trim()).join('\u0001'))}
    }
    return extras;
   }
  };
 }
};

// READIQ_PRACTICE_BRIDGE_END


// READIQ_BISMILLAH_SELECTIONS_V1
window.ReadIQBismillah = (() => {
 const lines = [
  ['ar', 'rtl', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ✨'],
  ['ur', 'rtl', 'اللہ کے نام سے شروع جو نہایت مہربان ہمیشہ رحم فرمانے والا ہے'],
  ['en', 'ltr', 'In the Name of Allah, the Most Compassionate, the Ever-Merciful']
 ];
 function applies(code, selectionStart = false) {
  const match = /^P\d+[-–]S(\d+)[-–](\d+)$/u.exec(code);
  if (!match) return false;
  const surah = Number(match[1]), ayah = Number(match[2]);
  return !(surah === 9 && ayah === 1) && (selectionStart || ayah === 1);
 }
 function block() {
  const banner = document.createElement('div');
  banner.className = 'iq-bismillah';
  for (const [lang, dir, value] of lines) {
   const line = document.createElement(lang === 'ar' ? 'strong' : 'p');
   line.lang = lang;
   line.dir = dir;
   line.textContent = value;
   banner.append(line);
  }
  return banner;
 }
 return { applies, block };
})();

updateLanguageRow();

// READIQ_EXPLORE_V1
function exploreAnchor(control) {
 return document.getElementById('iqExploreToggle') || control;
}

const exploreToggle = document.createElement('button');
exploreToggle.id = 'iqExploreToggle';
exploreToggle.type = 'button';
exploreToggle.className = 'file-toggle';
exploreToggle.textContent = '☰ Explore';
exploreToggle.setAttribute('aria-controls','iqExploreMenu');
exploreToggle.setAttribute('aria-expanded','false');
const exploreMenu = document.createElement('nav');
exploreMenu.id = 'iqExploreMenu';
exploreMenu.className = 'file-menu';
exploreMenu.setAttribute('aria-label','Explore');
exploreMenu.hidden = true;
fileToggle.parentElement.prepend(exploreToggle);
document.body.append(exploreMenu);
for(const control of [fileToggle,paraToggle,surahToggle,asmaToggle,aboutLink]){
 exploreMenu.append(control);
}
function positionExplore() {
 if (exploreMenu.hidden) return;
 const left = exploreToggle.getBoundingClientRect().left;
 const width = exploreMenu.getBoundingClientRect().width;
 exploreMenu.style.left = Math.max(14,Math.min(left,innerWidth-width-14))+'px';
 exploreMenu.style.top = Math.ceil(header.getBoundingClientRect().bottom)+6+'px';
}
function hideExplore() {
 exploreMenu.hidden = true;
 exploreToggle.setAttribute('aria-expanded','false');
}
exploreToggle.onclick = () => {
 if (!exploreMenu.hidden) { hideExplore(); return; }
 document.querySelectorAll('.file-menu').forEach(panel=>panel.hidden=true);
 document.querySelectorAll('[aria-controls$="Menu"]').forEach(control=>control.setAttribute('aria-expanded','false'));
 tools(false);
 exploreMenu.hidden = false;
 exploreToggle.setAttribute('aria-expanded','true');
 positionExplore();
 exploreMenu.querySelector('button')?.focus();
};
exploreMenu.addEventListener('click',event=>{
 const control = event.target.closest('button,a');
 if (!control || !exploreMenu.contains(control)) return;
 const child = document.getElementById(control.getAttribute('aria-controls'));
 hideExplore();
 if (child && !child.hidden && !child.contains(document.activeElement)) {
  child.tabIndex = -1;
  child.focus();
 } else if (!child || child.hidden) exploreToggle.focus();
});
document.addEventListener('pointerdown',event=>{
 if (!exploreMenu.contains(event.target) && !exploreToggle.contains(event.target)) hideExplore();
});
document.addEventListener('keydown',event=>{
 if (event.key !== 'Escape') return;
 const opened = !exploreMenu.hidden || Array.from(exploreMenu.querySelectorAll('[aria-controls]')).some(control=>{
  const panel = document.getElementById(control.getAttribute('aria-controls'));
  return panel && !panel.hidden;
 });
 if (!opened) return;
 hideExplore();
 queueMicrotask(()=>exploreToggle.focus());
},true);
window.addEventListener('resize',positionExplore);
window.addEventListener('scroll',positionExplore,{passive:true});

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
