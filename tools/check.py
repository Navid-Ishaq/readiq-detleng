"""Integrity checks for extraction and generated output. No external dependencies."""
import hashlib,itertools,json,re,shutil,tempfile,zipfile
from pathlib import Path
from xml.etree import ElementTree as ET
import build as engine

def main():
 data=engine.build();root=engine.ROOT;total=0;ids=set()
 for f in data['files']:
  source=engine.CONTENT/f['path'];rows=engine.parse_docx(source)
  payload=json.loads((root/'_site'/f['url']).read_text(encoding='utf-8'))
  assert payload['verses']==rows
  assert f['id'] not in ids;ids.add(f['id']);total+=len(rows)
  # Reconstruct both original cells from their extracted parts.
  with zipfile.ZipFile(source) as z:xml=ET.fromstring(z.read('word/document.xml'))
  source_rows=[r for r in xml.findall('./w:body/w:tbl/w:tr',engine.NS) if len(r.findall('w:tc',engine.NS))==3]
  n=0
  for r in source_rows:
   cells=[engine.cell_text(c) for c in r.findall('w:tc',engine.NS)]
   if not any(cells) or ('code' in cells[1].lower() and 'translation' in cells[2].lower()):continue
   match=re.fullmatch(r'(P\d+[-–]S\d+[-–]\d+)\s*[–—-]\s*(.+)',cells[1],re.S)
   pieces=engine.split_translation(cells[2])
   v=rows[n];n+=1
   assert v==dict(code=match[1],ar=match[2].strip(),ur=pieces[0].strip(),en=pieces[1].strip())
  assert n==len(rows)
  for bits in itertools.product([False,True],repeat=3):
   languages=[k for k,b in zip(['ar','ur','en'],bits) if b]
   for row in rows:
    assert row['code'] and all(row[k] for k in languages)
 print(f'PASS: {len(ids)} quarter files, {total} records; codes and source text preserved; all 7 language combinations have complete fields.')
 # Exercise catalogue discovery in an isolated temporary project.
 original_root,original_content=engine.ROOT,engine.CONTENT
 with tempfile.TemporaryDirectory() as d:
  test=Path(d)
  for n in ['interface.html','app.js','favicon.svg','CNAME','.nojekyll']:shutil.copy2(root/n,test/n)
  folder=test/'Read Irfanul Quran/Para-01';folder.mkdir(parents=True)
  src=engine.CONTENT/data['files'][0]['path'];dest=folder/'IQV-Para-01-01.docx';shutil.copy2(src,dest)
  engine.ROOT=test;engine.CONTENT=test/'Read Irfanul Quran'
  try:
   a=engine.build();(engine.CONTENT/'Para-30').mkdir();b=engine.build();assert 30 in b['folders'] and a['revision']!=b['revision']
   renamed=folder/'IQV-Para-01-02.docx';dest.rename(renamed);c=engine.build();assert c['files'][0]['quarter']==2
   before=(test/'_site/library.json').read_bytes();renamed.write_bytes(b'bad docx')
   try:engine.build();raise AssertionError('Bad DOCX accepted')
   except zipfile.BadZipFile:pass
   assert before==(test/'_site/library.json').read_bytes()
   renamed.unlink();assert engine.build()['files']==[]
  finally:engine.ROOT=original_root;engine.CONTENT=original_content
 print('PASS: folder discovery, rename and deletion; malformed input keeps previous output intact.')
if __name__=='__main__':main()
