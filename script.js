window.addEventListener('contextmenu', (e) => e.preventDefault());

const CONFIG = {
  recipientName: "iu kid Phương Anh",
  messages: [
    "I love you",
    "iu bé",
    "Phương Anh kid",
    "kid trung thu vui vẻ",
    "chúc kid thật nhiều may mắn",
    "PAnh kid",
    "iu bé nhiều lắm",
    "mãi yêu bé",
    "chúc kid luôn hạnh phúc",
    "ráng ăn nhanh hơn nha kid"
  ],
  images: [
    "images/panh1.jpeg",
    "images/panh2.webp",
    "images/panh3.webp",
    "images/panh4.webp",
    "images/panh5.webp"
  ],
  musicUrl: "images/kid.mp3",
  stickers: [
    "images/banh.png",
    "images/den.png",
    "images/tho.png"
  ],
  letterLines: [
    "Trung Thu đến rồi...",
    "Anh chúc em bé của anh luôn xinh đẹp, vui vẻ và bình an.",
    "Dù ở đâu, anh cũng luôn nhớ và yêu em thật nhiều.",
    "Mãi yêu em, Phương Anh."
  ]
};

// ============ TIỆN ÍCH ============
const byId = (id) => document.getElementById(id);
const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || matchMedia('(pointer:coarse)').matches;
const FONT = '"Segoe UI",system-ui,Roboto,"Helvetica Neue",Arial,sans-serif';
const PALETTE = ['#ff5c8a', '#ffd166', '#7df9ff', '#c77dff', '#ff9e5e', '#9dffb0'];
const EMOJIS = ['💖', '💕', '✨', '🌙', '⭐', '🏮', '🐰'];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ============ CSS TỰ NẠP: nền đen, chống zoom/chọn chữ, câu chúc nổi bật ============
if (!document.querySelector('meta[name=viewport]')) {
  const m = document.createElement('meta');
  m.name = 'viewport';
  m.content = 'width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no';
  document.head.appendChild(m);
}
const injected = document.createElement('style');
injected.textContent = `
html,body{background:#000!important;overscroll-behavior:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
#intro-screen{background-color:#000!important}
#moonContainer,#canvas3d{touch-action:none}
#canvas3d{background:#000;opacity:0;transition:opacity 2s ease}
#canvas3d.ready{opacity:1}
#fxCanvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:3}
#wishSpot{position:fixed;left:0;right:0;top:calc(10% + env(safe-area-inset-top,0px));z-index:4;padding:0 6vw;text-align:center;pointer-events:none;opacity:0;
  font:800 clamp(24px,8vw,44px)/1.25 ${FONT};letter-spacing:.5px;
  background:linear-gradient(90deg,#ff7eb3,#ffe066,#7df9ff,#c77dff,#ff7eb3);background-size:300% 100%;
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
  filter:drop-shadow(0 0 8px rgba(255,120,180,.85)) drop-shadow(0 0 20px rgba(255,220,110,.5));animation:wishShine 5s linear infinite}
#letterText{white-space:pre-wrap;text-shadow:0 0 12px rgba(255,205,120,.55)}
@keyframes wishShine{to{background-position:300% 0}}
`;
document.head.appendChild(injected);

// ============ LỚP HIỆU ỨNG 2D: tim/sao bay, sao băng, chạm để bung tim + câu chúc ============
const fx = document.createElement('canvas');
fx.id = 'fxCanvas';
document.body.appendChild(fx);
const fg = fx.getContext('2d');
const parts = [];
let FW = 0, FH = 0, spawnT = 0, meteorT = 2;

function sizeFx() {
  const d = Math.min(devicePixelRatio || 1, 2);
  FW = innerWidth; FH = innerHeight;
  fx.width = FW * d; fx.height = FH * d;
  fg.setTransform(d, 0, 0, d, 0, 0);
}
sizeFx();

function burst(x, y) {
  for (let i = 0; i < 14; i++) {
    const a = rnd(0, 6.283), v = rnd(70, 210);
    parts.push({ k: 'e', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 70, g: 170, life: 0, max: rnd(1, 1.7), s: rnd(16, 30), e: pick(EMOJIS) });
  }
  parts.push({ k: 't', x: Math.min(Math.max(x, 130), FW - 130), y: y - 24, vx: 0, vy: -42, life: 0, max: 2.4, txt: pick(CONFIG.messages), col: pick(PALETTE) });
}

function drawFx(dt) {
  fg.clearRect(0, 0, FW, FH);
  fg.textAlign = 'center';
  fg.textBaseline = 'middle';

  if ((spawnT -= dt) <= 0 && parts.length < 60) {
    spawnT = IS_MOBILE ? 0.6 : 0.35;
    parts.push({ k: 'e', x: rnd(0, FW), y: FH + 30, vx: rnd(-12, 12), vy: rnd(-110, -60), g: 0, life: 0, max: rnd(5, 8), s: rnd(14, 26), e: pick(EMOJIS), amp: rnd(8, 22), ph: rnd(0, 6.283) });
  }
  if ((meteorT -= dt) <= 0) {
    meteorT = rnd(2.5, 5);
    parts.push({ k: 'm', x: rnd(FW * 0.3, FW * 1.1), y: rnd(-20, FH * 0.35), vx: -520, vy: 300, life: 0, max: 0.9 });
  }

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.life += dt;
    if (p.life >= p.max) { parts.splice(i, 1); continue; }
    p.vy += (p.g || 0) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
    const u = p.life / p.max;
    fg.globalAlpha = Math.min(1, u * 6, (1 - u) * 2.5);

    if (p.k === 'e') {
      fg.font = `${p.s}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      fg.fillText(p.e, p.x + Math.sin(p.life * 2 + (p.ph || 0)) * (p.amp || 0), p.y);
    } else if (p.k === 'm') {
      const tx = p.x - p.vx * 0.14, ty = p.y - p.vy * 0.14;
      const gr = fg.createLinearGradient(p.x, p.y, tx, ty);
      gr.addColorStop(0, '#fff');
      gr.addColorStop(1, 'rgba(255,220,150,0)');
      fg.strokeStyle = gr; fg.lineWidth = 2.2; fg.lineCap = 'round';
      fg.beginPath(); fg.moveTo(p.x, p.y); fg.lineTo(tx, ty); fg.stroke();
    } else {
      fg.font = `800 ${IS_MOBILE ? 24 : 28}px ${FONT}`;
      fg.shadowColor = p.col; fg.shadowBlur = 18; fg.fillStyle = '#fff';
      fg.fillText(p.txt, p.x, p.y);
      fg.shadowBlur = 0;
    }
  }
  fg.globalAlpha = 1;
}

// ============ CÂU CHÚC NỔI BẬT GIỮA MÀN HÌNH (chữ gradient + phát sáng) ============
const spot = document.createElement('div');
spot.id = 'wishSpot';
document.body.appendChild(spot);
const wishes = [...CONFIG.messages].sort(() => Math.random() - 0.5);
let wishIdx = 0;

function showWish() {
  spot.textContent = wishes[wishIdx++ % wishes.length];
  spot.animate([
    { opacity: 0, transform: 'translateY(18px) scale(.8)' },
    { opacity: 1, transform: 'translateY(0) scale(1.06)', offset: 0.18 },
    { opacity: 1, transform: 'scale(1)', offset: 0.8 },
    { opacity: 0, transform: 'translateY(-14px) scale(1.04)' }
  ], { duration: 3000, easing: 'ease-out' });
}

// === TÍNH TOÁN VỊ TRÍ MẶT TRĂNG THEO TỶ LỆ MÀN HÌNH ===
function calibrateMoonPosition() {
  const origW = 682, origH = 1024;
  const imgAspect = origW / origH;
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const screenAspect = screenW / screenH;

  let renderW, renderH, offsetX, offsetY;

  if (screenAspect < imgAspect) {
    renderH = screenH;
    renderW = screenH * imgAspect;
    offsetX = (screenW - renderW) / 2;
    offsetY = 0;
  } else {
    renderW = screenW;
    renderH = screenW / imgAspect;
    offsetX = 0;
    offsetY = (screenH - renderH) / 2;
  }

  const moonX = offsetX + 0.6387 * renderW;
  const moonY = offsetY + 0.1789 * renderH;
  const moonDiameter = 0.3276 * renderW;

  document.documentElement.style.setProperty('--moon-x', `${moonX}px`);
  document.documentElement.style.setProperty('--moon-y', `${moonY}px`);
  document.documentElement.style.setProperty('--moon-size', `${moonDiameter}px`);
}

// Resize gộp theo khung hình (tránh giật khi thanh địa chỉ điện thoại ẩn/hiện)
let rzId = 0;
function onResize() {
  cancelAnimationFrame(rzId);
  rzId = requestAnimationFrame(() => {
    calibrateMoonPosition();
    sizeFx();
    if (renderer) { renderer.setSize(innerWidth, innerHeight); fitCamera(); }
  });
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);
window.addEventListener('DOMContentLoaded', calibrateMoonPosition);
calibrateMoonPosition();

const moonContainer = byId('moonContainer');
const introScreen = byId('intro-screen');
const instructionText = byId('instructionText');
const hint = byId('hint');
const cornerLabel = byId('corner-label');
const actionIcons = byId('action-icons');
const bgMusic = byId('bgMusic');
const soundBtn = byId('soundBtn');
const envelopeBtn = byId('envelopeBtn');
const letterOverlay = byId('letter-overlay');
const letterText = byId('letterText');
const letterClose = byId('letterClose');

if (CONFIG.musicUrl) { bgMusic.src = CONFIG.musicUrl; bgMusic.loop = true; }
else soundBtn.style.display = 'none';

let musicPlaying = false;
soundBtn.addEventListener('click', () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying) { bgMusic.play().catch(() => {}); soundBtn.textContent = '🔊'; }
  else { bgMusic.pause(); soundBtn.textContent = '🔈'; }
});

let typingTimer = null;
function openLetter() {
  letterOverlay.classList.add('open');
  letterText.innerHTML = '<span class="cursor">|</span>';
  const full = CONFIG.letterLines.join('\n\n');
  let i = 0;
  clearInterval(typingTimer);
  typingTimer = setInterval(() => {
    i++;
    letterText.innerHTML = full.slice(0, i) + '<span class="cursor">|</span>';
    if (i >= full.length) clearInterval(typingTimer);
  }, 35);
}

function closeLetter() {
  letterOverlay.classList.remove('open');
  clearInterval(typingTimer);
}

envelopeBtn.addEventListener('click', openLetter);
letterClose.addEventListener('click', closeLetter);
letterOverlay.addEventListener('click', (e) => { if (e.target === letterOverlay) closeLetter(); });

// === ĐÈN TRỜI & HẠT SAO TRÊN TẦNG INTRO ===
(function initIntroEffects() {
  const canvas = byId('introCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeIntro() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeIntro);
  resizeIntro();

  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.5,
      alpha: Math.random(),
      speedAlpha: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
      speedY: (Math.random() - 0.5) * 0.25,
      speedX: (Math.random() - 0.5) * 0.25,
      color: Math.random() < 0.4 ? '#ffe082' : '#ffffff'
    });
  }

  function animateIntro() {
    if (introScreen.style.visibility === 'hidden') return;
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.alpha += p.speedAlpha;
      if (p.alpha <= 0.1 || p.alpha >= 1) p.speedAlpha *= -1;
      p.x += p.speedX; p.y += p.speedY;
      if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 5;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(animateIntro);
  }
  animateIntro();
})();

// === ÂM THANH CHO iOS / ANDROID (dùng muted vì iOS không cho chỉnh volume) ===
let isAudioPrepared = false;

function prepareAudioForMobile() {
  if (isAudioPrepared || !CONFIG.musicUrl) return;
  isAudioPrepared = true;
  bgMusic.muted = true;
  bgMusic.play().then(() => {
    bgMusic.pause();
    bgMusic.muted = false;
  }).catch(() => { bgMusic.muted = false; isAudioPrepared = false; });
}

// === NHẤN GIỮ VÀO MẶT TRĂNG ===
let holdTimer = null;
let isTransitioning = false;
const HOLD_REQUIRED_TIME = 900;

function startHold(e) {
  if (isTransitioning || holdTimer) return;
  if (e.cancelable) e.preventDefault();
  try { moonContainer.setPointerCapture(e.pointerId); } catch (_) {}

  prepareAudioForMobile();
  if (navigator.vibrate) navigator.vibrate(20);

  introScreen.classList.add('holding');
  instructionText.textContent = "Giữ yên một chút nhé...";

  holdTimer = setTimeout(() => {
    holdTimer = null;
    isTransitioning = true;
    if (navigator.vibrate) navigator.vibrate([30, 40, 60]);
    introScreen.classList.remove('holding');
    introScreen.classList.add('zooming');

    setTimeout(() => {
      introScreen.style.opacity = '0';
      introScreen.style.visibility = 'hidden';
      hint.classList.add('show');
      cornerLabel.classList.add('show');
      actionIcons.classList.add('show');

      init3DWorld();

      if (CONFIG.musicUrl) {
        bgMusic.currentTime = 0;
        bgMusic.muted = false;
        bgMusic.play().then(() => {
          musicPlaying = true;
          soundBtn.textContent = '🔊';
        }).catch((err) => {
          console.log("Cần chạm vào nút loa để bật nhạc:", err);
        });
      }
    }, 1000);
  }, HOLD_REQUIRED_TIME);
}

function cancelHold() {
  if (isTransitioning) return;
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  introScreen.classList.remove('holding');
  instructionText.textContent = "Nhấn giữ vào Mặt Trăng để mở món quà ✨";
}

moonContainer.addEventListener('pointerdown', startHold);
window.addEventListener('pointerup', cancelHold);
window.addEventListener('pointercancel', cancelHold);
moonContainer.addEventListener('pointerleave', cancelHold);

// ============ KHÔNG GIAN 3D ============
let scene, camera, renderer, controls, moon, halo, stars, dust;
const floatingItems = [];
const TOTAL_ITEMS = IS_MOBILE ? 44 : 60;
let lastT = performance.now(), introT = 0;

// Màn hình dọc (điện thoại): mở rộng góc nhìn để thấy đủ chữ
function fitCamera() {
  const a = innerWidth / innerHeight;
  camera.aspect = a;
  camera.fov = a < 1 ? Math.min(80, 65 + (1 - a) * 28) : 65;
  camera.updateProjectionMatrix();
}

function init3DWorld() {
  const canvas = byId('canvas3d');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.0014);

  camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 1, 1600);
  camera.position.set(0, 0, 760); // bay từ xa vào
  fitCamera();

  renderer = new THREE.WebGLRenderer({ canvas, antialias: devicePixelRatio < 2, powerPreference: 'high-performance' });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, IS_MOBILE ? 1.75 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  Object.assign(controls, {
    enableDamping: true, dampingFactor: 0.06, enablePan: false, rotateSpeed: 0.6,
    autoRotate: true, autoRotateSpeed: 0.8, minDistance: 130, maxDistance: 900
  });
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const dot = makeDotTex();
  stars = makePoints(IS_MOBILE ? 220 : 350, 1000, 0xffffff, 4, 0.8, dot);
  dust = makePoints(IS_MOBILE ? 110 : 200, 600, 0xffea9f, 9, 0.8, dot);
  createCentralMoon();
  createFloatingItems();

  canvas.classList.add('ready');

  // Chạm nhẹ (không kéo) => bung tim + câu chúc tại điểm chạm
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  canvas.addEventListener('pointerup', (e) => {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 12 && performance.now() - down.t < 350) {
      burst(e.clientX, e.clientY);
      if (navigator.vibrate) navigator.vibrate(12);
    }
    down = null;
  });

  showWish();
  setInterval(showWish, 3200);
  lastT = performance.now();
  animate();
}

function makeDotTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.35, 'rgba(255,255,255,.55)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

// Sao & hạt sáng tròn, phát sáng (thay cho điểm vuông mặc định)
function makePoints(count, spread, color, size, opacity, tex) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < pos.length; i++) pos[i] = (Math.random() - 0.5) * spread;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size, map: tex, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(pts);
  return pts;
}

function createCentralMoon() {
  const S = 512;
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
  const cc = mk(), bc = mk();
  const ctx = cc.getContext('2d'), bctx = bc.getContext('2d');

  ctx.fillStyle = '#f2e5cf'; ctx.fillRect(0, 0, S, S);
  bctx.fillStyle = '#808080'; bctx.fillRect(0, 0, S, S);

  for (let i = 0; i < 10; i++) {
    const x = rnd(0, S), y = rnd(0, S), r = rnd(50, 160);
    const g = ctx.createRadialGradient(x, y, 5, x, y, r);
    g.addColorStop(0, 'rgba(120,100,78,.45)');
    g.addColorStop(0.7, 'rgba(145,125,98,.2)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  for (let i = 0; i < 90; i++) {
    const x = rnd(0, S), y = rnd(0, S), r = rnd(2, 20);
    ctx.strokeStyle = `rgba(255,248,230,${rnd(0.35, 0.75)})`;
    ctx.lineWidth = Math.max(1, r * 0.2);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    bctx.strokeStyle = 'rgba(255,255,255,.7)';
    bctx.lineWidth = Math.max(1, r * 0.25);
    bctx.beginPath(); bctx.arc(x, y, r, 0, Math.PI * 2); bctx.stroke();
  }

  moon = new THREE.Mesh(
    new THREE.SphereGeometry(46, 40, 40),
    new THREE.MeshStandardMaterial({
      map: new THREE.CanvasTexture(cc), bumpMap: new THREE.CanvasTexture(bc), bumpScale: 2.2,
      roughness: 0.8, emissive: 0xffd885, emissiveIntensity: 0.28
    })
  );
  moon.position.set(0, 0, -240);
  scene.add(moon);

  const hc = document.createElement('canvas');
  hc.width = hc.height = 256;
  const hg = hc.getContext('2d');
  const gr = hg.createRadialGradient(128, 128, 40, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,215,130,.65)');
  gr.addColorStop(0.35, 'rgba(255,180,80,.25)');
  gr.addColorStop(1, 'rgba(0,0,0,0)');
  hg.fillStyle = gr;
  hg.fillRect(0, 0, 256, 256);

  halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(hc), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.85, depthWrite: false
  }));
  halo.scale.set(150, 150, 1);
  halo.position.set(0, 0, -240);
  scene.add(halo);
}

// CHỮ NEON: độ phân giải cao, tự co cho vừa, gradient + viền + hào quang màu. Mỗi câu chỉ vẽ 1 lần (cache)
const textCache = {};
function textTex(text, isName) {
  if (textCache[text]) return textCache[text];
  let h = 0;
  for (const ch of text) h += ch.charCodeAt(0);
  const col = isName ? '#ff4d88' : PALETTE[h % PALETTE.length];

  const c = document.createElement('canvas');
  c.width = 1024; c.height = 256;
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';

  let fs = isName ? 104 : 90;
  g.font = `800 ${fs}px ${FONT}`;
  while (g.measureText(text).width > 900 && fs > 30) { fs -= 4; g.font = `800 ${fs}px ${FONT}`; }

  const x = 512, y = 132;
  g.shadowColor = col; g.shadowBlur = 48; g.fillStyle = col;      // hào quang ngoài
  g.fillText(text, x, y); g.fillText(text, x, y);
  g.shadowBlur = 14; g.lineWidth = fs * 0.1; g.strokeStyle = col; // viền màu
  g.strokeText(text, x, y);
  const grad = g.createLinearGradient(0, y - fs / 2, 0, y + fs / 2); // lõi chữ sáng trắng
  grad.addColorStop(0, '#ffffff'); grad.addColorStop(1, '#fff3d6');
  g.shadowBlur = 0; g.fillStyle = grad;
  g.fillText(text, x, y);

  return (textCache[text] = new THREE.CanvasTexture(c));
}

function createFloatingItems() {
  const loader = new THREE.TextureLoader();
  const photos = CONFIG.images.map(s => loader.load(s));
  const stickers = CONFIG.stickers.map(s => loader.load(s));

  for (let i = 0; i < TOTAL_ITEMS; i++) {
    const roll = Math.random();
    const isPhoto = roll < 0.10 && photos.length > 0;
    const isSticker = !isPhoto && roll < 0.20 && stickers.length > 0;
    let mat, w, h;

    if (isPhoto) {
      mat = new THREE.SpriteMaterial({ map: pick(photos), transparent: true });
      w = 70; h = 95;
    } else if (isSticker) {
      mat = new THREE.SpriteMaterial({ map: pick(stickers), transparent: true });
      w = h = 50;
    } else {
      const isName = Math.random() < 0.2;
      const text = isName ? CONFIG.recipientName : pick(CONFIG.messages);
      mat = new THREE.SpriteMaterial({
        map: textTex(text, isName), transparent: true, blending: THREE.AdditiveBlending,
        depthWrite: false, fog: false, toneMapped: false
      });
      w = isName ? 200 : 165; h = w / 4;
    }

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(w, h, 1);
    const radius = 65 + Math.random() * 150;
    const angle = Math.random() * Math.PI * 2;
    sprite.position.set(Math.cos(angle) * radius, -320 + Math.random() * 640, Math.sin(angle) * radius);
    scene.add(sprite);
    floatingItems.push({ mesh: sprite, w, h, speedY: 0.5 + Math.random() * 0.8, ph: rnd(0, 6.283) });
  }
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastT) / 1000); // tốc độ không phụ thuộc 60/90/120Hz
  lastT = now;
  const k = dt * 60, t = now / 1000;

  if (introT < 1) { // camera bay vào mượt
    introT = Math.min(1, introT + dt / 2.6);
    camera.position.setLength(760 - 390 * (1 - Math.pow(1 - introT, 3)));
    if (introT === 1) controls.maxDistance = 450;
  }

  for (const it of floatingItems) {
    const m = it.mesh;
    m.position.y += it.speedY * k;
    m.position.x += Math.sin(t * 1.2 + it.ph) * 0.1 * k;
    const y = m.position.y;
    let op = 1;
    if (y < -180) op = (y + 320) / 140;
    else if (y > 180) op = (320 - y) / 140;
    m.material.opacity = Math.max(0, Math.min(1, op)) * (0.9 + 0.1 * Math.sin(t * 3 + it.ph));

    // Gần thì thu nhỏ, xa thì phóng nhẹ => chữ luôn đọc được trên màn hình dọc
    const sc = Math.min(1.15, Math.max(0.6, camera.position.distanceTo(m.position) / 330));
    m.scale.set(it.w * sc, it.h * sc, 1);

    if (y > 320) {
      m.position.y = -320;
      const r = 65 + Math.random() * 150, a = Math.random() * Math.PI * 2;
      m.position.x = Math.cos(a) * r;
      m.position.z = Math.sin(a) * r;
    }
  }

  const p = Math.sin(t * 1.6); // mặt trăng "thở"
  moon.rotation.y += 0.002 * k;
  halo.material.opacity = 0.8 + 0.15 * p;
  halo.scale.setScalar(150 + 12 * p);
  stars.material.opacity = 0.7 + 0.15 * Math.sin(t * 2.3);
  dust.material.opacity = 0.65 + 0.25 * Math.sin(t * 1.7 + 1);

  controls.update();
  renderer.render(scene, camera);
  drawFx(dt);
}
