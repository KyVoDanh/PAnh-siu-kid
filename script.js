const CONFIG = {
  recipientName: "Phương Anh",
  messages: [
    "I love you",
    "iu bé",
    "Phương Anh kid",
    "trung thu vui vẻ",
    "chúc bé thật nhiều may mắn",
    "PAnh kid",
    "iu bé nhiều lắm",
    "mãi yêu bé",
    "chúc bé luôn hạnh phúc"
  ],
  images: [],
  musicUrl: "",
  stickers: [],
  letterLines: [
    "Trung Thu đến rồi...",
    "Anh chúc em bé của anh luôn xinh đẹp, vui vẻ và bình an.",
    "Dù ở đâu, anh cũng luôn nhớ và yêu em thật nhiều.",
    "Mãi yêu em, Phương Anh."
  ]
};

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

window.addEventListener('resize', calibrateMoonPosition);
window.addEventListener('DOMContentLoaded', calibrateMoonPosition);
calibrateMoonPosition();

const moonContainer = document.getElementById('moonContainer');
const introScreen = document.getElementById('intro-screen');
const instructionText = document.getElementById('instructionText');
const hint = document.getElementById('hint');
const cornerLabel = document.getElementById('corner-label');
const actionIcons = document.getElementById('action-icons');
const bgMusic = document.getElementById('bgMusic');
const soundBtn = document.getElementById('soundBtn');
const envelopeBtn = document.getElementById('envelopeBtn');
const letterOverlay = document.getElementById('letter-overlay');
const letterText = document.getElementById('letterText');
const letterClose = document.getElementById('letterClose');

if (CONFIG.musicUrl) bgMusic.src = CONFIG.musicUrl;
else soundBtn.style.display = 'none';

let musicPlaying = false;
soundBtn.addEventListener('click', () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying){ bgMusic.play().catch(()=>{}); soundBtn.textContent = '🔊'; }
  else { bgMusic.pause(); soundBtn.textContent = '🔈'; }
});

let typingTimer = null;
function openLetter(){
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

function closeLetter(){
  letterOverlay.classList.remove('open');
  clearInterval(typingTimer);
}

envelopeBtn.addEventListener('click', openLetter);
letterClose.addEventListener('click', closeLetter);
letterOverlay.addEventListener('click', (e) => { if (e.target === letterOverlay) closeLetter(); });

// === ĐÈN TRỜI & HẠT SAO TRÊN TẦNG INTRO ===
(function initIntroEffects() {
  const canvas = document.getElementById('introCanvas');
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

// === XỬ LÝ NHẤN GIỮ CHÍNH XÁC VÀO MẶT TRĂNG ===
let holdTimer = null;
let isTransitioning = false;
const HOLD_REQUIRED_TIME = 900;

function startHold(e){
  if (isTransitioning) return;
  if (e.cancelable) e.preventDefault();
  
  introScreen.classList.add('holding');
  instructionText.textContent = "Giữ yên một chút nhé...";

  if (CONFIG.musicUrl && !musicPlaying) {
    bgMusic.play().then(()=>{ musicPlaying = true; soundBtn.textContent = '🔊'; }).catch(()=>{});
  }

  holdTimer = setTimeout(() => {
    isTransitioning = true;
    introScreen.classList.remove('holding');
    introScreen.classList.add('zooming');

    setTimeout(() => {
      introScreen.style.opacity = '0';
      introScreen.style.visibility = 'hidden';
      hint.classList.add('show');
      cornerLabel.classList.add('show');
      actionIcons.classList.add('show');
      init3DWorld();
    }, 1000);
  }, HOLD_REQUIRED_TIME);
}

function cancelHold(){
  if (isTransitioning) return;
  if (holdTimer){ 
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
let scene, camera, renderer, controls;
const floatingItems = [];
const TOTAL_ITEMS = 30;

function init3DWorld(){
  const canvas = document.getElementById('canvas3d');
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e21, 0.0016);

  camera = new THREE.PerspectiveCamera(65, window.innerWidth/window.innerHeight, 1, 1500);
  camera.position.set(0, 0, 370);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.rotateSpeed = 0.6;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.minDistance = 130;
  controls.maxDistance = 450;

  scene.add(new THREE.AmbientLight(0xffffff, 1));

  createStarfield();
  createCentralMoon();
  createFloatingItems();
  animate();

  window.addEventListener('resize', onResize);
}

function createCentralMoon(){
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');

  ctx.fillStyle = '#f2e5cf';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = (50 + Math.random() * 110);
    
    const g = ctx.createRadialGradient(x, y, 5, x, y, r);
    g.addColorStop(0, 'rgba(120, 100, 78, 0.45)');
    g.addColorStop(0.7, 'rgba(145, 125, 98, 0.2)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 90; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = (2 + Math.random() * 18);

    ctx.strokeStyle = `rgba(255, 248, 230, ${0.35 + Math.random() * 0.4})`;
    ctx.lineWidth = Math.max(1, r * 0.2);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    bCtx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    bCtx.lineWidth = Math.max(1, r * 0.25);
    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.stroke();
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  const bumpTex = new THREE.CanvasTexture(bumpCanvas);

  const geo = new THREE.SphereGeometry(46, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    map: colorTex,
    bumpMap: bumpTex,
    bumpScale: 2.2,
    roughness: 0.8,
    emissive: 0xffd885,
    emissiveIntensity: 0.28
  });

  const moon = new THREE.Mesh(geo, mat);
  moon.position.set(0, 0, -240);
  scene.add(moon);

  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 256;
  const hCtx = haloCanvas.getContext('2d');
  const hGrad = hCtx.createRadialGradient(128, 128, 40, 128, 128, 128);
  hGrad.addColorStop(0, 'rgba(255, 215, 130, 0.65)');
  hGrad.addColorStop(0.35, 'rgba(255, 180, 80, 0.25)');
  hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  hCtx.fillStyle = hGrad;
  hCtx.fillRect(0, 0, 256, 256);

  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloMat = new THREE.SpriteMaterial({
    map: haloTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0.85
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(150, 150, 1);
  halo.position.set(0, 0, -240);
  scene.add(halo);
}

function createTextTexture(text, isName){
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400; 
  canvas.height = 100;
  ctx.font = isName ? 'italic 600 38px "Playfair Display", serif' : '600 28px Quicksand, sans-serif';
  ctx.textAlign = 'center'; 
  ctx.textBaseline = 'middle';
  ctx.shadowColor = isName ? '#ffcf70' : '#ff9eb5';
  ctx.shadowBlur = 12;
  ctx.fillStyle = isName ? '#fff3c9' : '#fff6e2';
  ctx.fillText(text, canvas.width/2, canvas.height/2);
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createFloatingItems(){
  const textureLoader = new THREE.TextureLoader();
  const photoTextures = CONFIG.images.map(src => textureLoader.load(src));
  const stickerTextures = CONFIG.stickers.map(src => textureLoader.load(src));

  for (let i=0; i<TOTAL_ITEMS; i++){
    let spriteMaterial;
    const roll = Math.random();
    const isPhoto = roll < 0.16 && photoTextures.length > 0;
    const isSticker = !isPhoto && roll < 0.30 && stickerTextures.length > 0;

    if (isPhoto){
      const tex = photoTextures[Math.floor(Math.random()*photoTextures.length)];
      spriteMaterial = new THREE.SpriteMaterial({ map: tex, transparent:true });
    } else if (isSticker){
      const tex = stickerTextures[Math.floor(Math.random()*stickerTextures.length)];
      spriteMaterial = new THREE.SpriteMaterial({ map: tex, transparent:true });
    } else {
      const isName = Math.random() < 0.3;
      const text = isName ? CONFIG.recipientName : CONFIG.messages[Math.floor(Math.random()*CONFIG.messages.length)];
      spriteMaterial = new THREE.SpriteMaterial({ map: createTextTexture(text, isName), transparent:true });
    }

    const sprite = new THREE.Sprite(spriteMaterial);

    if (isPhoto) sprite.scale.set(70, 95, 1);
    else if (isSticker) sprite.scale.set(60, 60, 1);
    else sprite.scale.set(135, 34, 1);

    const radius = 65 + Math.random()*150;
    const angle = Math.random()*Math.PI*2;
    sprite.position.x = Math.cos(angle)*radius;
    sprite.position.z = Math.sin(angle)*radius;
    sprite.position.y = -320 + Math.random()*640;

    scene.add(sprite);
    floatingItems.push({ mesh: sprite, speedY: 0.5 + Math.random()*0.8, startY:-320, endY:320 });
  }
}

function createStarfield(){
  const count = 350;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  for (let i=0;i<count*3;i++) positions[i] = (Math.random()-0.5)*1000;
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({ color:0xffffff, size:1.8, transparent:true, opacity:0.65 });
  scene.add(new THREE.Points(geo, mat));
}

function animate(){
  requestAnimationFrame(animate);
  floatingItems.forEach(item => {
    item.mesh.position.y += item.speedY;
    const y = item.mesh.position.y;
    let opacity = 1;
    if (y < -180) opacity = (y+320)/140;
    else if (y > 180) opacity = (320-y)/140;
    item.mesh.material.opacity = Math.max(0, Math.min(1, opacity));

    if (item.mesh.position.y > item.endY){
      item.mesh.position.y = item.startY;
      const radius = 65 + Math.random()*150;
      const angle = Math.random()*Math.PI*2;
      item.mesh.position.x = Math.cos(angle)*radius;
      item.mesh.position.z = Math.sin(angle)*radius;
    }
  });
  controls.update();
  renderer.render(scene, camera);
}

function onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}