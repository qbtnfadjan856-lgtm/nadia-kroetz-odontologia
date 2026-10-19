
const WA='https://wa.me/555591027872';
const serviceData=[
 ['/assets/images/treatment-01.jpg','01','Implantes dentários','Planejamento e soluções para reabilitação oral.','implantes dentários'],
 ['/assets/images/treatment-01.jpg','02','Prótese dentária','Alternativas para recuperar função, conforto e estética.','prótese dentária'],
 ['/assets/images/treatment-02.jpg','03','Ortodontia','Acompanhamento para alinhamento e saúde do sorriso.','ortodontia'],
 ['/assets/images/treatment-03.jpg','04','Facetas de resina','Procedimentos estéticos planejados para o sorriso.','facetas de resina'],
 ['/assets/images/treatment-03.jpg','05','Lentes de porcelana','Soluções estéticas personalizadas para cada caso.','lentes de porcelana'],
 ['/assets/images/treatment-02.jpg','06','Reabilitação oral','Planejamento para recuperar estética e função.','reabilitação oral'],
 ['/assets/images/treatment-03.jpg','07','Endodontia','Cuidados e tratamento de canal conforme indicação.','tratamento de canal'],
 ['/assets/images/treatment-01.jpg','08','Cirurgias odontológicas','Procedimentos conforme avaliação profissional.','cirurgia odontológica'],
 ['/assets/images/treatment-02.jpg','09','Exames de imagem','Raio-X panorâmico e tomografia no consultório.','exames de imagem']
];
const services=document.getElementById('services');
const serviceCount=serviceData.length;
const copies=[...serviceData,...serviceData,...serviceData,...serviceData];
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior=()=>reducedMotion.matches?'auto':'smooth';
services.innerHTML=copies.map(([img,no,title,desc,msg],i)=>`<article class="treatment" data-service="${i%serviceCount}"><div class="treatment-media"><img src="${img}" alt="${title}" loading="lazy"></div><div class="treatment-content"><div class="treatment-no">${no} / TRATAMENTO</div><h3>${title}</h3><p>${desc}</p><a class="btn treatment-book-btn" href="#agendar" data-service="${i%serviceCount}">Agendar</a></div></article>`).join('');

const dots=document.getElementById('serviceDots');
dots.innerHTML=serviceData.slice(0,5).map((_,i)=>`<span class="carousel-dot${i===0?' active':''}" data-dot="${i}"></span>`).join('');
const cards=[...services.children];
let isDown=false,horizontal=false,startX=0,startY=0,startScroll=0,moved=false,lastX=0,lastT=0;
let settleTimer=null, isProgrammaticScroll=false;
const gap=()=>parseFloat(getComputedStyle(services).gap)||14;
const copyWidth=()=>cards[serviceCount] ? cards[serviceCount].offsetLeft-cards[0].offsetLeft : 0;

function centerCard(card,behavior=scrollBehavior()){
  if(!card)return;
  const trackRect=services.getBoundingClientRect();
  const cardRect=card.getBoundingClientRect();
  const delta=(cardRect.left+cardRect.width/2)-(trackRect.left+services.clientWidth/2);
  isProgrammaticScroll = behavior !== 'auto';
  services.scrollTo({left:Math.max(0,services.scrollLeft+delta),behavior});
  if(behavior==='auto'){
    isProgrammaticScroll=false;
    updateDots();
  }
}
function nearestCard(){
  const trackRect=services.getBoundingClientRect();
  const trackCenter=trackRect.left+services.clientWidth/2;
  let best=cards[0],dist=Infinity;
  for(const card of cards){
    const r=card.getBoundingClientRect();
    const d=Math.abs((r.left+r.width/2)-trackCenter);
    if(d<dist){dist=d;best=card;}
  }
  return best;
}
function currentIndex(){
  const c=nearestCard();
  return c ? Number(c.dataset.service)||0 : 0;
}
function updateDots(){
  const idx=((currentIndex()%dots.children.length)+dots.children.length)%dots.children.length;
  dots.querySelectorAll('.carousel-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  announceCarousel();
  const center=nearestCard();
  cards.forEach(c=>c.classList.toggle('is-center',c===center));
}
function normalizeLoop(){
  const w=copyWidth();
  if(!w)return;
  // Reposiciona somente depois da animação, nunca no meio do scroll.
  if(services.scrollLeft < w*.55) services.scrollLeft += w;
  else if(services.scrollLeft > w*2.45) services.scrollLeft -= w;
}
function scheduleSettle(){
  clearTimeout(settleTimer);
  settleTimer=setTimeout(()=>{
    normalizeLoop();
    const centered=nearestCard();
    if(centered) centerCard(centered,scrollBehavior());
    setTimeout(()=>{isProgrammaticScroll=false;updateDots();},380);
  },110);
}
requestAnimationFrame(()=>{
  centerCard(cards[serviceCount],'auto');
  updateDots();
});
services.addEventListener('scroll',()=>{
  updateDots();
  scheduleSettle();
},{passive:true});

services.addEventListener('pointerdown',e=>{
  isDown=true; horizontal=false; moved=false;
  startX=e.clientX; startY=e.clientY; startScroll=services.scrollLeft;
  lastX=e.clientX; lastT=performance.now();
});
services.addEventListener('pointermove',e=>{
  if(!isDown)return;
  const totalX=e.clientX-startX, totalY=e.clientY-startY;
  if(!horizontal){
    if(Math.abs(totalX)<8 && Math.abs(totalY)<8)return;
    if(Math.abs(totalY)>Math.abs(totalX)){
      isDown=false;
      services.classList.remove('dragging');
      return;
    }
    horizontal=true;
    services.classList.add('dragging');
    moved=Math.abs(totalX)>=14;
    try{services.setPointerCapture(e.pointerId)}catch{}
  }
  e.preventDefault();
  services.scrollLeft=startScroll-totalX;
  lastX=e.clientX; lastT=performance.now();
});
function endDrag(e){
  if(!isDown)return;
  const wasHorizontal=horizontal;
  const totalX=e ? e.clientX-startX : 0;
  isDown=false; horizontal=false; services.classList.remove('dragging');
  if(!wasHorizontal)return;
  const current=nearestCard();
  let target=current;
  if(Math.abs(totalX)>=18){
    const idx=cards.indexOf(current);
    // Cópias repetidas garantem que exista sempre um cartão à esquerda e à direita.
    target=cards[Math.max(0,Math.min(cards.length-1,idx+(totalX<0?1:-1)))] || current;
  }
  if(target)centerCard(target,scrollBehavior());
  scheduleSettle();
}
['pointerup','pointercancel','pointerleave'].forEach(ev=>services.addEventListener(ev,endDrag));

function moveCarousel(dir){
  const current=nearestCard();
  const idx=cards.indexOf(current);
  let target=cards[idx+dir];
  // Proteção de borda: reposiciona para a cópia equivalente e continua no sentido solicitado.
  if(!target){
    normalizeLoop();
    const fresh=nearestCard();
    const freshIdx=cards.indexOf(fresh);
    target=cards[Math.max(0,Math.min(cards.length-1,freshIdx+dir))];
  }
  if(target)centerCard(target,'smooth');
  scheduleSettle();
}
document.getElementById('prevService').addEventListener('click',()=>moveCarousel(-1));
document.getElementById('nextService').addEventListener('click',()=>moveCarousel(1));
function announceCarousel(){const status=document.getElementById('carouselStatus');const active=nearestCard();const heading=active&&active.querySelector('h3');if(status&&heading)status.textContent='Tratamento em destaque: '+heading.textContent;}
services.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();moveCarousel(1)}else if(e.key==='ArrowLeft'){e.preventDefault();moveCarousel(-1)}});

const menuBtn=document.getElementById('menuBtn'),mobile=document.getElementById('mobileMenu');
function setMobileMenu(open){mobile.hidden=!open;mobile.classList.toggle('open',open);menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');}
menuBtn.addEventListener('click',()=>setMobileMenu(mobile.hidden));
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMobileMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobile.hidden){setMobileMenu(false);menuBtn.focus();}});
document.getElementById('waFloat').onclick=()=>window.open(WA,'_blank','noopener,noreferrer');

const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lightboxImg'),lbClose=document.getElementById('closeLightbox');
let lightboxOpener=null;
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lightboxOpener=item;lbImg.src=item.dataset.full;lb.classList.add('open');lb.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';lbClose.focus();}));
function closeLB(){if(lb.getAttribute('aria-hidden')==='true')return;lb.classList.remove('open');lb.setAttribute('aria-hidden','true');lbImg.removeAttribute('src');document.body.style.overflow='';if(lightboxOpener&&typeof lightboxOpener.focus==='function')lightboxOpener.focus();lightboxOpener=null;}
lbClose.addEventListener('click',closeLB);lb.addEventListener('click',e=>{if(e.target===lb)closeLB()});
lb.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeLB();return;}if(e.key==='Tab'){const focusable=Array.from(lb.querySelectorAll('button,[href],input,[tabindex]:not([tabindex="-1"])')).filter(el=>!el.disabled);if(!focusable.length){e.preventDefault();lb.focus();return;}const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
