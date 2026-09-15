const data = window.portfolioData;
const grid = document.querySelector('#project-grid');
const art = {
  aurora: '<span class="planet"></span><span class="ring"></span>',
  signal: '<span class="signal-line"></span><span class="signal-line two"></span>',
  neon: '<span class="cube">N</span>',
};
grid.innerHTML = data.projects.map(project => `<article class="project-card studio-card"><div class="art"><img src="${project.image}" alt="Icono de ${project.title.replace('|', ' ')}" /><b>${project.number}</b></div><div class="card-info"><p>${project.category}</p><h3>${project.title.replace('|', '<br />')}</h3><p class="project-description">${project.description}</p></div></article>`).join('');

const links = [...document.querySelectorAll('nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const observer = new IntersectionObserver((entries) => {
  const active = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!active) return;
  links.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${active.target.id}`));
}, { threshold: .35 });
sections.forEach(section => observer.observe(section));

// Cada zona se anima al entrar en pantalla, tanto al bajar como al volver a subir.
const revealItems = document.querySelectorAll('.topbar,.hero-copy,.orbital-card,.scroll-note,.section-heading,.project-card,.profile,.contact,footer');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target.classList.toggle('is-visible', entry.isIntersecting);
  });
}, { threshold: .13 });
revealItems.forEach((item, index) => { item.classList.add('reveal'); item.style.setProperty('--delay', `${Math.min(index * 55, 260)}ms`); revealObserver.observe(item); });

// Los textos aparecen como piezas completas: conserva las fuentes y los degradados.
const textRevealItems = document.querySelectorAll('.brand,nav a,.eyebrow,h1,h2,h3,.role,.heading-copy,.profile-copy > p:not(.eyebrow),.card-info p,.card-info a,.skills span,.contact-subtitle,.discord-link,.contact-footer,footer');
const textRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => entry.target.classList.toggle('text-visible', entry.isIntersecting));
}, { threshold: .18 });

function prepareTitleLetters(title) {
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  }
  let position = 0;
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    let wordSpan = null;
    [...node.nodeValue].forEach(character => {
      const letter = document.createElement('span');
      letter.className = 'title-letter';
      letter.style.setProperty('--letter-delay', `${Math.min(position++ * 52, 820)}ms`);
      letter.textContent = character;
      if (/\s/.test(character)) {
        letter.classList.add('title-space');
        wordSpan = null;
        fragment.appendChild(letter);
      } else {
        if (!wordSpan) {
          wordSpan = document.createElement('span');
          wordSpan.style.display = 'inline-block';
          fragment.appendChild(wordSpan);
        }
        wordSpan.appendChild(letter);
      }
    });
    node.replaceWith(fragment);
  });
}
textRevealItems.forEach((item, index) => {
  const isTitle = item.matches('h1,h2,h3');
  item.classList.add('text-reveal');
  if (isTitle) {
    item.classList.add('title-reveal');
    prepareTitleLetters(item);
  }
  item.style.setProperty('--text-delay', `${Math.min(index * 38, 240)}ms`);
  textRevealObserver.observe(item);
});

// Estrellas y cabezas pixeladas que caen. La imagen real se usa desde content.js.
const canvas = document.querySelector('#sky');
const ctx = canvas.getContext('2d');
let width, height, stars, heads, skinImage;
const random = (min, max) => Math.random() * (max - min) + min;
function resizeSky() {
  const ratio = Math.min(devicePixelRatio || 1, 2); width = innerWidth; height = innerHeight;
  canvas.width = width * ratio; canvas.height = height * ratio; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({length: Math.min(145, Math.floor(width / 10))}, () => ({x:random(0,width),y:random(0,height),r:random(.4,1.6),speed:random(.08,.42),alpha:random(.2,.9)}));
  const start = performance.now();
  // Se mantienen las estrellas; se eliminan las cabezas que podían cruzarse sobre el texto.
  heads = [];
}
if (data.skinHeadImage) { skinImage = new Image(); skinImage.src = data.skinHeadImage; }
function drawHead(head) {
  const x = head.x + Math.sin(head.sway) * 16, y = head.y, s = head.size;
  ctx.save(); ctx.globalAlpha = head.alpha; ctx.shadowColor = '#44c9ff'; ctx.shadowBlur = 12;
  if (skinImage?.complete && skinImage.naturalWidth) ctx.drawImage(skinImage,x,y,s,s);
  else { const p=s/8; ctx.fillStyle='#218cc7';ctx.fillRect(x,y,s,s);ctx.fillStyle='#87e5ff';ctx.fillRect(x+p,y+p,s-p*2,p*2);ctx.fillStyle='#072244';ctx.fillRect(x+p,y+p*4,p*2,p);ctx.fillRect(x+p*5,y+p*4,p*2,p);ctx.fillStyle='#d8f8ff';ctx.fillRect(x+p*3,y+p*6,p*2,p); }
  ctx.restore();
}
function animateSky(now) { ctx.clearRect(0,0,width,height); stars.forEach(star=>{star.y+=star.speed;if(star.y>height){star.y=-2;star.x=random(0,width)}ctx.fillStyle=`rgba(163,231,255,${star.alpha})`;ctx.fillRect(star.x,star.y,star.r,star.r)});heads.forEach(head=>{if(now<head.spawnAt)return;head.alpha=Math.min(1,head.alpha+.012);head.y+=head.speed;head.sway+=.018;if(head.y>height+40){head.y=random(-220,-35);head.x=random(0,width);head.alpha=0;head.spawnAt=now+random(2600,5200)}drawHead(head)});requestAnimationFrame(animateSky); }
resizeSky(); animateSky(performance.now()); addEventListener('resize',resizeSky);
