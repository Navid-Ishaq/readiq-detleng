#!/usr/bin/env python3
"""Read IQ: strict, loss-aware extraction from supplied three-column Word tables."""
import hashlib,json,re,shutil,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
CONTENT=ROOT/'Read Irfanul Quran'
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
LABELS=[('First Quarter','پہلا ربع'),('Second Quarter','نصف'),('Third Quarter','تیسرا ربع'),('Fourth Quarter','آخری ربع')]
def cell_text(cell):
 paragraphs=[]
 for p in cell.findall('.//w:p',NS):
  parts=[]
  for el in p.iter():
   if el.tag=='{'+NS['w']+'}t':parts.append(el.text or '')
   elif el.tag in ('{'+NS['w']+'}br','{'+NS['w']+'}cr'):parts.append('\n')
   elif el.tag=='{'+NS['w']+'}tab':parts.append('\t')
  paragraphs.append(''.join(parts))
 return '\n'.join(paragraphs).strip()

# READIQ_TRANSLATION_SPLIT_V2
def split_translation(text):
    marks = list(re.finditer(r'\s+[\u2013\u2014]\s+', text))
    if not marks:
        raise ValueError('No translation separator found')

    chosen = marks[0]

    if len(marks) > 1:
        candidates = []
        for mark in marks:
            right = text[mark.end():]
            first = next((c for c in right if c.isalpha()), '')
            if first and re.fullmatch(r'[A-Za-z]', first):
                candidates.append(mark)

        if not candidates:
            raise ValueError('Cannot identify Urdu/English boundary')

        chosen = candidates[0]

    return [
        text[:chosen.start()].strip(),
        text[chosen.end():].strip()
    ]

def parse_docx(path):
 with zipfile.ZipFile(path) as z:root=ET.fromstring(z.read('word/document.xml'))
 records=[];seen=set()
 for table in root.findall('./w:body/w:tbl',NS):
  for rowno,row in enumerate(table.findall('w:tr',NS),1):
   cells=[cell_text(c) for c in row.findall('w:tc',NS)]
   if not any(cells):continue
   if len(cells)==3 and 'code' in cells[1].lower() and 'translation' in cells[2].lower():continue
   if len(cells)!=3:raise ValueError(f'{path.name}, row {rowno}: expected three columns')
   match=re.fullmatch(r'(P\d+[-–]S\d+[-–]\d+)\s*[–—-]\s*(.+)',cells[1],re.S)
   trans=split_translation(cells[2])
   if not match or len(trans)!=2 or not all(t.strip() for t in trans):
    raise ValueError(f'{path.name}, row {rowno}: cannot separate code/Arabic/Urdu/English; review source row')
   code=match[1]
   if code in seen:raise ValueError(f'{path.name}: duplicate verse code {code}')
   seen.add(code);records.append({'code':code,'ar':match[2].strip(),'ur':trans[0].strip(),'en':trans[1].strip()})
 if not records:raise ValueError(f'{path.name}: no verse records found')
 return records

# READIQ_SURAHS_V1
SURAH_EXPECTED = [7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6]
def index_surahs(payloads):
 groups={}; metadata=[]; additions={}
 for payload in payloads.values():
  for verse in payload['verses']:
   match=re.fullmatch(r'P\d+[-–]S(\d+)[-–](\d+)',verse['code'])
   if not match:raise ValueError('Invalid verse code: '+verse['code'])
   number,ayah=map(int,match.groups())
   if not 1<=number<=114 or not 1<=ayah<=SURAH_EXPECTED[number-1]:raise ValueError('Out-of-range verse code: '+verse['code'])
   group=groups.setdefault(number,{})
   if ayah in group:raise ValueError(f'Duplicate Surah {number} ayah {ayah}: '+verse['code'])
   group[ayah]=verse
 for number,expected in enumerate(SURAH_EXPECTED,1):
  group=groups.get(number,{})
  ordered=[group[n] for n in sorted(group)]
  complete=set(group)==set(range(1,expected+1))
  url=None
  if ordered:
   digest=hashlib.sha256(json.dumps(ordered,ensure_ascii=False).encode()).hexdigest()[:16]
   url=f'documents/surah-{number:03}-{digest}.json'
   additions[url]={'name':f'Surah {number}','verses':ordered}
  metadata.append({'number':number,'count':len(ordered),'expected':expected,'complete':complete,'url':url})
 return metadata,additions

def build():
 if not CONTENT.is_dir():raise ValueError('Missing content folder: Read Irfanul Quran')
 items=[];payloads={};all_keys=set()
 for path in sorted(CONTENT.rglob('*')):
  if not path.is_file() or path.suffix.lower()!='.docx':continue
  if path.is_symlink() or any(p.startswith(('.', '~$')) for p in path.relative_to(CONTENT).parts):continue
  m=re.fullmatch(r'IQV-Para-(\d{2})-(0[1-4])\.docx',path.name,re.I)
  if not m:raise ValueError(f'Unexpected filename: {path.name}; expected IQV-Para-NN-01..04.docx')
  para,quarter=map(int,m.groups())
  if not 1<=para<=30:raise ValueError(f'Invalid para: {path.name}')
  if path.parent.name!=f'Para-{para:02}':raise ValueError(f'{path.name} must be inside Para-{para:02}')
  if (para,quarter) in all_keys:raise ValueError(f'Duplicate quarter: {para}/{quarter}')
  all_keys.add((para,quarter));rows=parse_docx(path)
  digest=hashlib.sha256(json.dumps(rows,ensure_ascii=False).encode()).hexdigest()[:16]
  url=f'documents/para-{para:02}-{quarter:02}-{digest}.json'
  label,urdu=LABELS[quarter-1]
  item={'para':para,'quarter':quarter,'label':label,'urdu':urdu,'path':path.relative_to(CONTENT).as_posix(),'url':url,'count':len(rows),'id':f'P{para:02}-Q{quarter}'}
  items.append(item);payloads[url]={'name':path.stem,'verses':rows}
 folders=sorted({int(p.name[-2:]) for p in CONTENT.rglob('Para-*') if p.is_dir() and re.fullmatch(r'Para-(0[1-9]|[12]\d|30)',p.name)})
 catalogue={'folders':folders,'files':sorted(items,key=lambda i:(i['para'],i['quarter'])),'count':sum(i['count'] for i in items)}
 surahs,surah_payloads=index_surahs(payloads)
 catalogue['surahs']=surahs
 payloads.update(surah_payloads)
 catalogue['revision']=hashlib.sha256(json.dumps(catalogue,ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
 # Parse everything before touching the previous generated snapshot.
 stage=ROOT/'_site-next';out=ROOT/'_site'
 if stage.exists():shutil.rmtree(stage)
 (stage/'documents').mkdir(parents=True)
 # READIQ_WORD_BUILD_V1
 import runpy
 runpy.run_path(str(ROOT/'tools'/'wbw_build.py'))['build_word_by_word'](ROOT,stage,catalogue,payloads)
 for word_asset in ('word-by-word.js','word-by-word.css'):
  if not (ROOT/word_asset).is_file():raise ValueError('Missing '+word_asset)
  shutil.copy2(ROOT/word_asset,stage/word_asset)
 # READIQ_WORD_BUILD_END

 for url,payload in payloads.items():(stage/url).write_text(json.dumps(payload,ensure_ascii=False),encoding='utf-8')
 (stage/'library.json').write_text(json.dumps(catalogue,ensure_ascii=False),encoding='utf-8')
 shutil.copy2(ROOT/'interface.html',stage/'index.html')
 for name in ('app.js','favicon.svg','CNAME','.nojekyll'):shutil.copy2(ROOT/name,stage/name)
 # READIQ_ABOUT_V1
 about_page=ROOT/'about.html'
 if not about_page.is_file():raise ValueError('Missing about.html')
 shutil.copy2(about_page,stage/'about.html')
 # READIQ_MUSHAF_BUILD_V1
 font_source=ROOT/'fonts'/'almushaf-org.ttf'
 if not font_source.is_file():raise ValueError('Missing fonts/almushaf-org.ttf')
 (stage/'fonts').mkdir(exist_ok=True)
 shutil.copy2(font_source,stage/'fonts'/'almushaf-org.ttf')
 # READIQ_PRACTICE_BUILD_V1
 for practice_asset in ('practice.js','practice.css'):
  if not (ROOT/practice_asset).is_file():raise ValueError('Missing '+practice_asset)
  shutil.copy2(ROOT/practice_asset,stage/practice_asset)
 if out.exists():shutil.rmtree(out)
 stage.rename(out)
 print(f'Built {len(items)} quarters / {catalogue["count"]} verses. All text comes from supplied Word files.',flush=True)
 return catalogue
if __name__=='__main__':build()
