const $ = id => document.getElementById(id);
const cards = [...document.querySelectorAll('.card')];

function showTool(id){
  document.querySelector('.hero').classList.add('hidden');
  document.getElementById('tools').classList.add('hidden');
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}
function hideTools(){
  document.querySelector('.hero').classList.remove('hidden');
  document.getElementById('tools').classList.remove('hidden');
  document.querySelectorAll('.tool-panel').forEach(x=>x.classList.add('hidden'));
}

$('search').addEventListener('input', e=>{
  const q=e.target.value.trim().toLowerCase();
  cards.forEach(c=>c.style.display=c.dataset.name.toLowerCase().includes(q)?'block':'none');
});

let originalW=0, originalH=0;
$('imgInput').addEventListener('change', e=>{
  const file=e.target.files[0];
  if(!file)return;
  const img=new Image();
  img.onload=()=>{
    originalW=img.naturalWidth; originalH=img.naturalHeight;
    $('width').value=originalW; $('height').value=originalH;
    $('preview').src=img.src; $('imgArea').classList.remove('hidden');
  };
  img.src=URL.createObjectURL(file);
});
$('width').addEventListener('input',()=>{
  if($('ratio').checked && originalW) $('height').value=Math.round($('width').value*originalH/originalW);
});
$('height').addEventListener('input',()=>{
  if($('ratio').checked && originalH) $('width').value=Math.round($('height').value*originalW/originalH);
});
$('quality').addEventListener('input',()=> $('qualityValue').textContent=$('quality').value+'%');
$('processBtn').addEventListener('click',()=>{
  const file=$('imgInput').files[0]; if(!file)return;
  const img=new Image();
  img.onload=()=>{
    const canvas=document.createElement('canvas');
    canvas.width=+$('width').value; canvas.height=+$('height').value;
    canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
    canvas.toBlob(blob=>{
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='karino-image.jpg'; a.click();
      URL.revokeObjectURL(a.href);
    },'image/jpeg',+$('quality').value/100);
  };
  img.src=URL.createObjectURL(file);
});

function updateStats(){
  const t=$('textInput').value;
  const words=t.trim()?t.trim().split(/\s+/).length:0;
  const chars=t.length;
  const noSpace=t.replace(/\s/g,'').length;
  const lines=t? t.split(/\r?\n/).length:0;
  $('wordCount').textContent=words.toLocaleString('fa-IR');
  $('charCount').textContent=chars.toLocaleString('fa-IR');
  $('charNoSpace').textContent=noSpace.toLocaleString('fa-IR');
  $('lineCount').textContent=lines.toLocaleString('fa-IR');
}
$('textInput').addEventListener('input',updateStats);

$('cleanBtn').addEventListener('click',()=>{
  const el=$('textInput');
  el.value=el.value
    .replace(/[ \t]+/g,' ')
    .replace(/ *\n */g,'\n')
    .trim();
  updateStats();
});
$('clearBtn').addEventListener('click',()=>{
  $('textInput').value=''; updateStats(); $('copyStatus').textContent='';
});
$('copyBtn').addEventListener('click',async()=>{
  const text=$('textInput').value;
  if(!text)return;
  try{
    await navigator.clipboard.writeText(text);
  }catch{
    $('textInput').select(); document.execCommand('copy');
  }
  $('copyStatus').textContent='متن با موفقیت کپی شد ✓';
  setTimeout(()=>$('copyStatus').textContent='',1800);
});

let qrDownloadUrl='';
$('qrGenerate').addEventListener('click',()=>{
  const text=$('qrInput').value.trim();
  if(!text){
    $('qrStatus').textContent='اول متن یا لینک را وارد کن.';
    return;
  }
  const size=$('qrSize').value;
  const dark=$('qrDark').value.replace('#','');
  const light=$('qrLight').value.replace('#','');
  const url='https://api.qrserver.com/v1/create-qr-code/?size='+size+'x'+size+'&color='+dark+'&bgcolor='+light+'&data='+encodeURIComponent(text);
  $('qrImage').src=url;
  $('qrImage').classList.remove('hidden');
  $('qrPlaceholder').classList.add('hidden');
  $('qrDownload').classList.remove('hidden');
  $('qrStatus').textContent='QR Code ساخته شد ✓';
  qrDownloadUrl=url;
});
$('qrDownload').addEventListener('click',async()=>{
  if(!qrDownloadUrl)return;
  try{
    const res=await fetch(qrDownloadUrl);
    const blob=await res.blob();
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='karino-qr-code.png';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }catch{
    window.open(qrDownloadUrl,'_blank');
  }
});

const percentTabs=[...document.querySelectorAll('.percent-tab')];
const percentPanels={
  part:$('percentPart'),
  change:$('percentChange'),
  increase:$('percentIncrease'),
  decrease:$('percentDecrease')
};
percentTabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    percentTabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(percentPanels).forEach(p=>p.classList.add('hidden'));
    percentPanels[tab.dataset.mode].classList.remove('hidden');
  });
});
const fmt=n=>Number(n).toLocaleString('fa-IR',{maximumFractionDigits:6});
$('calcPart').addEventListener('click',()=>{
  const p=parseFloat($('partPercent').value), n=parseFloat($('partNumber').value);
  $('partResult').textContent=(Number.isFinite(p)&&Number.isFinite(n))
    ? `${fmt(p)}٪ از ${fmt(n)} می‌شود ${fmt(p*n/100)}`
    : 'لطفاً هر دو عدد را وارد کن.';
});
$('calcChange').addEventListener('click',()=>{
  const oldN=parseFloat($('oldNumber').value), newN=parseFloat($('newNumber').value);
  if(!Number.isFinite(oldN)||!Number.isFinite(newN)){$('changeResult').textContent='لطفاً هر دو عدد را وارد کن.';return}
  if(oldN===0){$('changeResult').textContent='برای عدد اولِ صفر، درصد تغییر تعریف نمی‌شود.';return}
  const change=(newN-oldN)/Math.abs(oldN)*100;
  $('changeResult').textContent=`درصد تغییر: ${fmt(change)}٪ (${change>=0?'افزایش':'کاهش'})`;
});
$('calcIncrease').addEventListener('click',()=>{
  const n=parseFloat($('increaseNumber').value), p=parseFloat($('increasePercent').value);
  $('increaseResult').textContent=(Number.isFinite(n)&&Number.isFinite(p))
    ? `نتیجه: ${fmt(n*(1+p/100))}`
    : 'لطفاً هر دو عدد را وارد کن.';
});
$('calcDecrease').addEventListener('click',()=>{
  const n=parseFloat($('decreaseNumber').value), p=parseFloat($('decreasePercent').value);
  $('decreaseResult').textContent=(Number.isFinite(n)&&Number.isFinite(p))
    ? `نتیجه: ${fmt(n*(1-p/100))}`
    : 'لطفاً هر دو عدد را وارد کن.';
});

const unitData={
  length:{
    'متر':1,'کیلومتر':1000,'سانتی‌متر':0.01,'میلی‌متر':0.001,'مایل':1609.344,'یارد':0.9144,'فوت':0.3048,'اینچ':0.0254
  },
  weight:{
    'کیلوگرم':1,'گرم':0.001,'میلی‌گرم':0.000001,'تن':1000,'پوند':0.45359237,'اونس':0.028349523125
  },
  volume:{
    'لیتر':1,'میلی‌لیتر':0.001,'متر مکعب':1000,'گالن آمریکا':3.785411784,'فنجان آمریکا':0.2365882365
  },
  temperature:['سلسیوس','فارنهایت','کلوین']
};
const unitTabs=[...document.querySelectorAll('.unit-tab')];
let currentUnitType='length';

function fillUnits(){
  const from=$('unitFrom'),to=$('unitTo');
  from.innerHTML='';to.innerHTML='';
  const data=unitData[currentUnitType];
  const names=Array.isArray(data)?data:Object.keys(data);
  names.forEach(name=>{
    from.add(new Option(name,name));
    to.add(new Option(name,name));
  });
  if(names.length>1) to.selectedIndex=1;
}
function convertTemperature(v,from,to){
  let c;
  if(from==='سلسیوس') c=v;
  else if(from==='فارنهایت') c=(v-32)*5/9;
  else c=v-273.15;
  if(to==='سلسیوس') return c;
  if(to==='فارنهایت') return c*9/5+32;
  return c+273.15;
}
unitTabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    unitTabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    currentUnitType=tab.dataset.type;
    fillUnits();
    $('unitResult').textContent='نتیجه اینجا نمایش داده می‌شود.';
  });
});
fillUnits();

$('convertUnit').addEventListener('click',()=>{
  const v=parseFloat($('unitValue').value);
  const from=$('unitFrom').value,to=$('unitTo').value;
  if(!Number.isFinite(v)){$('unitResult').textContent='لطفاً یک مقدار وارد کن.';return}
  let result;
  if(currentUnitType==='temperature') result=convertTemperature(v,from,to);
  else result=v*unitData[currentUnitType][from]/unitData[currentUnitType][to];
  const formatted=Number(result).toLocaleString('fa-IR',{maximumFractionDigits:8});
  $('unitResult').textContent=`${formatted} ${to}`;
});

const pdfTabs=[...document.querySelectorAll('.pdf-tab')];
const pdfPanels={merge:$('pdfMerge'),split:$('pdfSplit'),delete:$('pdfDelete'),imagepdf:$('pdfImagePdf'),rotate:$('pdfRotate'),reorder:$('pdfReorder')};
pdfTabs.forEach(tab=>{
  tab.addEventListener('click',()=>{
    pdfTabs.forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(pdfPanels).forEach(p=>p.classList.add('hidden'));
    pdfPanels[tab.dataset.pdfmode].classList.remove('hidden');
    $('pdfStatus').textContent='';
  });
});

let mergeSelected=[];
$('mergeFiles').addEventListener('change',e=>{
  mergeSelected=[...e.target.files];
  $('mergeList').innerHTML=mergeSelected.length
    ? mergeSelected.map((f,i)=>`<div class="pdf-item">${i+1}. ${f.name} — ${(f.size/1024/1024).toFixed(2)} MB</div>`).join('')
    : '';
  $('mergeBtn').disabled=mergeSelected.length<2;
});

function downloadBlob(bytes,name,type='application/pdf'){
  const blob=new Blob([bytes],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function parsePageSpec(spec,max){
  const set=new Set();
  for(const part of spec.split(',').map(x=>x.trim()).filter(Boolean)){
    if(part.includes('-')){
      const [a,b]=part.split('-').map(Number);
      if(!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a||b>max) return null;
      for(let i=a;i<=b;i++) set.add(i);
    }else{
      const n=Number(part);
      if(!Number.isInteger(n)||n<1||n>max) return null;
      set.add(n);
    }
  }
  return [...set].sort((a,b)=>a-b);
}

$('mergeBtn').addEventListener('click',async()=>{
  if(!window.PDFLib){$('pdfStatus').textContent='کتابخانه PDF بارگذاری نشده؛ اینترنت را بررسی کن.';return}
  try{
    $('pdfStatus').textContent='در حال ادغام...';
    const out=await PDFLib.PDFDocument.create();
    for(const file of mergeSelected){
      const doc=await PDFLib.PDFDocument.load(await file.arrayBuffer());
      const pages=await out.copyPages(doc,doc.getPageIndices());
      pages.forEach(p=>out.addPage(p));
    }
    downloadBlob(await out.save(),'karino-merged.pdf');
    $('pdfStatus').textContent='فایل PDF با موفقیت ادغام شد ✓';
  }catch(err){$('pdfStatus').textContent='ادغام انجام نشد؛ ممکن است فایل رمزگذاری‌شده یا خراب باشد.'}
});

let splitPdfFile=null,deletePdfFile=null,splitPageCount=0,deletePageCount=0;
$('splitFile').addEventListener('change',async e=>{
  splitPdfFile=e.target.files[0];
  splitPageCount=0;
  if(!splitPdfFile)return;
  try{
    const doc=await PDFLib.PDFDocument.load(await splitPdfFile.arrayBuffer());
    splitPageCount=doc.getPageCount();
    $('splitInfo').textContent=`تعداد صفحات: ${splitPageCount}`;
    $('splitBtn').disabled=false;
  }catch{$('splitInfo').textContent='خواندن PDF ممکن نیست.';$('splitBtn').disabled=true}
});
$('deleteFile').addEventListener('change',async e=>{
  deletePdfFile=e.target.files[0];
  deletePageCount=0;
  if(!deletePdfFile)return;
  try{
    const doc=await PDFLib.PDFDocument.load(await deletePdfFile.arrayBuffer());
    deletePageCount=doc.getPageCount();
    $('deleteInfo').textContent=`تعداد صفحات: ${deletePageCount}`;
    $('deleteBtn').disabled=false;
  }catch{$('deleteInfo').textContent='خواندن PDF ممکن نیست.';$('deleteBtn').disabled=true}
});

$('splitBtn').addEventListener('click',async()=>{
  if(!splitPdfFile)return;
  const pages=parsePageSpec($('splitPages').value,splitPageCount);
  if(!pages){$('pdfStatus').textContent='شماره صفحات نامعتبر است.';return}
  try{
    const src=await PDFLib.PDFDocument.load(await splitPdfFile.arrayBuffer());
    const out=await PDFLib.PDFDocument.create();
    const copied=await out.copyPages(src,pages.map(n=>n-1));
    copied.forEach(p=>out.addPage(p));
    downloadBlob(await out.save(),'karino-split.pdf');
    $('pdfStatus').textContent='صفحات با موفقیت جدا شدند ✓';
  }catch{$('pdfStatus').textContent='جدا کردن صفحات انجام نشد.'}
});

$('deleteBtn').addEventListener('click',async()=>{
  if(!deletePdfFile)return;
  const pages=parsePageSpec($('deletePages').value,deletePageCount);
  if(!pages){$('pdfStatus').textContent='شماره صفحات نامعتبر است.';return}
  if(pages.length===deletePageCount){$('pdfStatus').textContent='نمی‌توان همه صفحات را حذف کرد.';return}
  try{
    const src=await PDFLib.PDFDocument.load(await deletePdfFile.arrayBuffer());
    const out=await PDFLib.PDFDocument.create();
    const remove=new Set(pages.map(n=>n-1));
    const keep=[];
    for(let i=0;i<deletePageCount;i++) if(!remove.has(i)) keep.push(i);
    const copied=await out.copyPages(src,keep);
    copied.forEach(p=>out.addPage(p));
    downloadBlob(await out.save(),'karino-pages-removed.pdf');
    $('pdfStatus').textContent='صفحات انتخاب‌شده حذف شدند ✓';
  }catch{$('pdfStatus').textContent='حذف صفحات انجام نشد.'}
});


// Karino V8 - PDF image conversion, rotation and reordering
let imagePdfSelected=[];
$('imagePdfFiles').addEventListener('change',e=>{
  imagePdfSelected=[...e.target.files];
  $('imagePdfList').innerHTML=imagePdfSelected.length
    ? imagePdfSelected.map((f,i)=>`<div class="pdf-item">${i+1}. ${f.name} — ${(f.size/1024/1024).toFixed(2)} MB</div>`).join('')
    : '';
  $('imagePdfBtn').disabled=imagePdfSelected.length===0;
});

$('imagePdfBtn').addEventListener('click',async()=>{
  if(!window.PDFLib){$('pdfStatus').textContent='کتابخانه PDF بارگذاری نشده؛ اینترنت را بررسی کن.';return}
  if(!imagePdfSelected.length)return;
  try{
    $('pdfStatus').textContent='در حال ساخت PDF از عکس‌ها...';
    const out=await PDFLib.PDFDocument.create();
    for(const file of imagePdfSelected){
      const bytes=await file.arrayBuffer();
      let image;
      if(file.type==='image/jpeg'||file.type==='image/jpg') image=await out.embedJpg(bytes);
      else if(file.type==='image/png') image=await out.embedPng(bytes);
      else {
        const bitmap=await createImageBitmap(new Blob([bytes],{type:file.type}));
        const canvas=document.createElement('canvas');
        canvas.width=bitmap.width; canvas.height=bitmap.height;
        canvas.getContext('2d').drawImage(bitmap,0,0);
        const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
        image=await out.embedPng(await png.arrayBuffer());
        bitmap.close();
      }
      const scale=Math.min(595.28/image.width,841.89/image.height);
      const w=image.width*scale, h=image.height*scale;
      const page=out.addPage([w,h]);
      page.drawImage(image,{x:0,y:0,width:w,height:h});
    }
    downloadBlob(await out.save(),'karino-images.pdf');
    $('pdfStatus').textContent='PDF از عکس‌ها با موفقیت ساخته شد ✓';
  }catch(err){$('pdfStatus').textContent='تبدیل عکس به PDF انجام نشد.';}
});

let rotatePdfFile=null, rotatePageCount=0;
$('rotateFile').addEventListener('change',async e=>{
  rotatePdfFile=e.target.files[0]; rotatePageCount=0;
  $('rotateBtn').disabled=true; $('rotateInfo').textContent='';
  if(!rotatePdfFile)return;
  try{
    const doc=await PDFLib.PDFDocument.load(await rotatePdfFile.arrayBuffer());
    rotatePageCount=doc.getPageCount();
    $('rotateInfo').textContent=`تعداد صفحات: ${rotatePageCount}`;
    $('rotateBtn').disabled=false;
  }catch{$('rotateInfo').textContent='خواندن PDF ممکن نیست.';}
});
$('rotateBtn').addEventListener('click',async()=>{
  if(!rotatePdfFile)return;
  const pages=parsePageSpec($('rotatePages').value,rotatePageCount);
  if(!pages){$('pdfStatus').textContent='شماره صفحات نامعتبر است.';return}
  try{
    const doc=await PDFLib.PDFDocument.load(await rotatePdfFile.arrayBuffer());
    const angle=Number($('rotateAngle').value);
    pages.forEach(n=>{
      const page=doc.getPage(n-1);
      const current=page.getRotation().angle||0;
      page.setRotation(PDFLib.degrees((current+angle)%360));
    });
    downloadBlob(await doc.save(),'karino-rotated.pdf');
    $('pdfStatus').textContent='صفحات با موفقیت چرخانده شدند ✓';
  }catch{$('pdfStatus').textContent='چرخاندن صفحات انجام نشد.';}
});

let reorderPdfFile=null,reorderPageCount=0;
$('reorderFile').addEventListener('change',async e=>{
  reorderPdfFile=e.target.files[0]; reorderPageCount=0;
  $('reorderBtn').disabled=true; $('reorderInfo').textContent='';
  if(!reorderPdfFile)return;
  try{
    const doc=await PDFLib.PDFDocument.load(await reorderPdfFile.arrayBuffer());
    reorderPageCount=doc.getPageCount();
    $('reorderInfo').textContent=`تعداد صفحات: ${reorderPageCount}`;
    $('reorderBtn').disabled=false;
  }catch{$('reorderInfo').textContent='خواندن PDF ممکن نیست.';}
});
$('reorderBtn').addEventListener('click',async()=>{
  if(!reorderPdfFile)return;
  const pages=parsePageSpec($('reorderPages').value,reorderPageCount);
  if(!pages||pages.length!==reorderPageCount){$('pdfStatus').textContent=`باید دقیقاً ترتیب هر ${reorderPageCount} صفحه را وارد کنی؛ بدون تکرار.`;return}
  if(new Set(pages).size!==reorderPageCount){$('pdfStatus').textContent='هر صفحه باید دقیقاً یک‌بار در ترتیب جدید باشد.';return}
  try{
    const src=await PDFLib.PDFDocument.load(await reorderPdfFile.arrayBuffer());
    const out=await PDFLib.PDFDocument.create();
    const copied=await out.copyPages(src,pages.map(n=>n-1));
    copied.forEach(p=>out.addPage(p));
    downloadBlob(await out.save(),'karino-reordered.pdf');
    $('pdfStatus').textContent='ترتیب صفحات با موفقیت تغییر کرد ✓';
  }catch{$('pdfStatus').textContent='جابه‌جایی صفحات انجام نشد.';}
});
