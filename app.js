/**
 * 차경(借景) 3D — 한국 명승 산사 풍경 멍 프로토타입 (Three.js Real-Time WebGL Engine)
 * - 공간 1: 영주 부석사 무량수전 앞마당 (3D 배흘림기둥·서까래 처마, 안양루, 석등, 소백산맥 7중 능선과 운해, 3D 청동 풍경종)
 * - 공간 2: 순천 선암사 승선교 (3D 홍예석 아치 돌다리, 실시간 셰이더 계곡물과 반영, 강선루, 단풍/꽃잎 숲과 돌담길)
 */

const STORAGE_KEY = 'chakyeong_3d_wishes_v2';
const HAPJANG_STORAGE_KEY = 'chakyeong_3d_hapjang_v2';

const SPACE_META = {
  buseoksa: {
    eyebrow: '차경(借景) 3D 제1경 · 경북 영주 봉황산',
    title: '부석사 무량수전 앞마당',
    caption: '배흘림기둥과 서까래 처마 밑, 안양루·석등 너머로 겹겹이 펼쳐지는 3D 소백산맥 능선과 운해',
    locationBadge: '부석사 처마 밑',
    writeDesc: '무량수전 처마 밑 서까래에 3D 연등을 매달아 소백산 바람에 소원을 실어 보냅니다.',
    defaultBellMix: 80,
    defaultWaterMix: 20,
    defaultWindMix: 65
  },
  seonamsa: {
    eyebrow: '차경(借景) 3D 제2경 · 전남 순천 조계산',
    title: '순천 선암사 승선교',
    caption: '3D 무지개 돌다리(승선교) 아래 흐르는 맑은 계곡물과 바람에 흩날리는 꽃잎·단풍잎의 여운',
    locationBadge: '선암사 돌담길',
    writeDesc: '승선교 돌담길과 계곡 위 연등줄에 3D 연등을 걸어 흐르는 물결에 마음을 비춥니다.',
    defaultBellMix: 45,
    defaultWaterMix: 85,
    defaultWindMix: 55
  }
};

// Palette presets for Dawn (새벽 운해), Sunset (석양 노을), Night (별 헤는 밤)
const TIME_PALETTES = {
  dawn: {
    skyTop: new THREE.Color('#0E1B2E'),
    skyMid: new THREE.Color('#385675'),
    skyHorizon: new THREE.Color('#D8C8B0'),
    sunColor: new THREE.Color('#FFF8E7'),
    fogColor: new THREE.Color('#6E8296'),
    fogDensity: 0.0095,
    ambientColor: new THREE.Color('#7B96B8'),
    ambientIntensity: 0.72,
    dirColor: new THREE.Color('#FFE8C2'),
    dirIntensity: 1.15,
    sunPos: new THREE.Vector3(-28, 14, -120),
    cloudColor: new THREE.Color('#EAE4DC'),
    cloudOpacity: 0.78,
    starOpacity: 0.15,
    waterDeep: new THREE.Color('#142636'),
    waterShallow: new THREE.Color('#3B5C73')
  },
  sunset: {
    skyTop: new THREE.Color('#120E24'),
    skyMid: new THREE.Color('#6B2D46'),
    skyHorizon: new THREE.Color('#F27D3B'),
    sunColor: new THREE.Color('#FFF0C2'),
    fogColor: new THREE.Color('#5E2D3E'),
    fogDensity: 0.0082,
    ambientColor: new THREE.Color('#9E5A63'),
    ambientIntensity: 0.68,
    dirColor: new THREE.Color('#FF944D'),
    dirIntensity: 1.45,
    sunPos: new THREE.Vector3(16, 9.5, -120),
    cloudColor: new THREE.Color('#F5A26F'),
    cloudOpacity: 0.52,
    starOpacity: 0.22,
    waterDeep: new THREE.Color('#1F1224'),
    waterShallow: new THREE.Color('#6E3538')
  },
  night: {
    skyTop: new THREE.Color('#03060E'),
    skyMid: new THREE.Color('#0B1528'),
    skyHorizon: new THREE.Color('#1C304F'),
    sunColor: new THREE.Color('#E2ECFF'),
    fogColor: new THREE.Color('#0B1424'),
    fogDensity: 0.0088,
    ambientColor: new THREE.Color('#2B426B'),
    ambientIntensity: 0.45,
    dirColor: new THREE.Color('#8AB4F8'),
    dirIntensity: 0.65,
    sunPos: new THREE.Vector3(24, 22, -110),
    cloudColor: new THREE.Color('#354B6E'),
    cloudOpacity: 0.32,
    starOpacity: 0.98,
    waterDeep: new THREE.Color('#060B14'),
    waterShallow: new THREE.Color('#162840')
  }
};

const LANTERN_COLORS = {
  amber: { core: '#FFFBEB', mid: '#F59E0B', edge: '#B45309', hex: 0xf59e0b },
  lotus: { core: '#FFF1F2', mid: '#F472B6', edge: '#BE185D', hex: 0xf472b6 },
  jade:  { core: '#ECFDF5', mid: '#34D399', edge: '#047857', hex: 0x34d399 },
  moon:  { core: '#FFFFFF', mid: '#FDE047', edge: '#CA8A04', hex: 0xfde047 }
};

const INITIAL_WISHES = [
  // Space 1: 영주 부석사 무량수전 처마 밑 (slot 0 ~ 5)
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

  // Space 2: 순천 선암사 승선교 돌담길 (slot 0 ~ 5)
  {
    id: 'sa-1',
    space: 'seonamsa',
    color: 'lotus',
    author: '조계산 산책자',
    tag: '마음 평안',
    text: '승선교 아래 흐르는 맑은 계곡물처럼 지난 후회와 미련은 흘려보내고 오늘만 온전히 살아가기를.',
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
    // 1. Valley Stream Sound (선암사 계곡 물소리)
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

    // 2. Mountain Breeze Sound (소백산 능선 산바람 소리)
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
   PROCEDURAL TEXTURE FACTORY (나뭇결 · 단청 · 화강암 · 한지 연등 · 운해 텍스처)
   ========================================================================== */
class TextureFactory {
  static createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#3D2319');
    grad.addColorStop(0.5, '#543122');
    grad.addColorStop(1, '#361E15');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Wood grain fibers
    for (let i = 0; i < 420; i++) {
      const x = Math.random() * 512;
      const w = 1 + Math.random() * 3;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(24, 12, 8, 0.24)' : 'rgba(122, 74, 52, 0.14)';
      ctx.fillRect(x, 0, w, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createDancheongCapTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2A4B3C'; // 석록색 (celadon green)
    ctx.fillRect(0, 0, 128, 128);

    ctx.strokeStyle = '#E8DFCA';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#B84A39'; // 주홍 단청
    ctx.beginPath();
    ctx.arc(64, 64, 38, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B'; // 황금 연화심
    ctx.beginPath();
    ctx.arc(64, 64, 16, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  static createGraniteTexture(withMoss = true) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#58534E';
    ctx.fillRect(0, 0, 512, 512);

    // Granite mineral speckles
    for (let i = 0; i < 6500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const s = 1 + Math.random() * 2.5;
      const r = Math.random();
      if (r < 0.45) ctx.fillStyle = 'rgba(32, 30, 28, 0.35)';
      else if (r < 0.85) ctx.fillStyle = 'rgba(168, 160, 150, 0.28)';
      else ctx.fillStyle = 'rgba(215, 205, 190, 0.22)';
      ctx.fillRect(x, y, s, s);
    }

    if (withMoss) {
      for (let i = 0; i < 45; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const rad = 12 + Math.random() * 36;
        const g = ctx.createRadialGradient(x, y, 2, x, y, rad);
        g.addColorStop(0, 'rgba(62, 88, 54, 0.32)');
        g.addColorStop(1, 'rgba(62, 88, 54, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createHanjiLanternTexture(colorKey = 'amber') {
    const palette = LANTERN_COLORS[colorKey] || LANTERN_COLORS.amber;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, palette.edge);
    grad.addColorStop(0.22, palette.mid);
    grad.addColorStop(0.5, palette.core);
    grad.addColorStop(0.78, palette.mid);
    grad.addColorStop(1, palette.edge);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Vertical bamboo rib lines on lantern
    ctx.strokeStyle = 'rgba(45, 20, 8, 0.26)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }

    // Horizontal subtle rings
    ctx.strokeStyle = 'rgba(45, 20, 8, 0.14)';
    ctx.lineWidth = 1.2;
    for (let y = 32; y < 256; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  static createGlowSpriteTexture(innerColor = 'rgba(255, 248, 220, 1)', midColor = 'rgba(245, 158, 11, 0.45)') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 124);
    grad.addColorStop(0, innerColor);
    grad.addColorStop(0.28, midColor);
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.12)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }

  static createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 256);
    const puffs = [
      { x: 256, y: 136, r: 115, a: 0.45 },
      { x: 165, y: 145, r: 95, a: 0.36 },
      { x: 345, y: 142, r: 98, a: 0.36 },
      { x: 105, y: 158, r: 70, a: 0.24 },
      { x: 405, y: 156, r: 72, a: 0.24 },
      { x: 220, y: 108, r: 85, a: 0.32 },
      { x: 295, y: 112, r: 82, a: 0.32 }
    ];

    puffs.forEach((p) => {
      const g = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, p.r);
      g.addColorStop(0, `rgba(255, 255, 255, ${p.a})`);
      g.addColorStop(0.55, `rgba(255, 255, 255, ${p.a * 0.45})`);
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    return new THREE.CanvasTexture(canvas);
  }
}

/* ==========================================================================
   REAL-TIME 3D WORLD ENGINE (Three.js Scene, Shaders, Architecture & Nature)
   ========================================================================== */
class Chakyeong3DWorld {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.spaceMode = 'buseoksa';
    this.timeMode = 'sunset';
    this.foliageMode = 'autumn';
    this.camPreset = 'default';

    // Camera spherical orbit state
    this.camTarget = new THREE.Vector3(0, 0.2, -12);
    this.desiredCamTarget = new THREE.Vector3(0, 0.2, -12);
    this.camPos = new THREE.Vector3(0, 0.4, 7.2);
    this.desiredCamPos = new THREE.Vector3(0, 0.4, 7.2);

    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.zoomOffset = 0;

    this.isPointerDown = false;
    this.pointerStart = { x: 0, y: 0 };
    this.pointerMoved = false;
    this.mouseNDC = new THREE.Vector2(-99, -99);
    this.raycaster = new THREE.Raycaster();

    this.clock = new THREE.Clock();
    this.lanternMeshes = [];
    this.interactiveTargets = [];
    this.hoveredObject = null;

    this.cloudPlanes = [];
    this.seonamsaTreeCanopies = [];
    this.sonicRings = [];
    this.hapjangParticles = [];
    this.bellExcitation = 0;

    this.initRendererAndScene();
    this.initTexturesAndMaterials();
    this.initSkyAndCelestial();
    this.initLighting();
    this.buildBuseoksaWorld();
    this.buildSeonamsaWorld();
    this.initFallingFoliage3D();
    this.initInteractionEvents();

    window.addEventListener('resize', () => this.onResize());
  }

  initRendererAndScene() {
    this.scene = new THREE.Scene();
    const initialPal = TIME_PALETTES[this.timeMode];
    this.scene.fog = new THREE.FogExp2(initialPal.fogColor.getHex(), initialPal.fogDensity);

    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 0.1, 420);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camTarget);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    // Groups for Space 1 & Space 2
    this.buseoksaGroup = new THREE.Group();
    this.seonamsaGroup = new THREE.Group();
    this.seonamsaGroup.visible = false;

    this.lanternsRoot = new THREE.Group();
    this.fxRoot = new THREE.Group();

    this.scene.add(this.buseoksaGroup);
    this.scene.add(this.seonamsaGroup);
    this.scene.add(this.lanternsRoot);
    this.scene.add(this.fxRoot);
  }

  initTexturesAndMaterials() {
    this.woodTex = TextureFactory.createWoodTexture();
    this.dancheongTex = TextureFactory.createDancheongCapTexture();
    this.graniteTex = TextureFactory.createGraniteTexture(true);
    this.cloudTex = TextureFactory.createCloudTexture();
    this.glowTex = TextureFactory.createGlowSpriteTexture();

    this.lanternTextures = {
      amber: TextureFactory.createHanjiLanternTexture('amber'),
      lotus: TextureFactory.createHanjiLanternTexture('lotus'),
      jade: TextureFactory.createHanjiLanternTexture('jade'),
      moon: TextureFactory.createHanjiLanternTexture('moon')
    };

    this.woodMat = new THREE.MeshStandardMaterial({
      map: this.woodTex,
      roughness: 0.72,
      metalness: 0.08
    });

    this.darkRoofTileMat = new THREE.MeshStandardMaterial({
      color: 0x1c2026,
      roughness: 0.65,
      metalness: 0.22
    });

    this.graniteMat = new THREE.MeshStandardMaterial({
      map: this.graniteTex,
      roughness: 0.85,
      metalness: 0.05
    });

    this.bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x9b8266,
      roughness: 0.35,
      metalness: 0.78
    });
  }

  /* ------------------------------------------------------------------------
     CUSTOM GLSL SKY DOME, SUN CORONA, CRESCENT MOON & 3D STARFIELD
     ------------------------------------------------------------------------ */
  initSkyAndCelestial() {
    const pal = TIME_PALETTES[this.timeMode];

    this.skyUniforms = {
      uTopColor: { value: pal.skyTop.clone() },
      uMidColor: { value: pal.skyMid.clone() },
      uHorizonColor: { value: pal.skyHorizon.clone() },
      uSunPos: { value: pal.sunPos.clone() },
      uSunColor: { value: pal.sunColor.clone() },
      uTime: { value: 0 }
    };

    const skyGeo = new THREE.SphereGeometry(320, 48, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: `
        varying vec3 vWorldPos;
        void main() {
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform vec3 uTopColor;
        uniform vec3 uMidColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunPos;
        uniform vec3 uSunColor;
        varying vec3 vWorldPos;

        void main() {
          vec3 dir = normalize(vWorldPos);
          float h = clamp(dir.y, 0.0, 1.0);

          vec3 col = mix(uHorizonColor, uMidColor, pow(h, 0.45));
          col = mix(col, uTopColor, smoothstep(0.28, 0.92, h));

          // Mie scattering solar glow around sun position
          vec3 sunDir = normalize(uSunPos);
          float sunAmt = max(dot(dir, sunDir), 0.0);
          col += uSunColor * pow(sunAmt, 14.0) * 0.42;
          col += uSunColor * pow(sunAmt, 120.0) * 0.85;

          // Subtle horizon atmospheric mist glow
          float horizonBand = exp(-abs(dir.y) * 9.5);
          col = mix(col, uHorizonColor * 1.12, horizonBand * 0.45);

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // 3D Starfield (1,600 stars in upper hemisphere)
    const starCount = 1600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.05 + Math.random() * 0.95);
      const r = 270 + Math.random() * 20;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xfff8e7,
      size: 1.35,
      transparent: true,
      opacity: pal.starOpacity,
      depthWrite: false,
      Fog: false
    });
    this.starField = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.starField);

    // 3D Moon Mesh for Night Mode
    const moonGeo = new THREE.SphereGeometry(5.2, 32, 32);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xfef9e6,
      transparent: true,
      opacity: 0,
      fog: false
    });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(28, 34, -140);

    const moonHaloMat = new THREE.SpriteMaterial({
      map: this.glowTex,
      color: 0xc7d9ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    this.moonHalo = new THREE.Sprite(moonHaloMat);
    this.moonHalo.scale.set(36, 36, 1);
    this.moonMesh.add(this.moonHalo);
    this.scene.add(this.moonMesh);
  }

  initLighting() {
    const pal = TIME_PALETTES[this.timeMode];

    this.ambientLight = new THREE.AmbientLight(pal.ambientColor, pal.ambientIntensity);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffecd2, 0x1a1c24, 0.55);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(pal.dirColor, pal.dirIntensity);
    this.dirLight.position.copy(pal.sunPos);
    this.scene.add(this.dirLight);

    // Warm under-eave fill light so foreground wooden architecture has rich warm detail
    this.eaveWarmLight = new THREE.PointLight(0xffa94d, 1.35, 28, 1.6);
    this.eaveWarmLight.position.set(0, 2.2, 2.5);
    this.scene.add(this.eaveWarmLight);
  }

  /* ------------------------------------------------------------------------
     SPACE 1: 영주 부석사 무량수전 앞마당 (3D Architecture, Ridges, Clouds)
     ------------------------------------------------------------------------ */
  buildBuseoksaWorld() {
    // 1. Foreground Muryangsujeon Frame (배흘림기둥, 툇마루, 서까래 처마)
    const frameGroup = new THREE.Group();

    // Wooden Maru Veranda Floor (무량수전 툇마루)
    const maruGeo = new THREE.BoxGeometry(26, 0.5, 6.5);
    const maruMesh = new THREE.Mesh(maruGeo, this.woodMat);
    maruMesh.position.set(0, -3.45, 5.2);
    frameGroup.add(maruMesh);

    // Stone Courtyard Ground (무량수전 앞마당 마사토 & 박석)
    const yardGeo = new THREE.PlaneGeometry(55, 30, 24, 24);
    const yardMat = new THREE.MeshStandardMaterial({
      map: this.graniteTex,
      color: 0x6b6057,
      roughness: 0.92
    });
    const yardMesh = new THREE.Mesh(yardGeo, yardMat);
    yardMesh.rotation.x = -Math.PI / 2;
    yardMesh.position.set(0, -3.65, -7);
    frameGroup.add(yardMesh);

    // Courtyard Stone Retaining Wall (석축 축대)
    const wallGeo = new THREE.BoxGeometry(52, 2.6, 1.8);
    const wallMesh = new THREE.Mesh(wallGeo, this.graniteMat);
    wallMesh.position.set(0, -4.8, -19.5);
    frameGroup.add(wallMesh);

    // 3D Baehullim Columns (배흘림기둥 - LatheGeometry with authentic entasis bulge)
    const columnPoints = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = t * 7.4;
      // Classic Baehullim profile: thickest around 38% height, tapering towards top and bottom
      const entasis = Math.sin(t * Math.PI * 0.88 + 0.15);
      const r = 0.36 + 0.095 * entasis;
      columnPoints.push(new THREE.Vector2(r, y));
    }
    const colGeo = new THREE.LatheGeometry(columnPoints, 28);

    const colPositions = [-7.2, -3.1, 3.1, 7.2];
    colPositions.forEach((xPos, idx) => {
      // Only place outer columns in foreground view so center view is a wide open 차경 frame!
      const zPos = idx === 0 || idx === 3 ? 3.2 : 5.8;
      const colMesh = new THREE.Mesh(colGeo, this.woodMat);
      colMesh.position.set(xPos, -3.3, zPos);
      frameGroup.add(colMesh);

      // Granite Plinth Base (주초석)
      const plinthGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.35, 16);
      const plinthMesh = new THREE.Mesh(plinthGeo, this.graniteMat);
      plinthMesh.position.set(xPos, -3.15, zPos);
      frameGroup.add(plinthMesh);
    });

    // Overhead Main Eave Beam (처마 도리 & 창방)
    const beamGeo = new THREE.BoxGeometry(24, 0.55, 0.65);
    const beamMesh = new THREE.Mesh(beamGeo, this.woodMat);
    beamMesh.position.set(0, 3.85, 3.2);
    frameGroup.add(beamMesh);

    // Sweeping Overhead Roof Eave & 34 3D Rafters (서까래와 부연, 단청 마구리)
    const rafterGroup = new THREE.Group();
    const rafterBodyGeo = new THREE.CylinderGeometry(0.085, 0.095, 3.4, 12);
    rafterBodyGeo.rotateX(Math.PI / 2);
    const capGeo = new THREE.CircleGeometry(0.094, 16);
    const capMat = new THREE.MeshBasicMaterial({ map: this.dancheongTex });

    for (let i = -17; i <= 17; i++) {
      const x = i * 0.58;
      const normX = x / 10;
      // Traditional Korean eave curve (조로/앙곡): sweeps gently upward toward corners
      const curveLift = normX * normX * 0.68;

      const rafter = new THREE.Mesh(rafterBodyGeo, this.woodMat);
      rafter.position.set(x, 3.65 + curveLift, 2.35);
      rafter.rotation.x = 0.28;
      rafterGroup.add(rafter);

      // Dancheong painted end cap on each rafter tip
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(x, 3.65 + curveLift - Math.sin(0.28) * 1.71, 2.35 - Math.cos(0.28) * 1.71);
      cap.rotation.y = Math.PI;
      rafterGroup.add(cap);
    }

    // Dark Curved Eave Roof Shadow Plane above rafters
    const eaveCoverGeo = new THREE.BoxGeometry(24, 0.4, 4.2);
    const eaveCover = new THREE.Mesh(eaveCoverGeo, this.darkRoofTileMat);
    eaveCover.position.set(0, 4.25, 2.5);
    eaveCover.rotation.x = 0.26;
    rafterGroup.add(eaveCover);

    frameGroup.add(rafterGroup);

    // 2. Interactive 3D Bronze Wind-Bell (처마 끝 청동 풍경종과 물고기 풍경편)
    this.windBellPivot = new THREE.Group();
    this.windBellPivot.position.set(5.35, 3.25, 1.15);

    const chainGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8);
    const chainMesh = new THREE.Mesh(chainGeo, this.bronzeMat);
    chainMesh.position.y = -0.22;
    this.windBellPivot.add(chainMesh);

    // Bell Profile via LatheGeometry
    const bellPts = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.16, -0.04),
      new THREE.Vector2(0.21, -0.22),
      new THREE.Vector2(0.26, -0.46),
      new THREE.Vector2(0.29, -0.52),
      new THREE.Vector2(0.24, -0.52)
    ];
    const bellGeo = new THREE.LatheGeometry(bellPts, 24);
    const bellMesh = new THREE.Mesh(bellGeo, this.bronzeMat);
    bellMesh.position.y = -0.42;
    bellMesh.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windBellPivot.add(bellMesh);
    this.interactiveTargets.push(bellMesh);

    // Clapper Cord & 3D Golden Fish Pendant (물고기 모양 풍경편)
    this.windFishPivot = new THREE.Group();
    this.windFishPivot.position.y = -0.92;

    const lowerCord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.45, 6),
      this.bronzeMat
    );
    lowerCord.position.y = 0.15;
    this.windFishPivot.add(lowerCord);

    const fishShape = new THREE.Shape();
    fishShape.moveTo(0, 0.18);
    fishShape.quadraticCurveTo(0.22, 0.04, 0.12, -0.22);
    fishShape.lineTo(0.24, -0.38);
    fishShape.lineTo(0.03, -0.28);
    fishShape.lineTo(-0.03, -0.28);
    fishShape.lineTo(-0.24, -0.38);
    fishShape.lineTo(-0.12, -0.22);
    fishShape.quadraticCurveTo(-0.22, 0.04, 0, 0.18);

    const fishGeo = new THREE.ExtrudeGeometry(fishShape, {
      depth: 0.025,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008
    });
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0xd9a760,
      roughness: 0.28,
      metalness: 0.85
    });
    const fishMesh = new THREE.Mesh(fishGeo, fishMat);
    fishMesh.position.set(0, -0.1, -0.012);
    fishMesh.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windFishPivot.add(fishMesh);
    this.interactiveTargets.push(fishMesh);

    this.windBellPivot.add(this.windFishPivot);
    frameGroup.add(this.windBellPivot);

    // 3. 3D Buseoksa Stone Lantern (무량수전 앞 화강암 석등)
    const stoneLantern = this.create3DStoneLantern();
    stoneLantern.position.set(4.1, -3.65, -4.8);
    frameGroup.add(stoneLantern);

    // 4. 3D Anyangnu Pavilion on Left Cliff (안양루 3D 팔작지붕 누각)
    const anyangnu = this.create3DPavilion(1.25);
    anyangnu.position.set(-7.8, -4.2, -15.5);
    anyangnu.rotation.y = 0.28;
    frameGroup.add(anyangnu);

    // 5. Flanking 3D Korean Red Pine Trees (소나무 숲 실루엣)
    const pineLeft = this.create3DPineTree(1.3);
    pineLeft.position.set(-12.5, -3.8, -11.5);
    frameGroup.add(pineLeft);

    const pineRight = this.create3DPineTree(1.15);
    pineRight.position.set(11.8, -3.8, -13.0);
    frameGroup.add(pineRight);

    this.buseoksaGroup.add(frameGroup);

    // 6. 7 Layers of 3D Sobaeksan Mountain Ridges (소백산맥 3D 다중 능선)
    this.buildSobaeksanMountainRidges();

    // 7. 3D Volumetric-Style Sea of Clouds (운해 레이어)
    this.buildSeaOfClouds();
  }

  create3DStoneLantern() {
    const group = new THREE.Group();

    // Lower Base (하대석)
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.02, 0.45, 8), this.graniteMat);
    base1.position.y = 0.22;
    group.add(base1);

    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.82, 0.35, 8), this.graniteMat);
    base2.position.y = 0.62;
    group.add(base2);

    // Octagonal Pillar (간주석)
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 1.35, 8), this.graniteMat);
    pillar.position.y = 1.45;
    group.add(pillar);

    // Upper Lotus Base (상대석)
    const upperBase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.42, 0.32, 8), this.graniteMat);
    upperBase.position.y = 2.28;
    group.add(upperBase);

    // Fire Chamber Pillars (화사석 기둥들)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.72, 6), this.graniteMat);
      post.position.set(Math.cos(angle) * 0.38, 2.8, Math.sin(angle) * 0.38);
      group.add(post);
    }

    // Glowing Flame Core inside Stone Lantern (석등 불빛과 광원)
    const flameCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff3c4 })
    );
    flameCore.position.y = 2.78;
    group.add(flameCore);

    this.stoneLanternLight = new THREE.PointLight(0xff9e2c, 2.2, 18, 1.8);
    this.stoneLanternLight.position.set(0, 2.8, 0);
    group.add(this.stoneLanternLight);

    const flameHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: this.glowTex,
        color: 0xffae33,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    flameHalo.scale.set(2.8, 2.8, 1);
    flameHalo.position.y = 2.8;
    this.stoneLanternHalo = flameHalo;
    group.add(flameHalo);

    // Octagonal Roof Stone (옥개석)
    const roofPts = [
      new THREE.Vector2(0.01, 0.62),
      new THREE.Vector2(0.28, 0.42),
      new THREE.Vector2(0.68, 0.16),
      new THREE.Vector2(1.08, 0.04),
      new THREE.Vector2(0.98, -0.08),
      new THREE.Vector2(0.45, -0.06)
    ];
    const roofGeo = new THREE.LatheGeometry(roofPts, 8);
    const roofMesh = new THREE.Mesh(roofGeo, this.graniteMat);
    roofMesh.position.y = 3.22;
    group.add(roofMesh);

    // Finial Jewel (상륜부 보주)
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.graniteMat);
    finial.position.y = 3.92;
    group.add(finial);

    return group;
  }

  create3DPavilion(scale = 1.0) {
    const group = new THREE.Group();
    group.scale.setScalar(scale);

    // Stone Terrace Sub-base
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(6.8, 1.8, 4.4), this.graniteMat);
    terrace.position.y = 0.9;
    group.add(terrace);

    // Wooden Pillars
    const px = [-2.6, -0.9, 0.9, 2.6];
    const pz = [-1.5, 1.5];
    px.forEach((x) => {
      pz.forEach((z) => {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 2.8, 12), this.woodMat);
        p.position.set(x, 3.2, z);
        group.add(p);
      });
    });

    // Pavilion Floor & Balustrade
    const floor = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.25, 3.8), this.woodMat);
    floor.position.y = 2.3;
    group.add(floor);

    // Curved Korean Paljak Roof (팔작지붕 곡선 기와지붕)
    const roofGeo = new THREE.BoxGeometry(8.4, 0.45, 5.6, 16, 2, 12);
    const pos = roofGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      // Center ridge rises high; four corners flare gracefully upward (추녀 곡선)
      const distCenterZ = Math.abs(vz) / 2.8;
      const distCenterX = Math.abs(vx) / 4.2;
      const ridgeLift = (1.0 - distCenterZ) * 1.45;
      const cornerFlare = Math.pow(distCenterX, 2.2) * Math.pow(distCenterZ, 1.5) * 0.85;
      pos.setY(i, vy + ridgeLift + cornerFlare);
    }
    roofGeo.computeVertexNormals();

    const roofMesh = new THREE.Mesh(roofGeo, this.darkRoofTileMat);
    roofMesh.position.y = 4.65;
    group.add(roofMesh);

    // Main Roof Ridge Beam (용마루)
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.28, 0.32), this.graniteMat);
    ridge.position.y = 6.25;
    group.add(ridge);

    return group;
  }

  create3DPineTree(scale = 1.0) {
    const group = new THREE.Group();
    group.scale.setScalar(scale);

    // Gnarled curved trunk
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.4, 1.8, 0.2),
      new THREE.Vector3(-0.3, 3.6, -0.1),
      new THREE.Vector3(0.2, 5.2, 0.3)
    ]);
    const trunkGeo = new THREE.TubeGeometry(curve, 16, 0.24, 8, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, this.woodMat);
    group.add(trunkMesh);

    const needleMat = new THREE.MeshStandardMaterial({
      color: 0x1d3326,
      roughness: 0.88
    });

    const clusters = [
      { x: 0.2, y: 5.4, z: 0.3, rx: 1.8, ry: 0.65 },
      { x: -1.1, y: 4.5, z: 0.1, rx: 1.4, ry: 0.55 },
      { x: 1.2, y: 4.1, z: -0.2, rx: 1.5, ry: 0.55 },
      { x: -0.4, y: 6.1, z: 0.0, rx: 1.3, ry: 0.5 }
    ];

    clusters.forEach((c) => {
      const cg = new THREE.SphereGeometry(1, 12, 10);
      cg.scale(c.rx, c.ry, c.rx * 0.85);
      const cm = new THREE.Mesh(cg, needleMat);
      cm.position.set(c.x, c.y, c.z);
      group.add(cm);
    });

    return group;
  }

  buildSobaeksanMountainRidges() {
    this.ridgeMaterials = [];
    const ridgeConfigs = [
      { z: -28, width: 110, depth: 18, baseH: -5.5, amp: 6.2, seed: 1.1, color: '#2E2334' },
      { z: -46, width: 145, depth: 22, baseH: -5.2, amp: 8.8, seed: 2.4, color: '#39283B' },
      { z: -68, width: 185, depth: 26, baseH: -4.8, amp: 11.5, seed: 3.8, color: '#473044' },
      { z: -96, width: 230, depth: 32, baseH: -4.2, amp: 14.8, seed: 5.2, color: '#54384D' },
      { z: -130, width: 280, depth: 38, baseH: -3.5, amp: 18.5, seed: 6.7, color: '#634156' },
      { z: -170, width: 340, depth: 45, baseH: -2.5, amp: 23.0, seed: 8.3, color: '#704B5F' }
    ];

    ridgeConfigs.forEach((cfg, idx) => {
      const geo = new THREE.PlaneGeometry(cfg.width, cfg.depth, 96, 20);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Normalized ridge profile (tapers at front & back edges of strip)
        const zNorm = 1.0 - Math.pow(z / (cfg.depth * 0.5), 2);
        const n1 = Math.sin(x * 0.045 + cfg.seed) * Math.cos(z * 0.08 + cfg.seed);
        const n2 = Math.sin(x * 0.11 - cfg.seed * 1.7) * 0.48;
        const n3 = Math.cos(x * 0.23 + z * 0.15 + cfg.seed) * 0.24;
        const ridgeHeight = Math.max(0, (n1 + n2 + n3 + 0.85) * cfg.amp * Math.max(0, zNorm));
        pos.setY(i, ridgeHeight);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        roughness: 0.92,
        metalness: 0.02,
        flatShading: false
      });
      this.ridgeMaterials.push({ mat, layerIndex: idx });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, cfg.baseH, cfg.z);
      this.buseoksaGroup.add(mesh);
    });
  }

  buildSeaOfClouds() {
    this.cloudPlanes = [];
    const cloudGeo = new THREE.PlaneGeometry(36, 14);

    for (let i = 0; i < 38; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: this.cloudTex,
        color: TIME_PALETTES[this.timeMode].cloudColor.clone(),
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(cloudGeo, mat);
      const z = -22 - (i / 38) * 125;
      const x = (Math.random() - 0.5) * 130;
      const y = -4.2 + Math.random() * 3.2 + Math.abs(z) * 0.025;
      const scale = 0.85 + Math.random() * 1.45;

      mesh.position.set(x, y, z);
      mesh.scale.set(scale, scale * 0.7, 1);

      this.cloudPlanes.push({
        mesh,
        mat,
        baseX: x,
        baseY: y,
        speed: 0.35 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2
      });

      this.buseoksaGroup.add(mesh);
    }
  }

  /* ------------------------------------------------------------------------
     SPACE 2: 순천 선암사 승선교 (3D Granite Arch Bridge, Stream Shader, Forest)
     ------------------------------------------------------------------------ */
  buildSeonamsaWorld() {
    // 1. 3D Seungseongyo Semicircular Granite Arch Bridge (승선교 무지개 돌다리)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, -2.5, -10.5);

    const archRadius = 5.4;
    const bridgeDepth = 3.2;

    // 26 Individual 3D Granite Voussoir Arch Stones (홍예석)
    const voussoirCount = 26;
    for (let i = 0; i < voussoirCount; i++) {
      const angle = ((i + 0.5) / voussoirCount) * Math.PI;
      const stoneGeo = new THREE.BoxGeometry(0.66, 0.72, bridgeDepth);
      const stoneMesh = new THREE.Mesh(stoneGeo, this.graniteMat);
      stoneMesh.position.set(
        Math.cos(angle) * archRadius,
        Math.sin(angle) * archRadius,
        0
      );
      stoneMesh.rotation.z = angle - Math.PI / 2;
      bridgeGroup.add(stoneMesh);
    }

    // Dragon-Head Keystone protruding at bottom of arch apex (승선교 중앙 용머리 돌)
    const dragonStone = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.68, 0.52),
      this.graniteMat
    );
    dragonStone.position.set(0, archRadius - 0.42, bridgeDepth * 0.35);
    bridgeGroup.add(dragonStone);

    // Bridge Spandrel Stone Walls & Parapet Deck (다리 상판과 석축)
    const spandrelShape = new THREE.Shape();
    spandrelShape.moveTo(-9.5, 0);
    spandrelShape.lineTo(-9.5, 5.85);
    spandrelShape.quadraticCurveTo(0, 6.35, 9.5, 5.85);
    spandrelShape.lineTo(9.5, 0);
    spandrelShape.lineTo(archRadius, 0);
    spandrelShape.absarc(0, 0, archRadius, 0, Math.PI, false);
    spandrelShape.lineTo(-9.5, 0);

    const spandrelGeo = new THREE.ExtrudeGeometry(spandrelShape, {
      depth: bridgeDepth - 0.16,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06
    });
    spandrelGeo.translate(0, 0, -(bridgeDepth - 0.16) / 2);
    const spandrelMesh = new THREE.Mesh(spandrelGeo, this.graniteMat);
    bridgeGroup.add(spandrelMesh);

    // Inverted Underwater Reflection Arch for realism through water shader
    const reflArch = bridgeGroup.clone();
    reflArch.scale.y = -0.75;
    reflArch.position.y = -2.65;
    this.seonamsaGroup.add(reflArch);

    this.seonamsaGroup.add(bridgeGroup);

    // 2. Real-Time 3D Animated Valley Stream Shader (선암사 계곡 수면과 윤슬 셰이더)
    const pal = TIME_PALETTES[this.timeMode];
    this.waterUniforms = {
      uTime: { value: 0 },
      uDeepColor: { value: pal.waterDeep.clone() },
      uShallowColor: { value: pal.waterShallow.clone() },
      uSunColor: { value: pal.sunColor.clone() }
    };

    const waterGeo = new THREE.PlaneGeometry(34, 65, 96, 96);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.ShaderMaterial({
      uniforms: this.waterUniforms,
      transparent: true,
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying float vWave;

        void main() {
          vUv = uv;
          vec3 pos = position;
          float w1 = sin(pos.x * 1.4 + uTime * 2.2) * cos(pos.z * 0.9 + uTime * 1.8) * 0.07;
          float w2 = sin(pos.z * 2.4 - uTime * 3.4) * 0.045;
          pos.y += w1 + w2;
          vWave = w1 + w2;

          vec4 wp = modelMatrix * vec4(pos, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uSunColor;
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying float vWave;

        void main() {
          // Animated water ripple normal approximation
          float ripple = sin(vWorldPos.x * 4.5 + uTime * 3.0) * cos(vWorldPos.z * 3.8 - uTime * 4.2);
          float shimmer = smoothstep(0.68, 0.98, ripple);

          vec3 waterCol = mix(uDeepColor, uShallowColor, clamp(vWave * 5.0 + 0.5, 0.0, 1.0));

          // Golden lantern & sky reflection strip down the stream center
          float centerGlow = exp(-pow(vWorldPos.x * 0.22, 2.0));
          waterCol += uSunColor * centerGlow * (0.18 + shimmer * 0.45);

          // Subtle white foam streaks in stream current
          float foam = smoothstep(0.86, 0.98, sin(vWorldPos.z * 2.2 - uTime * 3.8 + sin(vWorldPos.x * 2.0)));
          waterCol = mix(waterCol, vec3(0.92, 0.95, 0.98), foam * 0.18);

          gl_FragColor = vec4(waterCol, 0.86);
        }
      `
    });

    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(0, -2.55, -12);
    this.seonamsaGroup.add(waterMesh);

    // 3. Valley Riverbanks & Mossy Boulders (계곡 양안 기슭과 이끼 바위들)
    const boulderCoords = [
      [-5.5, -2.3, -3.5, 1.8],
      [-4.2, -2.5, -1.2, 1.3],
      [5.8, -2.2, -4.2, 2.1],
      [4.5, -2.5, -0.8, 1.4],
      [-6.8, -2.1, -7.2, 2.2],
      [6.9, -2.0, -7.5, 2.3],
      [-2.2, -2.6, -5.5, 0.85],
      [2.6, -2.6, -14.5, 1.1]
    ];
    boulderCoords.forEach(([bx, by, bz, br]) => {
      const bGeo = new THREE.DodecahedronGeometry(br, 1);
      bGeo.scale(1.3, 0.68, 1.1);
      const bMesh = new THREE.Mesh(bGeo, this.graniteMat);
      bMesh.position.set(bx, by, bz);
      bMesh.rotation.y = Math.random() * Math.PI;
      this.seonamsaGroup.add(bMesh);
    });

    // Foreground Left & Right Stone Wall Path (선암사 돌담길)
    const stoneWallLeft = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.6, 1.2), this.graniteMat);
    stoneWallLeft.position.set(-6.8, -1.5, 2.2);
    stoneWallLeft.rotation.y = 0.35;
    this.seonamsaGroup.add(stoneWallLeft);

    const stoneWallRight = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.6, 1.2), this.graniteMat);
    stoneWallRight.position.set(6.8, -1.5, 2.2);
    stoneWallRight.rotation.y = -0.35;
    this.seonamsaGroup.add(stoneWallRight);

    // 4. Gangseonru Pavilion visible beyond the Stone Arch (강선루)
    const gangseonru = this.create3DPavilion(0.95);
    gangseonru.position.set(0, -1.6, -24.5);
    this.seonamsaGroup.add(gangseonru);

    // 5. Jogyesan Valley Ridges & Autumn/Spring Foliage Forest (단풍/산벚꽃 나무 숲)
    const valleyRidgeLeft = new THREE.Mesh(
      new THREE.ConeGeometry(22, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0x2a232d, roughness: 0.92 })
    );
    valleyRidgeLeft.position.set(-22, 6, -28);
    this.seonamsaGroup.add(valleyRidgeLeft);

    const valleyRidgeRight = new THREE.Mesh(
      new THREE.ConeGeometry(24, 26, 16),
      new THREE.MeshStandardMaterial({ color: 0x261f29, roughness: 0.92 })
    );
    valleyRidgeRight.position.set(22, 7, -30);
    this.seonamsaGroup.add(valleyRidgeRight);

    // Populate 26 3D Deciduous Maple / Cherry Trees around the bridge and valley
    this.seonamsaTreeCanopies = [];
    const treeLocations = [
      [-9.5, -1.5, -5.5, 1.3],
      [9.5, -1.5, -5.8, 1.35],
      [-11.2, -0.8, -11.5, 1.5],
      [11.4, -0.8, -11.2, 1.45],
      [-7.5, -1.2, -17.5, 1.25],
      [7.8, -1.2, -18.0, 1.3],
      [-4.8, -1.4, -22.0, 1.15],
      [5.2, -1.4, -22.5, 1.2],
      [-7.2, -1.2, 1.8, 1.25],
      [7.2, -1.2, 1.8, 1.25]
    ];

    treeLocations.forEach(([tx, ty, tz, ts], idx) => {
      const tree = this.create3DFoliageTree(ts, idx);
      tree.position.set(tx, ty, tz);
      this.seonamsaGroup.add(tree);
    });

    // 6. Hanging Lantern Rope spanning across the valley foreground (돌담길 연등줄)
    const ropeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.5, 3.6, 1.2),
      new THREE.Vector3(-4.0, 2.85, 0.9),
      new THREE.Vector3(0, 2.55, 0.8),
      new THREE.Vector3(4.0, 2.85, 0.9),
      new THREE.Vector3(8.5, 3.6, 1.2)
    ]);
    const ropeGeo = new THREE.TubeGeometry(ropeCurve, 32, 0.022, 6, false);
    const ropeMesh = new THREE.Mesh(ropeGeo, this.bronzeMat);
    this.seonamsaGroup.add(ropeMesh);
  }

  create3DFoliageTree(scale = 1.0, idx = 0) {
    const group = new THREE.Group();
    group.scale.setScalar(scale);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.24, 3.4, 8),
      this.woodMat
    );
    trunk.position.y = 1.7;
    group.add(trunk);

    const canopyOffsets = [
      [0, 3.6, 0, 1.45],
      [-0.95, 3.1, 0.4, 1.15],
      [0.95, 3.2, -0.3, 1.2],
      [0.2, 4.2, 0.3, 1.1]
    ];

    canopyOffsets.forEach(([cx, cy, cz, cr], cIdx) => {
      const mat = new THREE.MeshStandardMaterial({
        color: this.getFoliageColor(idx + cIdx),
        roughness: 0.8
      });
      const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(cr, 1), mat);
      sphere.scale.set(1.2, 0.82, 1.1);
      sphere.position.set(cx, cy, cz);
      group.add(sphere);
      this.seonamsaTreeCanopies.push({ mat, seed: idx + cIdx });
    });

    return group;
  }

  getFoliageColor(seed) {
    if (this.foliageMode === 'autumn') {
      const autumnColors = [0xd94832, 0xe87a24, 0xf2a922, 0xb8332a];
      return new THREE.Color(autumnColors[seed % autumnColors.length]);
    } else {
      const springColors = [0xf9cbd6, 0xfde2e8, 0xf4a7b9, 0x76a07d];
      return new THREE.Color(springColors[seed % springColors.length]);
    }
  }

  /* ------------------------------------------------------------------------
     3D FALLING PETALS / MAPLE LEAVES IN 3D SPACE
     ------------------------------------------------------------------------ */
  initFallingFoliage3D() {
    this.leafCount = 110;
    this.leafDummy = new THREE.Object3D();
    this.leafData = [];

    const leafGeo = new THREE.PlaneGeometry(0.16, 0.12);
    this.leafInstancedMat = new THREE.MeshBasicMaterial({
      color: 0xe86a38,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });

    this.leafInstancedMesh = new THREE.InstancedMesh(leafGeo, this.leafInstancedMat, this.leafCount);
    for (let i = 0; i < this.leafCount; i++) {
      this.leafData.push({
        x: (Math.random() - 0.5) * 28,
        y: -2 + Math.random() * 10,
        z: -16 + Math.random() * 20,
        vx: 0.4 + Math.random() * 0.8,
        vy: -0.45 - Math.random() * 0.55,
        vz: (Math.random() - 0.5) * 0.4,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        spin: 0.8 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      });
    }
    this.fxRoot.add(this.leafInstancedMesh);
  }

  /* ------------------------------------------------------------------------
     3D WISH LANTERNS BUILDER (처마 밑 / 돌담길 3D 한지 연등)
     ------------------------------------------------------------------------ */
  rebuild3DLanterns(wishesForSpace, activeWishId) {
    // Clear existing 3D lanterns
    while (this.lanternsRoot.children.length > 0) {
      this.lanternsRoot.remove(this.lanternsRoot.children[0]);
    }
    this.lanternMeshes = [];
    this.interactiveTargets = this.interactiveTargets.filter(
      (obj) => obj.userData?.type === 'windbell'
    );

    const total = wishesForSpace.length;

    // Prepare reusable 3D lotus/hanji lantern profile (LatheGeometry)
    const lanternPts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const y = (t - 0.5) * 0.56;
      const r = 0.08 + Math.sin(t * Math.PI) * 0.19;
      lanternPts.push(new THREE.Vector2(r, y));
    }
    const bodyGeo = new THREE.LatheGeometry(lanternPts, 20);
    const capGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16);
    const tagGeo = new THREE.PlaneGeometry(0.11, 0.34);

    wishesForSpace.forEach((wish, idx) => {
      const pivot = new THREE.Group();

      // Compute 3D hanging coordinate along Muryangsujeon Eaves or Seonamsa Rope
      const t = total <= 1 ? 0.5 : idx / (total - 1);
      const x = -5.0 + t * 9.2; // leaves room on far right for the bronze windbell
      const normX = x / 9.5;

      let y, z;
      if (this.spaceMode === 'buseoksa') {
        const eaveCurve = normX * normX * 0.65;
        y = 3.18 + eaveCurve;
        z = 1.25 + (idx % 2) * 0.35;
      } else {
        // Catenary sag along the Seonamsa rope
        y = 2.55 + normX * normX * 1.15;
        z = 0.85 + (idx % 2) * 0.25;
      }

      pivot.position.set(x, y, z);

      const cordLen = 0.42 + (idx % 3) * 0.12;
      const cordMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, cordLen, 6),
        this.bronzeMat
      );
      cordMesh.position.y = -cordLen * 0.5;
      pivot.add(cordMesh);

      const lanternCenterY = -cordLen - 0.28;
      const colorKey = wish.color || 'amber';
      const pal = LANTERN_COLORS[colorKey] || LANTERN_COLORS.amber;
      const isSelected = wish.id === activeWishId;

      const bodyMat = new THREE.MeshStandardMaterial({
        map: this.lanternTextures[colorKey] || this.lanternTextures.amber,
        emissive: new THREE.Color(pal.hex),
        emissiveMap: this.lanternTextures[colorKey] || this.lanternTextures.amber,
        emissiveIntensity: isSelected ? 1.45 : 0.95,
        roughness: 0.4
      });

      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = lanternCenterY;
      bodyMesh.userData = {
        type: 'lantern',
        wishId: wish.id,
        wish,
        worldPos: new THREE.Vector3(x, y + lanternCenterY, z)
      };
      pivot.add(bodyMesh);
      this.interactiveTargets.push(bodyMesh);

      // Top & Bottom Wooden Caps
      const topCap = new THREE.Mesh(capGeo, this.woodMat);
      topCap.position.y = lanternCenterY + 0.28;
      pivot.add(topCap);

      const botCap = new THREE.Mesh(capGeo, this.woodMat);
      botCap.position.y = lanternCenterY - 0.28;
      pivot.add(botCap);

      // Optical Glow Sprite around each 3D Lantern
      const haloMat = new THREE.SpriteMaterial({
        map: this.glowTex,
        color: pal.hex,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const halo = new THREE.Sprite(haloMat);
      const haloScale = isSelected ? 2.1 : 1.45;
      halo.scale.set(haloScale, haloScale, 1);
      halo.position.y = lanternCenterY;
      pivot.add(halo);

      // Fluttering 3D Hanji Paper Wish Tag (소원지 꼬리표)
      const tagMat = new THREE.MeshBasicMaterial({
        color: 0xf5efe2,
        side: THREE.DoubleSide
      });
      const tagMesh = new THREE.Mesh(tagGeo, tagMat);
      tagMesh.position.y = lanternCenterY - 0.52;
      tagMesh.userData = bodyMesh.userData;
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

  /* ------------------------------------------------------------------------
     3D EFFECTS: WINDBELL SONIC RING & HAPJANG GOLDEN LOTUS EMBERS
     ------------------------------------------------------------------------ */
  exciteWindBell() {
    this.bellExcitation = 1.0;

    // Spawn expanding 3D golden sonic ring around the wind-bell
    const ringGeo = new THREE.RingGeometry(0.18, 0.24, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(5.35, 2.55, 1.15);
    this.fxRoot.add(ringMesh);
    this.sonicRings.push({ mesh: ringMesh, mat: ringMat, scale: 1, alpha: 0.9 });
  }

  spawnHapjangParticles3D(wishId) {
    const targetLantern = this.lanternMeshes.find((l) => l.wishId === wishId);
    const origin = targetLantern
      ? targetLantern.bodyMesh.userData.worldPos.clone()
      : new THREE.Vector3(0, 1.5, 1.0);

    for (let i = 0; i < 28; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: this.glowTex,
        color: i % 2 === 0 ? 0xfef08a : 0xf59e0b,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      const s = 0.22 + Math.random() * 0.28;
      sprite.scale.set(s, s, 1);
      sprite.position.set(
        origin.x + (Math.random() - 0.5) * 0.7,
        origin.y + (Math.random() - 0.5) * 0.4,
        origin.z + (Math.random() - 0.5) * 0.5
      );
      this.fxRoot.add(sprite);

      this.hapjangParticles.push({
        sprite,
        mat: spriteMat,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.7 + Math.random() * 1.1,
        vz: (Math.random() - 0.5) * 0.5,
        alpha: 0.98
      });
    }
  }

  /* ------------------------------------------------------------------------
     STATE TRANSITIONS: SPACE, TIME, FOLIAGE, CAMERA PRESETS & FOCUS
     ------------------------------------------------------------------------ */
  setSpace(space) {
    this.spaceMode = space;
    this.buseoksaGroup.visible = space === 'buseoksa';
    this.seonamsaGroup.visible = space === 'seonamsa';
    this.setCameraPreset(this.camPreset);
  }

  setTimeMode(timeKey) {
    this.timeMode = timeKey;
    const pal = TIME_PALETTES[timeKey] || TIME_PALETTES.sunset;

    this.skyUniforms.uTopColor.value.copy(pal.skyTop);
    this.skyUniforms.uMidColor.value.copy(pal.skyMid);
    this.skyUniforms.uHorizonColor.value.copy(pal.skyHorizon);
    this.skyUniforms.uSunPos.value.copy(pal.sunPos);
    this.skyUniforms.uSunColor.value.copy(pal.sunColor);

    this.scene.fog.color.copy(pal.fogColor);
    this.scene.fog.density = pal.fogDensity;

    this.ambientLight.color.copy(pal.ambientColor);
    this.ambientLight.intensity = pal.ambientIntensity;
    this.dirLight.color.copy(pal.dirColor);
    this.dirLight.intensity = pal.dirIntensity;
    this.dirLight.position.copy(pal.sunPos);

    this.starMat.opacity = pal.starOpacity;
    const isNight = timeKey === 'night';
    this.moonMesh.material.opacity = isNight ? 0.95 : 0;
    this.moonHalo.material.opacity = isNight ? 0.65 : 0;

    // Update cloud tint & opacity
    this.cloudPlanes.forEach((c) => {
      c.mat.color.copy(pal.cloudColor);
      c.mat.opacity = pal.cloudOpacity * 0.55;
    });

    // Update mountain ridge atmospheric colors per time of day
    const ridgeColorsByTime = {
      dawn: ['#202E3D', '#2B3E52', '#384F66', '#46617A', '#56748F', '#6B89A3'],
      sunset: ['#1F1626', '#2E1E33', '#3F2740', '#52304B', '#663B54', '#7C485E'],
      night: ['#090F1C', '#0E1729', '#142038', '#1A2946', '#213354', '#283D63']
    };
    const rCols = ridgeColorsByTime[timeKey] || ridgeColorsByTime.sunset;
    this.ridgeMaterials.forEach(({ mat, layerIndex }) => {
      mat.color.set(rCols[layerIndex] || rCols[0]);
    });

    // Update water shader colors
    if (this.waterUniforms) {
      this.waterUniforms.uDeepColor.value.copy(pal.waterDeep);
      this.waterUniforms.uShallowColor.value.copy(pal.waterShallow);
      this.waterUniforms.uSunColor.value.copy(pal.sunColor);
    }
  }

  setFoliageMode(foliageKey) {
    this.foliageMode = foliageKey;
    this.seonamsaTreeCanopies.forEach(({ mat, seed }) => {
      mat.color.copy(this.getFoliageColor(seed));
    });
    this.leafInstancedMat.color.set(foliageKey === 'autumn' ? 0xe86434 : 0xfbcfe8);
  }

  setCameraPreset(preset) {
    this.camPreset = preset;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.zoomOffset = 0;

    if (preset === 'closeup') {
      if (this.spaceMode === 'buseoksa') {
        this.desiredCamPos.set(1.6, 1.3, 4.2);
        this.desiredCamTarget.set(2.8, 0.8, -6.5);
      } else {
        this.desiredCamPos.set(0, 0.2, 3.8);
        this.desiredCamTarget.set(0, 0.4, -10.5);
      }
    } else if (preset === 'wide') {
      this.desiredCamPos.set(0, 0.8, 8.8);
      this.desiredCamTarget.set(0, 0.1, -18.0);
    } else {
      // 'default' borrowed scenery framing
      this.desiredCamPos.set(0, 0.45, 6.8);
      this.desiredCamTarget.set(0, 0.25, -14.0);
    }
  }

  focusOnLantern(wishId) {
    const item = this.lanternMeshes.find((l) => l.wishId === wishId);
    if (!item) return;
    const wp = item.bodyMesh.userData.worldPos;
    this.desiredCamPos.set(wp.x * 0.55, 1.4, 4.6);
    this.desiredCamTarget.set(wp.x, wp.y - 0.15, wp.z - 2.0);
  }

  /* ------------------------------------------------------------------------
     RAYCASTER & ORBIT MOUSE/TOUCH INTERACTION
     ------------------------------------------------------------------------ */
  initInteractionEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.pointerMoved = false;
      this.pointerStart.x = e.clientX;
      this.pointerStart.y = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      this.mouseNDC.x = (e.clientX / this.width) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / this.height) * 2 + 1;

      if (this.isPointerDown) {
        const dx = e.clientX - this.pointerStart.x;
        const dy = e.clientY - this.pointerStart.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          this.pointerMoved = true;
        }
        this.targetYaw = Math.max(-0.55, Math.min(0.55, this.targetYaw - dx * 0.0022));
        this.targetPitch = Math.max(-0.28, Math.min(0.32, this.targetPitch - dy * 0.0018));
        this.pointerStart.x = e.clientX;
        this.pointerStart.y = e.clientY;
        return;
      }

      this.checkHoverIntersection(e.clientX, e.clientY);
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      if (!this.pointerMoved && e.target === el) {
        this.handleSceneClick();
      }
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomOffset = Math.max(-2.6, Math.min(2.6, this.zoomOffset + e.deltaY * 0.0025));
      },
      { passive: false }
    );
  }

  checkHoverIntersection(clientX, clientY) {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveTargets, false);
    const tooltip = document.getElementById('lantern-3d-tooltip');

    if (hits.length > 0) {
      const hitObj = hits[0].object;
      const data = hitObj.userData;

      if (data.type === 'windbell' && this.spaceMode !== 'buseoksa') {
        this.clearHover(tooltip);
        return;
      }

      this.hoveredObject = hitObj;
      this.container.classList.add('pointer-hover');

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
    } else {
      this.clearHover(tooltip);
    }
  }

  clearHover(tooltip) {
    this.hoveredObject = null;
    this.container.classList.remove('pointer-hover');
    if (tooltip) tooltip.classList.remove('visible');
  }

  handleSceneClick() {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const hits = this.raycaster.intersectObjects(this.interactiveTargets, false);

    if (hits.length > 0) {
      const data = hits[0].object.userData;
      if (data.type === 'windbell' && this.spaceMode === 'buseoksa') {
        triggerBellRingInteraction();
        return;
      }
      if (data.type === 'lantern' && data.wishId) {
        openWishReader(data.wishId);
        return;
      }
    } else {
      closeWishReader();
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  /* ------------------------------------------------------------------------
     MAIN 3D ANIMATION LOOP
     ------------------------------------------------------------------------ */
  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    // 1. Smoothly interpolate camera position & orbit look
    this.orbitYaw += (this.targetYaw - this.orbitYaw) * 0.08;
    this.orbitPitch += (this.targetPitch - this.orbitPitch) * 0.08;

    const breathSwayX = Math.sin(elapsed * 0.35) * 0.08;
    const breathSwayY = Math.cos(elapsed * 0.28) * 0.05;

    const targetPosWithZoom = this.desiredCamPos.clone();
    targetPosWithZoom.z += this.zoomOffset;
    this.camPos.lerp(targetPosWithZoom, 0.05);
    this.camTarget.lerp(this.desiredCamTarget, 0.06);

    this.camera.position.set(
      this.camPos.x + breathSwayX + Math.sin(this.orbitYaw) * 3.2,
      this.camPos.y + breathSwayY + this.orbitPitch * 2.4,
      this.camPos.z
    );
    this.camera.lookAt(
      this.camTarget.x - this.orbitYaw * 4.5,
      this.camTarget.y + this.orbitPitch * 3.5,
      this.camTarget.z
    );

    // 2. Rotate night starfield gently
    if (this.starField) {
      this.starField.rotation.y = elapsed * 0.006;
    }

    // 3. Space 1: Animate Sea of Clouds, Stone Lantern flicker, and 3D Bronze Wind-Bell
    if (this.spaceMode === 'buseoksa') {
      for (const c of this.cloudPlanes) {
        c.mesh.position.x += c.speed * dt;
        c.mesh.position.y = c.baseY + Math.sin(elapsed * 0.4 + c.phase) * 0.22;
        if (c.mesh.position.x > 68) c.mesh.position.x = -68;
      }

      if (this.stoneLanternLight) {
        const flicker = 2.0 + Math.sin(elapsed * 7.5) * 0.25 + Math.cos(elapsed * 13.0) * 0.15;
        this.stoneLanternLight.intensity = flicker;
        if (this.stoneLanternHalo) {
          const hs = 2.6 + Math.sin(elapsed * 6.0) * 0.25;
          this.stoneLanternHalo.scale.set(hs, hs, 1);
        }
      }

      if (this.windBellPivot) {
        this.bellExcitation = Math.max(0, this.bellExcitation - dt * 0.42);
        const swayAmp = 0.045 + this.bellExcitation * 0.22;
        const swaySpeed = 1.8 + this.bellExcitation * 6.5;
        this.windBellPivot.rotation.z = Math.sin(elapsed * swaySpeed) * swayAmp;
        this.windBellPivot.rotation.x = Math.cos(elapsed * 1.3) * 0.03;

        if (this.windFishPivot) {
          this.windFishPivot.rotation.y = Math.sin(elapsed * 2.6) * (0.28 + this.bellExcitation * 0.8);
          this.windFishPivot.rotation.z = Math.cos(elapsed * 3.4) * (0.08 + this.bellExcitation * 0.25);
        }
      }
    }

    // 4. Space 2: Animate Valley Stream Shader
    if (this.spaceMode === 'seonamsa' && this.waterUniforms) {
      this.waterUniforms.uTime.value = elapsed;
    }

    // 5. Animate 3D Hanging Wish Lanterns (gentle pendulum sway + paper tag wave)
    for (const l of this.lanternMeshes) {
      l.pivot.rotation.z = Math.sin(elapsed * l.speed + l.phase) * 0.055;
      l.pivot.rotation.x = Math.cos(elapsed * (l.speed * 0.8) + l.phase) * 0.035;
      l.tagMesh.rotation.z = Math.sin(elapsed * 2.4 + l.phase) * 0.14;
      l.tagMesh.rotation.y = Math.cos(elapsed * 1.7 + l.phase) * 0.25;
    }

    // 6. Animate 3D Falling Petals / Maple Leaves
    const activeLeaves = this.spaceMode === 'seonamsa' ? this.leafCount : 36;
    for (let i = 0; i < this.leafCount; i++) {
      if (i >= activeLeaves) {
        this.leafDummy.scale.setScalar(0);
        this.leafDummy.updateMatrix();
        this.leafInstancedMesh.setMatrixAt(i, this.leafDummy.matrix);
        continue;
      }
      const d = this.leafData[i];
      d.x += (d.vx + Math.sin(elapsed * 1.5 + d.phase) * 0.45) * dt;
      d.y += d.vy * dt;
      d.z += d.vz * dt;
      d.rx += d.spin * dt;
      d.ry += d.spin * 0.8 * dt;

      if (d.y < -3.4 || d.x > 16) {
        d.x = -14 + Math.random() * 20;
        d.y = 4.5 + Math.random() * 4.0;
        d.z = -14 + Math.random() * 18;
      }

      this.leafDummy.position.set(d.x, d.y, d.z);
      this.leafDummy.rotation.set(d.rx, d.ry, 0);
      this.leafDummy.scale.setScalar(1);
      this.leafDummy.updateMatrix();
      this.leafInstancedMesh.setMatrixAt(i, this.leafDummy.matrix);
    }
    this.leafInstancedMesh.instanceMatrix.needsUpdate = true;

    // 7. Animate Expanding Sonic Rings & Hapjang Particles
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
      p.alpha -= dt * 0.48;
      p.mat.opacity = Math.max(0, p.alpha);
      if (p.alpha <= 0) {
        this.fxRoot.remove(p.sprite);
        this.hapjangParticles.splice(i, 1);
      }
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
let currentTime = 'sunset';
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
  const spaceWishes = wishes.filter((w) => w.space === currentSpace);
  const buseoksaCount = wishes.filter((w) => w.space === 'buseoksa').length;
  const seonamsaCount = wishes.filter((w) => w.space === 'seonamsa').length;

  document.getElementById('count-buseoksa').textContent = buseoksaCount;
  document.getElementById('count-seonamsa').textContent = seonamsaCount;

  if (world3D) {
    world3D.rebuild3DLanterns(spaceWishes, activeWishId);
  }
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
  document.getElementById('reader-date').textContent = wish.date || '2026.11.02';
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
  const meta = SPACE_META[currentSpace];
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
  if (targetSpace === currentSpace) return;
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

  if (world3D) {
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
  document.querySelectorAll('[data-cam-btn]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.camBtn === preset);
  });
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
    showToast('풍경멍 모드입니다. 마우스 드래그로 3D 풍경을 둘러보세요 (Esc/Space로 복귀).');
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
  world3D.animate();

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
      mixerPanel.classList.remove('open');
      if (document.body.classList.contains('zen-mode')) {
        toggleZenMode(false);
      }
    } else if (e.key === ' ' && !isTyping) {
      e.preventDefault();
      toggleZenMode();
    } else if (e.key === 'ArrowRight' && activeWishId && !isTyping) {
      navigateWish(1);
    } else if (e.key === 'ArrowLeft' && activeWishId && !isTyping) {
      navigateWish(-1);
    }
  });
});
