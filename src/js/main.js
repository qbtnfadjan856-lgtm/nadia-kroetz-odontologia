
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
services.innerHTML=copies.map(([img,no,title,desc,msg],i)=>`<article class="treatment" data-service="${i%serviceCount}"><div class="treatment-media"><img src="${img}" alt="${title}" loading="lazy"></div><div class="treatment-content"><div class="treatment-no">${no} / TRATAMENTO</div><h3>${title}</h3><p>${desc}</p><a class="btn treatment-book-btn" href="#agendar" data-service="${i%serviceCount}">Agendar</a></div></article>`).join('');

const dots=document.getElementById('serviceDots');
dots.innerHTML=serviceData.slice(0,5).map((_,i)=>`<span class="carousel-dot${i===0?' active':''}" data-dot="${i}"></span>`).join('');
const cards=[...services.children];
let isDown=false,horizontal=false,startX=0,startY=0,startScroll=0,moved=false,lastX=0,lastT=0;
let settleTimer=null, isProgrammaticScroll=false;
const gap=()=>parseFloat(getComputedStyle(services).gap)||14;
const copyWidth=()=>cards[serviceCount] ? cards[serviceCount].offsetLeft-cards[0].offsetLeft : 0;

function centerCard(card,behavior='smooth'){
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
    if(centered) centerCard(centered,'smooth');
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
  if(target)centerCard(target,'smooth');
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
document.getElementById('prevService').onclick=()=>moveCarousel(-1);
document.getElementById('nextService').onclick=()=>moveCarousel(1);

const menuBtn=document.getElementById('menuBtn'),mobile=document.getElementById('mobileMenu');menuBtn.onclick=()=>mobile.classList.toggle('open');mobile.querySelectorAll('a').forEach(a=>a.onclick=()=>mobile.classList.remove('open'));
document.getElementById('waFloat').onclick=()=>window.open(WA,'_blank');

const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lightboxImg');
document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{lbImg.src=item.dataset.full;lb.classList.add('open');lb.setAttribute('aria-hidden','false')}));
function closeLB(){lb.classList.remove('open');lb.setAttribute('aria-hidden','true');lbImg.removeAttribute('src')}
document.getElementById('closeLightbox').onclick=closeLB;lb.onclick=e=>{if(e.target===lb)closeLB()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLB()});
