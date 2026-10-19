
(() => {
  const PHONE='555591027872';
  const BOOK_SERVICES=[
    ['Implantes dentários','implantes dentários','Planejamento e soluções para reabilitação oral.'],
    ['Prótese dentária','prótese dentária','Alternativas para recuperar função, conforto e estética.'],
    ['Ortodontia','ortodontia','Acompanhamento para alinhamento e saúde do sorriso.'],
    ['Facetas de resina','facetas de resina','Procedimentos estéticos planejados para o sorriso.'],
    ['Lentes de porcelana','lentes de porcelana','Soluções estéticas personalizadas para cada caso.'],
    ['Reabilitação oral','reabilitação oral','Planejamento para recuperar estética e função.'],
    ['Endodontia / tratamento de canal','tratamento de canal','Cuidados e tratamento de canal conforme indicação.'],
    ['Cirurgias odontológicas','cirurgia odontológica','Procedimentos conforme avaliação profissional.'],
    ['Exames de imagem','exames de imagem','Raio-X panorâmico e tomografia no consultório.'],
    ['Avaliação odontológica','avaliação odontológica','Primeiro encontro para entender suas necessidades e orientar o próximo passo.']
  ];
  const DAYS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const $=id=>document.getElementById(id);
  const state={service:null,day:null,period:null,name:'',step:1};
  const options=$('bookingOptions');
  BOOK_SERVICES.forEach((s,i)=>{
    const wrap=document.createElement('div');wrap.className='book-option';
    wrap.innerHTML=`<input id="book-service-${i}" type="radio" name="book-service" value="${i}"><label for="book-service-${i}"><span><strong>${s[0]}</strong><small>${s[2]}</small></span><span class="book-radio" aria-hidden="true"></span></label>`;
    options.appendChild(wrap);
  });
  const days=$('bookingDays'), periods=$('bookingPeriods');
  DAYS.forEach(d=>{const w=document.createElement('div');w.className='choice';w.innerHTML=`<input id="day-${d}" type="radio" name="book-day" value="${d}"><label for="day-${d}">${d}</label>`;days.appendChild(w)});
  ['Manhã','Tarde'].forEach(p=>{const w=document.createElement('div');w.className='choice';w.innerHTML=`<input id="period-${p}" type="radio" name="book-period" value="${p}"><label for="period-${p}">${p}</label>`;periods.appendChild(w)});

  const stepEls=[...document.querySelectorAll('.booking-steps li')];
  function updateSteps(){stepEls.forEach((x,i)=>x.classList.toggle('active',i<state.step));}
  function valid(){return state.step===1?state.service!==null:state.step===2?!!(state.name.trim()&&state.day&&state.period):true}
  function updateSelectedService(){
    const svc=state.service!==null?BOOK_SERVICES[state.service]:null;
    $('selectedServiceName').textContent=svc?svc[0]:'—';
  }
  function showStep(n){
    state.step=n;
    $('bookStep1').hidden=n!==1;$('bookStep2').hidden=n!==2;$('bookStep3').hidden=n!==3;
    $('bookingBack').hidden=n===1;
    $('bookingNext').querySelector('span').textContent=n===3?'Abrir WhatsApp':'Continuar';
    $('bookingError').textContent=''; updateSteps(); updateButton();
    if(n===3) renderSummary();
  }
  function updateButton(){$('bookingNext').disabled=!valid()}
  // Depois de uma escolha, faz apenas um pequeno ajuste para trazer o botão Continuar
  // para uma zona confortável da tela. Nunca força uma descida grande.
  function guideToContinue(){
    requestAnimationFrame(()=>{
      const nav=document.querySelector('.booking-nav');
      if(!nav) return;
      const rect=nav.getBoundingClientRect();
      const vh=window.innerHeight;
      const navCenter=rect.top + rect.height/2;
      const desired=vh*0.60;
      let delta=navCenter-desired;
      if(Math.abs(delta)<24) return;
      delta=Math.max(-140,Math.min(140,delta));
      window.scrollBy({top:delta,behavior:'smooth'});
    });
  }
  options.addEventListener('change',e=>{
    state.service=+e.target.value;
    updateSelectedService();
    updateButton();
    guideToContinue();
  });
  $('bookingName').addEventListener('input',e=>{
    state.name=e.target.value;
    updateButton();
  });

  days.addEventListener('change',e=>{
    state.day=e.target.value;
    const sat=state.day==='Sábado';
    const tarde=document.querySelector('input[name="book-period"][value="Tarde"]');
    tarde.disabled=sat;
    if(sat&&state.period==='Tarde'){state.period=null;tarde.checked=false}
    updateButton();
    guideToContinue();
  });
  periods.addEventListener('change',e=>{
    state.period=e.target.value;
    updateButton();
    guideToContinue();
  });

  function openBooking(serviceIndex=null){
    if(serviceIndex!==null){state.service=serviceIndex;const input=document.getElementById('book-service-'+serviceIndex);if(input)input.checked=true}
    state.day=null;state.period=null;state.name='';
    $('bookingName').value='';
    updateSelectedService();
    document.querySelectorAll('input[name="book-day"],input[name="book-period"]').forEach(i=>i.checked=false);
    document.querySelector('input[name="book-period"][value="Tarde"]').disabled=false;
    const fromTreatment = serviceIndex!==null;
    showStep(fromTreatment ? 2 : 1);
    // Ao vir de um card de tratamento, o serviço já está selecionado e
    // o usuário cai diretamente na etapa de dia/período.
    requestAnimationFrame(()=>{
      const target=fromTreatment ? $('bookStep2') : $('agendar');
      if(target) target.scrollIntoView({behavior:'smooth',block:fromTreatment?'center':'start'});
    });
  }

  // Every treatment card now feeds the multi-step flow; selecting Agendar jumps directly to day/time. 
  function openBookingFromService(serviceIndex){ openBooking(Math.min(Number(serviceIndex)||0,BOOK_SERVICES.length-1)); }

  // Botões dos cards: o listener fica junto do fluxo de agendamento para garantir
  // que a função exista quando o toque acontecer. O href também funciona como fallback.
  document.getElementById('services').addEventListener('click',e=>{
    const btn=e.target.closest('.treatment-book-btn');
    if(!btn) return;
    e.preventDefault();
    e.stopPropagation();
    openBookingFromService(btn.dataset.service);
  });
  document.querySelectorAll('.hero-actions a[href="#tratamentos"]').forEach(a=>a.addEventListener('click',()=>{}));

  $('bookingNext').addEventListener('click',()=>{
    if(!valid()){
      $('bookingError').textContent=state.step===1?'Selecione um serviço para continuar.':'Selecione o dia e o período para continuar.';return;
    }
    if(state.step<3){showStep(state.step+1);return}
    const svc=BOOK_SERVICES[state.service];
    const msg=`Olá! Meu nome é ${state.name}. Quero agendar uma avaliação para ${svc[1]}. Minha preferência é ${state.day}, ${state.period.toLowerCase()}.`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  });
  $('bookingBack').addEventListener('click',()=>showStep(Math.max(1,state.step-1)));

  function renderSummary(){
    const svc=BOOK_SERVICES[state.service];
    $('bookingSummary').innerHTML=`<div class="summary-card"><span>Nome</span><strong>${state.name}</strong></div><div class="summary-card"><span>Serviço</span><strong>${svc[0]}</strong></div><div class="summary-card"><span>Dia</span><strong>${state.day}</strong></div><div class="summary-card"><span>Período</span><strong>${state.period}</strong></div>`;
    const msg=`Olá! Meu nome é ${state.name}. Quero agendar uma avaliação para ${svc[1]}. Minha preferência é ${state.day}, ${state.period.toLowerCase()}.`;
    $('bookingMessage').innerHTML=`<small>Mensagem que será enviada</small>${msg}`;
  }
  updateSelectedService();
  updateButton();
})();
