const services = {
  regular:{name:'Поддерживающая уборка',rate:85,min:3500,description:'Полы, пыль, доступные поверхности, кухня и санузел'},
  deep:{name:'Генеральная уборка',rate:130,min:6500,description:'Комнаты, кухонные фасады, двери, плинтусы и сантехника'},
  repair:{name:'Уборка после ремонта',rate:180,min:9000,description:'Мелкая строительная пыль, доступные поверхности, плитка и сантехника'},
  office:{name:'Уборка офиса',rate:70,min:4500,description:'Свободные рабочие столы, полы, общие зоны, кухня и санузлы'}
};
const format = n => new Intl.NumberFormat('ru-RU').format(n);
const areaNumber = document.querySelector('#area-number');
const areaRange = document.querySelector('#area-range');
const windows = document.querySelector('#extra-windows');
const windowCount = document.querySelector('#window-count');
const estimateButton = document.querySelector('#use-estimate');
let currentEstimate;
function calculate(){
  const key=document.querySelector('[name="cleaning-type"]:checked').value;
  const service=services[key];const area=Number(areaNumber.value);
  const areaValid=areaNumber.value!==''&&areaNumber.validity.valid;
  const valid=areaValid&&(!windows.checked||(windowCount.value!==''&&windowCount.validity.valid));
  document.querySelector('#area-error').hidden=areaValid;estimateButton.disabled=!valid;
  if(!valid){document.querySelector('#estimate-total').textContent='—';document.querySelector('#estimate-rate').textContent='Проверьте площадь и количество окон';currentEstimate=null;document.querySelector('#booking-price').textContent='Расчёт не завершён';document.querySelector('#booking-details').textContent='Укажите корректную площадь и дополнительные задачи';return;}
  const extras=[];
  if(windows.checked)extras.push({label:`Окна: ${Number(windowCount.value)} шт.`,price:Number(windowCount.value)*750});
  if(document.querySelector('#extra-oven').checked)extras.push({label:'Духовка внутри',price:1500});
  if(document.querySelector('#extra-fridge').checked)extras.push({label:'Холодильник внутри',price:700});
  if(document.querySelector('#extra-balcony').checked)extras.push({label:'Уборка балкона',price:900});
  const base=Math.max(area*service.rate,service.min);const total=base+extras.reduce((s,x)=>s+x.price,0);
  currentEstimate={key,name:service.name,area,base,total,extras};
  document.querySelector('#estimate-total').textContent=`${format(total)} ₽`;
  document.querySelector('#estimate-rate').textContent=`${service.rate} ₽ / м², минимум ${format(service.min)} ₽`;
  document.querySelector('#estimate-description').textContent=service.description;
  const lines=document.querySelector('#estimate-lines');lines.replaceChildren();
  for(const item of [{label:`Уборка ${area} м²`,price:base},...extras]){const li=document.createElement('li');const label=document.createElement('span');const amount=document.createElement('span');label.textContent=item.label;amount.textContent=`${format(item.price)} ₽`;li.append(label,amount);lines.append(li);}
  document.querySelector('#booking-type').textContent=service.name;document.querySelector('#booking-price').textContent=`${format(total)} ₽`;
  document.querySelector('#booking-details').textContent=`${area} м², ${extras.length?extras.map(x=>x.label.toLowerCase()).join(', '):'без дополнительных услуг'}`;
}
areaNumber.addEventListener('input',()=>{if(areaNumber.validity.valid&&areaNumber.value!=='')areaRange.value=areaNumber.value;calculate();});
areaRange.addEventListener('input',()=>{areaNumber.value=areaRange.value;calculate();});
document.querySelectorAll('[name="cleaning-type"], .extras-fieldset input').forEach(input=>input.addEventListener('change',()=>{document.querySelector('#window-count-group').hidden=!windows.checked;windowCount.disabled=!windows.checked;calculate();}));
windowCount.addEventListener('input',calculate);
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>{document.querySelector(`[name="cleaning-type"][value="${link.dataset.service}"]`).checked=true;calculate();}));
const form=document.querySelector('#request-form');const result=document.querySelector('#request-result');
estimateButton.addEventListener('click',()=>{if(!currentEstimate)return;form.hidden=false;result.hidden=true;document.querySelector('#request').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
calculate();
const compare=document.querySelector('#comparison-range');
compare.addEventListener('input',()=>{document.querySelector('.comparison').style.setProperty('--position',`${compare.value}%`);compare.setAttribute('aria-valuetext',`${compare.value}% изображения до уборки`);});
const clientName=document.querySelector('#client-name');const contact=document.querySelector('#client-contact');const contactError=document.querySelector('#contact-error');
contact.addEventListener('input',()=>{contactError.hidden=true;contact.removeAttribute('aria-invalid');});
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!currentEstimate){document.querySelector('#calculator').scrollIntoView();areaNumber.reportValidity();if(windows.checked)windowCount.reportValidity();return;}
  if(!clientName.value.trim()){clientName.value='';clientName.reportValidity();return;}
  const value=contact.value.trim();const digits=value.replace(/\D/g,'');
  const phone=/^[+\d\s()\-]+$/.test(value)&&digits.length>=10&&digits.length<=15;const telegram=/^@[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(value);
  if(!phone&&!telegram){contactError.textContent='Укажите телефон с кодом страны или Telegram в формате @username';contactError.hidden=false;contact.setAttribute('aria-invalid','true');contact.focus();return;}
  const e=currentEstimate;const entries=[['Уборка',`${e.name}, ${e.area} м²`],['Дополнительно',e.extras.length?e.extras.map(x=>x.label).join(', '):'Без дополнительных услуг'],['Ориентир',`${format(e.total)} ₽`],['Имя',clientName.value.trim()],['Контакт',value]];
  const comment=document.querySelector('#client-comment').value.trim();if(comment)entries.push(['Пожелания',comment]);
  const summary=document.querySelector('#request-summary');summary.replaceChildren();for(const [label,value] of entries){const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;summary.append(dt,dd);}
  form.hidden=true;result.hidden=false;result.focus({preventScroll:true});
});
document.querySelector('#edit-request').addEventListener('click',()=>{form.hidden=false;result.hidden=true;clientName.focus({preventScroll:true});});
