/* ══ CURSOR ══════════════════════════════════════ */
const cur   = document.getElementById('cursor');
const trail = document.getElementById('cursor-trail');
let mx=0, my=0, tx=0, ty=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
}, { passive: true });

(function animTrail(){
  tx += (mx - tx) * .1;
  ty += (my - ty) * .1;
  trail.style.left = tx + 'px';
  trail.style.top  = ty + 'px';
  requestAnimationFrame(animTrail);
})();

document.querySelectorAll('a, button, .sk, .pcard, .chip, .ctr').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovered'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovered'));
});

/* ══ STARFIELD ═══════════════════════════════════ */
const cv  = document.getElementById('starfield');
const ctx = cv.getContext('2d');

function setSize(){ cv.width = innerWidth; cv.height = innerHeight; }
setSize();
window.addEventListener('resize', () => { setSize(); buildStars(); buildNebula(); });

let stars = [];
function buildStars(){
  stars = Array.from({length:280}, () => ({
    x: Math.random()*cv.width,
    y: Math.random()*cv.height,
    r: Math.random()*1.8+.15,
    a: Math.random(),
    da: .002 + Math.random()*.006,
    gold: Math.random() < .07
  }));
}
buildStars();

let nebula = [];
function buildNebula(){
  const cols = [
    [245,197,24],
    [130,80,255],
    [40,120,255],
    [255,80,120],
  ];
  nebula = Array.from({length:6}, (_,i) => {
    const c = cols[i % cols.length];
    return {
      x: Math.random()*cv.width,
      y: Math.random()*cv.height,
      r: 120 + Math.random()*200,
      c,
      a: .025 + Math.random()*.035,
    };
  });
}
buildNebula();

let shoots = [];
function spawnShoot(){
  const fromLeft = Math.random()<.5;
  shoots.push({
    x: fromLeft ? -20 : cv.width+20,
    y: Math.random()*cv.height*.65,
    vx: fromLeft ? 2+Math.random()*3 : -(2+Math.random()*3),
    vy: .6+Math.random()*1.6,
    size: 1.5+Math.random()*2.5,
    a: .75+Math.random()*.25,
    tail: [],
  });
}
setInterval(spawnShoot, 650);

let sparks = [];
document.addEventListener('click', e => {
  for(let i=0;i<14;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = 1.5+Math.random()*3.5;
    sparks.push({
      x:e.clientX, y:e.clientY,
      vx:Math.cos(angle)*speed,
      vy:Math.sin(angle)*speed,
      r:1.5+Math.random()*2.5,
      a:1, life:1
    });
  }
});

function draw(){
  ctx.clearRect(0,0,cv.width,cv.height);

  nebula.forEach(n=>{
    const g = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r);
    g.addColorStop(0,   `rgba(${n.c},${n.a})`);
    g.addColorStop(.55, `rgba(${n.c},${n.a*.3})`);
    g.addColorStop(1,   `rgba(${n.c},0)`);
    ctx.beginPath();
    ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();
  });

  stars.forEach(s=>{
    s.a += s.da;
    if(s.a>1||s.a<0) s.da*=-1;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle = s.gold
      ? `rgba(245,197,24,${s.a})`
      : `rgba(200,210,255,${s.a*.9})`;
    ctx.fill();
  });

  shoots.forEach((s,i)=>{
    s.tail.push({x:s.x,y:s.y});
    if(s.tail.length>20) s.tail.shift();
    s.tail.forEach((t,ti)=>{
      const ratio = ti/s.tail.length;
      ctx.beginPath();
      ctx.arc(t.x,t.y,s.size*ratio*.85,0,Math.PI*2);
      ctx.fillStyle=`rgba(245,215,80,${ratio*s.a*.4})`;
      ctx.fill();
    });
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fillStyle=`rgba(255,220,80,${s.a})`;
    ctx.shadowBlur=12; ctx.shadowColor='#f5c518';
    ctx.fill(); ctx.shadowBlur=0;
    s.x+=s.vx; s.y+=s.vy;
    if(s.y>cv.height+50||s.x<-80||s.x>cv.width+80) shoots.splice(i,1);
  });

  sparks.forEach((p,i)=>{
    p.x+=p.vx; p.y+=p.vy;
    p.vy+=.07;
    p.life -= .035;
    p.a = p.life;
    if(p.life<=0){sparks.splice(i,1);return;}
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(245,197,24,${p.a})`;
    ctx.shadowBlur=8; ctx.shadowColor='#f5c518';
    ctx.fill(); ctx.shadowBlur=0;
  });

  requestAnimationFrame(draw);
}
draw();

/* ══ TYPEWRITER ═══════════════════════════════════ */
const roles=['Software Developer 💻','Backend Engineer ⚙️','Frontend Crafter 🎨','Problem Solver 🚀','Full Stack Builder 🛠️'];
let ri=0,ci=0,del=false;
const tel=document.getElementById('typed');
function type(){
  const w=roles[ri];
  if(!del){ tel.textContent=w.slice(0,++ci); if(ci===w.length){del=true;setTimeout(type,1800);return;} }
  else{ tel.textContent=w.slice(0,--ci); if(ci===0){del=false;ri=(ri+1)%roles.length;} }
  setTimeout(type,del?42:78);
}
type();

/* ══ NAVBAR ═══════════════════════════════════════ */
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('stuck',scrollY>50);
});

document.getElementById('burger').addEventListener('click',()=>{
  document.getElementById('navLinks').classList.toggle('open');
});

/* ══ SCROLL REVEAL ════════════════════════════════ */
const revealEls = document.querySelectorAll(
  '.sk, .pcard, .chip, .ctr, .clink, .s-label, .s-title, .about-body, .about-chips, .contact-sub, .proj-grid, .skills-wrap, .contact-grid'
);

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.08 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

/* ══ SKILL TILT ═══════════════════════════════════ */
document.querySelectorAll('.sk').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`translateY(-10px) rotateX(${-y*16}deg) rotateY(${x*16}deg)`;
    card.style.transition='transform 0s';
  });
  card.addEventListener('mouseleave',()=>{
    card.style.transform='translateY(0)';
    card.style.transition='all .35s';
  });
});