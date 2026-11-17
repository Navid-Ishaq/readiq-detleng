"""Read IQ Word-by-Word: strict, dependency-free XLSX reader."""
import hashlib,json,re,zipfile,posixpath
from pathlib import Path
from xml.etree import ElementTree as ET

M={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
def canonical(code):
 m=re.fullmatch(r'P(\d+)[-–]S(\d+)[-–](\d+)',code)
 if not m:raise ValueError('Invalid Ayat code: '+code)
 return tuple(map(int,m.groups()))

def read_word_workbook(path):
 result={};expected=[f'{p:02}-{q:02}' for p in range(1,31) for q in range(1,5)]
 with zipfile.ZipFile(path) as z:
  shared=[]
  if 'xl/sharedStrings.xml' in z.namelist():
   shared=[''.join(t.text or '' for t in si.findall('.//m:t',M)) for si in ET.fromstring(z.read('xl/sharedStrings.xml'))]
  rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
  sheets=ET.fromstring(z.read('xl/workbook.xml')).find('m:sheets',M)
  names=[s.attrib['name'] for s in sheets]
  if len(names)!=120 or set(names)!=set(expected):raise ValueError('Word-by-Word workbook must have exactly 120 sheets: 01-01 through 30-04.')
  for sheet in sheets:
   name=sheet.attrib['name'];p,q=map(int,name.split('-'));target=rels[sheet.attrib['{'+REL+'}id']]
   target=target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join('xl',target))
   if not target.startswith('xl/worksheets/'):raise ValueError('Invalid worksheet path')
   root=ET.fromstring(z.read(target));words=[];seen_serial=set();last_serial=0;last_verse=None;closed=set()
   for row in root.findall('m:sheetData/m:row',M):
    cells={}
    for cell in row.findall('m:c',M):
     col=re.sub(r'\d','',cell.attrib['r']);v=cell.find('m:v',M)
     if cell.find('m:f',M) is not None:raise ValueError(f'{name} {cell.attrib["r"]}: formulas are not supported in source content.')
     text=''.join(t.text or '' for t in cell.findall('.//m:t',M)) if cell.attrib.get('t')=='inlineStr' else (v.text or '' if v is not None else '')
     if cell.attrib.get('t')=='s':text=shared[int(text)]
     cells[col]=text
    if not any(v.strip() for v in cells.values()):continue
    a,b,c=[cells.get(k,'') for k in ('A','B','C')]
    if 'code' in b.lower() and 'translation' in c.lower():continue
    where=f'{name}, Excel row {row.attrib["r"]}'
    if not re.fullmatch(r'\d+',a.strip()):raise ValueError(where+': serial number must be an integer.')
    serial=int(a)
    if serial in seen_serial or serial<=last_serial:raise ValueError(where+': serial numbers must be unique and increasing.')
    match=re.fullmatch(r'(P\d+[-–]S\d+[-–]\d+)\s*[—–-]\s*(.+)',b,re.S)
    if not match:raise ValueError(where+': expected code — Arabic word.')
    key=canonical(match[1])
    if key[0]!=p:raise ValueError(where+': Ayat code does not match the sheet Para.')
    if key!=last_verse:
     if key in closed:raise ValueError(where+': words of one Ayat must remain together.')
     if last_verse is not None:closed.add(last_verse)
     last_verse=key
    separators=list(re.finditer(r'\s+[—–]\s+',c))
    boundary=next((m for m in separators if re.search(r'[A-Za-z]',c[m.end():]) and next((ch for ch in c[m.end():] if ch.isalpha()),'').isascii()),None)
    if boundary is None:raise ValueError(where+': expected Urdu — English translation.')
    ur,en=c[:boundary.start()].strip(),c[boundary.end():].strip()
    if not ur or not en:raise ValueError(where+': both translations are required.')
    ar=match[2].strip()
    if not ar:raise ValueError(where+': Arabic word is empty.')
    words.append({'id':f'{name}:{serial}','serial':serial,'sheet':name,'code':match[1],'ar':ar,'ur':ur,'en':en})
    seen_serial.add(serial);last_serial=serial
   result[name]=words
 return result

def build_word_by_word(root,stage,catalogue,payloads):
 source=root/'Irfan-ul-Quran-WordByWord'/'Irfan-ul-Quran-WordByWord.xlsx'
 if not source.is_file():raise ValueError('Missing Irfan-ul-Quran-WordByWord/Irfan-ul-Quran-WordByWord.xlsx')
 raw=read_word_workbook(source);all_verses={};quarter_verses={}
 for f in catalogue['files']:
  name=f'{f["para"]:02}-{f["quarter"]:02}';quarter_verses[name]=[]
  for verse in payloads[f['url']]['verses']:
   key=canonical(verse['code']);all_verses[key]=verse;quarter_verses[name].append(key)
 sheets=[];surah_sheets={};all_words=[]
 folder=stage/'word-by-word';folder.mkdir(exist_ok=True)
 for name,words in sorted(raw.items()):
  allowed=set(quarter_verses.get(name,[]));covered=set()
  for word in words:
   key=canonical(word['code'])
   if key not in all_verses:raise ValueError(f'{name}, serial {word["serial"]}: Ayat {word["code"]} not found in full-verse source.')
   if key not in allowed:raise ValueError(f'{name}, serial {word["serial"]}: {word["code"]} belongs to a different quarter.')
   word['fullAr']=all_verses[key]['ar'];word['fullUr']=all_verses[key]['ur'];word['fullEn']=all_verses[key]['en'];word['surah']=key[1];word['ayah']=key[2];covered.add(key)
   surah_sheets.setdefault(key[1],set()).add(name)
  url=None
  if words:
   digest=hashlib.sha256(json.dumps(words,ensure_ascii=False).encode()).hexdigest()[:16]
   url=f'word-by-word/{name}-{digest}.json'
   (stage/url).write_text(json.dumps({'sheet':name,'words':words},ensure_ascii=False),encoding='utf-8')
  sheets.append({'name':name,'para':int(name[:2]),'quarter':int(name[-2:]),'count':len(words),'verseCount':len(covered),'expectedVerses':len(allowed),'coverageComplete':bool(allowed) and covered==allowed,'url':url})
  all_words.extend(words)
 surahs=[]
 for s in catalogue['surahs']:
  number=s['number'];w=[w for w in all_words if w['surah']==number];covered={w['ayah'] for w in w}
  surahs.append({'number':number,'count':len(w),'verseCount':len(covered),'expectedVerses':s['expected'],'coverageComplete':len(covered)==s['expected'],'sheets':sorted(surah_sheets.get(number,set()))})
 index={'sheets':sheets,'surahs':surahs,'count':len(all_words),'source':'Irfan-ul-Quran-WordByWord.xlsx'}
 index['revision']=hashlib.sha256(json.dumps(index,ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
 (folder/'index.json').write_text(json.dumps(index,ensure_ascii=False),encoding='utf-8')
 catalogue['wordByWord']={'url':'word-by-word/index.json','revision':index['revision'],'count':len(all_words)}
 catalogue['revision']=hashlib.sha256(json.dumps(catalogue,ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
 print(f'Word-by-Word: {len(all_words)} words / {sum(bool(s["count"]) for s in sheets)} populated quarters / 120 sheets.',flush=True)
 return index
