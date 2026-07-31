const STORAGE_KEY='marginpilot-products-v1'
const PRESETS={
 wb:{name:'Wildberries',commissionPct:22,logistics:125,storage:18,fulfillment:45,packaging:25,acquiringPct:1.5},
 ozon:{name:'Ozon',commissionPct:20,logistics:110,storage:15,fulfillment:50,packaging:25,acquiringPct:1.5},
 ym:{name:'Яндекс Маркет',commissionPct:18,logistics:95,storage:12,fulfillment:55,packaging:25,acquiringPct:1.7}
}
const ids=['productName','marketplace','salePrice','costPrice','commissionPct','logistics','storage','fulfillment','packaging','acquiringPct','adsPct','taxPct','returnsPct','otherCosts','targetMargin','monthlySales']
const $=id=>document.getElementById(id)
const num=id=>Math.max(0,Number($(id).value)||0)
const rub=v=>new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(Number(v)||0)
const pct=v=>`${(Number(v)||0).toFixed(1).replace('.0','')}%`
const stateFromForm=()=>Object.fromEntries(ids.map(id=>[id,$(id).value]))

function applyPreset(key,keepCore=true){
 const p=PRESETS[key]; if(!p)return
 for(const k of ['commissionPct','logistics','storage','fulfillment','packaging','acquiringPct']) $(k).value=p[k]
 if(!keepCore){$('adsPct').value=8;$('taxPct').value=6;$('returnsPct').value=10;$('otherCosts').value=50;$('targetMargin').value=25;$('monthlySales').value=100}
 calculate()
}

function metricsFor(presetKey=$('marketplace').value,usePreset=false){
 const p=PRESETS[presetKey]
 const price=num('salePrice'),cost=num('costPrice')
 const commissionPct=usePreset?p.commissionPct:num('commissionPct')
 const logistics=usePreset?p.logistics:num('logistics')
 const storage=usePreset?p.storage:num('storage')
 const fulfillment=usePreset?p.fulfillment:num('fulfillment')
 const packaging=usePreset?p.packaging:num('packaging')
 const acquiringPct=usePreset?p.acquiringPct:num('acquiringPct')
 const adsPct=num('adsPct'),taxPct=num('taxPct'),returnsPct=Math.min(95,num('returnsPct')),other=num('otherCosts')
 const percentageRate=(commissionPct+acquiringPct+adsPct+taxPct)/100
 const returnReserve=(logistics*2+fulfillment+packaging)*returnsPct/100
 const fixed=cost+logistics+storage+fulfillment+packaging+returnReserve+other
 const commission=price*commissionPct/100,acquiring=price*acquiringPct/100,ads=price*adsPct/100,tax=price*taxPct/100
 const totalCosts=fixed+commission+acquiring+ads+tax
 const profit=price-totalCosts
 const margin=price?profit/price*100:0,roi=cost?profit/cost*100:0
 const breakEven=1-percentageRate>0?fixed/(1-percentageRate):0
 const target=num('targetMargin')/100
 const targetPrice=1-percentageRate-target>0?fixed/(1-percentageRate-target):0
 return {presetKey,price,cost,commissionPct,logistics,storage,fulfillment,packaging,acquiringPct,adsPct,taxPct,returnsPct,other,returnReserve,commission,acquiring,ads,tax,fixed,totalCosts,profit,margin,roi,breakEven,targetPrice,percentageRate}
}

function calculate(){
 const m=metricsFor()
 $('profit').textContent=rub(m.profit);$('heroProfit').textContent=rub(m.profit)
 $('margin').textContent=pct(m.margin);$('roi').textContent=pct(m.roi);$('breakEven').textContent=rub(m.breakEven);$('targetPrice').textContent=rub(m.targetPrice)
 $('monthlyProfit').textContent=rub(m.profit*num('monthlySales'));$('costShare').textContent=pct(m.price?m.totalCosts/m.price*100:0)
 const status=m.profit>0?(m.margin>=25?'Здоровая экономика товара':'Товар прибыльный, но запас небольшой'):'Продажа убыточна при этих параметрах'
 $('heroStatus').textContent=status;$('profitNote').textContent=status
 $('scoreCard').className=`score ${m.profit>=0?'positive':'negative'}`
 const costs=[['Себестоимость',m.cost],['Комиссия',m.commission],['Логистика',m.logistics],['Хранение',m.storage],['Фулфилмент',m.fulfillment],['Упаковка',m.packaging],['Реклама',m.ads],['Налог',m.tax],['Эквайринг',m.acquiring],['Возвраты',m.returnReserve],['Прочее',m.other]].filter(x=>x[1]>0)
 const max=Math.max(...costs.map(x=>x[1]),1)
 $('costRows').innerHTML=costs.map(([n,v])=>`<div class="cost-row"><span>${n}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><strong>${rub(v)}</strong></div>`).join('')
 renderCompare(); return m
}

function renderCompare(){
 const active=$('marketplace').value
 $('compareGrid').innerHTML=Object.keys(PRESETS).map(key=>{const m=metricsFor(key,true);return `<article class="market-card ${key===active?'active':''}"><header><h3>${PRESETS[key].name}</h3><span class="pill">${m.commissionPct}% комиссия</span></header><strong style="color:${m.profit>=0?'var(--accent)':'#ff8b98'}">${rub(m.profit)}</strong><small>прибыль с продажи</small><div class="mini"><span>Маржа ${pct(m.margin)}</span><span>Безубыток ${rub(m.breakEven)}</span></div></article>`}).join('')
}

function readSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
function writeSaved(v){localStorage.setItem(STORAGE_KEY,JSON.stringify(v));renderSaved()}
function saveProduct(){
 const m=calculate(),items=readSaved()
 items.unshift({id:crypto.randomUUID?.()||String(Date.now()),name:$('productName').value||'Без названия',marketplace:$('marketplace').value,price:m.price,profit:m.profit,margin:m.margin,roi:m.roi,form:stateFromForm(),createdAt:new Date().toISOString()})
 writeSaved(items.slice(0,50));flash($('saveButton'),'Сохранено')
}
function renderSaved(){
 const items=readSaved(),body=$('savedBody');$('emptyState').style.display=items.length?'none':'block';$('savedTable').style.display=items.length?'table':'none'
 body.innerHTML=items.map(i=>`<tr data-id="${i.id}"><td><button class="text-button load-row">${escapeHtml(i.name)}</button></td><td>${PRESETS[i.marketplace]?.name||i.marketplace}</td><td>${rub(i.price)}</td><td class="${i.profit>=0?'positive':'negative'}">${rub(i.profit)}</td><td>${pct(i.margin)}</td><td>${pct(i.roi)}</td><td><button class="delete-row" aria-label="Удалить">×</button></td></tr>`).join('')
 body.querySelectorAll('tr').forEach(row=>{const item=items.find(x=>x.id===row.dataset.id);row.querySelector('.load-row').onclick=()=>{Object.entries(item.form).forEach(([k,v])=>{if($(k))$(k).value=v});calculate();scrollTo({top:0,behavior:'smooth'})};row.querySelector('.delete-row').onclick=()=>writeSaved(items.filter(x=>x.id!==item.id))})
}
function exportCsv(){
 const items=readSaved();if(!items.length)return alert('Сначала сохраните хотя бы один товар')
 const rows=[['Товар','Маркетплейс','Цена','Прибыль','Маржа %','ROI %'],...items.map(i=>[i.name,PRESETS[i.marketplace]?.name,i.price,i.profit.toFixed(2),i.margin.toFixed(2),i.roi.toFixed(2)])]
 const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(';')).join('\n')
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='marginpilot-products.csv';a.click();URL.revokeObjectURL(a.href)
}
function encodeState(){return btoa(unescape(encodeURIComponent(JSON.stringify(stateFromForm())))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'')}
function loadHash(){if(!location.hash.startsWith('#c='))return;try{let s=location.hash.slice(3).replaceAll('-','+').replaceAll('_','/');s+='='.repeat((4-s.length%4)%4);const data=JSON.parse(decodeURIComponent(escape(atob(s))));Object.entries(data).forEach(([k,v])=>{if($(k))$(k).value=v})}catch{}}
async function share(){const url=new URL(location.href);url.hash=`c=${encodeState()}`;await navigator.clipboard.writeText(url);flash($('shareButton'),'Ссылка скопирована')}
function flash(btn,text){const old=btn.textContent;btn.textContent=text;setTimeout(()=>btn.textContent=old,1600)}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

ids.forEach(id=>$(id)?.addEventListener('input',calculate))
$('marketplace').addEventListener('change',e=>applyPreset(e.target.value))
$('saveButton').onclick=saveProduct;$('shareButton').onclick=share;$('exportButton').onclick=exportCsv;$('printButton').onclick=()=>window.print()
$('resetButton').onclick=()=>{$('productName').value='Беспроводные наушники';$('salePrice').value=2490;$('costPrice').value=890;$('marketplace').value='wb';applyPreset('wb',false)}
loadHash();applyPreset($('marketplace').value);renderSaved()