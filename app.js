/**
 * 차경(借景) 3D — 한국 명승 산사 '풍경 멍' 힐링 웹 프로토타입
 * - 그래픽 엔진: Three.js r180 + 실사 PBR 7종 표면 재질(createSurfaceManager) + 360° 산림 파노라마 & 호라이즌 블렌딩 + 3D 소나무(pine.glb) + 수면 반사 셰이더
 * - 공간 1 (영주 부석사 무량수전 앞마당): 배흘림기둥·우물마루·처마 서까래·무량수전 현판·석등·안양루·소백산맥 6겹 능선과 실시간 운해·처마 끝 3D 풍경종·소원 연등
 * - 공간 2 (순천 선암사 승선교와 강선루): 28개 홍예석 반원형 무지개 돌다리(승선교)와 용두석·수면 원형 반영·실시간 계곡물 셰이더·강선루 누각·조계산 단풍/봄꽃 숲·돌담길 소원 연등
 */

const C_ENGINE = window.SANSA_CORE;

const STORAGE_KEY = 'chakyeong_3d_wishes_v2';
const HAPJANG_STORAGE_KEY = 'chakyeong_3d_hapjang_v2';

const SPACE_META = {
  buseoksa: {
    eyebrow: '차경(借景) 3D 제1경 · 경북 영주 봉황산',
    title: '부석사 무량수전 앞마당',
    caption: '배흘림기둥과 서까래 처마 밑, 안양루 너머로 겹겹이 펼쳐지는 소백산맥의 능선과 운해',
    locationBadge: '부석사 무량수전 처마 밑',
    writeDesc: '무량수전 처마 밑 서까래에 3D 연등을 매달아 소백산 바람에 소원을 실어 보냅니다.',
    defaultBellMix: 80,
    defaultWaterMix: 20,
    defaultWindMix: 65
  },
  seonamsa: {
    eyebrow: '차경(借景) 3D 제2경 · 전남 순천 조계산',
    title: '순천 선암사 승선교와 강선루',
    caption: '둥근 무지개 돌다리 아래 흐르는 맑은 계곡물, 수면 위에 어리는 반영과 바람에 흩날리는 계절의 잎',
    locationBadge: '선암사 승선교 돌담길',
    writeDesc: '승선교 무지개 다리와 계곡 돌담길에 3D 연등을 걸어 맑은 물결 위에 마음을 비춥니다.',
    defaultBellMix: 45,
    defaultWaterMix: 85,
    defaultWindMix: 50
  }
};

const LANTERN_COLORS = {
  amber: { core: '#FFFBEB', mid: '#F59E0B', edge: '#B45309', hex: 0xf59e0b },
  lotus: { core: '#FFF1F2', mid: '#F472B6', edge: '#BE185D', hex: 0xf472b6 },
  jade:  { core: '#ECFDF5', mid: '#34D399', edge: '#047857', hex: 0x34d399 },
  moon:  { core: '#FFFFFF', mid: '#FDE047', edge: '#CA8A04', hex: 0xfde047 }
};

const INITIAL_WISHES = [
  {
    id: 'bs-1',
    space: 'buseoksa',
    color: 'amber',
    author: '소백산 나그네',
    tag: '마음 평안',
    text: '무량수전 배흘림기둥에 기대어 바라본 능선처럼, 흔들리는 마음도 묵묵히 제자리를 찾기를 바랍니다.',
    date: '2026.10.29',
    hapjang: 64,
    slot: 0
  },
  {
    id: 'bs-2',
    space: 'buseoksa',
    color: 'lotus',
    author: '가을 순례자',
    tag: '가족 건강',
    text: '부모님의 걸음이 오래도록 가벼우시길, 다가오는 겨울에도 따뜻한 온기가 집안에 머물기를 발원합니다.',
    date: '2026.10.30',
    hapjang: 91,
    slot: 1
  },
  {
    id: 'bs-3',
    space: 'buseoksa',
    color: 'moon',
    author: '새벽별',
    tag: '소망 성취',
    text: '오랜 시간 준비해 온 작은 씨앗이 조급함 없이 단단한 뿌리를 내리고 꽃피울 수 있기를.',
    date: '2026.10.31',
    hapjang: 53,
    slot: 2
  },
  {
    id: 'bs-4',
    space: 'buseoksa',
    color: 'jade',
    author: '청산에 살어리',
    tag: '오늘의 감사',
    text: '처마 끝 풍경 소리에 잠시 멈춰 숨을 고를 수 있는 오늘 하루의 여백에 깊이 감사합니다.',
    date: '2026.11.01',
    hapjang: 78,
    slot: 3
  },
  {
    id: 'bs-5',
    space: 'buseoksa',
    color: 'amber',
    author: '안양루 달빛',
    tag: '인연과 사랑',
    text: '멀리 떨어져 있어도 같은 하늘의 노을을 보며 서로의 안녕을 빌어주는 따뜻한 인연이기를.',
    date: '2026.11.01',
    hapjang: 112,
    slot: 4
  },
  {
    id: 'bs-6',
    space: 'buseoksa',
    color: 'lotus',
    author: '풍경소리',
    tag: '마음 평안',
    text: '이곳을 스쳐 가는 모든 이들의 어두운 밤길에 석등 같은 잔잔한 불빛 하나가 함께하길 합장합니다.',
    date: '2026.11.02',
    hapjang: 85,
    slot: 5
  },
  {
    id: 'sa-1',
    space: 'seonamsa',
    color: 'lotus',
    author: '조계산 산책자',
    tag: '마음 평안',
    text: '승선교 아래 흐르는 맑은 물결처럼 지난 후회와 미련은 흘려보내고 오늘만 온전히 살아가기를.',
    date: '2026.10.28',
    hapjang: 72,
    slot: 0
  },
  {
    id: 'sa-2',
    space: 'seonamsa',
    color: 'amber',
    author: '홍매화 기다림',
    tag: '가족 건강',
    text: '우리 가족 모두 아픈 곳 없이 사계절 내내 웃음소리가 돌담길 너머까지 퍼져나가기를 기원합니다.',
    date: '2026.10.30',
    hapjang: 98,
    slot: 1
  },
  {
    id: 'sa-3',
    space: 'seonamsa',
    color: 'jade',
    author: '강선루 나그네',
    tag: '오늘의 감사',
    text: '물에 비친 둥근 무지개 다리를 보며 내 마음의 모난 구석도 둥글게 다듬어 봅니다.',
    date: '2026.10.31',
    hapjang: 61,
    slot: 2
  },
  {
    id: 'sa-4',
    space: 'seonamsa',
    color: 'moon',
    author: '단풍잎 편지',
    tag: '인연과 사랑',
    text: '붉게 물든 단풍잎이 물결 위를 나란히 떠가듯, 소중한 사람과 오래도록 같은 보폭으로 걷고 싶습니다.',
    date: '2026.11.01',
    hapjang: 104,
    slot: 3
  },
  {
    id: 'sa-5',
    space: 'seonamsa',
    color: 'amber',
    author: '차향기',
    tag: '소망 성취',
    text: '새로운 시작 앞에서 두려움보다 설렘이 한 뼘 더 크기를, 지치지 않는 호흡을 주소서.',
    date: '2026.11.02',
    hapjang: 49,
    slot: 4
  },
  {
    id: 'sa-6',
    space: 'seonamsa',
    color: 'lotus',
    author: '선암사 달빛',
    tag: '마음 평안',
    text: '지금 이 화면을 바라보며 잠시 숨을 고르는 당신에게 산사의 고요한 평화가 깃들기를.',
    date: '2026.11.02',
    hapjang: 128,
    slot: 5
  }
];

/* ==========================================================================
   PROCEDURAL WEB AUDIO SOUNDSCAPE ENGINE (풍경종 · 계곡물 · 산바람)
   ========================================================================== */
class SanSaAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.bellLevel = 0.75;
    this.waterLevel = 0.65;
    this.windLevel = 0.55;

    this.waterGain = null;
    this.windGain = null;
    this.masterGain = null;
    this.autoBellTimer = null;
  }

  initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;
    this.masterGain.connect(this.ctx.destination);

    this.setupContinuousStreams();
  }

  createNoiseBuffer(seconds = 4, type = 'pink') {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'brown') {
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.8;
      } else {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.08;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  setupContinuousStreams() {
    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = this.createNoiseBuffer(5, 'brown');
    brownNoise.loop = true;

    const waterBand = this.ctx.createBiquadFilter();
    waterBand.type = 'bandpass';
    waterBand.frequency.value = 540;
    waterBand.Q.value = 0.75;

    const waterHigh = this.ctx.createBiquadFilter();
    waterHigh.type = 'lowpass';
    waterHigh.frequency.value = 1750;

    const waterLfo = this.ctx.createOscillator();
    waterLfo.frequency.value = 0.32;
    const waterLfoGain = this.ctx.createGain();
    waterLfoGain.gain.value = 190;
    waterLfo.connect(waterLfoGain);
    waterLfoGain.connect(waterBand.frequency);
    waterLfo.start();

    this.waterGain = this.ctx.createGain();
    this.waterGain.gain.value = 0;

    brownNoise.connect(waterBand);
    waterBand.connect(waterHigh);
    waterHigh.connect(this.waterGain);
    this.waterGain.connect(this.masterGain);
    brownNoise.start();

    const pinkNoise = this.ctx.createBufferSource();
    pinkNoise.buffer = this.createNoiseBuffer(6, 'pink');
    pinkNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 250;
    windFilter.Q.value = 2.5;

    const windLfo = this.ctx.createOscillator();
    windLfo.frequency.value = 0.12;
    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.value = 115;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start();

    this.windGain = this.ctx.createGain();
    this.windGain.gain.value = 0;

    pinkNoise.connect(windFilter);
    windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    pinkNoise.start();
  }

  toggle() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = !this.isPlaying;
    this.updateContinuousVolumes();

    if (this.isPlaying) {
      this.strikeWindBell(0.8);
      this.scheduleNextAutoBell();
    } else if (this.autoBellTimer) {
      clearTimeout(this.autoBellTimer);
      this.autoBellTimer = null;
    }
    return this.isPlaying;
  }

  ensureActiveForInteraction() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  updateContinuousVolumes() {
    if (!this.ctx || !this.waterGain || !this.windGain) return;
    const now = this.ctx.currentTime;
    if (!this.isPlaying) {
      this.waterGain.gain.setTargetAtTime(0, now, 0.4);
      this.windGain.gain.setTargetAtTime(0, now, 0.4);
      return;
    }
    this.waterGain.gain.setTargetAtTime(this.waterLevel * 0.24, now, 0.5);
    this.windGain.gain.setTargetAtTime(this.windLevel * 0.28, now, 0.5);
  }

  scheduleNextAutoBell() {
    if (this.autoBellTimer) clearTimeout(this.autoBellTimer);
    if (!this.isPlaying) return;

    const intervalMs = 5000 + Math.random() * 6000;
    this.autoBellTimer = setTimeout(() => {
      if (this.isPlaying && this.bellLevel > 0.02) {
        this.strikeWindBell(this.bellLevel * (0.65 + Math.random() * 0.35));
        if (world3D) world3D.exciteWindBell();
      }
      this.scheduleNextAutoBell();
    }, intervalMs);
  }

  strikeWindBell(intensity = 0.85, pitchVariant = null) {
    this.ensureActiveForInteraction();
    const now = this.ctx.currentTime;

    const bellNotes = [528, 594, 660, 792, 880];
    const baseFreq = pitchVariant || bellNotes[Math.floor(Math.random() * bellNotes.length)];

    const partials = [
      { ratio: 1.0, amp: 0.44, decay: 5.1 },
      { ratio: 2.004, amp: 0.25, decay: 4.1 },
      { ratio: 2.756, amp: 0.19, decay: 2.9 },
      { ratio: 4.18, amp: 0.1, decay: 2.0 },
      { ratio: 5.404, amp: 0.05, decay: 1.3 }
    ];

    partials.forEach((p) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * p.ratio * 0.9984, now + p.decay);

      const peakGain = Math.max(0.001, p.amp * intensity * 0.34);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });
  }
}

/* ==========================================================================
   PROCEDURAL CALLIGRAPHY PLAQUE & TEXTURE FACTORY
   ========================================================================== */
class TextureFactory {
  static createPlaqueTexture(hanjaText, hangulSub) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    // Deep aged temple wood background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 320);
    bgGrad.addColorStop(0, '#1e241f');
    bgGrad.addColorStop(0.5, '#273129');
    bgGrad.addColorStop(1, '#181d19');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 320);

    // Subtle wood grain lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.lineWidth = 2;
    for (let y = 8; y < 320; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(340, y + Math.sin(y) * 4, 680, y - Math.cos(y) * 4, 1024, y);
      ctx.stroke();
    }

    // Double aged-gold border frame
    ctx.strokeStyle = '#b69d6b';
    ctx.lineWidth = 8;
    ctx.strokeRect(18, 18, 988, 284);
    ctx.strokeStyle = 'rgba(216, 192, 138, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 964, 260);

    // Gold leaf calligraphy
    ctx.fillStyle = '#e0c78c';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 138px "Batang", "Nanum Myeongjo", "AppleMyungjo", serif';
    ctx.fillText(hanjaText, 512, 142);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#b8a886';
    ctx.font = '500 30px "Pretendard", "Malgun Gothic", sans-serif';
    ctx.fillText(hangulSub, 512, 256);

    const tex = new C_ENGINE.CanvasTexture(canvas);
    tex.colorSpace = C_ENGINE.SRGBColorSpace;
    return tex;
  }

  static createDancheongCapTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#335246';
    ctx.fillRect(0, 0, 128, 128);

    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fillStyle = '#8c372b';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#d8c28c';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(64, 64, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#486e5c';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(64, 64, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#e4be6e';
    ctx.fill();

    const tex = new C_ENGINE.CanvasTexture(canvas);
    tex.colorSpace = C_ENGINE.SRGBColorSpace;
    return tex;
  }

  static createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 8, 128, 128, 122);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.58)');
    grad.addColorStop(0.35, 'rgba(242, 246, 250, 0.34)');
    grad.addColorStop(0.7, 'rgba(225, 234, 242, 0.11)');
    grad.addColorStop(1, 'rgba(225, 234, 242, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    return new C_ENGINE.CanvasTexture(canvas);
  }

  static createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 124);
    grad.addColorStop(0, 'rgba(255, 248, 220, 1)');
    grad.addColorStop(0.28, 'rgba(245, 158, 11, 0.46)');
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.12)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    return new C_ENGINE.CanvasTexture(canvas);
  }

  static createContactShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
    grad.addColorStop(0, 'rgba(18, 16, 12, 0.72)');
    grad.addColorStop(0.5, 'rgba(18, 16, 12, 0.32)');
    grad.addColorStop(1, 'rgba(18, 16, 12, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new C_ENGINE.CanvasTexture(canvas);
  }

  static createLanternTexture(colorKey) {
    const palette = LANTERN_COLORS[colorKey] || LANTERN_COLORS.amber;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const lGrad = ctx.createLinearGradient(0, 0, 0, 256);
    lGrad.addColorStop(0, palette.edge);
    lGrad.addColorStop(0.22, palette.mid);
    lGrad.addColorStop(0.5, palette.core);
    lGrad.addColorStop(0.78, palette.mid);
    lGrad.addColorStop(1, palette.edge);
    ctx.fillStyle = lGrad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(45, 20, 8, 0.24)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }

    const tex = new C_ENGINE.CanvasTexture(canvas);
    tex.colorSpace = C_ENGINE.SRGBColorSpace;
    return tex;
  }
}

/* ==========================================================================
   REAL-TIME 3D CHAKYEONG WORLD ENGINE (Three.js r180 + Photorealistic PBR)
   ========================================================================== */
class Chakyeong3DWorld {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width < 768;

    this.spaceMode = 'buseoksa';
    this.timeMode = 'dawn';
    this.foliageMode = 'autumn';
    this.camPreset = 'default';

    this.yawOffset = 0;
    this.pitchOffset = 0;
    this.targetYawOffset = 0;
    this.targetPitchOffset = 0;
    this.zoomOffset = 0;
    this.targetZoomOffset = 0;

    this.isPointerDown = false;
    this.pointerMoved = false;
    this.pointerStart = { x: 0, y: 0 };
    this.activePointers = new Map();
    this.pinchStartDist = null;
    this.pinchStartZoom = 0;

    this.camPos = new C_ENGINE.Vector3(0, 2.35, 9.2);
    this.camLook = new C_ENGINE.Vector3(0, 2.1, -18);
    this.targetCamPos = this.camPos.clone();
    this.targetCamLook = this.camLook.clone();

    this.lanternMeshes = [];
    this.interactiveTargets = [];
    this.cloudPlanes = [];
    this.buseoksaPineAnchors = [];
    this.seonamsaPineAnchors = [];
    this.seasonalCanopies = [];
    this.sonicRings = [];
    this.hapjangParticles = [];
    this.bellExcitation = 0;
    this.waterEnhancer = null;
    this.horizonUpdaters = [];
    this.windUniform = { value: 0 };

    this.mouseNDC = new C_ENGINE.Vector2(-99, -99);
    this.raycaster = new C_ENGINE.Raycaster();
    this.lastFrameTime = performance.now();

    this.initRendererAndScene();
    this.initMaterials();
    this.initSkyStarsAndMoon();
    this.buildBuseoksaWorld();
    this.buildSeonamsaWorld();
    this.initInteractiveWindBell();
    this.initFallingFoliage3D();
    this.loadPhotorealisticAssets();

    this.setSpace('buseoksa', true);
    this.setTimeMode('dawn');
    this.bindViewportEvents();

    window.addEventListener('resize', () => this.onResize());
    this.animate();
  }

  initRendererAndScene() {
    this.scene = new C_ENGINE.Scene();
    this.scene.fog = new C_ENGINE.Fog(0xd8e4df, 42, 215);

    const aspect = this.width / Math.max(1, this.height);
    const baseFov = aspect < 0.85 ? 58 : 48;
    this.camera = new C_ENGINE.PerspectiveCamera(baseFov, aspect, 0.15, 420);

    this.renderer = new C_ENGINE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.75 : 2));
    this.renderer.outputColorSpace = C_ENGINE.SRGBColorSpace;
    this.renderer.toneMapping = C_ENGINE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = C_ENGINE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Subtle PBR environment reflections (RoomEnvironment + PMREMGenerator)
    try {
      const pmrem = new C_ENGINE.PMREMGenerator(this.renderer);
      const roomEnv = new C_ENGINE.RoomEnvironment();
      this.envRT = pmrem.fromScene(roomEnv, 0.04);
      this.scene.environment = this.envRT.texture;
      this.scene.environmentIntensity = 0.25;
      roomEnv.dispose?.();
      pmrem.dispose();
    } catch (e) {
      // Fallback if PMREM unavailable
    }

    // Main Lighting Rig
    this.hemiLight = new C_ENGINE.HemisphereLight(0xeef5ef, 0x706c5d, 0.92);
    this.hemiLight.position.set(0, 40, 0);
    this.scene.add(this.hemiLight);

    this.ambientLight = new C_ENGINE.AmbientLight(0xfff4e4, 0.32);
    this.scene.add(this.ambientLight);

    this.sunLight = new C_ENGINE.DirectionalLight(0xfff1dc, 2.45);
    this.sunLight.position.set(-28, 36, -24);
    this.sunLight.castShadow = true;
    const shadowRes = this.isMobile ? 1536 : 3072;
    this.sunLight.shadow.mapSize.set(shadowRes, shadowRes);
    this.sunLight.shadow.camera.near = 4;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.camera.left = -32;
    this.sunLight.shadow.camera.right = 32;
    this.sunLight.shadow.camera.top = 32;
    this.sunLight.shadow.camera.bottom = -32;
    this.sunLight.shadow.bias = -0.00035;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Warm under-eave fill light for Buseoksa veranda & Seonamsa pavilion
    this.eaveFillLight = new C_ENGINE.PointLight(0xffb86b, 1.4, 24, 1.6);
    this.eaveFillLight.position.set(0, 3.8, 6.2);
    this.scene.add(this.eaveFillLight);

    this.buseoksaGroup = new C_ENGINE.Group();
    this.seonamsaGroup = new C_ENGINE.Group();
    this.lanternsRoot = new C_ENGINE.Group();
    this.fxRoot = new C_ENGINE.Group();

    this.scene.add(this.buseoksaGroup);
    this.scene.add(this.seonamsaGroup);
    this.scene.add(this.lanternsRoot);
    this.scene.add(this.fxRoot);
  }

  initMaterials() {
    this.glowTex = TextureFactory.createGlowTexture();
    this.cloudTex = TextureFactory.createCloudTexture();
    this.contactShadowTex = TextureFactory.createContactShadowTexture();
    this.dancheongCapTex = TextureFactory.createDancheongCapTexture();

    this.lanternTextures = {};
    Object.keys(LANTERN_COLORS).forEach((k) => {
      this.lanternTextures[k] = TextureFactory.createLanternTexture(k);
    });

    // Base PBR materials that will be automatically upgraded with real normal/roughness/color maps by createSurfaceManager
    this.matTimber = new C_ENGINE.MeshStandardMaterial({
      color: 0x9c7454,
      roughness: 0.88,
      metalness: 0.02,
      vertexColors: true
    });
    this.matDarkTimber = new C_ENGINE.MeshStandardMaterial({
      color: 0x5c4332,
      roughness: 0.86,
      metalness: 0.02,
      side: C_ENGINE.DoubleSide,
      vertexColors: true
    });
    this.matPaleTimber = new C_ENGINE.MeshStandardMaterial({
      color: 0xb89674,
      roughness: 0.85,
      metalness: 0.02,
      vertexColors: true
    });
    this.matFloorWood = new C_ENGINE.MeshStandardMaterial({
      color: 0x8f6b4e,
      roughness: 0.74,
      metalness: 0.02,
      vertexColors: true
    });
    this.matDancheongJade = new C_ENGINE.MeshStandardMaterial({
      color: 0x4b6b5c,
      roughness: 0.86,
      metalness: 0.02,
      vertexColors: true
    });
    this.matDancheongRed = new C_ENGINE.MeshStandardMaterial({
      color: 0x8a392d,
      roughness: 0.86,
      metalness: 0.02,
      vertexColors: true
    });
    this.matPlaster = new C_ENGINE.MeshStandardMaterial({
      color: 0xd4cbb8,
      roughness: 0.96,
      metalness: 0.0,
      vertexColors: true
    });
    this.matStone = new C_ENGINE.MeshStandardMaterial({
      color: 0xb5afa2,
      roughness: 0.92,
      metalness: 0.02,
      vertexColors: true
    });
    this.matRock = new C_ENGINE.MeshStandardMaterial({
      color: 0x8e8d82,
      roughness: 0.95,
      metalness: 0.02,
      vertexColors: true
    });
    this.matMoss = new C_ENGINE.MeshStandardMaterial({
      color: 0x5d744d,
      roughness: 0.96,
      metalness: 0.0,
      vertexColors: true
    });
    this.matGround = new C_ENGINE.MeshStandardMaterial({
      color: 0xa6a391,
      roughness: 0.98,
      metalness: 0.0,
      vertexColors: true
    });
    this.matGravel = new C_ENGINE.MeshStandardMaterial({
      color: 0xbab6a4,
      roughness: 0.96,
      metalness: 0.0,
      vertexColors: true
    });
    this.matGiwaRoof = new C_ENGINE.MeshStandardMaterial({
      color: 0x454b49,
      roughness: 0.84,
      metalness: 0.06,
      side: C_ENGINE.DoubleSide,
      vertexColors: true
    });
    this.matBronze = new C_ENGINE.MeshStandardMaterial({
      color: 0xb39659,
      roughness: 0.38,
      metalness: 0.78
    });
    this.matWarmHanji = new C_ENGINE.MeshStandardMaterial({
      color: 0xfff3d6,
      emissive: new C_ENGINE.Color(0xffb347),
      emissiveIntensity: 1.35,
      roughness: 0.5
    });
    this.matContactShadow = new C_ENGINE.MeshBasicMaterial({
      map: this.contactShadowTex,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    // Seasonal Canopy Materials (Autumn Maple vs Spring Cherry Blossom)
    this.canopyMaterials = [
      new C_ENGINE.MeshStandardMaterial({ color: 0xc83e2b, roughness: 0.88, vertexColors: true }),
      new C_ENGINE.MeshStandardMaterial({ color: 0xe06d2b, roughness: 0.88, vertexColors: true }),
      new C_ENGINE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.88, vertexColors: true })
    ];
    this.canopyMaterials.forEach((m) => this.attachWindSwayShader(m, 0.08));

    this.trackedGeometries = [];
  }

  attachWindSwayShader(material, amplitude = 0.05) {
    const prevCompile = material.onBeforeCompile;
    material.onBeforeCompile = (shader, renderer) => {
      if (prevCompile) prevCompile(shader, renderer);
      shader.uniforms.uWindTime = this.windUniform;
      shader.vertexShader = `uniform float uWindTime;\n` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         float swayWave = sin(position.x * 0.45 + position.z * 0.35 + uWindTime * 1.15);
         transformed.x += swayWave * ${amplitude.toFixed(4)} * max(0.0, position.y);
         transformed.z += cos(position.z * 0.4 - uWindTime * 0.9) * ${(amplitude * 0.6).toFixed(4)} * max(0.0, position.y);`
      );
    };
    material.customProgramCacheKey = () => `chakyeong-wind-${amplitude}`;
  }

  paintVertexTone(geometry, tone = 1.0, variance = 0.03) {
    const pos = geometry.getAttribute('position');
    if (!pos) return geometry;
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const n =
        tone +
        Math.sin(pos.getX(i) * 1.7 + pos.getY(i) * 2.3 + pos.getZ(i) * 1.3) * variance;
      colors[i * 3] = n;
      colors[i * 3 + 1] = n;
      colors[i * 3 + 2] = n;
    }
    geometry.setAttribute('color', new C_ENGINE.BufferAttribute(colors, 3));
    return geometry;
  }

  createMesh(geometry, material, parent, opts = {}) {
    const tone = opts.tone ?? 1.0;
    const variance = opts.variance ?? 0.025;
    this.paintVertexTone(geometry, tone, variance);
    this.trackedGeometries.push({ geometry, material });

    const mesh = new C_ENGINE.Mesh(geometry, material);
    if (opts.pos) mesh.position.set(opts.pos[0], opts.pos[1], opts.pos[2]);
    if (opts.rot) mesh.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
    if (opts.scale) {
      if (typeof opts.scale === 'number') mesh.scale.setScalar(opts.scale);
      else mesh.scale.set(opts.scale[0], opts.scale[1], opts.scale[2]);
    }
    mesh.castShadow = opts.castShadow ?? true;
    mesh.receiveShadow = opts.receiveShadow ?? true;
    if (parent) parent.add(mesh);
    return mesh;
  }

  loadPhotorealisticAssets() {
    const texLoader = new C_ENGINE.TextureLoader();

    // 1. Load 360° Woodland Mountain Panorama & apply to scene background + horizon shaders
    texLoader.load('assets/environment/woodland.jpg', (tex) => {
      tex.colorSpace = C_ENGINE.SRGBColorSpace;
      tex.mapping = C_ENGINE.EquirectangularReflectionMapping;
      this.woodlandPanorama = tex;
      this.scene.background = tex;
      this.scene.backgroundBlurriness = 0.014;
      this.setTimeMode(this.timeMode);
      this.horizonUpdaters.forEach((fn) => fn());
    });

    // Support user drag-and-drop custom Buseoksa photo
    window.applyCustomBuseoksaPhoto = (imageUrl) => {
      texLoader.load(imageUrl, (tex) => {
        tex.colorSpace = C_ENGINE.SRGBColorSpace;
        tex.mapping = C_ENGINE.EquirectangularReflectionMapping;
        this.woodlandPanorama = tex;
        this.scene.background = tex;
        this.scene.backgroundBlurriness = 0.004;
        this.setTimeMode(this.timeMode);
        this.horizonUpdaters.forEach((fn) => fn());
      });
    };

    // 2. Load 7 Photorealistic PBR Material Sets (wood, stone, plaster, roof, cloth, ground, rock)
    if (C_ENGINE.createSurfaceManager) {
      C_ENGINE.createSurfaceManager(this.renderer)
        .then(async (surfaceMgr) => {
          this.surfaceMgr = surfaceMgr;
          await surfaceMgr.loadGarden();

          surfaceMgr.apply(this.matTimber, 'wood', { tint: '#b59273', normal: 0.22, roughness: 0.88 });
          surfaceMgr.apply(this.matDarkTimber, 'wood', { tint: '#785e49', normal: 0.2, roughness: 0.86 });
          surfaceMgr.apply(this.matPaleTimber, 'wood', { tint: '#cfb397', normal: 0.16, roughness: 0.84 });
          surfaceMgr.apply(this.matFloorWood, 'floor', { tint: '#ab8c70', normal: 0.08, roughness: 0.72 });
          surfaceMgr.apply(this.matDancheongJade, 'wood', {
            tint: '#557868',
            normal: 0.12,
            saturation: 0.15,
            gain: 1.5
          });
          surfaceMgr.apply(this.matDancheongRed, 'wood', {
            tint: '#964234',
            normal: 0.12,
            saturation: 0.25,
            gain: 1.4
          });
          surfaceMgr.apply(this.matPlaster, 'plaster', { tint: '#d8cfc0', normal: 0.12 });
          surfaceMgr.apply(this.matStone, 'stone', { tint: '#ccc6b8', normal: 0.35 });
          surfaceMgr.apply(this.matRock, 'rock', { tint: '#aba99b', normal: 0.48 });
          surfaceMgr.apply(this.matMoss, 'moss', { tint: '#688056', normal: 0.32 });
          surfaceMgr.apply(this.matGround, 'ground', { tint: '#b5b8a3', normal: 0.45 });
          if (this.buseoksaGroundMat) {
            surfaceMgr.apply(this.buseoksaGroundMat, 'ground', { tint: '#b5b8a3', normal: 0.45 });
          }
          if (this.seonamsaGroundMat) {
            surfaceMgr.apply(this.seonamsaGroundMat, 'ground', { tint: '#b5b8a3', normal: 0.45 });
          }
          surfaceMgr.apply(this.matGravel, 'gravel', { tint: '#c4c2b2', normal: 0.42 });
          surfaceMgr.apply(this.matGiwaRoof, 'roof', { tint: '#7f8782', normal: 0.32 });

          const unitScale = new C_ENGINE.Vector3(1, 1, 1);
          for (const item of this.trackedGeometries) {
            surfaceMgr.projectUvs(item.geometry, item.material, unitScale);
          }

          if (this.buseoksaGroundMat && C_ENGINE.attachLandscapeHorizon) {
            this.horizonUpdaters.push(
              C_ENGINE.attachLandscapeHorizon(this.buseoksaGroundMat, this.scene)
            );
          }
          if (this.seonamsaGroundMat && C_ENGINE.attachLandscapeHorizon) {
            this.horizonUpdaters.push(
              C_ENGINE.attachLandscapeHorizon(this.seonamsaGroundMat, this.scene)
            );
          }
        })
        .catch((err) => console.warn('Surface manager fallback:', err));
    }

    // 3. Load Scanned 3D Korean Pine Model (assets/models/pine.glb)
    if (C_ENGINE.GLTFLoader && C_ENGINE.MeshoptDecoder) {
      const loader = new C_ENGINE.GLTFLoader().setMeshoptDecoder(C_ENGINE.MeshoptDecoder);
      loader
        .loadAsync('assets/models/pine.glb')
        .then((gltf) => {
          this.populateScannedPines(gltf);
        })
        .catch((err) => console.warn('Pine GLB fallback:', err));
    }
  }

  populateScannedPines(gltf) {
    const candidates = gltf.scene.children.filter((c) => c.name.startsWith('pine_sapling_small'));
    const templates = candidates.length > 0 ? candidates : [gltf.scene];

    // Enhance pine materials with gentle wind sway
    templates.forEach((tpl) => {
      tpl.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m && m.name && m.name.includes('twig')) {
              this.attachWindSwayShader(m, 0.012);
            }
          });
        }
      });
    });

    const placePineAt = (spec, idx, targetGroup) => {
      const tpl = templates[idx % templates.length].clone(true);
      const wrapper = new C_ENGINE.Group();
      wrapper.add(tpl);
      wrapper.updateMatrixWorld(true);

      const box = new C_ENGINE.Box3().setFromObject(wrapper);
      const center = box.getCenter(new C_ENGINE.Vector3());
      const rawHeight = Math.max(0.5, box.max.y - box.min.y);
      const scale = spec.height / rawHeight;

      wrapper.scale.setScalar(scale);
      wrapper.rotation.y = spec.yaw || idx * 1.7;
      wrapper.position.set(
        spec.x - center.x * scale,
        spec.y - box.min.y * scale,
        spec.z - center.z * scale
      );
      targetGroup.add(wrapper);
    };

    this.buseoksaPineAnchors.forEach((spec, idx) => placePineAt(spec, idx, this.buseoksaGroup));
    this.seonamsaPineAnchors.forEach((spec, idx) => placePineAt(spec, idx, this.seonamsaGroup));
  }

  initSkyStarsAndMoon() {
    this.skyGroup = new C_ENGINE.Group();
    this.scene.add(this.skyGroup);

    // 1,600 3D Stars for Night Mode
    const starCount = 1600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.46 + 0.04;
      const r = 175 + Math.random() * 25;
      starPos[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi);
      starPos[i * 3 + 2] = -Math.abs(r * Math.cos(phi) * Math.sin(theta)) - 10;
    }
    const starGeo = new C_ENGINE.BufferGeometry();
    starGeo.setAttribute('position', new C_ENGINE.BufferAttribute(starPos, 3));
    this.starMat = new C_ENGINE.PointsMaterial({
      color: 0xfff8e7,
      size: 0.85,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: C_ENGINE.AdditiveBlending
    });
    this.starPoints = new C_ENGINE.Points(starGeo, this.starMat);
    this.skyGroup.add(this.starPoints);

    // Full Moon + Warm Halo
    this.moonGroup = new C_ENGINE.Group();
    this.moonGroup.position.set(28, 34, -115);

    const moonDisc = new C_ENGINE.Mesh(
      new C_ENGINE.SphereGeometry(2.8, 24, 24),
      new C_ENGINE.MeshBasicMaterial({ color: 0xfffbeb, fog: false })
    );
    this.moonGroup.add(moonDisc);

    this.moonHaloMat = new C_ENGINE.MeshBasicMaterial({
      map: this.glowTex,
      color: 0xfde68a,
      transparent: true,
      opacity: 0.75,
      blending: C_ENGINE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    this.moonHalo = new C_ENGINE.Mesh(new C_ENGINE.PlaneGeometry(24, 24), this.moonHaloMat);
    this.moonGroup.add(this.moonHalo);
    this.moonGroup.visible = false;
    this.skyGroup.add(this.moonGroup);
  }

  /* ------------------------------------------------------------------------
     SPACE 1: 영주 부석사 무량수전 앞마당 (Muryangsujeon & Sobaeksan Chakyeong)
     ------------------------------------------------------------------------ */
  buildBuseoksaWorld() {
    const g = this.buseoksaGroup;

    // 1. Continuous Courtyard & Mountain Apron Ground
    this.buseoksaGroundMat = this.matGround.clone();
    const groundGeo = new C_ENGINE.PlaneGeometry(280, 260, 64, 64);
    groundGeo.rotateX(-Math.PI / 2);
    const gPos = groundGeo.getAttribute('position');
    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i);
      const z = gPos.getZ(i);
      let y = -0.82;
      if (z < -12) {
        // Gentle slope down past Anyangru stone terrace, then rising into Sobaeksan foothills
        const d = -12 - z;
        y = -0.82 - Math.min(4.2, d * 0.18) + Math.sin(x * 0.08) * Math.min(1.5, d * 0.04);
      } else {
        y = -0.82 + Math.sin(x * 0.25 + z * 0.2) * 0.03;
      }
      gPos.setY(i, y);
    }
    groundGeo.computeVertexNormals();
    this.createMesh(groundGeo, this.buseoksaGroundMat, g, {
      castShadow: false,
      receiveShadow: true,
      tone: 0.98,
      variance: 0.04
    });

    // 2. Muryangsujeon Dressed Stone Foundation (기단) & Steps (계단)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(26.4, 0.92, 6.8, 2, 0.06),
      this.matStone,
      g,
      { pos: [0, -0.44, 8.6], tone: 0.96 }
    );
    // Top border stones of foundation (면석·갑석)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(26.6, 0.16, 6.96, 2, 0.04),
      this.matStone,
      g,
      { pos: [0, 0.04, 8.6], tone: 1.02 }
    );

    // Central stone steps leading from veranda to courtyard
    for (let s = 0; s < 4; s++) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(4.4, 0.22, 0.56, 2, 0.035),
        this.matStone,
        g,
        { pos: [0, -0.08 - s * 0.2, 5.15 - s * 0.48], tone: 0.95 + (s % 2) * 0.04 }
      );
    }
    for (const sideX of [-2.32, 2.32]) {
      const cheekGeo = new C_ENGINE.RoundedBoxGeometry(0.28, 0.95, 2.2, 2, 0.04);
      cheekGeo.rotateX(0.32);
      this.createMesh(cheekGeo, this.matStone, g, {
        pos: [sideX, -0.36, 4.4],
        tone: 0.92
      });
    }

    // 3. Individual Umulmaru Wooden Veranda Planks (우물마루 널빤지 개별 조립)
    const plankCountX = 48;
    const totalVerandaWidth = 24.0;
    const plankW = totalVerandaWidth / plankCountX - 0.012;
    for (let row = 0; row < 2; row++) {
      const rowZ = 6.55 + row * 2.15;
      for (let i = 0; i < plankCountX; i++) {
        const px = -totalVerandaWidth / 2 + (i + 0.5) * (totalVerandaWidth / plankCountX);
        const tone = 0.95 + ((i * 7 + row * 13) % 9) * 0.012;
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(plankW, 0.09, 2.08, 2, 0.008),
          this.matFloorWood,
          g,
          { pos: [px, 0.14, rowZ], tone, variance: 0.015 }
        );
      }
    }
    // Cross tie beams (장귀틀)
    for (const zBeam of [5.48, 7.62, 9.72]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(24.4, 0.12, 0.22, 2, 0.02),
        this.matDarkTimber,
        g,
        { pos: [0, 0.145, zBeam], tone: 0.9 }
      );
    }

    // 4. Muryangsujeon Entasis Columns (배흘림기둥) & Multi-tier Brackets (공포·주두·첨차)
    const columnXs = [-10.8, -6.2, -2.6, 2.6, 6.2, 10.8];
    const colZ = 6.0;
    const entasisPts = [
      new C_ENGINE.Vector2(0.34, 0.0),
      new C_ENGINE.Vector2(0.38, 0.35),
      new C_ENGINE.Vector2(0.42, 1.45),
      new C_ENGINE.Vector2(0.435, 2.35),
      new C_ENGINE.Vector2(0.4, 3.55),
      new C_ENGINE.Vector2(0.355, 4.55),
      new C_ENGINE.Vector2(0.33, 5.05)
    ];

    columnXs.forEach((cx, idx) => {
      // Natural Granite Plinth (초석)
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(1.04, 0.26, 1.04, 2, 0.06),
        this.matStone,
        g,
        { pos: [cx, 0.25, colZ], tone: 0.94 + (idx % 2) * 0.04 }
      );

      // Contact shadow around column base
      const cShadow = new C_ENGINE.Mesh(
        new C_ENGINE.PlaneGeometry(1.8, 1.8),
        this.matContactShadow
      );
      cShadow.rotation.x = -Math.PI / 2;
      cShadow.position.set(cx, 0.195, colZ);
      g.add(cShadow);

      // Entasis Timber Column (배흘림기둥)
      const colGeo = new C_ENGINE.LatheGeometry(entasisPts, 28);
      this.createMesh(colGeo, this.matTimber, g, {
        pos: [cx, 0.36, colZ],
        tone: 0.97 + (idx % 3) * 0.025
      });

      // Capital Block (주두)
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.86, 0.22, 0.86, 2, 0.03),
        this.matDarkTimber,
        g,
        { pos: [cx, 5.48, colZ] }
      );

      // 3-Tiered Bracket Arms (첨차·살미·소로)
      for (let tier = 0; tier < 3; tier++) {
        const ty = 5.68 + tier * 0.24;
        const span = 1.28 + tier * 0.38;
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(span, 0.16, 0.34, 2, 0.02),
          tier === 1 ? this.matDancheongJade : this.matDarkTimber,
          g,
          { pos: [cx, ty, colZ] }
        );
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(0.34, 0.16, span, 2, 0.02),
          tier === 1 ? this.matDancheongRed : this.matPaleTimber,
          g,
          { pos: [cx, ty + 0.04, colZ] }
        );
      }
    });

    // Horizontal Lintels & Beams (창방 · 평방 · 도리)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(23.6, 0.34, 0.42, 2, 0.035),
      this.matTimber,
      g,
      { pos: [0, 5.22, colZ] }
    );
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(23.8, 0.22, 0.48, 2, 0.025),
      this.matDancheongJade,
      g,
      { pos: [0, 5.48, colZ] }
    );
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(24.8, 0.38, 0.46, 2, 0.035),
      this.matDarkTimber,
      g,
      { pos: [0, 6.38, colZ - 0.15] }
    );

    // Rear Lattice Doors & Warm Earth Plaster Wall behind Veranda (정면 분합문과 회벽)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(22.4, 5.2, 0.28, 2, 0.02),
      this.matPlaster,
      g,
      { pos: [0, 2.8, 9.55], tone: 0.94 }
    );
    for (let bx = -9.0; bx <= 9.0; bx += 1.8) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.14, 4.8, 0.34, 2, 0.015),
        this.matDarkTimber,
        g,
        { pos: [bx, 2.75, 9.52] }
      );
    }

    // 5. Calligraphed Plaque: 無量壽殿 (무량수전 현판)
    const muryangPlaqueTex = TextureFactory.createPlaqueTexture('無 量 壽 殿', '부석사 무량수전');
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(4.35, 1.38, 0.18, 2, 0.03),
      this.matDarkTimber,
      g,
      { pos: [0, 5.88, 5.55], rot: [0.14, 0, 0] }
    );
    const muryangFace = new C_ENGINE.Mesh(
      new C_ENGINE.PlaneGeometry(4.12, 1.2),
      new C_ENGINE.MeshStandardMaterial({ map: muryangPlaqueTex, roughness: 0.65 })
    );
    muryangFace.position.set(0, 5.88, 5.45);
    muryangFace.rotation.x = 0.14 + Math.PI;
    muryangFace.rotation.z = Math.PI;
    g.add(muryangFace);

    // 6. Deep Curved Eaves, 38 Rafters (서까래·부연) & Lotus Dancheong End-Caps
    const rafterCapMat = new C_ENGINE.MeshStandardMaterial({
      map: this.dancheongCapTex,
      roughness: 0.65
    });

    const rafterCount = 38;
    for (let i = 0; i < rafterCount; i++) {
      const t = i / (rafterCount - 1) - 0.5;
      const rx = t * 25.2;
      const cornerLift = Math.pow(Math.abs(t) * 2, 2.4) * 0.58;

      const rCurve = new C_ENGINE.CatmullRomCurve3([
        new C_ENGINE.Vector3(rx, 6.85 + cornerLift * 0.3, 7.6),
        new C_ENGINE.Vector3(rx * 1.01, 5.95 + cornerLift * 0.65, 5.6),
        new C_ENGINE.Vector3(rx * 1.025, 5.12 + cornerLift, 3.65)
      ]);
      const rGeo = new C_ENGINE.TubeGeometry(rCurve, 10, 0.088, 8, false);
      this.createMesh(rGeo, this.matTimber, g, { tone: 0.94 + (i % 3) * 0.03 });

      // Lotus Dancheong End-Cap (서까래 마구리)
      const capMesh = new C_ENGINE.Mesh(
        new C_ENGINE.CylinderGeometry(0.088, 0.088, 0.03, 12),
        rafterCapMat
      );
      capMesh.rotation.x = Math.PI / 2 - 0.36;
      capMesh.position.set(rx * 1.025, 5.11 + cornerLift, 3.63);
      g.add(capMesh);
    }

    // Sweeping Eave Roof Soffit & Giwa Tile Courses above Muryangsujeon
    const eaveRoofGeo = new C_ENGINE.PlaneGeometry(27.2, 6.6, 36, 12);
    const ePos = eaveRoofGeo.getAttribute('position');
    for (let i = 0; i < ePos.count; i++) {
      const x = ePos.getX(i);
      const y = ePos.getY(i);
      const normX = Math.abs(x) / 13.6;
      const normY = (y + 3.3) / 6.6; // 0 at front eave edge, 1 at ridge side
      const height = 5.25 + normY * 2.95 + Math.pow(normX, 2.3) * 0.62 * (1 - normY * 0.4);
      const depthZ = 3.45 + normY * 5.8;
      ePos.setXYZ(i, x, height, depthZ);
    }
    eaveRoofGeo.computeVertexNormals();
    this.matDarkTimber.side = C_ENGINE.DoubleSide;
    this.createMesh(eaveRoofGeo, this.matDarkTimber, g, { tone: 0.85 });

    const roofTopGeo = eaveRoofGeo.clone();
    roofTopGeo.translate(0, 0.16, 0);
    this.matGiwaRoof.side = C_ENGINE.DoubleSide;
    this.createMesh(roofTopGeo, this.matGiwaRoof, g, { tone: 0.96 });

    // 7. Courtyard Flagstone Path (박석길), Terrace Wall (석축), & Boulders
    for (let i = 0; i < 16; i++) {
      const fz = 3.1 - i * 0.92;
      const fx = Math.sin(i * 0.45) * 0.18;
      const fw = 1.55 + (i % 3) * 0.18;
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(fw, 0.08, 0.76, 2, 0.025),
        this.matStone,
        g,
        {
          pos: [fx, -0.79, fz],
          rot: [0, (i % 2 === 0 ? 1 : -1) * 0.03, 0],
          tone: 0.92 + (i % 4) * 0.04
        }
      );
    }

    // Courtyard far stone terrace wall (부석사 석축 단)
    for (let tier = 0; tier < 3; tier++) {
      for (let bx = -18; bx <= 18; bx += 1.65) {
        if (bx > -5.5 && bx < -1.8 && tier === 2) continue;
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(1.58, 0.48, 0.95, 2, 0.07),
          this.matStone,
          g,
          {
            pos: [bx + (tier % 2) * 0.35, -1.45 + tier * 0.44, -11.6 + tier * 0.18],
            tone: 0.88 + ((Math.abs(bx) + tier) % 4) * 0.05
          }
        );
      }
    }

    // Mossy courtyard boulders
    const boulderSpecs = [
      [-8.5, -0.72, -3.5, 1.35, 0.68, 1.05],
      [-7.4, -0.78, -2.8, 0.78, 0.45, 0.65],
      [8.2, -0.74, -4.8, 1.45, 0.72, 1.15],
      [9.4, -0.78, -3.9, 0.85, 0.48, 0.75],
      [-10.2, -0.7, -9.4, 1.6, 0.85, 1.25],
      [10.6, -0.72, -9.8, 1.5, 0.78, 1.15]
    ];
    boulderSpecs.forEach(([bx, by, bz, sx, sy, sz], idx) => {
      this.createMesh(
        new C_ENGINE.SphereGeometry(1, 18, 14),
        idx % 3 === 0 ? this.matMoss : this.matRock,
        g,
        { pos: [bx, by, bz], scale: [sx, sy, sz], rot: [0, idx * 1.1, 0], tone: 0.94 }
      );
    });

    // 8. Unified Silla Buseoksa Stone Lantern (부석사 무량수전 앞 석등)
    this.buildBuseoksaStoneLantern(g, 2.75, -0.82, -1.65);

    // 9. Anyangru 2-Story Pavilion (안양루 누각) framing Sobaeksan ridges
    this.buildPavilion3D(g, {
      x: -4.2,
      y: -1.15,
      z: -13.8,
      scale: 0.92,
      yaw: 0.16,
      hanja: '安 養 樓',
      hangul: '부석사 안양루'
    });

    // 10. Register Scanned 3D Pine Trees (assets/models/pine.glb) around Courtyard & Anyangru
    this.buseoksaPineAnchors = [
      { x: -11.2, y: -0.85, z: -6.2, height: 8.8, yaw: 0.4 },
      { x: -14.8, y: -0.95, z: -11.5, height: 10.5, yaw: 1.8 },
      { x: 10.4, y: -0.85, z: -5.8, height: 8.4, yaw: -0.6 },
      { x: 14.2, y: -0.95, z: -11.8, height: 10.8, yaw: 2.3 },
      { x: 4.8, y: -1.25, z: -14.2, height: 9.2, yaw: 0.9 },
      { x: -10.5, y: -1.35, z: -16.5, height: 9.8, yaw: -1.4 }
    ];

    // Seasonal Maple / Cherry Trees flanking the courtyard
    this.buildSeasonalTree(g, -9.4, -0.82, -8.5, 1.15);
    this.buildSeasonalTree(g, 8.8, -0.82, -8.2, 1.1);
    this.buildSeasonalTree(g, 1.8, -1.2, -14.8, 1.05);

    // 11. Multi-Layered 3D Sobaeksan Mountain Ridges (소백산맥 6겹 중첩 능선)
    this.buildSobaeksanMountainRidges(g);

    // 12. Real-Time 3D Sea of Clouds (운해 레이어 38장)
    this.buildSeaOfClouds(g);
  }

  buildBuseoksaStoneLantern(parent, x, y, z) {
    const lg = new C_ENGINE.Group();
    lg.position.set(x, y, z);

    // Contact shadow
    const cs = new C_ENGINE.Mesh(new C_ENGINE.PlaneGeometry(2.6, 2.6), this.matContactShadow);
    cs.rotation.x = -Math.PI / 2;
    cs.position.y = 0.02;
    lg.add(cs);

    // Base steps & lower lotus pedestal (하대석)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(1.48, 0.22, 1.48, 2, 0.04),
      this.matStone,
      lg,
      { pos: [0, 0.11, 0] }
    );
    this.createMesh(
      new C_ENGINE.CylinderGeometry(0.56, 0.68, 0.34, 8),
      this.matStone,
      lg,
      { pos: [0, 0.38, 0] }
    );

    // Octagonal shaft (간주석)
    this.createMesh(
      new C_ENGINE.CylinderGeometry(0.22, 0.24, 1.08, 8),
      this.matStone,
      lg,
      { pos: [0, 1.06, 0] }
    );

    // Upper lotus pedestal (상대석)
    this.createMesh(
      new C_ENGINE.CylinderGeometry(0.58, 0.38, 0.24, 8),
      this.matStone,
      lg,
      { pos: [0, 1.7, 0] }
    );

    // Glowing Hanji Light Chamber (화사석 등불)
    const chamberCore = new C_ENGINE.Mesh(
      new C_ENGINE.CylinderGeometry(0.34, 0.34, 0.62, 8),
      this.matWarmHanji
    );
    chamberCore.position.set(0, 2.12, 0);
    lg.add(chamberCore);

    // Corner stone posts around light chamber
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.09, 0.66, 0.09, 2, 0.015),
        this.matStone,
        lg,
        { pos: [Math.cos(a) * 0.39, 2.12, Math.sin(a) * 0.39], rot: [0, -a, 0] }
      );
    }

    // Octagonal Roof Stone (옥개석) & Finial (보주)
    const roofPts = [
      new C_ENGINE.Vector2(0.0, 0.52),
      new C_ENGINE.Vector2(0.14, 0.44),
      new C_ENGINE.Vector2(0.11, 0.32),
      new C_ENGINE.Vector2(0.32, 0.24),
      new C_ENGINE.Vector2(0.78, 0.06),
      new C_ENGINE.Vector2(0.84, 0.0),
      new C_ENGINE.Vector2(0.0, 0.0)
    ];
    this.createMesh(new C_ENGINE.LatheGeometry(roofPts, 8), this.matStone, lg, {
      pos: [0, 2.42, 0],
      tone: 0.92
    });

    // Warm PointLight inside stone lantern
    this.stoneLanternLight = new C_ENGINE.PointLight(0xffaa44, 2.2, 14, 1.6);
    this.stoneLanternLight.position.set(0, 2.15, 0);
    lg.add(this.stoneLanternLight);

    // Soft glow pool on ground around stone lantern
    const groundGlowMat = new C_ENGINE.MeshBasicMaterial({
      map: this.glowTex,
      color: 0xffb35c,
      transparent: true,
      opacity: 0.38,
      blending: C_ENGINE.AdditiveBlending,
      depthWrite: false
    });
    const groundGlow = new C_ENGINE.Mesh(new C_ENGINE.PlaneGeometry(4.2, 4.2), groundGlowMat);
    groundGlow.rotation.x = -Math.PI / 2;
    groundGlow.position.y = 0.03;
    lg.add(groundGlow);

    parent.add(lg);
  }

  buildPavilion3D(parent, spec) {
    const pg = new C_ENGINE.Group();
    pg.position.set(spec.x, spec.y, spec.z);
    pg.rotation.y = spec.yaw || 0;
    pg.scale.setScalar(spec.scale || 1);

    // Stone base platform
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(8.8, 0.85, 6.2, 2, 0.06),
      this.matStone,
      pg,
      { pos: [0, 0.42, 0], tone: 0.93 }
    );

    // Lower story tall pillars (누하주) & upper entasis columns (누상주)
    const pXs = [-3.4, -1.15, 1.15, 3.4];
    const pZs = [-2.2, 2.2];
    for (const px of pXs) {
      for (const pz of pZs) {
        this.createMesh(
          new C_ENGINE.CylinderGeometry(0.24, 0.27, 2.3, 16),
          this.matTimber,
          pg,
          { pos: [px, 1.95, pz] }
        );
        this.createMesh(
          new C_ENGINE.CylinderGeometry(0.21, 0.24, 2.55, 16),
          this.matTimber,
          pg,
          { pos: [px, 4.5, pz] }
        );
      }
    }

    // 2nd Floor Pavilion Deck & Intricate Wooden Railing (우물마루와 계자난간)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(8.2, 0.22, 5.6, 2, 0.03),
      this.matFloorWood,
      pg,
      { pos: [0, 3.15, 0] }
    );
    // Railings
    for (const rz of [-2.65, 2.65]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(8.3, 0.1, 0.12, 2, 0.015),
        this.matDancheongRed,
        pg,
        { pos: [0, 3.72, rz] }
      );
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(8.2, 0.08, 0.1, 2, 0.015),
        this.matDancheongJade,
        pg,
        { pos: [0, 3.45, rz] }
      );
    }
    for (const rx of [-3.95, 3.95]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.12, 0.1, 5.4, 2, 0.015),
        this.matDancheongRed,
        pg,
        { pos: [rx, 3.72, 0] }
      );
    }

    // Upper Beams & Dancheong Frieze
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(8.0, 0.34, 5.2, 2, 0.03),
      this.matDancheongJade,
      pg,
      { pos: [0, 5.82, 0] }
    );

    // Calligraphed Pavilion Plaque (안양루 / 강선루 현판)
    const plaqueTex = TextureFactory.createPlaqueTexture(spec.hanja, spec.hangul);
    const plaqueMesh = new C_ENGINE.Mesh(
      new C_ENGINE.PlaneGeometry(2.55, 0.78),
      new C_ENGINE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.65 })
    );
    plaqueMesh.position.set(0, 5.55, 2.68);
    pg.add(plaqueMesh);

    // Traditional Curved Paljak Giwa Roof (팔작지붕 곡선 기와)
    const roofGeo = new C_ENGINE.BufferGeometry();
    const rVerts = [];
    const rUvs = [];
    const rIndices = [];
    const segX = 28;
    const segZ = 18;
    for (let iz = 0; iz <= segZ; iz++) {
      const vz = iz / segZ - 0.5; // -0.5 to 0.5
      for (let ix = 0; ix <= segX; ix++) {
        const vx = ix / segX - 0.5; // -0.5 to 0.5
        const absZ = Math.abs(vz) * 2;
        const absX = Math.abs(vx) * 2;
        const spanX = 5.4 + absZ * 0.65;
        const spanZ = 3.9 + absX * 0.35;
        const x = vx * spanX * 2;
        const z = vz * spanZ * 2;
        const ridgeDrop = Math.pow(absZ, 1.35) * 1.95;
        const cornerLift = Math.pow(absX, 3.0) * Math.pow(absZ, 2.0) * 0.85;
        const y = 7.75 - ridgeDrop + cornerLift;
        rVerts.push(x, y, z);
        rUvs.push(x * 0.4, z * 0.4);
      }
    }
    for (let iz = 0; iz < segZ; iz++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iz * (segX + 1) + ix;
        const b = a + segX + 1;
        rIndices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    roofGeo.setAttribute('position', new C_ENGINE.Float32BufferAttribute(rVerts, 3));
    roofGeo.setAttribute('uv', new C_ENGINE.Float32BufferAttribute(rUvs, 2));
    roofGeo.setIndex(rIndices);
    roofGeo.computeVertexNormals();

    this.matGiwaRoof.side = C_ENGINE.DoubleSide;
    this.createMesh(roofGeo, this.matGiwaRoof, pg, { tone: 0.95 });

    // Roof Ridge Beam (용마루)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(7.2, 0.24, 0.28, 2, 0.04),
      this.matGiwaRoof,
      pg,
      { pos: [0, 7.82, 0], tone: 1.05 }
    );

    // Warm interior lantern inside pavilion
    const innerLantern = new C_ENGINE.Mesh(
      new C_ENGINE.SphereGeometry(0.24, 14, 14),
      this.matWarmHanji
    );
    innerLantern.position.set(0, 4.85, 0);
    pg.add(innerLantern);

    parent.add(pg);
  }

  buildSeasonalTree(parent, x, y, z, scale = 1.0) {
    const tg = new C_ENGINE.Group();
    tg.position.set(x, y, z);
    tg.scale.setScalar(scale);

    // Curved trunk & branches
    const trunkCurve = new C_ENGINE.CatmullRomCurve3([
      new C_ENGINE.Vector3(0, 0, 0),
      new C_ENGINE.Vector3(0.18, 1.35, 0.08),
      new C_ENGINE.Vector3(-0.12, 2.75, -0.1),
      new C_ENGINE.Vector3(0.08, 3.85, 0.05)
    ]);
    this.createMesh(
      new C_ENGINE.TubeGeometry(trunkCurve, 12, 0.22, 8, false),
      this.matDarkTimber,
      tg,
      { tone: 0.85 }
    );

    const canopyOffsets = [
      [0, 4.1, 0, 1.45, 0.95, 1.35],
      [-1.1, 3.55, 0.4, 1.15, 0.78, 1.1],
      [1.05, 3.65, -0.35, 1.2, 0.82, 1.15],
      [0.25, 4.65, -0.5, 1.1, 0.75, 1.05],
      [-0.45, 3.2, -0.8, 0.95, 0.68, 0.95]
    ];

    canopyOffsets.forEach(([cx, cy, cz, sx, sy, sz], idx) => {
      const geo = new C_ENGINE.SphereGeometry(1, 16, 12);
      const pos = geo.getAttribute('position');
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        const vz = pos.getZ(i);
        const bump = 1 + Math.sin(vx * 5 + vy * 4 + idx) * 0.14;
        pos.setXYZ(i, vx * bump, vy * bump, vz * bump);
      }
      geo.computeVertexNormals();
      const mat = this.canopyMaterials[idx % this.canopyMaterials.length];
      const mesh = this.createMesh(geo, mat, tg, {
        pos: [cx, cy, cz],
        scale: [sx, sy, sz],
        tone: 0.94 + (idx % 3) * 0.04
      });
      this.seasonalCanopies.push(mesh);
    });

    parent.add(tg);
  }

  buildSobaeksanMountainRidges(parent) {
    this.mountainLayers = [];
    const ridgeConfigs = [
      { z: -36, width: 140, baseH: 5.5, amp: 3.4, freq: 0.055, phase: 0.3, color: 0x3b5249 },
      { z: -62, width: 185, baseH: 9.8, amp: 5.2, freq: 0.042, phase: 1.4, color: 0x465f58 },
      { z: -92, width: 230, baseH: 14.5, amp: 7.4, freq: 0.032, phase: 2.7, color: 0x556f6b },
      { z: -126, width: 280, baseH: 19.5, amp: 9.2, freq: 0.025, phase: 4.1, color: 0x678080 },
      { z: -162, width: 330, baseH: 25.0, amp: 11.5, freq: 0.02, phase: 5.3, color: 0x7b9396 },
      { z: -198, width: 380, baseH: 31.0, amp: 13.5, freq: 0.016, phase: 0.9, color: 0x8ea4a9 }
    ];

    ridgeConfigs.forEach((cfg, layerIdx) => {
      const segX = 96;
      const segY = 18;
      const geo = new C_ENGINE.PlaneGeometry(cfg.width, 45, segX, segY);
      const pos = geo.getAttribute('position');
      const colors = new Float32Array(pos.count * 3);

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const rawY = pos.getY(i);
        const v = (rawY + 22.5) / 45; // 0 at bottom, 1 at ridge crest

        const ridgeCurve =
          cfg.baseH +
          Math.sin(x * cfg.freq + cfg.phase) * cfg.amp +
          Math.cos(x * cfg.freq * 2.1 - cfg.phase * 0.7) * (cfg.amp * 0.42) +
          Math.sin(x * cfg.freq * 4.3 + layerIdx) * (cfg.amp * 0.16);

        const y = -8.5 + v * (ridgeCurve + 8.5);
        const zOffset = (1 - v) * 8.5 + Math.sin(x * 0.08 + v * 3.0) * 2.2;
        pos.setXYZ(i, x, y, zOffset);

        const hShade = 0.72 + v * 0.34;
        colors[i * 3] = hShade;
        colors[i * 3 + 1] = hShade;
        colors[i * 3 + 2] = hShade;
      }
      geo.setAttribute('color', new C_ENGINE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mat = new C_ENGINE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.95,
        metalness: 0.0,
        vertexColors: true
      });
      const mesh = new C_ENGINE.Mesh(geo, mat);
      mesh.position.set(0, 0, cfg.z);
      mesh.receiveShadow = true;
      parent.add(mesh);
      this.mountainLayers.push({ mesh, mat, layerIdx });
    });
  }

  buildSeaOfClouds(parent) {
    this.cloudPlanes = [];
    const cloudGeo = new C_ENGINE.PlaneGeometry(34, 14);
    for (let i = 0; i < 38; i++) {
      const mat = new C_ENGINE.MeshBasicMaterial({
        map: this.cloudTex,
        color: 0xf4f7fa,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      const mesh = new C_ENGINE.Mesh(cloudGeo, mat);
      const x = (Math.random() - 0.5) * 145;
      const y = -1.2 + Math.random() * 6.8;
      const z = -24 - Math.random() * 125;
      mesh.position.set(x, y, z);
      mesh.scale.set(0.8 + Math.random() * 1.1, 0.65 + Math.random() * 0.6, 1);
      parent.add(mesh);
      this.cloudPlanes.push({
        mesh,
        mat,
        baseX: x,
        baseY: y,
        speed: 0.45 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: 0.28 + Math.random() * 0.28
      });
    }
  }

  /* ------------------------------------------------------------------------
     SPACE 2: 순천 선암사 승선교와 강선루 (Seungseongyo Rainbow Bridge & Valley)
     ------------------------------------------------------------------------ */
  buildSeonamsaWorld() {
    const g = this.seonamsaGroup;

    // 1. Valley Stream Water Surface (계곡 수면 + 실시간 노멀 물결 & 프레넬 반사 셰이더)
    const waterNormalData = new Uint8Array(128 * 128 * 4);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const idx = (y * 128 + x) * 4;
        const u = (x / 128) * Math.PI * 2;
        const v = (y / 128) * Math.PI * 2;
        const nx = Math.cos(u * 3 + v * 2) * 0.04 + Math.cos(u * 7 - v * 4) * 0.015;
        const ny = Math.sin(u * 3 + v * 2) * 0.03 - Math.cos(u * 7 - v * 4) * 0.01;
        const n = new C_ENGINE.Vector3(-nx, -ny, 1).normalize();
        waterNormalData[idx] = (n.x * 0.5 + 0.5) * 255;
        waterNormalData[idx + 1] = (n.y * 0.5 + 0.5) * 255;
        waterNormalData[idx + 2] = (n.z * 0.5 + 0.5) * 255;
        waterNormalData[idx + 3] = 255;
      }
    }
    this.waterNormalTex = new C_ENGINE.DataTexture(
      waterNormalData,
      128,
      128,
      C_ENGINE.RGBAFormat
    );
    this.waterNormalTex.wrapS = C_ENGINE.RepeatWrapping;
    this.waterNormalTex.wrapT = C_ENGINE.RepeatWrapping;
    this.waterNormalTex.repeat.set(10, 10);
    this.waterNormalTex.minFilter = C_ENGINE.LinearFilter;
    this.waterNormalTex.magFilter = C_ENGINE.LinearFilter;
    this.waterNormalTex.needsUpdate = true;

    this.valleyWaterMat = new C_ENGINE.MeshStandardMaterial({
      color: 0x264446,
      roughness: 0.18,
      metalness: 0.08,
      normalMap: this.waterNormalTex,
      normalScale: new C_ENGINE.Vector2(0.32, 0.32)
    });

    if (C_ENGINE.enhanceWaterMaterial) {
      const reflectionLanternSpots = [
        { x: -4.2, height: 2.2, z: 0.5 },
        { x: -2.8, height: 2.6, z: -2.0 },
        { x: 0.0, height: 3.8, z: -3.5 },
        { x: 2.8, height: 2.6, z: -2.0 },
        { x: 4.2, height: 2.2, z: 0.5 },
        { x: 3.2, height: 4.5, z: -17.5 }
      ];
      this.waterEnhancer = C_ENGINE.enhanceWaterMaterial(
        this.valleyWaterMat,
        () => this.woodlandPanorama || null,
        reflectionLanternSpots
      );
    }

    const waterGeo = new C_ENGINE.PlaneGeometry(36, 95, 32, 32);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMesh = new C_ENGINE.Mesh(waterGeo, this.valleyWaterMat);
    waterMesh.position.set(0, -0.65, -20);
    waterMesh.receiveShadow = true;
    g.add(waterMesh);

    // 2. Valley Banks, Stone Embankments (석축) & Forest Slopes
    this.seonamsaGroundMat = this.matGround.clone();
    for (const side of [-1, 1]) {
      const bankGeo = new C_ENGINE.PlaneGeometry(75, 110, 36, 36);
      bankGeo.rotateX(-Math.PI / 2);
      const bPos = bankGeo.getAttribute('position');
      for (let i = 0; i < bPos.count; i++) {
        const lx = bPos.getX(i);
        const lz = bPos.getZ(i);
        const distFromStream = Math.max(0, (lx + 37.5) / 75);
        const h =
          -0.45 +
          Math.pow(distFromStream, 1.35) * 14.5 +
          Math.sin(lx * 0.2 + lz * 0.15) * 0.45;
        bPos.setY(i, h);
      }
      bankGeo.computeVertexNormals();
      this.createMesh(bankGeo, this.seonamsaGroundMat, g, {
        pos: [side * 42.5, 0, -20],
        scale: [side, 1, 1],
        castShadow: false,
        receiveShadow: true
      });

      // Natural stone embankment wall (계곡 석축) flanking Seungseongyo
      for (let tier = 0; tier < 4; tier++) {
        for (let bz = -18; bz <= 8; bz += 1.55) {
          this.createMesh(
            new C_ENGINE.RoundedBoxGeometry(1.35, 0.55, 1.48, 2, 0.08),
            tier === 0 ? this.matMoss : this.matStone,
            g,
            {
              pos: [
                side * (5.3 + tier * 0.32 + Math.sin(bz * 0.6) * 0.15),
                -0.38 + tier * 0.48,
                bz
              ],
              tone: 0.88 + ((Math.abs(bz) + tier) % 4) * 0.05
            }
          );
        }
      }
    }

    // 3. Seungseongyo Semicircular Rainbow Stone Arch Bridge (승선교 28개 홍예석 + 용두석 + 수면 원형 반영)
    const bridgeGroup = new C_ENGINE.Group();
    bridgeGroup.position.set(0, -0.65, -3.5);

    const archRadius = 4.65;
    const bridgeDepth = 3.45;
    const voussoirCount = 28;

    for (let i = 0; i < voussoirCount; i++) {
      const angle = ((i + 0.5) / voussoirCount) * Math.PI;
      const vx = Math.cos(angle) * archRadius;
      const vy = Math.sin(angle) * archRadius;
      const rotZ = angle - Math.PI / 2;
      const tone = 0.92 + (i % 4) * 0.035;

      // Upper real arch voussoir stone (홍예석)
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.56, 0.64, bridgeDepth, 2, 0.035),
        this.matStone,
        bridgeGroup,
        { pos: [vx, vy, 0], rot: [0, 0, rotZ], tone }
      );

      // Spandrel stone fill above the arch ring (홍예 옆면 석축 채움)
      const deckY = archRadius + 0.58;
      const fillH = Math.max(0.18, deckY - (vy + 0.28));
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.58, fillH, bridgeDepth - 0.12, 2, 0.03),
        i % 5 === 0 ? this.matMoss : this.matStone,
        bridgeGroup,
        { pos: [vx, vy + 0.28 + fillH * 0.5, 0], tone: tone * 0.94 }
      );

      // Underwater inverted arch reflection (수면에 비친 반원형 무지개 다리 원형 반영)
      const reflMat = this.matStone.clone();
      reflMat.transparent = true;
      reflMat.opacity = 0.34;
      const reflMesh = new C_ENGINE.Mesh(
        new C_ENGINE.RoundedBoxGeometry(0.54, 0.58, bridgeDepth * 0.92, 2, 0.03),
        reflMat
      );
      reflMesh.position.set(vx, -vy * 0.88 - 0.08, 0);
      reflMesh.rotation.z = -rotZ;
      bridgeGroup.add(reflMesh);
    }

    // Protruding Dragon-Head Keystone (승선교 정중앙 용두석 龍頭石)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(0.28, 0.52, 0.68, 2, 0.04),
      this.matStone,
      bridgeGroup,
      { pos: [0, archRadius - 0.38, bridgeDepth * 0.5 + 0.16], tone: 0.86 }
    );

    // Bridge Deck Flagstones & Low Parapet Stones (승선교 교면과 낮은 돌난간)
    const deckSteps = 22;
    for (let i = 0; i < deckSteps; i++) {
      const t = i / (deckSteps - 1) - 0.5;
      const dx = t * 11.4;
      const dy = archRadius + 0.62 - Math.pow(t * 2, 2) * 0.52;
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.56, 0.18, bridgeDepth + 0.16, 2, 0.03),
        this.matStone,
        bridgeGroup,
        { pos: [dx, dy, 0], tone: 0.94 + (i % 3) * 0.03 }
      );
      for (const sideZ of [-bridgeDepth * 0.5 + 0.18, bridgeDepth * 0.5 - 0.18]) {
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(0.54, 0.28, 0.32, 2, 0.035),
          i % 4 === 0 ? this.matMoss : this.matStone,
          bridgeGroup,
          { pos: [dx, dy + 0.2, sideZ], tone: 0.9 }
        );
      }
    }

    g.add(bridgeGroup);

    // 4. Valley Stream Boulders & Stepping Rocks (계곡 바위와 이끼 암석)
    const valleyRocks = [
      [-3.8, -0.55, 2.4, 1.45, 0.62, 1.15],
      [-2.4, -0.6, 3.6, 0.95, 0.42, 0.82],
      [3.9, -0.52, 1.8, 1.55, 0.68, 1.25],
      [2.6, -0.58, 3.9, 1.05, 0.45, 0.88],
      [-4.2, -0.5, -9.5, 1.65, 0.75, 1.3],
      [4.4, -0.52, -10.8, 1.5, 0.7, 1.2],
      [-1.8, -0.62, -13.2, 0.95, 0.38, 0.85],
      [1.9, -0.6, -7.8, 0.88, 0.36, 0.78]
    ];
    valleyRocks.forEach(([rx, ry, rz, sx, sy, sz], idx) => {
      this.createMesh(
        new C_ENGINE.SphereGeometry(1, 18, 14),
        idx % 2 === 0 ? this.matRock : this.matMoss,
        g,
        { pos: [rx, ry, rz], scale: [sx, sy, sz], rot: [0, idx * 1.3, 0], tone: 0.92 }
      );
    });

    // Foreground Stone Wall Path on Right & Left Banks (돌담길)
    for (const side of [-1, 1]) {
      for (let z = -1.5; z <= 6.5; z += 0.95) {
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(0.65, 0.78, 0.9, 2, 0.06),
          this.matStone,
          g,
          {
            pos: [side * 5.65, 1.45, z],
            tone: 0.9 + (Math.abs(Math.round(z)) % 3) * 0.04
          }
        );
      }
    }

    // 5. Gangseollu 2-Story Valley Pavilion (선암사 강선루 누각) beyond Seungseongyo
    this.buildPavilion3D(g, {
      x: 2.8,
      y: -0.25,
      z: -18.5,
      scale: 0.95,
      yaw: -0.22,
      hanja: '降 仙 樓',
      hangul: '선암사 강선루'
    });

    // 6. Jogyesan Scanned 3D Pine Trees & Seasonal Maple / Cherry Forest
    this.seonamsaPineAnchors = [
      { x: -9.5, y: 1.2, z: -6.5, height: 9.4, yaw: 0.6 },
      { x: 9.8, y: 1.25, z: -5.8, height: 9.2, yaw: -0.8 },
      { x: -11.5, y: 1.6, z: -15.5, height: 10.6, yaw: 1.9 },
      { x: 11.2, y: 1.5, z: -16.8, height: 10.4, yaw: -1.5 },
      { x: -6.2, y: 0.9, z: -22.0, height: 9.8, yaw: 0.3 }
    ];

    this.buildSeasonalTree(g, -7.2, 0.95, -1.2, 1.15);
    this.buildSeasonalTree(g, 7.4, 0.95, -0.8, 1.18);
    this.buildSeasonalTree(g, -6.8, 1.05, -9.8, 1.25);
    this.buildSeasonalTree(g, 7.6, 1.05, -11.2, 1.2);
    this.buildSeasonalTree(g, -4.5, 0.85, -17.2, 1.1);

    // Distant Jogyesan mountain ridges behind Gangseollu
    const jogyeRidgeGeo = new C_ENGINE.PlaneGeometry(180, 38, 64, 14);
    const jPos = jogyeRidgeGeo.getAttribute('position');
    for (let i = 0; i < jPos.count; i++) {
      const x = jPos.getX(i);
      const v = (jPos.getY(i) + 19) / 38;
      const crest = 14 + Math.sin(x * 0.045 + 0.8) * 5.8 + Math.cos(x * 0.09) * 2.4;
      jPos.setXYZ(i, x, -4 + v * (crest + 4), (1 - v) * 6);
    }
    jogyeRidgeGeo.computeVertexNormals();
    this.paintVertexTone(jogyeRidgeGeo, 0.9, 0.04);
    const jogyeMat = new C_ENGINE.MeshStandardMaterial({
      color: 0x455e55,
      roughness: 0.95,
      vertexColors: true
    });
    const jogyeMesh = new C_ENGINE.Mesh(jogyeRidgeGeo, jogyeMat);
    jogyeMesh.position.set(0, 0, -58);
    g.add(jogyeMesh);
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE 3D BRONZE WIND-BELL, FOLIAGE & WISH LANTERNS
     ------------------------------------------------------------------------ */
  initInteractiveWindBell() {
    this.windBellPivot = new C_ENGINE.Group();
    this.windBellPivot.position.set(3.85, 5.15, 4.35);

    const chainGeo = new C_ENGINE.CylinderGeometry(0.014, 0.014, 0.52, 8);
    const chainMesh = new C_ENGINE.Mesh(chainGeo, this.matBronze);
    chainMesh.position.y = -0.26;
    this.windBellPivot.add(chainMesh);

    const bellPts = [
      new C_ENGINE.Vector2(0.01, 0),
      new C_ENGINE.Vector2(0.2, -0.05),
      new C_ENGINE.Vector2(0.26, -0.26),
      new C_ENGINE.Vector2(0.33, -0.54),
      new C_ENGINE.Vector2(0.37, -0.62),
      new C_ENGINE.Vector2(0.3, -0.62)
    ];
    const bellGeo = new C_ENGINE.LatheGeometry(bellPts, 28);
    const bellMesh = new C_ENGINE.Mesh(bellGeo, this.matBronze);
    bellMesh.position.y = -0.48;
    bellMesh.castShadow = true;
    bellMesh.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windBellPivot.add(bellMesh);
    this.interactiveTargets.push(bellMesh);

    const bellHitbox = new C_ENGINE.Mesh(
      new C_ENGINE.SphereGeometry(0.85, 8, 8),
      new C_ENGINE.MeshBasicMaterial({ visible: false })
    );
    bellHitbox.position.y = -0.82;
    bellHitbox.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windBellPivot.add(bellHitbox);
    this.interactiveTargets.push(bellHitbox);

    this.windFishPivot = new C_ENGINE.Group();
    this.windFishPivot.position.y = -1.12;

    const lowerCord = new C_ENGINE.Mesh(
      new C_ENGINE.CylinderGeometry(0.01, 0.01, 0.5, 6),
      this.matBronze
    );
    lowerCord.position.y = 0.18;
    this.windFishPivot.add(lowerCord);

    const fishShape = new C_ENGINE.Shape();
    fishShape.moveTo(0, 0.22);
    fishShape.quadraticCurveTo(0.26, 0.05, 0.15, -0.26);
    fishShape.lineTo(0.3, -0.45);
    fishShape.lineTo(0.04, -0.34);
    fishShape.lineTo(-0.04, -0.34);
    fishShape.lineTo(-0.3, -0.45);
    fishShape.lineTo(-0.15, -0.26);
    fishShape.quadraticCurveTo(-0.26, 0.05, 0, 0.22);

    const fishGeo = new C_ENGINE.ExtrudeGeometry(fishShape, {
      depth: 0.028,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008
    });
    const fishMat = new C_ENGINE.MeshStandardMaterial({
      color: 0xd9a760,
      roughness: 0.28,
      metalness: 0.85
    });
    const fishMesh = new C_ENGINE.Mesh(fishGeo, fishMat);
    fishMesh.position.set(0, -0.1, -0.014);
    fishMesh.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windFishPivot.add(fishMesh);
    this.interactiveTargets.push(fishMesh);

    this.windBellPivot.add(this.windFishPivot);
    this.scene.add(this.windBellPivot);
  }

  initFallingFoliage3D() {
    this.leafCount = 95;
    this.leafDummy = new C_ENGINE.Object3D();
    this.leafData = [];

    const leafGeo = new C_ENGINE.PlaneGeometry(0.16, 0.12);
    this.leafInstancedMat = new C_ENGINE.MeshBasicMaterial({
      color: 0xe86a38,
      side: C_ENGINE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });

    this.leafInstancedMesh = new C_ENGINE.InstancedMesh(
      leafGeo,
      this.leafInstancedMat,
      this.leafCount
    );
    this.leafInstancedMesh.raycast = () => {};

    for (let i = 0; i < this.leafCount; i++) {
      this.leafData.push({
        x: (Math.random() - 0.5) * 24,
        y: Math.random() * 8.5,
        z: 6 - Math.random() * 24,
        vx: 0.32 + Math.random() * 0.58,
        vy: -0.38 - Math.random() * 0.45,
        vz: (Math.random() - 0.5) * 0.3,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        spin: 0.8 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      });
    }
    this.fxRoot.add(this.leafInstancedMesh);
  }

  rebuild3DLanterns(allWishes, activeWishId) {
    while (this.lanternsRoot.children.length > 0) {
      this.lanternsRoot.remove(this.lanternsRoot.children[0]);
    }
    this.lanternMeshes = [];
    this.interactiveTargets = this.interactiveTargets.filter(
      (obj) => obj.userData?.type === 'windbell'
    );

    const spaceWishes = allWishes.filter((w) => w.space === this.spaceMode);
    const total = spaceWishes.length;
    if (total === 0) return;

    const lanternPts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const y = (t - 0.5) * 0.58;
      const r = 0.085 + Math.sin(t * Math.PI) * 0.2;
      lanternPts.push(new C_ENGINE.Vector2(r, y));
    }
    const bodyGeo = new C_ENGINE.LatheGeometry(lanternPts, 24);
    const capGeo = new C_ENGINE.CylinderGeometry(0.13, 0.13, 0.042, 16);
    const tagGeo = new C_ENGINE.PlaneGeometry(0.11, 0.36);
    const haloGeo = new C_ENGINE.PlaneGeometry(1, 1);
    const hitSphereGeo = new C_ENGINE.SphereGeometry(0.54, 8, 8);
    const hitSphereMat = new C_ENGINE.MeshBasicMaterial({ visible: false });
    const darkCapMat = new C_ENGINE.MeshStandardMaterial({ color: 0x3b281e, roughness: 0.8 });

    spaceWishes.forEach((wish, idx) => {
      const pivot = new C_ENGINE.Group();
      const t = total <= 1 ? 0.5 : idx / (total - 1);

      let x, y, z;
      if (this.spaceMode === 'buseoksa') {
        // Hanging gracefully under Muryangsujeon eaves between the entasis columns
        x = -5.2 + t * 10.4;
        const normX = Math.abs(x) / 13.6;
        y = 5.05 + Math.pow(normX, 2.3) * 0.5;
        z = 4.35 + (idx % 2) * 0.22;
      } else {
        // Hanging along the Seungseongyo stone wall & valley arch approach
        const side = idx % 2 === 0 ? -1 : 1;
        const pairIdx = Math.floor(idx / 2);
        const pairCount = Math.max(1, Math.ceil(total / 2));
        const pt = pairCount <= 1 ? 0.5 : pairIdx / (pairCount - 1);
        x = side * (3.65 - pt * 1.15);
        z = 2.8 - pt * 5.2;
        y = 3.55 + Math.sin(pt * Math.PI) * 0.65;

        // Add subtle lantern post on the valley bank
        const postH = 2.4;
        const post = new C_ENGINE.Mesh(
          new C_ENGINE.CylinderGeometry(0.035, 0.045, postH, 8),
          darkCapMat
        );
        post.position.set(side * 0.28, -postH * 0.5, 0);
        pivot.add(post);
      }

      pivot.position.set(x, y, z);

      const cordLen = 0.42 + (idx % 3) * 0.12;
      const cordMesh = new C_ENGINE.Mesh(
        new C_ENGINE.CylinderGeometry(0.009, 0.009, cordLen, 6),
        this.matBronze
      );
      cordMesh.position.y = -cordLen * 0.5;
      pivot.add(cordMesh);

      const lanternCenterY = -cordLen - 0.29;
      const colorKey = wish.color || 'amber';
      const pal = LANTERN_COLORS[colorKey] || LANTERN_COLORS.amber;
      const isSelected = wish.id === activeWishId;

      const bodyMat = new C_ENGINE.MeshStandardMaterial({
        map: this.lanternTextures[colorKey] || this.lanternTextures.amber,
        emissive: new C_ENGINE.Color(pal.hex),
        emissiveMap: this.lanternTextures[colorKey] || this.lanternTextures.amber,
        emissiveIntensity: isSelected ? 1.7 : 1.1,
        roughness: 0.4
      });

      const lanternData = {
        type: 'lantern',
        wishId: wish.id,
        wish,
        worldPos: new C_ENGINE.Vector3(x, y + lanternCenterY, z)
      };

      const bodyMesh = new C_ENGINE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = lanternCenterY;
      bodyMesh.castShadow = true;
      bodyMesh.userData = lanternData;
      pivot.add(bodyMesh);
      this.interactiveTargets.push(bodyMesh);

      const hitMesh = new C_ENGINE.Mesh(hitSphereGeo, hitSphereMat);
      hitMesh.position.y = lanternCenterY - 0.1;
      hitMesh.userData = lanternData;
      pivot.add(hitMesh);
      this.interactiveTargets.push(hitMesh);

      const topCap = new C_ENGINE.Mesh(capGeo, darkCapMat);
      topCap.position.y = lanternCenterY + 0.29;
      pivot.add(topCap);

      const botCap = new C_ENGINE.Mesh(capGeo, darkCapMat);
      botCap.position.y = lanternCenterY - 0.29;
      pivot.add(botCap);

      const haloMat = new C_ENGINE.MeshBasicMaterial({
        map: this.glowTex,
        color: pal.hex,
        side: C_ENGINE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.65,
        blending: C_ENGINE.AdditiveBlending,
        depthWrite: false
      });
      const halo = new C_ENGINE.Mesh(haloGeo, haloMat);
      const haloScale = isSelected ? 2.25 : 1.55;
      halo.scale.set(haloScale, haloScale, 1);
      halo.position.y = lanternCenterY;
      pivot.add(halo);

      const tagMat = new C_ENGINE.MeshBasicMaterial({
        color: 0xf5efe2,
        side: C_ENGINE.DoubleSide
      });
      const tagMesh = new C_ENGINE.Mesh(tagGeo, tagMat);
      tagMesh.position.y = lanternCenterY - 0.52;
      tagMesh.userData = lanternData;
      pivot.add(tagMesh);
      this.interactiveTargets.push(tagMesh);

      this.lanternsRoot.add(pivot);
      this.lanternMeshes.push({
        pivot,
        bodyMesh,
        tagMesh,
        halo,
        wishId: wish.id,
        phase: idx * 1.15,
        speed: 1.1 + (idx % 3) * 0.25
      });
    });
  }

  exciteWindBell() {
    this.bellExcitation = 1.0;

    const ringGeo = new C_ENGINE.PlaneGeometry(0.55, 0.55);
    const ringMat = new C_ENGINE.MeshBasicMaterial({
      map: this.glowTex,
      color: 0xfbbf24,
      side: C_ENGINE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: C_ENGINE.AdditiveBlending,
      depthWrite: false
    });
    const ringMesh = new C_ENGINE.Mesh(ringGeo, ringMat);
    ringMesh.position.copy(this.windBellPivot.position).add(new C_ENGINE.Vector3(0, -0.65, 0));
    this.fxRoot.add(ringMesh);
    this.sonicRings.push({ mesh: ringMesh, mat: ringMat, scale: 1, alpha: 0.9 });
  }

  spawnHapjangParticles3D(wishId) {
    const targetLantern = this.lanternMeshes.find((l) => l.wishId === wishId);
    const origin = targetLantern
      ? targetLantern.bodyMesh.userData.worldPos.clone()
      : new C_ENGINE.Vector3(0, 3.2, 3.5);

    const particleGeo = new C_ENGINE.PlaneGeometry(1, 1);
    for (let i = 0; i < 28; i++) {
      const spriteMat = new C_ENGINE.MeshBasicMaterial({
        map: this.glowTex,
        color: i % 2 === 0 ? 0xfef08a : 0xf59e0b,
        side: C_ENGINE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        blending: C_ENGINE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new C_ENGINE.Mesh(particleGeo, spriteMat);
      const s = 0.24 + Math.random() * 0.3;
      sprite.scale.set(s, s, 1);
      sprite.position.set(
        origin.x + (Math.random() - 0.5) * 0.75,
        origin.y + (Math.random() - 0.5) * 0.42,
        origin.z + (Math.random() - 0.5) * 0.75
      );
      sprite.lookAt(this.camera.position);
      this.fxRoot.add(sprite);

      this.hapjangParticles.push({
        sprite,
        mat: spriteMat,
        vx: (Math.random() - 0.5) * 0.55,
        vy: 0.7 + Math.random() * 1.1,
        vz: (Math.random() - 0.5) * 0.55,
        alpha: 0.98
      });
    }
  }

  /* ------------------------------------------------------------------------
     SPACE, TIME, FOLIAGE & CAMERA PRESET CONTROLLERS
     ------------------------------------------------------------------------ */
  setSpace(space, immediate = false) {
    this.spaceMode = space;
    const isBuseoksa = space === 'buseoksa';

    this.buseoksaGroup.visible = isBuseoksa;
    this.seonamsaGroup.visible = !isBuseoksa;

    // Position the 3D wind-bell under the foreground eave/branch of the active space
    if (this.windBellPivot) {
      if (isBuseoksa) {
        this.windBellPivot.position.set(3.85, 5.15, 4.35);
      } else {
        this.windBellPivot.position.set(3.75, 4.65, 3.85);
      }
    }

    this.setCameraPreset(this.camPreset, immediate);
  }

  setTimeMode(timeKey) {
    this.timeMode = timeKey;

    if (timeKey === 'dawn') {
      // 새벽 운해 (Crisp morning mist & sea of clouds)
      this.hemiLight.color.set(0xeaf4f0);
      this.hemiLight.groundColor.set(0x6b6859);
      this.hemiLight.intensity = 0.94;
      this.ambientLight.color.set(0xfff5e6);
      this.ambientLight.intensity = 0.34;
      this.sunLight.color.set(0xfff0d8);
      this.sunLight.intensity = 2.45;
      this.sunLight.position.set(-28, 34, -26);
      this.eaveFillLight.intensity = 1.15;
      if (this.stoneLanternLight) this.stoneLanternLight.intensity = 1.6;
      this.scene.fog.color.set(0xd7e4df);
      this.scene.fog.near = 36;
      this.scene.fog.far = 205;
      this.scene.backgroundIntensity = 0.88;
      this.renderer.toneMappingExposure = 1.04;
      this.starMat.opacity = 0;
      this.moonGroup.visible = false;
      if (this.waterEnhancer) this.waterEnhancer.setNight(0.12);

      const dawnColors = [0x3b5249, 0x465f58, 0x556f6b, 0x678080, 0x7b9396, 0x8ea4a9];
      this.mountainLayers?.forEach((l, idx) => l.mat.color.set(dawnColors[idx]));
      this.cloudPlanes.forEach((c) => {
        c.mat.color.set(0xf4f8fa);
        c.mat.opacity = c.baseAlpha;
      });
    } else if (timeKey === 'sunset') {
      // 석양 노을 (Warm crimson-gold twilight)
      this.hemiLight.color.set(0xffd2ad);
      this.hemiLight.groundColor.set(0x6e5344);
      this.hemiLight.intensity = 0.82;
      this.ambientLight.color.set(0xffcfa8);
      this.ambientLight.intensity = 0.3;
      this.sunLight.color.set(0xff9248);
      this.sunLight.intensity = 2.65;
      this.sunLight.position.set(-38, 18, -32);
      this.eaveFillLight.intensity = 1.85;
      if (this.stoneLanternLight) this.stoneLanternLight.intensity = 2.8;
      this.scene.fog.color.set(0xd8a388);
      this.scene.fog.near = 38;
      this.scene.fog.far = 210;
      this.scene.backgroundIntensity = 0.58;
      this.renderer.toneMappingExposure = 1.02;
      this.starMat.opacity = 0.22;
      this.moonGroup.visible = false;
      if (this.waterEnhancer) this.waterEnhancer.setNight(0.48);

      const sunsetColors = [0x3d3538, 0x4f3e45, 0x634952, 0x7a5760, 0x94696e, 0xad7d7c];
      this.mountainLayers?.forEach((l, idx) => l.mat.color.set(sunsetColors[idx]));
      this.cloudPlanes.forEach((c) => {
        c.mat.color.set(0xffd8be);
        c.mat.opacity = c.baseAlpha * 0.78;
      });
    } else if (timeKey === 'night') {
      // 별 헤는 밤 (Starry mountain temple night & warm lanterns)
      this.hemiLight.color.set(0x4c6282);
      this.hemiLight.groundColor.set(0x232830);
      this.hemiLight.intensity = 0.38;
      this.ambientLight.color.set(0x6b82a8);
      this.ambientLight.intensity = 0.22;
      this.sunLight.color.set(0x9ab4dc);
      this.sunLight.intensity = 0.72;
      this.sunLight.position.set(24, 38, -30);
      this.eaveFillLight.intensity = 2.45;
      if (this.stoneLanternLight) this.stoneLanternLight.intensity = 3.6;
      this.scene.fog.color.set(0x111824);
      this.scene.fog.near = 34;
      this.scene.fog.far = 195;
      this.scene.backgroundIntensity = 0.08;
      this.renderer.toneMappingExposure = 0.96;
      this.starMat.opacity = 0.92;
      this.moonGroup.visible = true;
      if (this.waterEnhancer) this.waterEnhancer.setNight(0.95);

      const nightColors = [0x141d26, 0x18232e, 0x1c2938, 0x223042, 0x28384c, 0x2e4057];
      this.mountainLayers?.forEach((l, idx) => l.mat.color.set(nightColors[idx]));
      this.cloudPlanes.forEach((c) => {
        c.mat.color.set(0x475970);
        c.mat.opacity = c.baseAlpha * 0.42;
      });
    }

    this.horizonUpdaters.forEach((fn) => fn());
  }

  setFoliageMode(foliageKey) {
    this.foliageMode = foliageKey;
    const isAutumn = foliageKey === 'autumn';

    // Falling petals/leaves color
    this.leafInstancedMat.color.set(isAutumn ? 0xe86434 : 0xfbcfe8);

    // 3D Tree canopies color palette (Autumn Maple vs Spring Cherry Blossom)
    const palette = isAutumn
      ? [0xc83e2b, 0xe06d2b, 0xd99b26]
      : [0xf9a8d4, 0xfbcfe8, 0xfdf2f8];
    this.canopyMaterials.forEach((mat, idx) => {
      mat.color.set(palette[idx % palette.length]);
    });
  }

  setCameraPreset(preset, immediate = false) {
    this.camPreset = preset;
    this.targetYawOffset = 0;
    this.targetPitchOffset = 0;
    this.targetZoomOffset = 0;

    const aspect = this.width / Math.max(1, this.height);
    const portraitPullback = aspect < 0.85 ? (0.85 - aspect) * 4.8 : 0;

    if (this.spaceMode === 'buseoksa') {
      if (preset === 'default') {
        // 기본 차경: 무량수전 배흘림기둥과 처마 밑에서 석등·안양루·소백산맥을 바라보는 구도
        this.targetCamPos.set(0, 2.38, 8.8 + portraitPullback * 0.65);
        this.targetCamLook.set(0, 2.15, -18.0);
      } else if (preset === 'closeup') {
        // 처마·풍경 가까이: 서까래 단청, 소원 연등, 청동 풍경종 클로즈업 차경
        this.targetCamPos.set(1.4, 3.25, 7.4 + portraitPullback * 0.45);
        this.targetCamLook.set(2.4, 4.15, -6.0);
      } else if (preset === 'wide') {
        // 광각 파노라마: 마당 앞으로 나서서 안양루와 소백산맥 6겹 능선·운해 조망
        this.targetCamPos.set(0, 2.85, 3.2 + portraitPullback * 0.5);
        this.targetCamLook.set(0, 2.45, -35.0);
      }
    } else {
      if (preset === 'default') {
        // 기본 차경: 계곡 물가에서 반원형 승선교 무지개 아치와 강선루를 바라보는 구도
        this.targetCamPos.set(0, 1.85, 8.2 + portraitPullback * 0.7);
        this.targetCamLook.set(0.4, 1.65, -12.0);
      } else if (preset === 'closeup') {
        // 다리·연등 가까이: 승선교 홍예석과 용두석, 수면 원형 반영 클로즈업
        this.targetCamPos.set(-1.6, 1.45, 4.4 + portraitPullback * 0.45);
        this.targetCamLook.set(0.8, 1.55, -8.5);
      } else if (preset === 'wide') {
        // 광각 파노라마: 승선교와 강선루, 조계산 단풍/벚꽃 계곡 전체 조망
        this.targetCamPos.set(0, 3.45, 11.2 + portraitPullback * 0.75);
        this.targetCamLook.set(0.6, 2.1, -16.0);
      }
    }

    if (immediate) {
      this.camPos.copy(this.targetCamPos);
      this.camLook.copy(this.targetCamLook);
      this.yawOffset = 0;
      this.pitchOffset = 0;
      this.zoomOffset = 0;
    }
  }

  focusOnLantern(wishId) {
    const item = this.lanternMeshes.find((l) => l.wishId === wishId);
    if (!item) return;
    const wp = item.bodyMesh.userData.worldPos;
    const aspect = this.width / Math.max(1, this.height);
    const mobileOffset = aspect < 0.85 ? 1.15 : 0;

    this.targetYawOffset = 0;
    this.targetPitchOffset = 0;
    this.targetZoomOffset = 0;

    if (this.spaceMode === 'buseoksa') {
      this.targetCamPos.set(wp.x * 0.82, wp.y - 0.35, wp.z + 3.4 + mobileOffset);
      this.targetCamLook.set(wp.x, wp.y - 0.05, wp.z - 2.5);
    } else {
      this.targetCamPos.set(wp.x * 0.65, wp.y - 0.25, wp.z + 3.8 + mobileOffset);
      this.targetCamLook.set(wp.x, wp.y - 0.05, wp.z - 2.0);
    }
  }

  /* ------------------------------------------------------------------------
     VIEWPORT INTERACTION (ORBIT DRAG, PINCH ZOOM, RAYCAST HOVER & CLICK)
     ------------------------------------------------------------------------ */
  bindViewportEvents() {
    const dom = this.renderer.domElement;
    dom.style.touchAction = 'none';

    dom.addEventListener('pointerdown', (e) => {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.activePointers.size === 2) {
        const pts = [...this.activePointers.values()];
        this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        this.pinchStartZoom = this.targetZoomOffset;
        this.isPointerDown = false;
        return;
      }
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      this.isPointerDown = true;
      this.pointerMoved = false;
      this.pointerStart.x = e.clientX;
      this.pointerStart.y = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (this.activePointers.has(e.pointerId)) {
        this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      if (this.activePointers.size === 2 && this.pinchStartDist) {
        const pts = [...this.activePointers.values()];
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const delta = (this.pinchStartDist - dist) * 0.025;
        this.targetZoomOffset = Math.max(-3.2, Math.min(4.8, this.pinchStartZoom + delta));
        return;
      }

      if (this.isPointerDown) {
        const dx = e.clientX - this.pointerStart.x;
        const dy = e.clientY - this.pointerStart.y;
        if (Math.hypot(dx, dy) > 4) {
          this.pointerMoved = true;
        }
        this.pointerStart.x = e.clientX;
        this.pointerStart.y = e.clientY;

        this.targetYawOffset = Math.max(-0.68, Math.min(0.68, this.targetYawOffset - dx * 0.0028));
        this.targetPitchOffset = Math.max(
          -0.32,
          Math.min(0.36, this.targetPitchOffset - dy * 0.0022)
        );
        return;
      }

      if (e.pointerType === 'mouse') {
        this.checkHoverIntersection(e.clientX, e.clientY);
      }
    });

    window.addEventListener('pointerup', (e) => {
      this.activePointers.delete(e.pointerId);
      if (this.activePointers.size < 2) {
        this.pinchStartDist = null;
      }
      if (this.isPointerDown) {
        this.isPointerDown = false;
        if (!this.pointerMoved) {
          this.handleSceneClick(e.clientX, e.clientY);
        }
      }
    });

    window.addEventListener('pointercancel', (e) => {
      this.activePointers.delete(e.pointerId);
      this.pinchStartDist = null;
      this.isPointerDown = false;
    });

    dom.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.targetZoomOffset = Math.max(
          -3.2,
          Math.min(4.8, this.targetZoomOffset + e.deltaY * 0.0035)
        );
      },
      { passive: false }
    );
  }

  checkHoverIntersection(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    this.mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);

    const hits = this.raycaster.intersectObjects(this.interactiveTargets, false);
    const tooltip = document.getElementById('lantern-3d-tooltip');

    if (hits.length > 0 && hits[0].distance < 42) {
      const data = hits[0].object.userData;
      this.renderer.domElement.style.cursor = 'pointer';
      tooltip.style.left = `${clientX}px`;
      tooltip.style.top = `${clientY}px`;
      if (data.type === 'windbell') {
        tooltip.textContent = data.label;
      } else if (data.wish) {
        const snippet =
          data.wish.text.length > 18 ? `${data.wish.text.slice(0, 18)}…` : data.wish.text;
        tooltip.textContent = `🏮 “${snippet}” · 🙏 ${data.wish.hapjang}`;
      }
      tooltip.classList.add('visible');
      return;
    }

    this.renderer.domElement.style.cursor = 'grab';
    if (tooltip) tooltip.classList.remove('visible');
  }

  handleSceneClick(clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    this.mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);

    const hits = this.raycaster.intersectObjects(this.interactiveTargets, false);
    if (hits.length > 0 && hits[0].distance < 42) {
      const data = hits[0].object.userData;
      if (data.type === 'windbell') {
        triggerBellRingInteraction();
        return;
      }
      if (data.type === 'lantern' && data.wishId) {
        openWishReader(data.wishId);
        return;
      }
    }

    if (activeWishId) {
      closeWishReader();
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.width < 768;

    const aspect = this.width / Math.max(1, this.height);
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.85 ? 58 : 48;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    if (!activeWishId) {
      this.setCameraPreset(this.camPreset);
    }
  }

  /* ------------------------------------------------------------------------
     MAIN ANIMATION LOOP
     ------------------------------------------------------------------------ */
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrameTime) * 0.001);
    this.lastFrameTime = now;
    const elapsed = now * 0.001;
    this.windUniform.value = elapsed;

    // 1. Smooth Camera Interpolation + Orbit & Zoom Offset
    const damp = 1 - Math.exp(-dt * 4.5);
    this.camPos.lerp(this.targetCamPos, damp);
    this.camLook.lerp(this.targetCamLook, damp);
    this.yawOffset += (this.targetYawOffset - this.yawOffset) * damp;
    this.pitchOffset += (this.targetPitchOffset - this.pitchOffset) * damp;
    this.zoomOffset += (this.targetZoomOffset - this.zoomOffset) * damp;

    const viewDir = this.camLook.clone().sub(this.camPos).normalize();
    const finalPos = this.camPos.clone().addScaledVector(viewDir, -this.zoomOffset);
    finalPos.x += Math.sin(elapsed * 0.45) * 0.035;
    finalPos.y += Math.cos(elapsed * 0.38) * 0.025;

    const lookDist = this.camPos.distanceTo(this.camLook);
    const baseYaw = Math.atan2(viewDir.x, viewDir.z) + this.yawOffset;
    const basePitch = Math.asin(Math.max(-0.95, Math.min(0.95, viewDir.y))) + this.pitchOffset;

    const finalLook = new C_ENGINE.Vector3(
      finalPos.x + Math.sin(baseYaw) * Math.cos(basePitch) * lookDist,
      finalPos.y + Math.sin(basePitch) * lookDist,
      finalPos.z + Math.cos(baseYaw) * Math.cos(basePitch) * lookDist
    );

    this.camera.position.copy(finalPos);
    this.camera.lookAt(finalLook);

    // 2. Animate 3D Bronze Wind-Bell & Fish Clapper
    if (this.windBellPivot) {
      this.bellExcitation = Math.max(0, this.bellExcitation - dt * 0.42);
      const swayAmp = 0.042 + this.bellExcitation * 0.22;
      const swaySpeed = 1.8 + this.bellExcitation * 6.5;
      this.windBellPivot.rotation.z = Math.sin(elapsed * swaySpeed) * swayAmp;
      this.windBellPivot.rotation.x = Math.cos(elapsed * 1.3) * 0.03;

      if (this.windFishPivot) {
        this.windFishPivot.rotation.y =
          Math.sin(elapsed * 2.6) * (0.28 + this.bellExcitation * 0.8);
        this.windFishPivot.rotation.z =
          Math.cos(elapsed * 3.4) * (0.08 + this.bellExcitation * 0.25);
      }
    }

    // 3. Animate 3D Hanging Wish Lanterns
    for (const l of this.lanternMeshes) {
      l.pivot.rotation.z = Math.sin(elapsed * l.speed + l.phase) * 0.052;
      l.pivot.rotation.x = Math.cos(elapsed * (l.speed * 0.8) + l.phase) * 0.032;
      l.tagMesh.rotation.z = Math.sin(elapsed * 2.4 + l.phase) * 0.14;
      l.tagMesh.rotation.y = Math.cos(elapsed * 1.7 + l.phase) * 0.25;
      if (l.halo) {
        l.halo.lookAt(this.camera.position);
      }
    }

    // 4. Animate Buseoksa Sea of Clouds (운해)
    if (this.spaceMode === 'buseoksa') {
      for (const c of this.cloudPlanes) {
        c.mesh.position.x = c.baseX + Math.sin(elapsed * 0.08 * c.speed + c.phase) * 14;
        c.mesh.position.y = c.baseY + Math.cos(elapsed * 0.22 + c.phase) * 0.35;
      }
    }

    // 5. Animate Seonamsa Valley Stream Water Ripples
    if (this.spaceMode === 'seonamsa') {
      if (this.waterNormalTex) {
        this.waterNormalTex.offset.set(elapsed * 0.015, elapsed * 0.045);
      }
      if (this.waterEnhancer) {
        this.waterEnhancer.update(elapsed);
      }
    }

    // 6. Animate Falling Seasonal Petals / Maple Leaves
    for (let i = 0; i < this.leafCount; i++) {
      const d = this.leafData[i];
      d.x += (d.vx + Math.sin(elapsed * 1.5 + d.phase) * 0.42) * dt;
      d.y += d.vy * dt;
      d.z += d.vz * dt;
      d.rx += d.spin * dt;
      d.ry += d.spin * 0.8 * dt;

      if (d.y < -0.6 || d.x > 14) {
        d.x = -13 + Math.random() * 26;
        d.y = 6.2 + Math.random() * 3.8;
        d.z = 6 - Math.random() * 22;
      }

      this.leafDummy.position.set(d.x, d.y, d.z);
      this.leafDummy.rotation.set(d.rx, d.ry, 0);
      this.leafDummy.scale.setScalar(1);
      this.leafDummy.updateMatrix();
      this.leafInstancedMesh.setMatrixAt(i, this.leafDummy.matrix);
    }
    this.leafInstancedMesh.instanceMatrix.needsUpdate = true;

    // 7. Animate Sonic Rings & Hapjang Light Particles
    for (let i = this.sonicRings.length - 1; i >= 0; i--) {
      const r = this.sonicRings[i];
      r.scale += dt * 7.5;
      r.alpha -= dt * 0.65;
      r.mesh.scale.setScalar(r.scale);
      r.mesh.lookAt(this.camera.position);
      r.mat.opacity = Math.max(0, r.alpha);
      if (r.alpha <= 0) {
        this.fxRoot.remove(r.mesh);
        this.sonicRings.splice(i, 1);
      }
    }

    for (let i = this.hapjangParticles.length - 1; i >= 0; i--) {
      const p = this.hapjangParticles[i];
      p.sprite.position.x += p.vx * dt;
      p.sprite.position.y += p.vy * dt;
      p.sprite.position.z += p.vz * dt;
      p.sprite.lookAt(this.camera.position);
      p.alpha -= dt * 0.48;
      p.mat.opacity = Math.max(0, p.alpha);
      if (p.alpha <= 0) {
        this.fxRoot.remove(p.sprite);
        this.hapjangParticles.splice(i, 1);
      }
    }

    if (this.moonGroup.visible && this.moonHalo) {
      this.moonHalo.lookAt(this.camera.position);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

/* ==========================================================================
   APPLICATION CONTROLLER & UI BINDINGS
   ========================================================================== */
const audioEngine = new SanSaAudioEngine();
let world3D = null;

let currentSpace = 'buseoksa';
let currentTime = 'dawn';
let currentFoliage = 'autumn';
let wishes = loadWishes();
let likedWishIds = loadLikedWishes();
let activeWishId = null;
let selectedLanternColor = 'amber';
let breathGuideInterval = null;

function loadWishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage fallback:', e);
  }
  return [...INITIAL_WISHES];
}

function saveWishes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  } catch (e) {
    // ignore
  }
}

function loadLikedWishes() {
  try {
    const raw = localStorage.getItem(HAPJANG_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {
    // ignore
  }
  return new Set();
}

function saveLikedWishes() {
  try {
    localStorage.setItem(HAPJANG_STORAGE_KEY, JSON.stringify([...likedWishIds]));
  } catch (e) {
    // ignore
  }
}

function sync3DLanterns() {
  const buseoksaCount = wishes.filter((w) => w.space === 'buseoksa').length;
  const seonamsaCount = wishes.filter((w) => w.space === 'seonamsa').length;

  document.getElementById('count-buseoksa').textContent = buseoksaCount;
  document.getElementById('count-seonamsa').textContent = seonamsaCount;

  if (world3D) {
    world3D.rebuild3DLanterns(wishes, activeWishId);
  }
}

function syncCamButtonsUI(preset) {
  document.querySelectorAll('[data-cam-btn]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.camBtn === preset);
  });
}

function openWishReader(wishId) {
  const wish = wishes.find((w) => w.id === wishId);
  if (!wish) return;

  activeWishId = wishId;
  sync3DLanterns();

  if (world3D) {
    world3D.focusOnLantern(wishId);
  }

  const meta = SPACE_META[wish.space] || SPACE_META.buseoksa;
  document.getElementById('reader-location').textContent = meta.locationBadge;
  document.getElementById('reader-tag').textContent = wish.tag || '소원 기원';
  document.getElementById('reader-text').textContent = wish.text;
  document.getElementById('reader-author').textContent = wish.author || '익명의 순례자';
  document.getElementById('reader-date').textContent = wish.date || '2026.11.03';
  document.getElementById('reader-hapjang-count').textContent = wish.hapjang;

  const hapjangBtn = document.getElementById('hapjang-btn');
  hapjangBtn.classList.toggle('pressed', likedWishIds.has(wish.id));

  document.getElementById('wish-reader-card').classList.add('open');
  audioEngine.strikeWindBell(0.5, 660);
}

function closeWishReader() {
  if (!activeWishId) return;
  activeWishId = null;
  document.getElementById('wish-reader-card').classList.remove('open');
  sync3DLanterns();
  if (world3D) {
    world3D.setCameraPreset(world3D.camPreset);
  }
}

function navigateWish(direction) {
  const spaceWishes = wishes.filter((w) => w.space === currentSpace);
  if (spaceWishes.length === 0) return;
  const idx = spaceWishes.findIndex((w) => w.id === activeWishId);
  const nextIdx = (idx + direction + spaceWishes.length) % spaceWishes.length;
  openWishReader(spaceWishes[nextIdx].id);
}

function handleHapjangClick() {
  if (!activeWishId) return;
  const wish = wishes.find((w) => w.id === activeWishId);
  if (!wish) return;

  wish.hapjang += 1;
  likedWishIds.add(wish.id);
  saveWishes();
  saveLikedWishes();

  document.getElementById('reader-hapjang-count').textContent = wish.hapjang;

  const btn = document.getElementById('hapjang-btn');
  btn.classList.remove('pressed');
  void btn.offsetWidth;
  btn.classList.add('pressed');

  audioEngine.strikeWindBell(0.9, 528);
  if (world3D) {
    world3D.spawnHapjangParticles3D(wish.id);
  }
  showToast('🙏 따뜻한 합장의 마음이 3D 연등 불빛을 타고 하늘로 피어오릅니다.');
}

function openWriteModal() {
  const meta = SPACE_META[currentSpace] || SPACE_META.buseoksa;
  document.getElementById('write-modal-desc').textContent = meta.writeDesc;
  document.getElementById('write-modal-backdrop').classList.add('open');
  setTimeout(() => {
    document.getElementById('wish-input').focus();
  }, 140);
}

function closeWriteModal() {
  document.getElementById('write-modal-backdrop').classList.remove('open');
}

function handleWriteFormSubmit(e) {
  e.preventDefault();
  const textInput = document.getElementById('wish-input');
  const authorInput = document.getElementById('wish-author');
  const tagSelect = document.getElementById('wish-tag');

  const text = textInput.value.trim();
  if (!text) return;

  const author = authorInput.value.trim() || '산사 나그네';
  const tag = tagSelect.value;

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const newWish = {
    id: `wish-${Date.now()}`,
    space: currentSpace,
    color: selectedLanternColor,
    author,
    tag,
    text,
    date: dateStr,
    hapjang: 1
  };

  wishes.push(newWish);
  saveWishes();

  textInput.value = '';
  authorInput.value = '';
  document.getElementById('char-counter').textContent = '0 / 90자';
  closeWriteModal();

  openWishReader(newWish.id);
  if (world3D) {
    world3D.spawnHapjangParticles3D(newWish.id);
  }
  audioEngine.strikeWindBell(0.95, 792);
  showToast('🏮 새로운 3D 소원 연등이 밝혀졌습니다!');
}

function triggerBellRingInteraction() {
  audioEngine.strikeWindBell(0.95);
  if (world3D) {
    world3D.exciteWindBell();
  }
  showToast('🔔 처마 끝 3D 청동 풍경종이 맑은 여운을 남기며 울립니다.');
}

function switchSpace(targetSpace) {
  if (!SPACE_META[targetSpace]) return;
  currentSpace = targetSpace;

  document.querySelectorAll('[data-space-target]').forEach((btn) => {
    const isTarget = btn.dataset.spaceTarget === currentSpace;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', String(isTarget));
  });

  const meta = SPACE_META[currentSpace];
  document.getElementById('space-eyebrow').textContent = meta.eyebrow;
  document.getElementById('space-title').textContent = meta.title;
  document.getElementById('space-caption').textContent = meta.caption;

  setMixerSliders(meta.defaultBellMix, meta.defaultWaterMix, meta.defaultWindMix);

  activeWishId = null;
  document.getElementById('wish-reader-card').classList.remove('open');

  syncCamButtonsUI('default');
  if (world3D) {
    world3D.camPreset = 'default';
    world3D.setSpace(currentSpace);
  }
  sync3DLanterns();
}

function switchTime(targetTime) {
  currentTime = targetTime;
  document.querySelectorAll('[data-time-btn]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.timeBtn === currentTime);
  });
  if (world3D) {
    world3D.setTimeMode(currentTime);
  }
}

function switchFoliage(targetFoliage) {
  currentFoliage = targetFoliage;
  document.querySelectorAll('[data-foliage-btn]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.foliageBtn === currentFoliage);
  });
  if (world3D) {
    world3D.setFoliageMode(currentFoliage);
  }
}

function switchCamPreset(preset) {
  syncCamButtonsUI(preset);
  if (world3D) {
    world3D.setCameraPreset(preset);
  }
}

function setMixerSliders(bell, water, wind) {
  document.getElementById('slider-bell').value = bell;
  document.getElementById('slider-water').value = water;
  document.getElementById('slider-wind').value = wind;

  document.getElementById('val-bell').textContent = `${bell}%`;
  document.getElementById('val-water').textContent = `${water}%`;
  document.getElementById('val-wind').textContent = `${wind}%`;

  audioEngine.bellLevel = bell / 100;
  audioEngine.waterLevel = water / 100;
  audioEngine.windLevel = wind / 100;
  audioEngine.updateContinuousVolumes();
}

function toggleZenMode(forceState) {
  const isZen =
    typeof forceState === 'boolean'
      ? forceState
      : !document.body.classList.contains('zen-mode');

  document.body.classList.toggle('zen-mode', isZen);
  if (isZen) {
    closeWishReader();
    document.getElementById('sound-mixer-panel').classList.remove('open');
    showToast('풍경멍 모드입니다. 드래그로 3D 시선을 천천히 둘러보세요 (Esc로 복귀).');
  }
}

function toggleBreathingGuide() {
  const guideEl = document.getElementById('breathing-guide');
  const btnEl = document.getElementById('breath-toggle-btn');
  const textEl = document.getElementById('breath-text');

  const isActive = guideEl.classList.toggle('active');
  btnEl.classList.toggle('active', isActive);

  if (breathGuideInterval) {
    clearInterval(breathGuideInterval);
    breathGuideInterval = null;
  }

  if (isActive) {
    const prompts = [
      '코끝으로 산사의 맑은 공기를 천천히 들이마십니다 (4초)',
      '가슴 가득 고요함을 잠시 머금어 봅니다 (2초)',
      '어깨의 긴장을 내려놓으며 길게 내쉽니다 (4초)'
    ];
    let step = 0;
    textEl.textContent = prompts[0];
    breathGuideInterval = setInterval(() => {
      step = (step + 1) % prompts.length;
      textEl.textContent = prompts[step];
    }, 3333);
  }
}

let toastTimeout = null;
function showToast(message) {
  const banner = document.getElementById('toast-banner');
  banner.textContent = message;
  banner.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    banner.classList.remove('show');
  }, 3200);
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('webgl-container');
  world3D = new Chakyeong3DWorld(container);
  sync3DLanterns();

  // Support drag-and-drop of user's own real Buseoksa photo onto the viewport
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      if (window.applyCustomBuseoksaPhoto) {
        window.applyCustomBuseoksaPhoto(url);
        showToast('📷 직접 찍으신 실사 사진이 3D 원경 배경에 적용되었습니다!');
      }
    }
  });

  // Space switcher
  document.querySelectorAll('[data-space-target]').forEach((btn) => {
    btn.addEventListener('click', () => switchSpace(btn.dataset.spaceTarget));
  });

  // Time buttons
  document.querySelectorAll('[data-time-btn]').forEach((btn) => {
    btn.addEventListener('click', () => switchTime(btn.dataset.timeBtn));
  });

  // Foliage buttons
  document.querySelectorAll('[data-foliage-btn]').forEach((btn) => {
    btn.addEventListener('click', () => switchFoliage(btn.dataset.foliageBtn));
  });

  // Camera Preset buttons
  document.querySelectorAll('[data-cam-btn]').forEach((btn) => {
    btn.addEventListener('click', () => switchCamPreset(btn.dataset.camBtn));
  });

  // Audio Toggle & Mixer
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const mixerPanel = document.getElementById('sound-mixer-panel');

  audioToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audioEngine.isPlaying) {
      const playing = audioEngine.toggle();
      audioToggleBtn.classList.toggle('active-audio', playing);
      document.getElementById('audio-btn-label').textContent = playing
        ? '산사 소리 조율'
        : '산사 소리 켜기';
      mixerPanel.classList.add('open');
      if (world3D) world3D.exciteWindBell();
    } else {
      mixerPanel.classList.toggle('open');
    }
  });

  document.getElementById('close-mixer-btn').addEventListener('click', () => {
    mixerPanel.classList.remove('open');
  });

  document.getElementById('manual-bell-btn').addEventListener('click', triggerBellRingInteraction);
  document.getElementById('ring-bell-dock-btn').addEventListener('click', triggerBellRingInteraction);

  ['bell', 'water', 'wind'].forEach((type) => {
    const slider = document.getElementById(`slider-${type}`);
    slider.addEventListener('input', () => {
      const val = Number(slider.value);
      document.getElementById(`val-${type}`).textContent = `${val}%`;
      audioEngine[`${type}Level`] = val / 100;
      if (!audioEngine.isPlaying) {
        const playing = audioEngine.toggle();
        audioToggleBtn.classList.toggle('active-audio', playing);
        document.getElementById('audio-btn-label').textContent = '산사 소리 조율';
      } else {
        audioEngine.updateContinuousVolumes();
      }
    });
  });

  // Wish Reader Actions
  document.getElementById('close-reader-btn').addEventListener('click', closeWishReader);
  document.getElementById('prev-wish-btn').addEventListener('click', () => navigateWish(-1));
  document.getElementById('next-wish-btn').addEventListener('click', () => navigateWish(1));
  document.getElementById('hapjang-btn').addEventListener('click', handleHapjangClick);

  // Write Modal Actions
  document.getElementById('open-write-modal-btn').addEventListener('click', openWriteModal);
  document.getElementById('close-write-modal-btn').addEventListener('click', closeWriteModal);
  document.getElementById('write-modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'write-modal-backdrop') closeWriteModal();
  });

  document.querySelectorAll('#lantern-color-picker .color-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedLanternColor = btn.dataset.color;
      document
        .querySelectorAll('#lantern-color-picker .color-option')
        .forEach((b) => b.classList.toggle('selected', b === btn));
    });
  });

  const wishInput = document.getElementById('wish-input');
  wishInput.addEventListener('input', () => {
    document.getElementById('char-counter').textContent = `${wishInput.value.length} / 90자`;
  });

  document.getElementById('write-lantern-form').addEventListener('submit', handleWriteFormSubmit);

  // Breathing Guide & Zen Mode
  document.getElementById('breath-toggle-btn').addEventListener('click', toggleBreathingGuide);
  document.getElementById('zen-mode-btn').addEventListener('click', () => toggleZenMode(true));
  document.getElementById('zen-restore-btn').addEventListener('click', () => toggleZenMode(false));

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (e.key === 'Escape') {
      closeWriteModal();
      closeWishReader();
      document.getElementById('sound-mixer-panel').classList.remove('open');
      if (document.body.classList.contains('zen-mode')) {
        toggleZenMode(false);
      }
      return;
    }

    if (
      e.code === 'Space' &&
      !isTyping &&
      !document.getElementById('write-modal-backdrop').classList.contains('open')
    ) {
      e.preventDefault();
      toggleZenMode();
    }
  });
});
