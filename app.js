/**
 * 차경(借景) 3D — 한국 명승 산사 '풍경 멍' 힐링 웹 프로토타입 (부석사 무량수전 단일 공간 & 모바일 발열 최적화 버전)
 * - 그래픽 엔진: Three.js r180 + 실사 PBR 7종 표면 재질(createSurfaceManager) + 360° 산림 파노라마 & 호라이즌 블렌딩 + 3D 소나무(pine.glb)
 * - 공간 (영주 부석사 무량수전 앞마당): 배흘림기둥·우물마루·처마 서까래·무량수전 현판·석등·안양루·소백산맥 능선과 실시간 운해·처마 끝 3D 풍경종·소원 연등
 */

const C_ENGINE = window.SANSA_CORE;

const STORAGE_KEY = 'chakyeong_3d_wishes_v2';
const HAPJANG_STORAGE_KEY = 'chakyeong_3d_hapjang_v2';

const SPACE_META = {
  buseoksa: {
    eyebrow: '차경(借景) 3D · 영주 부석사',
    title: '부석사 무량수전과 안양루',
    caption: '광활한 박석 마당과 안양루 처마 너머로 시원하게 펼쳐지는 소백산맥의 능선과 운해',
    locationBadge: '부석사 안양루 처마 밑',
    writeDesc: '소백산맥이 내려다보이는 안양루 처마 밑에 3D 연등을 매달아 바람에 소원을 실어 보냅니다.',
    defaultBellMix: 80,
    defaultWaterMix: 20,
    defaultWindMix: 65
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
  }
];

/* ==========================================================================
   PROCEDURAL WEB AUDIO SOUNDSCAPE ENGINE (풍경종 · 계곡물 · 산바람)
   ========================================================================== */
class SanSaAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.bellLevel = 0.80;
    this.waterLevel = 0.20;
    this.windLevel = 0.65;

    this.waterGain = null;
    this.windGain = null;
    this.masterGain = null;
    this.autoBellTimer = null;

    // Pure HTML5 Audio playback for uploaded templebell.wav repeating every 30 seconds
    this.bellWavUrl = 'templebell.wav';
    this.bellRepeatIntervalSec = 30;
    this.bellRepeatTimer = null;

    this.bellLoopAudio = new Audio(this.bellWavUrl);
    this.bellLoopAudio.loop = false;
    this.bellLoopAudio.preload = 'auto';
    this.bellLoopAudio.volume = this.bellLevel;

    // Loop back to 0s as soon as playback reaches 30 seconds
    this.bellLoopAudio.addEventListener('timeupdate', () => {
      if (this.isPlaying && this.bellLoopAudio.currentTime >= this.bellRepeatIntervalSec) {
        this.bellLoopAudio.currentTime = 0;
        this.bellLoopAudio.play().catch(() => {});
        if (world3D) world3D.exciteWindBell();
      }
    });

    this.bellOnceAudio = new Audio(this.bellWavUrl);
    this.bellOnceAudio.loop = false;
    this.bellOnceAudio.preload = 'auto';
    this.bellOnceAudio.volume = this.bellLevel;
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

  startBellRepeatCycle() {
    this.stopBellRepeatCycle();
    this.bellLoopAudio.currentTime = 0;
    this.bellLoopAudio.volume = Math.max(0, Math.min(1, this.bellLevel));
    this.bellLoopAudio.play().catch((err) => console.warn('templebell.wav play blocked:', err));

    // Repeat templebell.wav every 30 seconds (30,000ms)
    this.bellRepeatTimer = setInterval(() => {
      if (!this.isPlaying) return;
      this.bellLoopAudio.currentTime = 0;
      this.bellLoopAudio.volume = Math.max(0, Math.min(1, this.bellLevel));
      this.bellLoopAudio.play().catch(() => {});
      if (world3D) world3D.exciteWindBell();
    }, this.bellRepeatIntervalSec * 1000);
  }

  stopBellRepeatCycle() {
    if (this.bellRepeatTimer) {
      clearInterval(this.bellRepeatTimer);
      this.bellRepeatTimer = null;
    }
    this.bellLoopAudio.pause();
  }

  toggle() {
    this.initContext();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = !this.isPlaying;
    this.updateContinuousVolumes();

    if (this.isPlaying) {
      this.bellOnceAudio.pause();
      this.startBellRepeatCycle();
      this.scheduleNextAutoBell();
    } else {
      this.stopBellRepeatCycle();
      if (this.autoBellTimer) {
        clearTimeout(this.autoBellTimer);
        this.autoBellTimer = null;
      }
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
    this.bellLoopAudio.volume = Math.max(0, Math.min(1, this.bellLevel));
    this.bellOnceAudio.volume = Math.max(0.25, Math.min(1, this.bellLevel));

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

    const intervalMs = 5000 + Math.random() * 5500;
    this.autoBellTimer = setTimeout(() => {
      if (this.isPlaying && this.bellLevel > 0.02) {
        if (world3D) world3D.exciteWindBell();
      }
      this.scheduleNextAutoBell();
    }, intervalMs);
  }

  /**
   * Plays only the original uploaded templebell.wav file with zero synthetic sound or pitch alteration.
   */
  strikeWindBell(intensity = 0.85) {
    const vol = Math.max(0.25, Math.min(1, intensity * Math.max(0.45, this.bellLevel)));

    // If ambient loop is already playing templebell.wav, do not stack another audio stream on top
    if (this.isPlaying && !this.bellLoopAudio.paused) {
      this.bellLoopAudio.volume = Math.max(this.bellLoopAudio.volume, vol);
      return;
    }

    try {
      this.bellOnceAudio.pause();
      this.bellOnceAudio.currentTime = 0.50;
      this.bellOnceAudio.volume = vol;
      this.bellOnceAudio.play().catch((err) => console.warn('templebell.wav play blocked:', err));
    } catch (err) {
      console.warn('Error playing templebell.wav:', err);
    }
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

  static createForestCanopyTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep Korean mountain forest base (소백산·봉황산 짙은 녹음 베이스)
    const baseGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    baseGrad.addColorStop(0, '#2f4f28');
    baseGrad.addColorStop(0.5, '#254220');
    baseGrad.addColorStop(1, '#1a3017');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Layered sunlit tree crowns & pine/broad-leaf foliage clusters
    const crownColors = [
      'rgba(24, 44, 20, 0.72)',
      'rgba(38, 66, 31, 0.68)',
      'rgba(52, 86, 42, 0.62)',
      'rgba(68, 106, 52, 0.48)',
      'rgba(88, 126, 64, 0.34)'
    ];
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 4200; i++) {
      const cx = rand() * 1024;
      const cy = rand() * 1024;
      const rx = 8 + rand() * 26;
      const ry = 6 + rand() * 18;
      const cIdx = Math.min(crownColors.length - 1, Math.floor(rand() * crownColors.length));
      ctx.fillStyle = crownColors[cIdx];
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, (rand() - 0.5) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new C_ENGINE.CanvasTexture(canvas);
    tex.colorSpace = C_ENGINE.SRGBColorSpace;
    tex.wrapS = C_ENGINE.RepeatWrapping;
    tex.wrapT = C_ENGINE.RepeatWrapping;
    tex.repeat.set(6, 3);
    return tex;
  }

  static createSobaeksanVistaTexture(onPhotoLoaded) {
    const W = 2560;
    const H = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Apply soft alpha feathering at the left, right, top, and bottom edges of the forward vista
    // so it blends invisibly into the 3D pine forest & 360° woodland without any awkward blue side-stripes.
    const applyEdgeAlphaFeather = () => {
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;
      for (let y = 0; y < H; y++) {
        const v = y / H; // 0 at top of sky, 1 at bottom of valley
        let alphaY = 1.0;
        if (v < 0.04) {
          alphaY = v / 0.04;
          alphaY = alphaY * alphaY * (3 - 2 * alphaY);
        } else if (v > 0.90) {
          alphaY = (1.0 - v) / 0.10;
          alphaY = alphaY * alphaY * (3 - 2 * alphaY);
        }

        for (let x = 0; x < W; x++) {
          const u = x / W; // 0 at left edge, 1 at right edge
          let alphaX = 1.0;
          if (u < 0.09) {
            alphaX = u / 0.09;
            alphaX = alphaX * alphaX * (3 - 2 * alphaX);
          } else if (u > 0.91) {
            alphaX = (1.0 - u) / 0.09;
            alphaX = alphaX * alphaX * (3 - 2 * alphaX);
          }

          if (alphaX < 1.0 || alphaY < 1.0) {
            const idx = (y * W + x) * 4;
            data[idx + 3] = Math.round(data[idx + 3] * alphaX * alphaY);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    const drawGreenForestLowerBase = () => {
      // Lush dark-green mountain forest canopy in the lower portion (behind 3D Anyangru & stone terrace)
      const forestGrad = ctx.createLinearGradient(0, H * 0.48, 0, H);
      forestGrad.addColorStop(0, '#32542b');
      forestGrad.addColorStop(0.35, '#284522');
      forestGrad.addColorStop(0.75, '#1f371a');
      forestGrad.addColorStop(1, '#172913');
      ctx.fillStyle = forestGrad;
      ctx.fillRect(0, Math.floor(H * 0.48), W, Math.ceil(H * 0.52));

      let fSeed = 9001;
      const fRand = () => {
        fSeed = (fSeed * 16807) % 2147483647;
        return (fSeed - 1) / 2147483646;
      };
      const canopyShades = [
        'rgba(30, 52, 25, 0.65)',
        'rgba(44, 72, 36, 0.58)',
        'rgba(60, 94, 47, 0.50)',
        'rgba(78, 114, 58, 0.38)',
        'rgba(22, 39, 18, 0.62)'
      ];
      for (let i = 0; i < 4200; i++) {
        const cx = fRand() * W;
        const cy = H * 0.50 + fRand() * (H * 0.50);
        const rx = 10 + fRand() * 26;
        const ry = 7 + fRand() * 16;
        ctx.fillStyle = canopyShades[Math.floor(fRand() * canopyShades.length)];
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tex = new C_ENGINE.CanvasTexture(canvas);
    tex.colorSpace = C_ENGINE.SRGBColorSpace;

    // Load the real photograph ("부석사 소백산맥 원거리 배경.jpg") across the full forward vista width
    const refImg = new Image();
    refImg.crossOrigin = 'anonymous';
    refImg.onload = () => {
      try {
        ctx.clearRect(0, 0, W, H);
        drawGreenForestLowerBase();

        // Draw upper 62% of "부석사 소백산맥 원거리 배경.jpg" (real blue sky, cumulus clouds, Sobaeksan ridges & green hills)
        // across 100% of the forward vista width (W)
        const off = document.createElement('canvas');
        const destH = Math.round(H * 0.72);
        off.width = W;
        off.height = destH;
        const octx = off.getContext('2d');

        const srcCropH = Math.round(refImg.height * 0.60);
        octx.drawImage(refImg, 0, 0, refImg.width, srcCropH, 0, 0, W, destH);

        // Feather the bottom of the cropped photo right across the green mid-ground hills
        // so the 2D photo Anyangru roof (below 55% of photo) is cleanly replaced by green forest + 3D Anyangru
        const imgData = octx.getImageData(0, 0, W, destH);
        const data = imgData.data;

        for (let y = 0; y < destH; y++) {
          const v = y / destH;
          for (let x = 0; x < W; x++) {
            const u = x / W;

            let fadeStart = 0.84;
            let fadeEnd = 0.95;
            if (u < 0.46) {
              fadeStart = 0.76;
              fadeEnd = 0.88;
            } else if (u > 0.66) {
              fadeStart = 0.86;
              fadeEnd = 0.97;
            }

            if (v > fadeStart) {
              let alphaY = Math.max(0, Math.min(1, 1.0 - (v - fadeStart) / (fadeEnd - fadeStart)));
              alphaY = alphaY * alphaY * (3 - 2 * alphaY);
              const idx = (y * W + x) * 4;
              data[idx + 3] = Math.round(data[idx + 3] * alphaY);
            }
          }
        }

        octx.putImageData(imgData, 0, 0);
        ctx.drawImage(off, 0, 0);

        // Feather outer left/right/top/bottom edges so there is never a sharp blue border on the sides
        applyEdgeAlphaFeather();

        tex.needsUpdate = true;
        if (typeof onPhotoLoaded === 'function') onPhotoLoaded(tex);
      } catch (err) {
        console.warn('Sobaeksan vista photo composite fallback:', err);
      }
    };
    refImg.src = encodeURI('부석사 소백산맥 원거리 배경.jpg');

    return tex;
  }

  /**
   * Generates a photorealistic Korean Traditional Giwa Roof Tile (전통 수키와·암키와 기왓골)
   * Diffuse Color Map + 3D Relief Bump Map so Muryangsujeon & Anyangru roofs look deeply authentic.
   */
  static createRealisticGiwaRoofTexture() {
    const W = 1024;
    const H = 1024;
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = W;
    colorCanvas.height = H;
    const ctx = colorCanvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = W;
    bumpCanvas.height = H;
    const bctx = bumpCanvas.getContext('2d');

    // 1. Base charcoal-slate clay fill
    ctx.fillStyle = '#2d3336';
    ctx.fillRect(0, 0, W, H);
    bctx.fillStyle = '#606060';
    bctx.fillRect(0, 0, W, H);

    // 16 vertical columns of Am-giwa (concave pan tiles) + Su-giwa (convex semi-cylindrical ridge tiles)
    const cols = 16;
    const colW = W / cols; // 64px per course
    const rows = 16;
    const rowH = H / rows; // 64px per tile length

    let seed = 4219;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let c = 0; c < cols; c++) {
      const x0 = c * colW;
      const suW = colW * 0.36; // Convex ridge width
      const amW = colW - suW;  // Concave pan width

      // Draw Am-giwa (concave pan valley) with horizontal overlapping tile joints
      for (let r = 0; r < rows; r++) {
        const y0 = r * rowH;
        const shade = (rand() - 0.5) * 10;
        const baseR = Math.round(44 + shade);
        const baseG = Math.round(50 + shade);
        const baseB = Math.round(53 + shade);

        const amGrad = ctx.createLinearGradient(x0, 0, x0 + amW, 0);
        amGrad.addColorStop(0.0, `rgb(${baseR - 12}, ${baseG - 12}, ${baseB - 12})`);
        amGrad.addColorStop(0.25, `rgb(${baseR + 4}, ${baseG + 5}, ${baseB + 6})`);
        amGrad.addColorStop(0.5, `rgb(${baseR + 10}, ${baseG + 12}, ${baseB + 14})`);
        amGrad.addColorStop(0.75, `rgb(${baseR + 3}, ${baseG + 4}, ${baseB + 5})`);
        amGrad.addColorStop(1.0, `rgb(${baseR - 14}, ${baseG - 14}, ${baseB - 14})`);
        ctx.fillStyle = amGrad;
        ctx.fillRect(x0, y0, amW, rowH);

        // Concave bump gradient for Am-giwa
        const bAmGrad = bctx.createLinearGradient(x0, 0, x0 + amW, 0);
        bAmGrad.addColorStop(0.0, '#525252');
        bAmGrad.addColorStop(0.5, '#282828');
        bAmGrad.addColorStop(1.0, '#525252');
        bctx.fillStyle = bAmGrad;
        bctx.fillRect(x0, y0, amW, rowH);

        // Horizontal overlap step shadow at bottom of each Am-giwa tile
        ctx.fillStyle = 'rgba(10, 13, 15, 0.72)';
        ctx.fillRect(x0, y0 + rowH - 5, amW, 5);
        ctx.fillStyle = 'rgba(130, 142, 148, 0.25)';
        ctx.fillRect(x0, y0 + rowH - 7, amW, 2);

        bctx.fillStyle = '#121212';
        bctx.fillRect(x0, y0 + rowH - 5, amW, 5);
        bctx.fillStyle = '#888888';
        bctx.fillRect(x0, y0, amW, 4);
      }

      // Draw Su-giwa (convex semi-cylindrical ridge tile) with deep side AO shadows
      const sx0 = x0 + amW;
      // Ambient occlusion shadow cast onto adjacent Am-giwa
      ctx.fillStyle = 'rgba(8, 10, 12, 0.58)';
      ctx.fillRect(sx0 - 5, 0, 5, H);
      ctx.fillRect(sx0 + suW, 0, 5, H);

      for (let r = 0; r < rows; r++) {
        const y0 = r * rowH;
        const tone = (rand() - 0.5) * 12;
        const sr = Math.round(58 + tone);
        const sg = Math.round(65 + tone);
        const sb = Math.round(68 + tone);

        const suGrad = ctx.createLinearGradient(sx0, 0, sx0 + suW, 0);
        suGrad.addColorStop(0.0, `rgb(${sr - 22}, ${sg - 22}, ${sb - 22})`);
        suGrad.addColorStop(0.28, `rgb(${sr + 14}, ${sg + 16}, ${sb + 18})`);
        suGrad.addColorStop(0.48, `rgb(${sr + 28}, ${sg + 31}, ${sb + 34})`);
        suGrad.addColorStop(0.72, `rgb(${sr + 8}, ${sg + 10}, ${sb + 12})`);
        suGrad.addColorStop(1.0, `rgb(${sr - 24}, ${sg - 24}, ${sb - 24})`);
        ctx.fillStyle = suGrad;
        ctx.fillRect(sx0, y0, suW, rowH);

        // Convex high bump gradient for Su-giwa
        const bSuGrad = bctx.createLinearGradient(sx0, 0, sx0 + suW, 0);
        bSuGrad.addColorStop(0.0, '#686868');
        bSuGrad.addColorStop(0.5, '#ffffff');
        bSuGrad.addColorStop(1.0, '#686868');
        bctx.fillStyle = bSuGrad;
        bctx.fillRect(sx0, y0, suW, rowH);

        // Su-giwa joint ring (언강·연결 마디)
        ctx.fillStyle = 'rgba(12, 15, 18, 0.78)';
        ctx.fillRect(sx0, y0 + rowH - 5, suW, 5);
        ctx.fillStyle = 'rgba(185, 198, 204, 0.35)';
        ctx.fillRect(sx0 + 2, y0 + rowH - 8, suW - 4, 3);

        bctx.fillStyle = '#303030';
        bctx.fillRect(sx0, y0 + rowH - 4, suW, 4);
      }
    }

    // Subtle weathered lichen / mountain moss micro-accents on aged roof tiles
    for (let i = 0; i < 650; i++) {
      const mx = rand() * W;
      const my = rand() * H;
      const mr = 2 + rand() * 8;
      ctx.fillStyle =
        rand() > 0.45 ? 'rgba(92, 110, 82, 0.08)' : 'rgba(180, 186, 178, 0.05)';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }

    const colorMap = new C_ENGINE.CanvasTexture(colorCanvas);
    colorMap.colorSpace = C_ENGINE.SRGBColorSpace;
    colorMap.wrapS = C_ENGINE.RepeatWrapping;
    colorMap.wrapT = C_ENGINE.RepeatWrapping;
    colorMap.anisotropy = 8;

    const bumpMap = new C_ENGINE.CanvasTexture(bumpCanvas);
    bumpMap.wrapS = C_ENGINE.RepeatWrapping;
    bumpMap.wrapT = C_ENGINE.RepeatWrapping;
    bumpMap.anisotropy = 8;

    return { colorMap, bumpMap };
  }

  /**
   * Generates a realistic 7-lobed Korean Autumn Maple Leaf (단풍잎) alpha-cutout texture
   * with organic serrated lobes, golden-crimson gradient, leaf veins (잎맥), and petiole stem.
   */
  static createRealisticMapleLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 256);
    ctx.save();
    ctx.translate(128, 142);

    // Draw slender petiole stem (잎자루)
    ctx.strokeStyle = '#8c3318';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.quadraticCurveTo(4, 48, 12, 92);
    ctx.stroke();

    // 7-lobed Korean Maple (당단풍/내장단풍) silhouette path
    const lobes = [
      { angle: -Math.PI * 0.82, len: 58, width: 15 },
      { angle: -Math.PI * 0.56, len: 92, width: 22 },
      { angle: -Math.PI * 0.28, len: 112, width: 25 },
      { angle: 0, len: 124, width: 27 },
      { angle: Math.PI * 0.28, len: 112, width: 25 },
      { angle: Math.PI * 0.56, len: 92, width: 22 },
      { angle: Math.PI * 0.82, len: 58, width: 15 }
    ];

    ctx.beginPath();
    ctx.moveTo(0, 12);

    lobes.forEach((lobe, idx) => {
      const a = lobe.angle - Math.PI / 2;
      const tipX = Math.cos(a) * lobe.len;
      const tipY = Math.sin(a) * lobe.len;

      const leftA = a - 0.16;
      const rightA = a + 0.16;
      const midLen = lobe.len * 0.64;

      const lx = Math.cos(leftA) * midLen;
      const ly = Math.sin(leftA) * midLen;
      const rx = Math.cos(rightA) * midLen;
      const ry = Math.sin(rightA) * midLen;

      // Serrated side notch going out to the sharp maple lobe tip
      ctx.quadraticCurveTo(lx * 0.75, ly * 0.75, lx, ly);
      ctx.quadraticCurveTo(
        Math.cos(a - 0.06) * (lobe.len * 0.88),
        Math.sin(a - 0.06) * (lobe.len * 0.88),
        tipX,
        tipY
      );
      ctx.quadraticCurveTo(
        Math.cos(a + 0.06) * (lobe.len * 0.88),
        Math.sin(a + 0.06) * (lobe.len * 0.88),
        rx,
        ry
      );

      // Deep sinus valley between adjacent lobes
      if (idx < lobes.length - 1) {
        const nextA = lobes[idx + 1].angle - Math.PI / 2;
        const valleyA = (a + nextA) * 0.5;
        const valleyLen = Math.min(lobe.len, lobes[idx + 1].len) * 0.36;
        ctx.quadraticCurveTo(
          Math.cos(valleyA) * (valleyLen * 1.15),
          Math.sin(valleyA) * (valleyLen * 1.15),
          Math.cos(valleyA) * valleyLen,
          Math.sin(valleyA) * valleyLen
        );
      }
    });

    ctx.closePath();

    // Rich sunlit autumn leaf gradient (tinted per-instance via InstancedMesh instanceColor)
    const leafGrad = ctx.createRadialGradient(0, -18, 8, 0, -24, 125);
    leafGrad.addColorStop(0.0, '#fff2b2');
    leafGrad.addColorStop(0.35, '#ffbe55');
    leafGrad.addColorStop(0.75, '#f26d35');
    leafGrad.addColorStop(1.0, '#b82514');
    ctx.fillStyle = leafGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(110, 22, 10, 0.55)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Delicate primary & secondary leaf veins (잎맥)
    ctx.strokeStyle = 'rgba(255, 238, 175, 0.52)';
    ctx.lineWidth = 1.8;
    lobes.forEach((lobe) => {
      const a = lobe.angle - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(Math.cos(a) * (lobe.len * 0.88), Math.sin(a) * (lobe.len * 0.88));
      ctx.stroke();
    });

    ctx.restore();

    const tex = new C_ENGINE.CanvasTexture(canvas);
    tex.colorSpace = C_ENGINE.SRGBColorSpace;
    return tex;
  }
}

/* ==========================================================================
   REAL-TIME 3D CHAKYEONG WORLD ENGINE (Three.js r180 + Photorealistic PBR)
   ========================================================================== */
class Chakyeong3DWorld {
  static getAutoTimeMode() {
    const hour = new Date().getHours();
    const min = new Date().getMinutes();
    const decimalHour = hour + min / 60;
    if (decimalHour >= 6.0 && decimalHour < 17.0) {
      return 'dawn'; // 아침·낮 청명한 운해 산사
    } else if (decimalHour >= 17.0 && decimalHour < 19.5) {
      return 'sunset'; // 해질녘 석양 노을 산사
    }
    return 'night'; // 밤·새벽 별빛 산사
  }

  constructor(container) {
    this.container = container;
    this.width = container.clientWidth || window.innerWidth;
    this.height = container.clientHeight || window.innerHeight;
    this.isMobile = this.width < 768;

    this.spaceMode = 'buseoksa';
    this.timeMode = Chakyeong3DWorld.getAutoTimeMode();
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

    this.camPos = new C_ENGINE.Vector3(0, 2.55, 8.5);
    this.camLook = new C_ENGINE.Vector3(0, 2.15, -22);
    this.targetCamPos = this.camPos.clone();
    this.targetCamLook = this.camLook.clone();

    this.lanternMeshes = [];
    this.interactiveTargets = [];
    this.cloudPlanes = [];
    this.buseoksaPineAnchors = [];
    this.seasonalCanopies = [];
    this.sonicRings = [];
    this.hapjangParticles = [];
    this.bellExcitation = 0;
    this.horizonUpdaters = [];
    this.windUniform = { value: 0 };

    this.mouseNDC = new C_ENGINE.Vector2(-99, -99);
    this.raycaster = new C_ENGINE.Raycaster();
    this.lastFrameTime = performance.now();
    this.lastRenderTime = 0;
    this.isPageHidden = document.hidden || false;

    this.initRendererAndScene();
    this.initMaterials();
    this.initSkyStarsAndMoon();
    this.buildBuseoksaWorld();
    this.initInteractiveWindBell();
    this.initFallingFoliage3D();
    this.loadPhotorealisticAssets();

    this.setSpace('buseoksa', true);
    this.setTimeMode(this.timeMode);
    this.bindViewportEvents();

    window.addEventListener('resize', () => this.onResize());
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.onResize());
    }
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.onResize());
      this.resizeObserver.observe(this.container);
    }
    document.addEventListener('visibilitychange', () => {
      this.isPageHidden = document.hidden;
      if (!this.isPageHidden) {
        this.lastFrameTime = performance.now();
      }
    });
    this.animate();
  }

  initRendererAndScene() {
    this.scene = new C_ENGINE.Scene();
    this.scene.fog = new C_ENGINE.Fog(0xd8e4df, 48, 235);

    const aspect = this.width / Math.max(1, this.height);
    const baseFov = aspect < 0.85 ? 58 : 48;
    this.camera = new C_ENGINE.PerspectiveCamera(baseFov, aspect, 0.15, 450);

    // Mobile thermal & battery optimization:
    // - Disable hardware MSAA on mobile high-DPI screens
    // - Use default power preference instead of forcing high-performance GPU boost
    // - Cap mobile pixelRatio to 1.25x and use lightweight PCFShadowMap (1024px)
    this.renderer = new C_ENGINE.WebGLRenderer({
      antialias: !this.isMobile,
      powerPreference: this.isMobile ? 'default' : 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.25 : 2));
    this.renderer.outputColorSpace = C_ENGINE.SRGBColorSpace;
    this.renderer.toneMapping = C_ENGINE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.04;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isMobile
      ? C_ENGINE.PCFShadowMap
      : C_ENGINE.PCFSoftShadowMap;
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
    this.sunLight.position.set(-28, 38, -24);
    this.sunLight.castShadow = true;
    const shadowRes = this.isMobile ? 1024 : 2048;
    this.sunLight.shadow.mapSize.set(shadowRes, shadowRes);
    this.sunLight.shadow.camera.near = 4;
    this.sunLight.shadow.camera.far = 140;
    this.sunLight.shadow.camera.left = -42;
    this.sunLight.shadow.camera.right = 42;
    this.sunLight.shadow.camera.top = 42;
    this.sunLight.shadow.camera.bottom = -42;
    this.sunLight.shadow.bias = -0.00035;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Warm under-eave fill light for Buseoksa veranda & Anyangru
    this.eaveFillLight = new C_ENGINE.PointLight(0xffb86b, 1.5, 32, 1.5);
    this.eaveFillLight.position.set(0, 4.2, -16.5);
    this.scene.add(this.eaveFillLight);

    this.buseoksaGroup = new C_ENGINE.Group();
    this.lanternsRoot = new C_ENGINE.Group();
    this.fxRoot = new C_ENGINE.Group();

    this.scene.add(this.buseoksaGroup);
    this.scene.add(this.lanternsRoot);
    this.scene.add(this.fxRoot);
  }

  initMaterials() {
    this.glowTex = TextureFactory.createGlowTexture();
    this.cloudTex = TextureFactory.createCloudTexture();
    this.contactShadowTex = TextureFactory.createContactShadowTexture();
    this.dancheongCapTex = TextureFactory.createDancheongCapTexture();
    this.forestCanopyTex = TextureFactory.createForestCanopyTexture();
    this.sobaeksanVistaTex = TextureFactory.createSobaeksanVistaTexture();
    this.giwaTexSet = TextureFactory.createRealisticGiwaRoofTexture();
    this.mapleLeafTex = TextureFactory.createRealisticMapleLeafTexture();

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
    // High-definition Korean Traditional Giwa Roof Material (preserves custom tile course UVs & 3D bump relief)
    this.matRealisticGiwa = new C_ENGINE.MeshStandardMaterial({
      map: this.giwaTexSet.colorMap,
      bumpMap: this.giwaTexSet.bumpMap,
      bumpScale: 0.09,
      color: 0xd8dedc,
      roughness: 0.72,
      metalness: 0.08,
      side: C_ENGINE.DoubleSide,
      vertexColors: true
    });
    this.matGiwaRoof = new C_ENGINE.MeshStandardMaterial({
      color: 0x3b4143,
      roughness: 0.78,
      metalness: 0.08,
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

    // Lush Korean Mountain Forest Green Canopy Materials (봉황산·소백산 녹음 수관)
    this.greenCanopyMaterials = [
      new C_ENGINE.MeshStandardMaterial({ color: 0x2d4d26, roughness: 0.90, vertexColors: true }),
      new C_ENGINE.MeshStandardMaterial({ color: 0x3b6032, roughness: 0.88, vertexColors: true }),
      new C_ENGINE.MeshStandardMaterial({ color: 0x4b743f, roughness: 0.88, vertexColors: true })
    ];
    this.greenCanopyMaterials.forEach((m) => this.attachWindSwayShader(m, 0.06));

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
    if (!opts.preserveUvs && material !== this.matRealisticGiwa) {
      this.trackedGeometries.push({ geometry, material });
    }

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

    // 1. Load 360° Natural Woodland Mountain Panorama & apply to scene background + horizon shaders
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
            surfaceMgr.apply(this.buseoksaGroundMat, 'ground', { tint: '#c5c2af', normal: 0.42 });
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
    const rawTemplates = candidates.length > 0 ? candidates : [gltf.scene];

    let baseTwigMat = null;
    let baseBarkMat = null;

    // 1. Normalize each scanned tree template so its trunk base is centered at (0, 0, 0)
    //    (Fixes the Blender export X-offsets of +1.0m / +2.025m so rotating a tree never shifts its world position)
    const normalizedTemplates = rawTemplates.map((tpl) => {
      const clone = tpl.clone(true);
      clone.position.set(0, 0, 0);
      clone.rotation.set(0, 0, 0);
      clone.scale.set(1, 1, 1);

      const holder = new C_ENGINE.Group();
      holder.add(clone);
      holder.updateMatrixWorld(true);

      const box = new C_ENGINE.Box3().setFromObject(holder);
      const center = box.getCenter(new C_ENGINE.Vector3());
      const rawHeight = Math.max(0.5, box.max.y - box.min.y);

      clone.position.set(-center.x, -box.min.y, -center.z);
      holder.updateMatrixWorld(true);

      clone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = !this.isMobile;
          child.receiveShadow = !this.isMobile;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (!m) return;
            if (m.name && m.name.includes('twig')) {
              m.alphaTest = 0.42;
              m.side = C_ENGINE.DoubleSide;
              m.roughness = 0.88;
              m.envMapIntensity = 0.32;
              this.attachWindSwayShader(m, 0.008);
              if (!baseTwigMat) baseTwigMat = m;
            } else if (m.name && m.name.includes('bark')) {
              m.roughness = 0.92;
              m.envMapIntensity = 0.25;
              if (!baseBarkMat) baseBarkMat = m;
            }
          });
        }
      });

      return { node: holder, rawHeight };
    });

    // 2. Create natural botanical foliage tint variants of the real scanned twig material
    //    (Preserves 100% of the scanned WebP leaf/needle diffuse, normal, roughness & alpha mask)
    const pineTintPalette = [0xffffff, 0xe8f4e0, 0xd6ebd0, 0xc8e2c2];
    const pineTwigMats = pineTintPalette.map((hex) => {
      if (!baseTwigMat) return null;
      const m = baseTwigMat.clone();
      m.color.setHex(hex);
      this.attachWindSwayShader(m, 0.008);
      return m;
    });

    // Subtle natural seasonal twig materials for distant seasonal accents
    this.scannedSeasonalTwigMats = [0xd88c52, 0xc96b43, 0xe2ab5a].map((hex) => {
      if (!baseTwigMat) return null;
      const m = baseTwigMat.clone();
      m.color.setHex(hex);
      this.attachWindSwayShader(m, 0.009);
      return m;
    });
    this.setFoliageMode(this.foliageMode);

    const applyTwigMaterial = (rootObj, twigMat) => {
      if (!twigMat) return;
      rootObj.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m) =>
              m && m.name && m.name.includes('twig') ? twigMat : m
            );
          } else if (child.material.name && child.material.name.includes('twig')) {
            child.material = twigMat;
          }
        }
      });
    };

    // 3. Place single or full-crowned multi-bough scanned 3D trees at each anchor
    //    On mobile, skip 3x sub-bough duplication to reduce pine vertex & alpha-test load by 66%
    const placePineAt = (spec, idx, targetGroup) => {
      const treeGroup = new C_ENGINE.Group();
      const mainTpl = normalizedTemplates[idx % normalizedTemplates.length];
      const mainScale = spec.height / mainTpl.rawHeight;

      const chooseTwigMat = (subIdx) => {
        if (spec.role === 'seasonal' && this.scannedSeasonalTwigMats.length > 0) {
          return this.scannedSeasonalTwigMats[(idx + subIdx) % this.scannedSeasonalTwigMats.length];
        }
        return pineTwigMats[(idx + subIdx) % pineTwigMats.length];
      };

      // Primary scanned tree trunk & crown
      const primary = mainTpl.node.clone(true);
      const widthBoost = (spec.widthScale || 1.12) * (this.isMobile ? 1.16 : 1.0);
      primary.scale.set(mainScale * widthBoost, mainScale, mainScale * widthBoost);
      applyTwigMaterial(primary, chooseTwigMat(0));
      treeGroup.add(primary);

      // For hero courtyard & forest trees on desktop, compose a lush full-crowned multi-bough silhouette
      if (spec.cluster !== false && !this.isMobile) {
        const subSpecs = [
          { dx: -0.22, dz: -0.12, hMul: 0.86, wMul: 1.15, yaw: 1.15, tiltX: 0.04, tiltZ: -0.05 },
          { dx: 0.24, dz: -0.15, hMul: 0.91, wMul: 1.12, yaw: 2.55, tiltX: -0.03, tiltZ: 0.04 }
        ];
        subSpecs.forEach((sub, sIdx) => {
          const subTpl = normalizedTemplates[(idx + sIdx + 1) % normalizedTemplates.length];
          const subScale = (spec.height * sub.hMul) / subTpl.rawHeight;
          const subNode = subTpl.node.clone(true);
          subNode.scale.set(subScale * sub.wMul, subScale, subScale * sub.wMul);
          subNode.rotation.set(sub.tiltX, sub.yaw, sub.tiltZ);
          subNode.position.set(sub.dx * (spec.height * 0.12), 0, sub.dz * (spec.height * 0.12));
          applyTwigMaterial(subNode, chooseTwigMat(sIdx + 1));
          treeGroup.add(subNode);
        });
      }

      treeGroup.rotation.y = spec.yaw ?? idx * 1.7;
      treeGroup.position.set(spec.x, spec.y, spec.z);
      targetGroup.add(treeGroup);
    };

    this.buseoksaPineAnchors.forEach((spec, idx) => placePineAt(spec, idx, this.buseoksaGroup));
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
     REALISTIC 3D KOREAN PALJAK GIWA ROOF BUILDER (무량수전 · 안양루 리얼 기와지붕)
     ------------------------------------------------------------------------ */
  buildRealisticPaljakRoof(parent, spec) {
    const {
      width = 34.0,
      depth = 13.0,
      baseY = 6.2,
      ridgeHeight = 4.2,
      ridgeLength = 21.0,
      tileRepeatX = 24,
      tileRepeatZ = 8
    } = spec;

    const rg = new C_ENGINE.Group();
    rg.position.set(spec.x || 0, baseY, spec.z || 0);

    const segX = 48;
    const segZ = 28;
    const roofGeo = new C_ENGINE.BufferGeometry();
    const verts = [];
    const uvs = [];
    const indices = [];

    const halfW = width * 0.5;
    const halfD = depth * 0.5;
    const halfRidge = ridgeLength * 0.5;

    for (let iz = 0; iz <= segZ; iz++) {
      const vz = iz / segZ - 0.5;
      const absZ = Math.abs(vz) * 2;
      for (let ix = 0; ix <= segX; ix++) {
        const vx = ix / segX - 0.5;
        const absX = Math.abs(vx) * 2;

        const cornerFlare = Math.pow(absX, 2.2) * Math.pow(absZ, 1.8) * 0.08;
        const x = vx * width * (1 + cornerFlare);
        const z = vz * depth * (1 + cornerFlare);

        const pastGable = Math.max(0, (Math.abs(x) - halfRidge) / Math.max(0.1, halfW - halfRidge));
        const mainSlopeDrop = Math.pow(absZ, 1.32) * ridgeHeight;
        const hipSlopeDrop = Math.pow(pastGable, 1.45) * (ridgeHeight * 0.62) * (1 - absZ * 0.55);
        const cornerLift = Math.pow(absX, 2.6) * Math.pow(absZ, 1.6) * (ridgeHeight * 0.28);
        const y = ridgeHeight - mainSlopeDrop - hipSlopeDrop + cornerLift;

        verts.push(x, y, z);
        uvs.push((vx + 0.5) * tileRepeatX, absZ * tileRepeatZ);
      }
    }

    for (let iz = 0; iz < segZ; iz++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iz * (segX + 1) + ix;
        const b = a + segX + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }

    roofGeo.setAttribute('position', new C_ENGINE.Float32BufferAttribute(verts, 3));
    roofGeo.setAttribute('uv', new C_ENGINE.Float32BufferAttribute(uvs, 2));
    roofGeo.setIndex(indices);
    roofGeo.computeVertexNormals();

    this.createMesh(roofGeo, this.matRealisticGiwa, rg, {
      preserveUvs: true,
      tone: 0.98
    });

    const soffitGeo = roofGeo.clone();
    soffitGeo.translate(0, -0.14, 0);
    this.matDarkTimber.side = C_ENGINE.DoubleSide;
    this.createMesh(soffitGeo, this.matDarkTimber, rg, {
      preserveUvs: true,
      castShadow: false,
      tone: 0.84
    });

    // Main Roof Ridge (용마루 적새기와 단) & Finials (망와·취두)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(ridgeLength + 0.6, 0.42, 0.46, 2, 0.06),
      this.matRealisticGiwa,
      rg,
      { pos: [0, ridgeHeight + 0.16, 0], preserveUvs: true, tone: 1.06 }
    );
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(ridgeLength + 0.8, 0.12, 0.54, 2, 0.03),
      this.matStone,
      rg,
      { pos: [0, ridgeHeight + 0.02, 0], tone: 0.92 }
    );
    for (const endX of [-halfRidge - 0.18, halfRidge + 0.18]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.42, 0.68, 0.54, 2, 0.06),
        this.matRealisticGiwa,
        rg,
        { pos: [endX, ridgeHeight + 0.34, 0], preserveUvs: true, tone: 1.08 }
      );
    }

    // 4 Descending Gable Ridges (내림마루) & 4 Corner Hip Ridges (추녀마루) + Gable Walls (합각벽)
    for (const sideSign of [-1, 1]) {
      const gx = sideSign * halfRidge;
      const gableH = ridgeHeight * 0.52;
      const gableW = depth * 0.44;
      this.createMesh(
        new C_ENGINE.CylinderGeometry(0.06, gableW * 0.5, gableH, 3),
        this.matPlaster,
        rg,
        {
          pos: [gx, ridgeHeight - gableH * 0.52, 0],
          rot: [0, sideSign > 0 ? Math.PI * 0.5 : -Math.PI * 0.5, 0],
          scale: [1, 1, 0.18],
          tone: 0.94
        }
      );

      for (const zSign of [-1, 1]) {
        const naerimCurve = new C_ENGINE.CatmullRomCurve3([
          new C_ENGINE.Vector3(gx, ridgeHeight + 0.12, 0),
          new C_ENGINE.Vector3(gx, ridgeHeight * 0.62, zSign * halfD * 0.28),
          new C_ENGINE.Vector3(gx * 1.02, ridgeHeight * 0.38, zSign * halfD * 0.52)
        ]);
        this.createMesh(
          new C_ENGINE.TubeGeometry(naerimCurve, 10, 0.16, 8, false),
          this.matRealisticGiwa,
          rg,
          { preserveUvs: true, tone: 1.04 }
        );

        const chunyeoCurve = new C_ENGINE.CatmullRomCurve3([
          new C_ENGINE.Vector3(gx, ridgeHeight * 0.42, zSign * halfD * 0.48),
          new C_ENGINE.Vector3(sideSign * (halfRidge + (halfW - halfRidge) * 0.55), ridgeHeight * 0.16, zSign * halfD * 0.78),
          new C_ENGINE.Vector3(sideSign * halfW * 1.05, ridgeHeight * 0.25, zSign * halfD * 1.05)
        ]);
        this.createMesh(
          new C_ENGINE.TubeGeometry(chunyeoCurve, 12, 0.17, 8, false),
          this.matRealisticGiwa,
          rg,
          { preserveUvs: true, tone: 1.05 }
        );
      }
    }

    // Front & Back Eave End-Tiles (수막새 와당)
    const sumaksaeCount = Math.min(36, Math.round(width * 1.1));
    for (const zSign of [-1, 1]) {
      for (let i = 0; i < sumaksaeCount; i++) {
        const u = i / (sumaksaeCount - 1) - 0.5;
        const absX = Math.abs(u) * 2;
        const cornerFlare = Math.pow(absX, 2.2) * 0.08;
        const sx = u * width * (1 + cornerFlare);
        const sz = zSign * halfD * (1 + cornerFlare);
        const pastGable = Math.max(0, (Math.abs(sx) - halfRidge) / Math.max(0.1, halfW - halfRidge));
        const hipDrop = Math.pow(pastGable, 1.45) * (ridgeHeight * 0.62) * 0.45;
        const cornerLift = Math.pow(absX, 2.6) * (ridgeHeight * 0.28);
        const sy = -hipDrop + cornerLift - 0.04;

        this.createMesh(
          new C_ENGINE.CylinderGeometry(0.11, 0.11, 0.08, 12),
          this.matRealisticGiwa,
          rg,
          {
            pos: [sx, sy, sz],
            rot: [Math.PI * 0.5, 0, 0],
            preserveUvs: true,
            castShadow: false,
            tone: 1.06
          }
        );
      }
    }

    parent.add(rg);
    return rg;
  }

  /* ------------------------------------------------------------------------
     SPACE 1: 영주 부석사 무량수전 앞마당 & 안양루 대확장 (Grand Muryangsujeon & Anyangru)
     ------------------------------------------------------------------------ */
  buildBuseoksaWorld() {
    const g = this.buseoksaGroup;

    // 1. Expanded 360° Courtyard & Mountain Apron Ground (대확장된 마당과 산자락 지형)
    this.buseoksaGroundMat = this.matGround.clone();
    const groundGeo = new C_ENGINE.PlaneGeometry(340, 320, 84, 84);
    groundGeo.rotateX(-Math.PI / 2);
    const gPos = groundGeo.getAttribute('position');
    for (let i = 0; i < gPos.count; i++) {
      const x = gPos.getX(i);
      const z = gPos.getZ(i);
      let y = -0.82;
      if (z < -25.0) {
        const d = -25.0 - z;
        y = -0.82 - Math.min(5.2, d * 0.2) + Math.sin(x * 0.07) * Math.min(1.4, d * 0.035);
      } else {
        const sideDist = Math.max(0, Math.abs(x) - 22.0);
        const sideLift = Math.min(7.5, Math.pow(sideDist * 0.075, 1.35) * 4.4);
        y = -0.82 + sideLift + Math.sin(x * 0.2 + z * 0.18) * 0.025;
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

    // 2. Grand Muryangsujeon Dressed Stone Foundation (웅장하게 확장된 무량수전 화강암 기단 · 계단)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(34.8, 0.98, 9.4, 2, 0.06),
      this.matStone,
      g,
      { pos: [0, -0.42, 9.9], tone: 0.96 }
    );
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(35.2, 0.18, 9.6, 2, 0.04),
      this.matStone,
      g,
      { pos: [0, 0.08, 9.9], tone: 1.02 }
    );

    // Wide central stone steps leading from Muryangsujeon veranda (z=5.65, y=0.20) to courtyard (z=3.55, y=-0.78)
    for (let s = 0; s < 4; s++) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(5.6, 0.24, 0.62, 2, 0.035),
        this.matStone,
        g,
        { pos: [0, -0.05 - s * 0.21, 5.45 - s * 0.54], tone: 0.95 + (s % 2) * 0.04 }
      );
    }
    for (const sideX of [-2.95, 2.95]) {
      const cheekGeo = new C_ENGINE.RoundedBoxGeometry(0.34, 1.02, 2.45, 2, 0.04);
      cheekGeo.rotateX(0.32);
      this.createMesh(cheekGeo, this.matStone, g, {
        pos: [sideX, -0.34, 4.65],
        tone: 0.92
      });
    }

    // 3. Expanded Umulmaru Wooden Veranda Planks (웅장한 무량수전 우물마루: 폭 32m × 깊이 6m)
    const plankCountX = 56;
    const totalVerandaWidth = 32.0;
    const plankW = totalVerandaWidth / plankCountX - 0.012;
    for (let row = 0; row < 3; row++) {
      const rowZ = 6.65 + row * 1.95;
      for (let i = 0; i < plankCountX; i++) {
        const px = -totalVerandaWidth / 2 + (i + 0.5) * (totalVerandaWidth / plankCountX);
        const tone = 0.95 + ((i * 7 + row * 13) % 9) * 0.012;
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(plankW, 0.1, 1.88, 2, 0.008),
          this.matFloorWood,
          g,
          { pos: [px, 0.15, rowZ], tone, variance: 0.015 }
        );
      }
    }
    for (const zBeam of [5.72, 7.62, 9.58, 11.52]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(32.6, 0.14, 0.24, 2, 0.02),
        this.matDarkTimber,
        g,
        { pos: [0, 0.155, zBeam], tone: 0.9 }
      );
    }

    // 4. Grand Muryangsujeon Entasis Columns (배흘림기둥 6주 대확장) & 4-Tier Jusimpo Brackets (주심포 공포)
    const columnXs = [-14.2, -8.4, -3.2, 3.2, 8.4, 14.2];
    const colZ = 6.8;
    const entasisPts = [
      new C_ENGINE.Vector2(0.42, 0.0),
      new C_ENGINE.Vector2(0.47, 0.45),
      new C_ENGINE.Vector2(0.52, 1.75),
      new C_ENGINE.Vector2(0.54, 2.75),
      new C_ENGINE.Vector2(0.49, 4.15),
      new C_ENGINE.Vector2(0.44, 5.25),
      new C_ENGINE.Vector2(0.41, 5.85)
    ];

    columnXs.forEach((cx, idx) => {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(1.28, 0.3, 1.28, 2, 0.06),
        this.matStone,
        g,
        { pos: [cx, 0.27, colZ], tone: 0.94 + (idx % 2) * 0.04 }
      );

      const cShadow = new C_ENGINE.Mesh(
        new C_ENGINE.PlaneGeometry(2.2, 2.2),
        this.matContactShadow
      );
      cShadow.rotation.x = -Math.PI / 2;
      cShadow.position.set(cx, 0.205, colZ);
      g.add(cShadow);

      const colGeo = new C_ENGINE.LatheGeometry(entasisPts, 28);
      this.createMesh(colGeo, this.matTimber, g, {
        pos: [cx, 0.38, colZ],
        tone: 0.97 + (idx % 3) * 0.025
      });

      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(1.06, 0.26, 1.06, 2, 0.03),
        this.matDarkTimber,
        g,
        { pos: [cx, 6.28, colZ] }
      );

      for (let tier = 0; tier < 4; tier++) {
        const ty = 6.52 + tier * 0.26;
        const span = 1.48 + tier * 0.44;
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(span, 0.18, 0.38, 2, 0.02),
          tier % 2 === 1 ? this.matDancheongJade : this.matDarkTimber,
          g,
          { pos: [cx, ty, colZ] }
        );
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(0.38, 0.18, span, 2, 0.02),
          tier % 2 === 1 ? this.matDancheongRed : this.matPaleTimber,
          g,
          { pos: [cx, ty + 0.04, colZ] }
        );
      }
    });

    // Horizontal Lintels & Beams (창방 · 평방 · 도리)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(31.2, 0.42, 0.48, 2, 0.035),
      this.matTimber,
      g,
      { pos: [0, 5.98, colZ] }
    );
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(31.6, 0.26, 0.54, 2, 0.025),
      this.matDancheongJade,
      g,
      { pos: [0, 6.28, colZ] }
    );
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(32.8, 0.44, 0.52, 2, 0.035),
      this.matDarkTimber,
      g,
      { pos: [0, 7.36, colZ - 0.18] }
    );

    // Rear Lattice Doors & Warm Earth Plaster Wall behind Veranda
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(30.4, 6.0, 0.32, 2, 0.02),
      this.matPlaster,
      g,
      { pos: [0, 3.2, 11.4], tone: 0.94 }
    );
    for (let bx = -13.2; bx <= 13.2; bx += 2.2) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.16, 5.6, 0.38, 2, 0.015),
        this.matDarkTimber,
        g,
        { pos: [bx, 3.15, 11.35] }
      );
    }

    // 5. Calligraphed Plaque: 無量壽殿 (무량수전 대형 현판)
    const muryangPlaqueTex = TextureFactory.createPlaqueTexture('無 量 壽 殿', '부석사 무량수전');
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(5.2, 1.62, 0.22, 2, 0.03),
      this.matDarkTimber,
      g,
      { pos: [0, 6.72, 6.28], rot: [0.14, 0, 0] }
    );
    const muryangFace = new C_ENGINE.Mesh(
      new C_ENGINE.PlaneGeometry(4.92, 1.4),
      new C_ENGINE.MeshStandardMaterial({ map: muryangPlaqueTex, roughness: 0.65 })
    );
    muryangFace.position.set(0, 6.72, 6.16);
    muryangFace.rotation.x = 0.14 + Math.PI;
    muryangFace.rotation.z = Math.PI;
    g.add(muryangFace);

    // 6. Deep Curved Eaves, 46 Rafters (서까래·부연) & Realistic 3D Paljak Giwa Roof
    const rafterCapMat = new C_ENGINE.MeshStandardMaterial({
      map: this.dancheongCapTex,
      roughness: 0.65
    });

    const rafterCount = 46;
    for (let i = 0; i < rafterCount; i++) {
      const t = i / (rafterCount - 1) - 0.5;
      const rx = t * 33.4;
      const cornerLift = Math.pow(Math.abs(t) * 2, 2.4) * 0.72;

      const rCurve = new C_ENGINE.CatmullRomCurve3([
        new C_ENGINE.Vector3(rx, 7.65 + cornerLift * 0.3, 8.8),
        new C_ENGINE.Vector3(rx * 1.01, 6.65 + cornerLift * 0.65, 6.3),
        new C_ENGINE.Vector3(rx * 1.025, 5.75 + cornerLift, 3.85)
      ]);
      const rGeo = new C_ENGINE.TubeGeometry(rCurve, 10, 0.095, 8, false);
      this.createMesh(rGeo, this.matTimber, g, { tone: 0.94 + (i % 3) * 0.03 });

      const capMesh = new C_ENGINE.Mesh(
        new C_ENGINE.CylinderGeometry(0.095, 0.095, 0.032, 12),
        rafterCapMat
      );
      capMesh.rotation.x = Math.PI / 2 - 0.36;
      capMesh.position.set(rx * 1.025, 5.74 + cornerLift, 3.82);
      g.add(capMesh);
    }

    this.buildRealisticPaljakRoof(g, {
      x: 0,
      z: 9.8,
      baseY: 5.88,
      width: 36.8,
      depth: 13.6,
      ridgeHeight: 4.85,
      ridgeLength: 22.8,
      tileRepeatX: 28,
      tileRepeatZ: 9
    });

    // 7. Expanded Courtyard Flagstone Path (넓고 길게 확장된 박석길: 중앙 주 박석길 + 가로 박석길)
    for (let i = 0; i < 24; i++) {
      const fz = 3.2 - i * 0.72;
      const fx = Math.sin(i * 0.38) * 0.16;
      const fw = 2.45 + (i % 3) * 0.24;
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(fw, 0.08, 0.64, 2, 0.025),
        this.matStone,
        g,
        {
          pos: [fx, -0.79, fz],
          rot: [0, (i % 2 === 0 ? 1 : -1) * 0.02, 0],
          tone: 0.92 + (i % 4) * 0.04
        }
      );
    }
    for (let ix = -7; ix <= 7; ix++) {
      if (Math.abs(ix) <= 1) continue;
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(1.35, 0.075, 1.55, 2, 0.025),
        this.matStone,
        g,
        {
          pos: [ix * 1.65, -0.795, -5.8 + Math.cos(ix) * 0.14],
          rot: [0, (ix % 2) * 0.02, 0],
          tone: 0.93 + (Math.abs(ix) % 3) * 0.03
        }
      );
    }

    // Courtyard far stone terrace wall (대확장된 부석사 석축 단: z = -24.6m)
    for (let tier = 0; tier < 3; tier++) {
      for (let bx = -24; bx <= 24; bx += 1.85) {
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(1.78, 0.52, 1.05, 2, 0.07),
          this.matStone,
          g,
          {
            pos: [bx + (tier % 2) * 0.35, -1.65 + tier * 0.48, -24.6 + tier * 0.18],
            tone: 0.88 + ((Math.abs(bx) + tier) % 4) * 0.05
          }
        );
      }
    }

    // Mossy courtyard boulders placed along the outer perimeter of the expanded courtyard
    const boulderSpecs = [
      [-14.5, -0.72, -3.5, 1.45, 0.72, 1.15],
      [-13.2, -0.78, -2.6, 0.85, 0.48, 0.7],
      [14.2, -0.74, -4.8, 1.55, 0.76, 1.2],
      [15.4, -0.78, -3.8, 0.92, 0.52, 0.8],
      [-15.6, -0.7, -12.4, 1.7, 0.88, 1.3],
      [15.8, -0.72, -12.8, 1.6, 0.82, 1.25]
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
    this.buildBuseoksaStoneLantern(g, 3.6, -0.82, -1.2);

    // 9. Grand Walkable Anyangru Pavilion (안양루 대확장: 툇마루 등반 + 명상 방석 + 관통하여 소백산맥 차경)
    this.buildPavilion3D(g, {
      x: 0.0,
      y: -0.78,
      z: -19.5,
      hanja: '安 養 樓',
      hangul: '부석사 안양루'
    });

    // 10. Scanned 3D Pine Trees flanking the Expanded Courtyard (중앙 안양루~소백산맥 시야는 완전히 개방)
    this.buseoksaPineAnchors = [
      { x: -16.5, y: -0.82, z: -6.2, height: 9.2, yaw: 0.4 },
      { x: -18.8, y: -0.82, z: -13.5, height: 10.8, yaw: 1.8 },
      { x: 16.4, y: -0.82, z: -5.8, height: 8.8, yaw: -0.6 },
      { x: 18.6, y: -0.82, z: -13.8, height: 11.4, yaw: 2.3 },
      { x: 14.8, y: -0.82, z: -21.2, height: 9.4, yaw: 0.9 },
      { x: -15.2, y: -0.82, z: -21.5, height: 10.2, yaw: -1.4 },
      { x: -20.6, y: -0.75, z: 3.2, height: 10.2, yaw: 0.8 },
      { x: -23.2, y: -0.35, z: 8.8, height: 11.8, yaw: 2.1 },
      { x: -19.8, y: -0.80, z: -1.5, height: 9.6, yaw: -0.5 },
      { x: 20.6, y: -0.75, z: 3.4, height: 10.6, yaw: -1.1 },
      { x: 23.5, y: -0.30, z: 9.2, height: 12.0, yaw: 1.4 },
      { x: 21.8, y: -0.55, z: -4.2, height: 11.2, yaw: 0.7 },
      { x: 24.4, y: -0.15, z: -10.6, height: 12.2, yaw: -1.2 },
      { x: 22.2, y: -0.35, z: -18.4, height: 11.8, yaw: 1.5 },
      { x: -21.5, y: -0.65, z: -19.8, height: 10.8, yaw: 1.1 }
    ];

    // Seasonal Maple Trees flanking the expanded courtyard
    this.buildSeasonalTree(g, -14.2, -0.82, -9.5, 1.22);
    this.buildSeasonalTree(g, 14.0, -0.82, -9.2, 1.18);
    this.buildSeasonalTree(g, -12.6, -0.82, -16.8, 1.12);
    this.buildSeasonalTree(g, 12.6, -0.82, -16.8, 1.12);

    // Lush Green Korean Broad-Leaf Forest Trees on outer mountain flanks
    this.buildGreenForestTree(g, 19.6, -0.45, -9.8, 1.3);
    this.buildGreenForestTree(g, 22.4, 0.35, -15.2, 1.42);
    this.buildGreenForestTree(g, 25.5, 1.25, -7.5, 1.48);
    this.buildGreenForestTree(g, -19.2, -0.65, -16.2, 1.25);
    this.buildGreenForestTree(g, -16.8, -1.25, -24.5, 1.3);

    // 11. Realistic Sobaeksan Vista Panorama & Multi-Layered 3D Mountain Ridges
    this.buildSobaeksanMountainRidges(g);

    // 12. Subtle Valley Mist & High Cumulus Clouds
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

  /**
   * Builds the Expanded & Walkable Anyangru Pavilion (안양루 누각 대확장):
   * - Walkable Umulmaru veranda floor at world y = 0.08 (local y = 0.86) with wide front stone steps
   * - Wide open central column span (6.8m wide between inner columns) so Sobaeksan mountain range
   *   is clearly visible right through Anyangru (안양루를 관통하여 시원하게 보이는 소백산맥 차경)
   * - Realistic 3D Paljak Giwa Roof + Dancheong rafters
   * - 3D Traditional Meditation Cushion (명상 방석) in the center of Anyangru's veranda
   */
  buildPavilion3D(parent, spec) {
    const pg = new C_ENGINE.Group();
    pg.position.set(spec.x, spec.y, spec.z);
    pg.rotation.y = spec.yaw || 0;

    // 1. Stone Terrace & Tall Under-Pavilion Pillars (누하주와 화강암 기단)
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(17.2, 0.84, 8.6, 2, 0.06),
      this.matStone,
      pg,
      { pos: [0, 0.36, 0], tone: 0.94 }
    );

    // Wide Courtyard-to-Anyangru Stone Steps (마당에서 안양루 툇마루로 올라가는 중앙 돌계단)
    for (let s = 0; s < 5; s++) {
      const stepY = 0.12 + s * 0.175;
      const stepZ = 5.55 - s * 0.38;
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(4.8, 0.2, 0.46, 2, 0.03),
        this.matStone,
        pg,
        { pos: [0, stepY, stepZ], tone: 0.96 + (s % 2) * 0.03 }
      );
    }
    for (const sideX of [-2.55, 2.55]) {
      const cheekGeo = new C_ENGINE.RoundedBoxGeometry(0.28, 0.96, 2.15, 2, 0.04);
      cheekGeo.rotateX(-0.38);
      this.createMesh(cheekGeo, this.matStone, pg, {
        pos: [sideX, 0.45, 4.78],
        tone: 0.92
      });
    }

    // 2. Walkable Anyangru Umulmaru Wooden Veranda Floor (안양루 툇마루 바닥: 16.4m × 8.2m, world y = 0.08)
    const deckY = 0.86;
    const plankCountX = 36;
    const deckW = 16.4;
    const plankW = deckW / plankCountX - 0.01;
    for (let row = 0; row < 2; row++) {
      const rowZ = -1.95 + row * 3.9;
      for (let i = 0; i < plankCountX; i++) {
        const px = -deckW * 0.5 + (i + 0.5) * (deckW / plankCountX);
        const tone = 0.95 + ((i * 5 + row * 11) % 7) * 0.014;
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(plankW, 0.12, 3.82, 2, 0.01),
          this.matFloorWood,
          pg,
          { pos: [px, deckY, rowZ], tone }
        );
      }
    }
    for (const zBeam of [-3.95, 0, 3.95]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(16.6, 0.16, 0.24, 2, 0.02),
        this.matDarkTimber,
        pg,
        { pos: [0, deckY + 0.01, zBeam], tone: 0.9 }
      );
    }

    // Low Gyeja-nangan Wooden Railings (계단 입구는 개방, 소백산 쪽은 시야 방해 없는 낮은 난간)
    for (const sideX of [-8.05, 8.05]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.14, 0.1, 8.0, 2, 0.015),
        this.matDancheongRed,
        pg,
        { pos: [sideX, deckY + 0.48, 0] }
      );
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.1, 0.08, 7.9, 2, 0.015),
        this.matDancheongJade,
        pg,
        { pos: [sideX, deckY + 0.26, 0] }
      );
    }
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(16.2, 0.1, 0.14, 2, 0.015),
      this.matDancheongRed,
      pg,
      { pos: [0, deckY + 0.42, -3.98] }
    );
    for (const frontSegX of [-5.3, 5.3]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(5.4, 0.1, 0.14, 2, 0.015),
        this.matDancheongRed,
        pg,
        { pos: [frontSegX, deckY + 0.48, 3.98] }
      );
    }

    // 3. Wide-Span Entasis Columns (중앙 6.8m 광폭 개방 기둥 배치 -> 안양루를 관통해 소백산맥이 시원하게 조망됨)
    const pXs = [-7.2, -3.4, 3.4, 7.2];
    const pZs = [-3.4, 3.4];
    const colEntasisPts = [
      new C_ENGINE.Vector2(0.30, 0.0),
      new C_ENGINE.Vector2(0.34, 1.2),
      new C_ENGINE.Vector2(0.35, 2.4),
      new C_ENGINE.Vector2(0.31, 4.1),
      new C_ENGINE.Vector2(0.28, 4.95)
    ];
    for (const px of pXs) {
      for (const pz of pZs) {
        this.createMesh(
          new C_ENGINE.CylinderGeometry(0.31, 0.34, 2.6, 18),
          this.matTimber,
          pg,
          { pos: [px, -0.45, pz], tone: 0.94 }
        );
        this.createMesh(
          new C_ENGINE.RoundedBoxGeometry(0.84, 0.16, 0.84, 2, 0.04),
          this.matStone,
          pg,
          { pos: [px, deckY + 0.08, pz] }
        );
        this.createMesh(
          new C_ENGINE.LatheGeometry(colEntasisPts, 22),
          this.matTimber,
          pg,
          { pos: [px, deckY + 0.14, pz], tone: 0.98 }
        );
        for (let tier = 0; tier < 3; tier++) {
          const ty = deckY + 5.15 + tier * 0.22;
          const span = 1.15 + tier * 0.34;
          this.createMesh(
            new C_ENGINE.RoundedBoxGeometry(span, 0.15, 0.3, 2, 0.02),
            tier === 1 ? this.matDancheongJade : this.matDarkTimber,
            pg,
            { pos: [px, ty, pz] }
          );
          this.createMesh(
            new C_ENGINE.RoundedBoxGeometry(0.3, 0.15, span, 2, 0.02),
            tier === 1 ? this.matDancheongRed : this.matPaleTimber,
            pg,
            { pos: [px, ty + 0.03, pz] }
          );
        }
      }
    }

    // High Perimeter Lintels & Beams (창방 · 평방 · 도리: y = deckY + 4.95 이상에 배치하여 시선 완전 개방)
    for (const bz of [-3.4, 3.4]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(15.6, 0.32, 0.38, 2, 0.03),
        this.matTimber,
        pg,
        { pos: [0, deckY + 4.95, bz] }
      );
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(16.0, 0.22, 0.44, 2, 0.025),
        this.matDancheongJade,
        pg,
        { pos: [0, deckY + 5.22, bz] }
      );
    }
    for (const bx of [-7.2, -3.4, 3.4, 7.2]) {
      this.createMesh(
        new C_ENGINE.RoundedBoxGeometry(0.36, 0.3, 7.4, 2, 0.03),
        this.matDarkTimber,
        pg,
        { pos: [bx, deckY + 5.18, 0] }
      );
    }

    // 4. Calligraphed Anyangru Plaque: 安養樓 (안양루 현판)
    const plaqueTex = TextureFactory.createPlaqueTexture(spec.hanja, spec.hangul);
    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(3.6, 1.12, 0.16, 2, 0.03),
      this.matDarkTimber,
      pg,
      { pos: [0, deckY + 5.38, 3.72], rot: [0.12, 0, 0] }
    );
    const plaqueMesh = new C_ENGINE.Mesh(
      new C_ENGINE.PlaneGeometry(3.38, 0.96),
      new C_ENGINE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.65 })
    );
    plaqueMesh.position.set(0, deckY + 5.38, 3.82);
    plaqueMesh.rotation.x = -0.12;
    pg.add(plaqueMesh);

    // 5. Anyangru Rafters (서까래) & Realistic 3D Paljak Giwa Roof (안양루 리얼 기와지붕)
    const anyangRafterCount = 28;
    for (let i = 0; i < anyangRafterCount; i++) {
      const t = i / (anyangRafterCount - 1) - 0.5;
      const rx = t * 18.2;
      const cornerLift = Math.pow(Math.abs(t) * 2, 2.4) * 0.48;
      for (const zSign of [-1, 1]) {
        const rCurve = new C_ENGINE.CatmullRomCurve3([
          new C_ENGINE.Vector3(rx, deckY + 6.15 + cornerLift * 0.3, zSign * 2.4),
          new C_ENGINE.Vector3(rx * 1.02, deckY + 5.32 + cornerLift, zSign * 5.2)
        ]);
        this.createMesh(
          new C_ENGINE.TubeGeometry(rCurve, 8, 0.075, 8, false),
          this.matTimber,
          pg,
          { tone: 0.95 }
        );
      }
    }

    this.buildRealisticPaljakRoof(pg, {
      x: 0,
      z: 0,
      baseY: deckY + 5.35,
      width: 20.6,
      depth: 11.4,
      ridgeHeight: 3.45,
      ridgeLength: 12.2,
      tileRepeatX: 18,
      tileRepeatZ: 7
    });

    // 6. 3D Traditional Silk Meditation Cushion on Anyangru Veranda (안양루 명상 방석 · 좌구)
    const cushionGroup = new C_ENGINE.Group();
    cushionGroup.position.set(0, deckY + 0.06, 0.0);

    this.createMesh(
      new C_ENGINE.RoundedBoxGeometry(1.48, 0.03, 1.48, 2, 0.01),
      this.matPaleTimber,
      cushionGroup,
      { pos: [0, 0.015, 0], tone: 1.06 }
    );
    this.createMesh(
      new C_ENGINE.CylinderGeometry(0.52, 0.56, 0.14, 28),
      this.matDancheongRed,
      cushionGroup,
      { pos: [0, 0.08, 0], tone: 1.05 }
    );
    this.createMesh(
      new C_ENGINE.CylinderGeometry(0.32, 0.34, 0.15, 24),
      this.matWarmHanji,
      cushionGroup,
      { pos: [0, 0.085, 0] }
    );
    pg.add(cushionGroup);

    const anyangLight = new C_ENGINE.PointLight(0xffb86c, 1.8, 18, 1.5);
    anyangLight.position.set(0, deckY + 4.6, 0);
    pg.add(anyangLight);

    parent.add(pg);
  }

  buildSeasonalTree(parent, x, y, z, scale = 1.0) {
    // Register as a photorealistic 3D scanned tree (assets/models/pine.glb) instead of procedural sphere balls
    this.buseoksaPineAnchors.push({
      x,
      y,
      z,
      height: 6.2 * scale,
      widthScale: 1.24,
      yaw: (x * 1.37 + z * 0.93) % (Math.PI * 2),
      cluster: true,
      role: 'pine'
    });
  }

  buildGreenForestTree(parent, x, y, z, scale = 1.0) {
    // Register as a photorealistic 3D scanned full-crown mountain tree (assets/models/pine.glb)
    this.buseoksaPineAnchors.push({
      x,
      y,
      z,
      height: 6.8 * scale,
      widthScale: 1.28,
      yaw: (x * 0.89 - z * 1.41) % (Math.PI * 2),
      cluster: true,
      role: 'pine'
    });
  }

  buildSobaeksanMountainRidges(parent) {
    this.mountainLayers = [];

    // 1. Forward Sobaeksan Real-Photo Vista Backdrop (전방 소백산맥·파란하늘·뭉게구름 실사 배경)
    //    Framed directly through Anyangru's open columns so the Sobaeksan ridges are clearly visible!
    const vistaSegX = 96;
    const vistaSegY = 32;
    const vistaGeo = new C_ENGINE.PlaneGeometry(1, 1, vistaSegX, vistaSegY);
    const vPos = vistaGeo.getAttribute('position');
    const arcSpan = Math.PI * 0.62;
    const radius = 142;
    const centerZ = -4.0;

    for (let i = 0; i < vPos.count; i++) {
      const u = vPos.getX(i) + 0.5;
      const v = vPos.getY(i) + 0.5;
      const angle = (u - 0.5) * arcSpan;
      const wx = Math.sin(angle) * radius;
      const wz = centerZ - Math.cos(angle) * radius;
      const wy = -18.0 + v * 74.0;
      vPos.setXYZ(i, wx, wy, wz);
    }
    vistaGeo.computeVertexNormals();

    this.sobaeksanVistaMat = new C_ENGINE.MeshBasicMaterial({
      map: this.sobaeksanVistaTex,
      color: 0xffffff,
      side: C_ENGINE.DoubleSide,
      transparent: true,
      fog: false,
      depthWrite: false
    });
    this.sobaeksanVistaMesh = new C_ENGINE.Mesh(vistaGeo, this.sobaeksanVistaMat);
    this.sobaeksanVistaMesh.renderOrder = -10;
    parent.add(this.sobaeksanVistaMesh);

    // 2. Low 3D Valley Foothills (안양루 정면 중앙은 낮게 열어두어 소백산맥 원경이 시원하게 관통되도록 구성)
    const ridgeConfigs = [
      {
        z: -42,
        width: 165,
        baseH: -2.4,
        amp: 0.9,
        freq: 0.048,
        phase: 0.5,
        color: 0x3b5834,
        useForestTex: true,
        rightSlopeLift: 8.5
      },
      {
        z: -68,
        width: 215,
        baseH: -1.2,
        amp: 1.3,
        freq: 0.038,
        phase: 1.7,
        color: 0x456340,
        useForestTex: true,
        rightSlopeLift: 10.5
      }
    ];

    ridgeConfigs.forEach((cfg, layerIdx) => {
      const segX = 96;
      const segY = 20;
      const geo = new C_ENGINE.PlaneGeometry(cfg.width, 32, segX, segY);
      const pos = geo.getAttribute('position');
      const colors = new Float32Array(pos.count * 3);

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const rawY = pos.getY(i);
        const v = (rawY + 16) / 32;

        // Keep center (|x| < 18m) dipped low so Anyangru's through-vista to Sobaeksan is 100% unobstructed
        const centerValleyDip = -Math.exp(-Math.pow(x / 16, 2)) * 2.2;
        const leftHillBump = Math.exp(-Math.pow((x + 28) / 22, 2)) * 2.2;
        const rightSlope =
          x > 18 ? Math.pow((x - 18) / (cfg.width * 0.45), 1.3) * cfg.rightSlopeLift : 0;

        const ridgeCurve =
          cfg.baseH +
          centerValleyDip +
          leftHillBump +
          rightSlope +
          Math.sin(x * cfg.freq + cfg.phase) * cfg.amp +
          Math.cos(x * cfg.freq * 2.1 - cfg.phase * 0.7) * (cfg.amp * 0.4) +
          Math.sin(x * cfg.freq * 4.3 + layerIdx) * (cfg.amp * 0.15);

        const y = -13.5 + v * (ridgeCurve + 13.5);
        const zOffset = (1 - v) * 6.5 + Math.sin(x * 0.07 + v * 2.8) * 1.6;
        pos.setXYZ(i, x, y, zOffset);

        const hShade = 0.76 + v * 0.28;
        colors[i * 3] = hShade;
        colors[i * 3 + 1] = hShade;
        colors[i * 3 + 2] = hShade;
      }
      geo.setAttribute('color', new C_ENGINE.BufferAttribute(colors, 3));
      geo.computeVertexNormals();

      const mat = new C_ENGINE.MeshStandardMaterial({
        map: cfg.useForestTex ? this.forestCanopyTex : null,
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
    const cloudGeo = new C_ENGINE.PlaneGeometry(38, 13);
    // Subtle low valley mist tucked below the horizon + high drifting sky cumulus accents
    for (let i = 0; i < 24; i++) {
      const isHighCumulus = i < 10;
      const mat = new C_ENGINE.MeshBasicMaterial({
        map: this.cloudTex,
        color: 0xf8fbff,
        transparent: true,
        opacity: isHighCumulus ? 0.28 : 0.14,
        depthWrite: false,
        fog: false
      });
      const mesh = new C_ENGINE.Mesh(cloudGeo, mat);
      const x = (Math.random() - 0.5) * 155;
      const y = isHighCumulus ? 24.0 + Math.random() * 14.0 : -5.8 + Math.random() * 2.4;
      const z = isHighCumulus ? -115 - Math.random() * 32 : -26 - Math.random() * 55;
      mesh.position.set(x, y, z);
      mesh.scale.set(
        (isHighCumulus ? 1.35 : 0.85) + Math.random() * 0.9,
        (isHighCumulus ? 0.85 : 0.45) + Math.random() * 0.4,
        1
      );
      parent.add(mesh);
      this.cloudPlanes.push({
        mesh,
        mat,
        baseX: x,
        baseY: y,
        speed: (isHighCumulus ? 0.22 : 0.38) + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        baseAlpha: isHighCumulus ? 0.22 + Math.random() * 0.14 : 0.10 + Math.random() * 0.08
      });
    }
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
    this.leafCount = this.isMobile ? 48 : 96;
    this.leafDummy = new C_ENGINE.Object3D();
    this.leafData = [];

    // 3D Curved Maple Leaf Geometry (자연스럽게 휘어진 단풍잎 곡면 메쉬 + 7갈래 단풍잎 실사 텍스처)
    const leafGeo = new C_ENGINE.PlaneGeometry(0.24, 0.24, 3, 3);
    const lPos = leafGeo.getAttribute('position');
    for (let i = 0; i < lPos.count; i++) {
      const lx = lPos.getX(i);
      const ly = lPos.getY(i);
      const curlZ = (lx * lx * 1.4 - ly * ly * 0.6) * 0.45;
      lPos.setZ(i, curlZ);
    }
    leafGeo.computeVertexNormals();

    this.leafInstancedMat = new C_ENGINE.MeshStandardMaterial({
      map: this.mapleLeafTex,
      alphaTest: 0.18,
      transparent: true,
      side: C_ENGINE.DoubleSide,
      roughness: 0.65,
      metalness: 0.02
    });

    this.leafInstancedMesh = new C_ENGINE.InstancedMesh(
      leafGeo,
      this.leafInstancedMat,
      this.leafCount
    );
    this.leafInstancedMesh.raycast = () => {};

    // Per-instance natural autumn maple palette (단풍 진홍·주홍·황금빛 그라데이션)
    const leafPalette = [
      new C_ENGINE.Color(0xff5e2b),
      new C_ENGINE.Color(0xe6391b),
      new C_ENGINE.Color(0xf59e0b),
      new C_ENGINE.Color(0xd94826),
      new C_ENGINE.Color(0xff8438)
    ];

    for (let i = 0; i < this.leafCount; i++) {
      this.leafInstancedMesh.setColorAt(i, leafPalette[i % leafPalette.length]);
      this.leafData.push({
        x: (Math.random() - 0.5) * 34,
        y: Math.random() * 9.0,
        z: 6 - Math.random() * 29,
        vx: 0.25 + Math.random() * 0.48,
        vy: -0.34 - Math.random() * 0.36,
        vz: (Math.random() - 0.5) * 0.34,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        spinX: (Math.random() - 0.5) * 2.4,
        spinY: (Math.random() - 0.5) * 2.2,
        spinZ: (Math.random() - 0.5) * 1.8,
        scale: 0.78 + Math.random() * 0.52,
        phase: Math.random() * Math.PI * 2
      });
    }
    if (this.leafInstancedMesh.instanceColor) {
      this.leafInstancedMesh.instanceColor.needsUpdate = true;
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

    const spaceWishes = allWishes.filter((w) => !w.space || w.space === 'buseoksa');
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
    const hitSphereGeo = new C_ENGINE.SphereGeometry(0.62, 8, 8);
    const hitSphereMat = new C_ENGINE.MeshBasicMaterial({ visible: false });
    const darkCapMat = new C_ENGINE.MeshStandardMaterial({ color: 0x3b281e, roughness: 0.8 });

    spaceWishes.forEach((wish, idx) => {
      const pivot = new C_ENGINE.Group();
      const t = total <= 1 ? 0.5 : idx / (total - 1);

      // Hanging gracefully under Anyangru Pavilion's eaves & perimeter beams (안양루 처마 밑 소원 연등 배치)
      // Anyangru is centered at x = 0, z = -19.5, with front eave at z ≈ -15.3 and side/back eaves
      const x = -6.4 + t * 12.8;
      const normX = Math.abs(x) / 8.2;
      const y = 4.35 + Math.pow(normX, 2.1) * 0.28;
      // Alternating along Anyangru's front eave (z = -15.35) and inner veranda beams (z = -16.85)
      const z = -15.35 - (idx % 2) * 1.45;

      pivot.position.set(x, y, z);

      const cordLen = 0.38 + (idx % 3) * 0.1;
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
        emissiveIntensity: isSelected ? 1.7 : 1.15,
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
      bodyMesh.castShadow = !this.isMobile;
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
      : new C_ENGINE.Vector3(0, 3.6, -15.8);

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
    this.spaceMode = 'buseoksa';
    this.buseoksaGroup.visible = true;

    // Position the 3D wind-bell under Muryangsujeon's foreground eave
    if (this.windBellPivot) {
      this.windBellPivot.position.set(3.85, 5.15, 4.35);
    }

    this.setTimeMode(this.timeMode);
    this.setCameraPreset(this.camPreset, immediate);
  }

  setTimeMode(timeKey) {
    this.timeMode = timeKey;

    if (timeKey === 'dawn') {
      // 새벽·아침 산사 (Crisp morning mist & natural woodland mountain horizon)
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
      this.scene.fog.near = 42;
      this.scene.fog.far = 215;
      if (this.woodlandPanorama) {
        this.scene.background = this.woodlandPanorama;
      }
      this.scene.backgroundIntensity = 0.88;
      this.renderer.toneMappingExposure = 1.04;
      this.starMat.opacity = 0;
      this.moonGroup.visible = false;
      if (this.sobaeksanVistaMat) this.sobaeksanVistaMat.color.set(0xffffff);

      const dawnColors = [0x3b5834, 0x456340, 0x526f4f, 0x627e62, 0x748f77, 0x88a18c];
      this.mountainLayers?.forEach((l, idx) =>
        l.mat.color.set(dawnColors[idx] ?? dawnColors[dawnColors.length - 1])
      );
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
      if (this.woodlandPanorama) {
        this.scene.background = this.woodlandPanorama;
      }
      this.scene.backgroundIntensity = 0.58;
      this.renderer.toneMappingExposure = 1.02;
      this.starMat.opacity = 0.22;
      this.moonGroup.visible = false;
      if (this.sobaeksanVistaMat) this.sobaeksanVistaMat.color.set(0xffbb94);

      const sunsetColors = [0x3d3538, 0x4f3e45, 0x634952, 0x7a5760, 0x94696e, 0xad7d7c];
      this.mountainLayers?.forEach((l, idx) =>
        l.mat.color.set(sunsetColors[idx] ?? sunsetColors[sunsetColors.length - 1])
      );
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
      if (this.woodlandPanorama) {
        this.scene.background = this.woodlandPanorama;
      }
      this.scene.backgroundIntensity = 0.08;
      this.renderer.toneMappingExposure = 0.96;
      this.starMat.opacity = 0.92;
      this.moonGroup.visible = true;
      if (this.sobaeksanVistaMat) this.sobaeksanVistaMat.color.set(0x243650);

      const nightColors = [0x141d26, 0x18232e, 0x1c2938, 0x223042, 0x28384c, 0x2e4057];
      this.mountainLayers?.forEach((l, idx) =>
        l.mat.color.set(nightColors[idx] ?? nightColors[nightColors.length - 1])
      );
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

    // Subtle organic tint for scanned seasonal trees (preserving real WebP twig textures)
    const palette = isAutumn
      ? [0xd88c52, 0xc96b43, 0xe2ab5a]
      : [0xf7d6e6, 0xf2e4ec, 0xe8f0e4];
    this.canopyMaterials.forEach((mat, idx) => {
      mat.color.set(palette[idx % palette.length]);
    });
    if (this.scannedSeasonalTwigMats) {
      this.scannedSeasonalTwigMats.forEach((mat, idx) => {
        if (mat) mat.color.setHex(palette[idx % palette.length]);
      });
    }
  }

  setCameraPreset(preset, immediate = false) {
    this.camPreset = preset;
    this.targetYawOffset = 0;
    this.targetPitchOffset = 0;
    this.targetZoomOffset = 0;

    const aspect = this.width / Math.max(1, this.height);
    const portraitPullback = aspect < 0.85 ? (0.85 - aspect) * 4.8 : 0;

    if (preset === 'default') {
      // 기본 차경: 넓어진 무량수전 마당에서 안양루를 관통해 소백산맥을 바라보는 구도
      this.targetCamPos.set(0, 2.45, 7.6 + portraitPullback * 0.65);
      this.targetCamLook.set(0, 2.15, -24.0);
    } else if (preset === 'closeup') {
      // 안양루·연등 가까이: 안양루 처마 밑 소원 연등과 소백산맥 클로즈업 차경
      this.targetCamPos.set(0.8, 2.55, -10.5 + portraitPullback * 0.45);
      this.targetCamLook.set(0, 3.15, -24.0);
    } else if (preset === 'wide') {
      // 광각 파노라마: 확장된 마당 중앙에서 안양루와 소백산맥 능선·운해 조망
      this.targetCamPos.set(0, 2.85, 2.2 + portraitPullback * 0.5);
      this.targetCamLook.set(0, 2.35, -38.0);
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
    const mobileOffset = aspect < 0.85 ? 1.25 : 0;

    this.targetYawOffset = 0;
    this.targetPitchOffset = 0;
    this.targetZoomOffset = 0;

    if (window.wandererManager) {
      window.wandererManager.followCamEnabled = false;
    }

    this.targetCamPos.set(wp.x * 0.86, wp.y - 0.35, wp.z + 3.6 + mobileOffset);
    this.targetCamLook.set(wp.x, wp.y - 0.05, wp.z - 2.8);
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
    this.width = this.container.clientWidth || window.innerWidth;
    this.height = this.container.clientHeight || window.innerHeight;
    this.isMobile = this.width < 768;

    const aspect = this.width / Math.max(1, this.height);
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.65 ? 64 : aspect < 0.85 ? 58 : 48;
    this.camera.updateProjectionMatrix();

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.25 : 2));
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

    if (this.isPageHidden) {
      this.lastFrameTime = performance.now();
      return;
    }

    const now = performance.now();
    // Throttle mobile rendering to ~38 FPS (26ms interval) to drastically reduce mobile GPU heat
    if (this.isMobile && now - this.lastRenderTime < 26) {
      return;
    }
    this.lastRenderTime = now;

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
    for (const c of this.cloudPlanes) {
      c.mesh.position.x = c.baseX + Math.sin(elapsed * 0.08 * c.speed + c.phase) * 14;
      c.mesh.position.y = c.baseY + Math.cos(elapsed * 0.22 + c.phase) * 0.35;
    }

    // 5. Animate Realistic 3D Falling Maple Leaves (마당 전체에 자연스럽게 흩날리는 3D 단풍잎)
    for (let i = 0; i < this.leafCount; i++) {
      const d = this.leafData[i];
      const flutter = Math.sin(elapsed * 2.1 + d.phase);
      const swayZ = Math.cos(elapsed * 1.6 + d.phase * 1.3);
      d.x += (d.vx + flutter * 0.48) * dt;
      d.y += (d.vy + Math.abs(flutter) * 0.08) * dt;
      d.z += (d.vz + swayZ * 0.32) * dt;
      d.rx += d.spinX * dt;
      d.ry += d.spinY * dt;
      d.rz += d.spinZ * dt;

      if (d.y < -0.78 || d.x > 19 || d.x < -19) {
        d.x = -17 + Math.random() * 34;
        d.y = 6.5 + Math.random() * 4.2;
        d.z = 6 - Math.random() * 29;
      }

      this.leafDummy.position.set(d.x, d.y, d.z);
      this.leafDummy.rotation.set(d.rx, d.ry, d.rz);
      this.leafDummy.scale.setScalar(d.scale || 1);
      this.leafDummy.updateMatrix();
      this.leafInstancedMesh.setMatrixAt(i, this.leafDummy.matrix);
    }
    this.leafInstancedMesh.instanceMatrix.needsUpdate = true;

    // 6. Animate Sonic Rings & Hapjang Light Particles
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
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((w) => !w.space || w.space === 'buseoksa');
        if (filtered.length > 0) return filtered;
      }
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
  const buseoksaCount = wishes.filter((w) => !w.space || w.space === 'buseoksa').length;
  const countEl = document.getElementById('count-buseoksa');
  if (countEl) {
    countEl.textContent = buseoksaCount;
  }

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

  const meta = SPACE_META.buseoksa;
  document.getElementById('reader-location').textContent = meta.locationBadge;
  document.getElementById('reader-tag').textContent = wish.tag || '소원 기원';
  document.getElementById('reader-text').textContent = wish.text;
  document.getElementById('reader-author').textContent = wish.author || '익명의 순례자';
  document.getElementById('reader-date').textContent = wish.date || '2026.11.03';
  document.getElementById('reader-hapjang-count').textContent = wish.hapjang;

  const hapjangBtn = document.getElementById('hapjang-btn');
  hapjangBtn.classList.toggle('pressed', likedWishIds.has(wish.id));

  document.getElementById('wish-reader-card').classList.add('open');
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
  const spaceWishes = wishes.filter((w) => !w.space || w.space === 'buseoksa');
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

  if (world3D) {
    world3D.spawnHapjangParticles3D(wish.id);
  }
  showToast('🙏 따뜻한 합장의 마음이 3D 연등 불빛을 타고 하늘로 피어오릅니다.');
}

function openWriteModal() {
  const meta = SPACE_META.buseoksa;
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
    space: 'buseoksa',
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
  showToast('🏮 새로운 3D 소원 연등이 밝혀졌습니다!');
}

function triggerBellRingInteraction() {
  audioEngine.strikeWindBell(0.95);
  if (world3D) {
    world3D.exciteWindBell();
  }
  showToast('🔔 처마 끝 풍경종이 은은하게 울립니다.');
}

function switchTime(targetTime) {
  currentTime = targetTime;
  const badgeEl = document.getElementById('auto-time-badge');
  if (badgeEl) {
    const labelMap = {
      dawn: '☁️ 실시간 운해 (아침·낮)',
      sunset: '🌇 실시간 노을 (석양)',
      night: '✨ 실시간 별빛 (밤 산사)'
    };
    badgeEl.textContent = labelMap[currentTime] || '☁️ 실시간 산사';
  }
  if (world3D) {
    world3D.setTimeMode(currentTime);
  }
}

function syncAutoTimeAtmosphere() {
  const autoMode = Chakyeong3DWorld.getAutoTimeMode();
  switchTime(autoMode);
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

function toggleBreathingGuide(forceState) {
  const guideEl = document.getElementById('breathing-guide');
  if (!guideEl) return;
  const textEl = document.getElementById('breath-text');

  const isActive =
    typeof forceState === 'boolean'
      ? (guideEl.classList.toggle('active', forceState), forceState)
      : guideEl.classList.toggle('active');

  if (breathGuideInterval) {
    clearInterval(breathGuideInterval);
    breathGuideInterval = null;
  }

  if (isActive && textEl) {
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
  if (!banner) return;
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
  syncAutoTimeAtmosphere();
  // Automatically check connection time every 60 seconds to transition dawn / sunset / night
  setInterval(syncAutoTimeAtmosphere, 60000);
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

  // Audio Toggle & Mixer (Always visible on both Mobile & Desktop top bar)
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const mixerPanel = document.getElementById('sound-mixer-panel');

  audioToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!audioEngine.isPlaying) {
      const playing = audioEngine.toggle();
      audioToggleBtn.classList.toggle('active-audio', playing);
      const labelEl = document.getElementById('audio-btn-label');
      if (labelEl) {
        labelEl.textContent = playing ? '소리 설정 중' : '소리 설정';
      }
      mixerPanel.classList.add('open');
      if (world3D) world3D.exciteWindBell();
    } else {
      mixerPanel.classList.toggle('open');
    }
  });

  document.getElementById('close-mixer-btn')?.addEventListener('click', () => {
    mixerPanel.classList.remove('open');
  });

  document.getElementById('manual-bell-btn')?.addEventListener('click', triggerBellRingInteraction);

  ['bell', 'water', 'wind'].forEach((type) => {
    const slider = document.getElementById(`slider-${type}`);
    if (!slider) return;
    slider.addEventListener('input', () => {
      const val = Number(slider.value);
      document.getElementById(`val-${type}`).textContent = `${val}%`;
      audioEngine[`${type}Level`] = val / 100;
      if (!audioEngine.isPlaying) {
        const playing = audioEngine.toggle();
        audioToggleBtn?.classList.toggle('active-audio', playing);
        const labelEl = document.getElementById('audio-btn-label');
        if (labelEl) labelEl.textContent = '소리 설정 중';
      } else {
        audioEngine.updateContinuousVolumes();
      }
    });
  });

  // Wish Reader Actions
  document.getElementById('close-reader-btn')?.addEventListener('click', closeWishReader);
  document.getElementById('prev-wish-btn')?.addEventListener('click', () => navigateWish(-1));
  document.getElementById('next-wish-btn')?.addEventListener('click', () => navigateWish(1));
  document.getElementById('hapjang-btn')?.addEventListener('click', handleHapjangClick);

  // Write Modal Actions
  document.getElementById('open-write-modal-btn')?.addEventListener('click', openWriteModal);
  document.getElementById('close-write-modal-btn')?.addEventListener('click', closeWriteModal);
  document.getElementById('write-modal-backdrop')?.addEventListener('click', (e) => {
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
  wishInput?.addEventListener('input', () => {
    document.getElementById('char-counter').textContent = `${wishInput.value.length} / 90자`;
  });

  document.getElementById('write-lantern-form')?.addEventListener('submit', handleWriteFormSubmit);

  // Zen Mode Restore
  document.getElementById('zen-restore-btn')?.addEventListener('click', () => toggleZenMode(false));

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    if (e.key === 'Escape') {
      closeWriteModal();
      closeWishReader();
      document.getElementById('sound-mixer-panel')?.classList.remove('open');
      if (document.body.classList.contains('zen-mode')) {
        toggleZenMode(false);
      }
      return;
    }

    if (
      e.code === 'Space' &&
      !isTyping &&
      !document.getElementById('write-modal-backdrop')?.classList.contains('open')
    ) {
      e.preventDefault();
      toggleZenMode();
    }
  });
});


/* ==========================================================================
   SANSA WANDERER (귀여운 산사 나그네) & 3RD-PERSON WALK + ANYANGRU MEDITATION
   ========================================================================== */
const THREE = C_ENGINE;
const WANDERER_STORAGE_KEY = 'chakyeong_3d_wanderer_cute_v1';

// 입장 시 자동 지정되는 귀여운 산사 닉네임 목록
const WANDERER_POETIC_NAMES = [
  '도토리 줍는 다람쥐',
  '꾸벅꾸벅 아기 반달곰',
  '단풍잎 책갈피 토끼',
  '구름 위 말랑 찹쌀떡',
  '산사 마실 나온 아기 참새',
  '솔방울 모으는 아기 여우',
  '툇마루 낮잠 치즈냥',
  '연등 아래 아기 꽃사슴',
  '약수터 총총 파랑새',
  '이끼 정원 꼬마 거북'
];

const WANDERER_PALETTES = [
  {
    id: 'ink',
    label: '먹빛',
    fullName: '먹빛 산사 도포',
    outerRobe: 0x363d45,
    innerRobe: 0xd8d2c5,
    collar: 0xf2ede2,
    shoes: 0xc9c1b2,
    bambooTint: 0xd4b475,
    orbHex: '#6c7a89',
    markerHex: 0xffd27d
  },
  {
    id: 'crane',
    label: '학창의',
    fullName: '솔빛 학창의 도포',
    outerRobe: 0xdce3dc,
    innerRobe: 0x4f6457,
    collar: 0xf7f4eb,
    shoes: 0xb8c2b9,
    bambooTint: 0xd9bc82,
    orbHex: '#88b397',
    markerHex: 0x98f5c4
  },
  {
    id: 'maple',
    label: '단풍',
    fullName: '치자·단풍 행자복',
    outerRobe: 0xd88835,
    innerRobe: 0x768568,
    collar: 0xf3ead8,
    shoes: 0xd6c8b2,
    bambooTint: 0xcfa968,
    orbHex: '#e69a45',
    markerHex: 0xffc46b
  },
  {
    id: 'mist',
    label: '운해',
    fullName: '운해빛 옥색 도포',
    outerRobe: 0x6f8b96,
    innerRobe: 0xd7dfd9,
    collar: 0xf4f6f2,
    shoes: 0xbac5c8,
    bambooTint: 0xcab07a,
    orbHex: '#7fa8b8',
    markerHex: 0x9be2ff
  }
];

const WANDERER_SPOTS = {
  buseoksa: [
    {
      id: 'courtyard_steps',
      label: '무량수전 박석길',
      icon: '🎋',
      pos: [0.0, -0.78, 1.5],
      facingYaw: 0.0,
      posture: 'walk'
    },
    {
      id: 'stone_lantern',
      label: '석등 앞 참배석',
      icon: '🕯️',
      pos: [1.6, -0.78, -1.5],
      facingYaw: -0.2,
      posture: 'walk'
    },
    {
      id: 'veranda_center',
      label: '무량수전 툇마루',
      icon: '🍵',
      pos: [0.0, 0.20, 6.0],
      facingYaw: 0.0,
      posture: 'walk'
    },
    {
      id: 'anyangnu_cushion',
      label: '안양루 명상 방석',
      icon: '🧘',
      pos: [0.0, 0.14, -19.5],
      facingYaw: 0.0,
      posture: 'kneel'
    },
    {
      id: 'maple_garden',
      label: '동쪽 단풍 마당',
      icon: '🍁',
      pos: [7.8, -0.78, -7.2],
      facingYaw: -0.3,
      posture: 'walk'
    }
  ]
};

/**
 * 3D Obstacle Collision & Pathfinding Definitions for Expanded Buseoksa Muryangsujeon & Walkable Anyangru
 */
const SPACE_OBSTACLES = {
  buseoksa: {
    circles: [
      // 6 Grand Muryangsujeon Entasis Columns (배흘림기둥 + 초석, z = 6.8)
      { x: -14.2, z: 6.8, r: 0.92, label: 'pillar' },
      { x: -8.4, z: 6.8, r: 0.92, label: 'pillar' },
      { x: -3.2, z: 6.8, r: 0.92, label: 'pillar' },
      { x: 3.2, z: 6.8, r: 0.92, label: 'pillar' },
      { x: 8.4, z: 6.8, r: 0.92, label: 'pillar' },
      { x: 14.2, z: 6.8, r: 0.92, label: 'pillar' },

      // 8 Anyangru Pavilion Columns (안양루 누상주 기둥: z = -16.1, -22.9 / 중앙 6.8m는 완전 개방)
      { x: -7.2, z: -16.1, r: 0.62, label: 'anyang_pillar' },
      { x: -3.4, z: -16.1, r: 0.62, label: 'anyang_pillar' },
      { x: 3.4, z: -16.1, r: 0.62, label: 'anyang_pillar' },
      { x: 7.2, z: -16.1, r: 0.62, label: 'anyang_pillar' },
      { x: -7.2, z: -22.9, r: 0.62, label: 'anyang_pillar' },
      { x: -3.4, z: -22.9, r: 0.62, label: 'anyang_pillar' },
      { x: 3.4, z: -22.9, r: 0.62, label: 'anyang_pillar' },
      { x: 7.2, z: -22.9, r: 0.62, label: 'anyang_pillar' },

      // Silla Stone Lantern in front of Muryangsujeon (부석사 석등)
      { x: 3.6, z: -1.2, r: 1.15, label: 'stone_lantern' },

      // Seasonal Maple Trees on expanded perimeter
      { x: -14.2, z: -9.5, r: 0.96, label: 'tree' },
      { x: 14.0, z: -9.2, r: 0.96, label: 'tree' },
      { x: -12.6, z: -16.8, r: 0.96, label: 'tree' },
      { x: 12.6, z: -16.8, r: 0.96, label: 'tree' },

      // Scanned 3D Korean Pine Trees on outer courtyard perimeter
      { x: -16.5, z: -6.2, r: 1.05, label: 'pine' },
      { x: 16.4, z: -5.8, r: 1.05, label: 'pine' },
      { x: 14.8, z: -21.2, r: 1.05, label: 'pine' },
      { x: -15.2, z: -21.5, r: 1.05, label: 'pine' },

      // Mossy Courtyard Boulders along outer courtyard perimeter
      { x: -14.5, z: -3.5, r: 1.52, label: 'boulder' },
      { x: -13.2, z: -2.6, r: 0.98, label: 'boulder' },
      { x: 14.2, z: -4.8, r: 1.62, label: 'boulder' },
      { x: 15.4, z: -3.8, r: 1.05, label: 'boulder' },
      { x: -15.6, z: -12.4, r: 1.72, label: 'boulder' },
      { x: 15.8, z: -12.8, r: 1.62, label: 'boulder' }
    ],
    boxes: [
      // Muryangsujeon Stone Step Cheeks & Foundation Drop-off Wall outside central steps (x in [-2.3, 2.3] is open stairs)
      { minX: -3.3, maxX: -2.35, minZ: 3.35, maxZ: 5.65 },
      { minX: 2.35, maxX: 3.3, minZ: 3.35, maxZ: 5.65 },
      { minX: -18.5, maxX: -2.35, minZ: 5.05, maxZ: 5.65 },
      { minX: 2.35, maxX: 18.5, minZ: 5.05, maxZ: 5.65 },

      // Anyangru Pavilion Stone Step Cheeks & Terrace Drop-off Wall outside central steps (x in [-2.1, 2.1] is open stairs)
      { minX: -2.85, maxX: -2.15, minZ: -15.65, maxZ: -13.65 },
      { minX: 2.15, maxX: 2.85, minZ: -15.65, maxZ: -13.65 },
      { minX: -18.5, maxX: -2.15, minZ: -15.75, maxZ: -15.15 },
      { minX: 2.15, maxX: 18.5, minZ: -15.75, maxZ: -15.15 },
      // Side drop-offs of Anyangru veranda (|x| > 7.8 for z < -15.2)
      { minX: -18.5, maxX: -7.75, minZ: -23.6, maxZ: -15.2 },
      { minX: 7.75, maxX: 18.5, minZ: -23.6, maxZ: -15.2 }
    ]
  }
};

const FELLOW_WANDERERS_PRESETS = {
  buseoksa: [
    {
      name: '솔방울 모으는 아기 여우',
      paletteIdx: 1,
      spotIdx: 1,
      offset: [-3.4, 0, -2.2],
      patrolRadius: 2.8,
      seed: 1.4
    },
    {
      name: '단풍잎 책갈피 토끼',
      paletteIdx: 2,
      spotIdx: 4,
      offset: [-2.2, 0, 1.8],
      patrolRadius: 2.6,
      seed: 3.8
    }
  ]
};

let sharedBambooWeaveTexture = null;

function getBambooWeaveTexture() {
  if (sharedBambooWeaveTexture) return sharedBambooWeaveTexture;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Warm natural dried bamboo base
  ctx.fillStyle = '#d4b272';
  ctx.fillRect(0, 0, 256, 256);

  // Herringbone / concentric bamboo strip weave pattern
  const step = 8;
  for (let y = 0; y < 256; y += step) {
    for (let x = 0; x < 256; x += step) {
      const odd = ((x / step) + (y / step)) % 2 === 0;
      ctx.fillStyle = odd ? 'rgba(115, 76, 26, 0.26)' : 'rgba(255, 240, 200, 0.24)';
      ctx.fillRect(x, y, step - 1, step - 1);

      ctx.strokeStyle = 'rgba(70, 44, 14, 0.30)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, step - 1, step - 1);
    }
  }

  // Subtle concentric ring shadows (bamboo hoop ties)
  for (let y = 24; y < 256; y += 36) {
    ctx.fillStyle = 'rgba(65, 40, 10, 0.28)';
    ctx.fillRect(0, y, 256, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  sharedBambooWeaveTexture = tex;
  return tex;
}

/**
 * Builds a traditional Korean Woven Bamboo Satgat (삿갓 / 죽립) 3D mesh group.
 * Sized precisely to fit the monk.glb head bone (head radius ~0.24m, crown top y=0.44m).
 */
function createSatgatHatMesh(palette) {
  const hatGroup = new THREE.Group();
  hatGroup.name = 'WandererSatgatHat';

  const weaveTex = getBambooWeaveTexture();
  const bambooColor = new THREE.Color(palette?.bambooTint || 0xd4b475);

  const outerBambooMat = new THREE.MeshStandardMaterial({
    color: bambooColor,
    map: weaveTex,
    roughness: 0.76,
    metalness: 0.04,
    side: THREE.FrontSide
  });

  const innerBambooMat = new THREE.MeshStandardMaterial({
    color: bambooColor.clone().multiplyScalar(0.68),
    map: weaveTex,
    roughness: 0.86,
    metalness: 0.02,
    side: THREE.BackSide
  });

  const darkBambooRibMat = new THREE.MeshStandardMaterial({
    color: 0x54381a,
    roughness: 0.72,
    metalness: 0.05
  });

  // Wide, authentic Korean conical Satgat silhouette (radius 0.45m, height 0.26m)
  const profilePoints = [
    new THREE.Vector2(0.001, 0.265),
    new THREE.Vector2(0.075, 0.225),
    new THREE.Vector2(0.180, 0.160),
    new THREE.Vector2(0.305, 0.082),
    new THREE.Vector2(0.415, 0.015),
    new THREE.Vector2(0.455, -0.012)
  ];

  const coneGeo = new THREE.LatheGeometry(profilePoints, 36);
  const outerCone = new THREE.Mesh(coneGeo, outerBambooMat);
  outerCone.castShadow = true;
  outerCone.receiveShadow = true;
  hatGroup.add(outerCone);

  const innerCone = new THREE.Mesh(coneGeo, innerBambooMat);
  hatGroup.add(innerCone);

  // Outer bamboo rim hoop (테두리 죽테)
  const rimHoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.453, 0.011, 10, 40),
    darkBambooRibMat
  );
  rimHoop.rotation.x = Math.PI / 2;
  rimHoop.position.y = -0.012;
  rimHoop.castShadow = true;
  hatGroup.add(rimHoop);

  // Mid bamboo hoop
  const midHoop = new THREE.Mesh(
    new THREE.TorusGeometry(0.275, 0.0065, 8, 32),
    darkBambooRibMat
  );
  midHoop.rotation.x = Math.PI / 2;
  midHoop.position.y = 0.095;
  hatGroup.add(midHoop);

  // 12 radial bamboo ribs (대살)
  const ribCount = 12;
  for (let i = 0; i < ribCount; i++) {
    const angle = (i / ribCount) * Math.PI * 2;
    const rib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0032, 0.005, 0.50, 6),
      darkBambooRibMat
    );
    rib.position.set(
      Math.sin(angle) * 0.225,
      0.118,
      Math.cos(angle) * 0.225
    );
    const dir = new THREE.Vector3(Math.sin(angle) * 0.45, -0.27, Math.cos(angle) * 0.45).normalize();
    rib.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    hatGroup.add(rib);
  }

  // Top woven knot finial (삿갓 꼭지)
  const finial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.035, 0.038, 12),
    darkBambooRibMat
  );
  finial.position.y = 0.268;
  finial.castShadow = true;
  hatGroup.add(finial);

  // Traditional dark fabric chin ties (삿갓 턱끈)
  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x24201c,
    roughness: 0.85
  });
  [-1, 1].forEach((side) => {
    const strap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0055, 0.0055, 0.26, 6),
      strapMat
    );
    strap.position.set(side * 0.165, -0.10, -0.03);
    strap.rotation.z = side * 0.42;
    strap.rotation.x = 0.12;
    hatGroup.add(strap);
  });

  hatGroup.userData.outerBambooMat = outerBambooMat;
  hatGroup.userData.innerBambooMat = innerBambooMat;

  return hatGroup;
}

/**
 * Builds a traditional Traveler's Back Scroll Bundle & Celadon Gourd (괴나리봇짐 & 청자 표주박)
 * Attached to the chest bone on the back (+Z in monk rig space) so it is clearly visible from behind.
 */
function createTravelerBackBundleMesh(palette) {
  const bundleGroup = new THREE.Group();
  bundleGroup.name = 'WandererBackBundle';

  const clothMat = new THREE.MeshStandardMaterial({
    color: palette?.innerRobe || 0xd8d2c5,
    roughness: 0.84,
    metalness: 0.02
  });

  const strapMat = new THREE.MeshStandardMaterial({
    color: 0x3b2c1e,
    roughness: 0.78,
    metalness: 0.04
  });

  const gourdMat = new THREE.MeshStandardMaterial({
    color: 0x8fb8a2, // Celadon jade gourd (청자빛 표주박)
    roughness: 0.35,
    metalness: 0.08
  });

  const tasselMat = new THREE.MeshStandardMaterial({
    color: 0xc85a32,
    roughness: 0.65
  });

  // Rolled bedding/scroll pack (괴나리봇짐 보따리) on the upper back (+Z = 0.195)
  const packRoll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.30, 16),
    clothMat
  );
  packRoll.rotation.z = Math.PI / 2;
  packRoll.rotation.y = 0.10;
  packRoll.position.set(0, 0.05, 0.195);
  packRoll.castShadow = true;
  packRoll.receiveShadow = true;
  bundleGroup.add(packRoll);

  // Rounded cloth end caps & leather binding straps
  [-1, 1].forEach((side) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.066, 12, 12),
      clothMat
    );
    cap.scale.set(0.65, 0.95, 0.95);
    cap.position.set(side * 0.15, 0.05, 0.195 - side * 0.015);
    bundleGroup.add(cap);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.069, 0.008, 8, 20),
      strapMat
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.set(side * 0.085, 0.05, 0.195);
    bundleGroup.add(ring);
  });

  // Diagonal shoulder sling knots across the back
  [-1, 1].forEach((side) => {
    const sling = new THREE.Mesh(
      new THREE.CylinderGeometry(0.010, 0.010, 0.26, 6),
      strapMat
    );
    sling.position.set(side * 0.085, 0.03, 0.135);
    sling.rotation.z = side * 0.42;
    sling.rotation.x = -0.35;
    bundleGroup.add(sling);
  });

  // Celadon Gourd bottle (청자 표주박) hanging at the right side of the pack
  const gourdLower = new THREE.Mesh(
    new THREE.SphereGeometry(0.044, 12, 12),
    gourdMat
  );
  gourdLower.position.set(0.11, -0.045, 0.215);
  gourdLower.castShadow = true;
  bundleGroup.add(gourdLower);

  const gourdUpper = new THREE.Mesh(
    new THREE.SphereGeometry(0.029, 12, 12),
    gourdMat
  );
  gourdUpper.position.set(0.11, 0.008, 0.215);
  bundleGroup.add(gourdUpper);

  const gourdCork = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.011, 0.022, 8),
    tasselMat
  );
  gourdCork.position.set(0.11, 0.038, 0.215);
  bundleGroup.add(gourdCork);

  bundleGroup.userData.clothMat = clothMat;
  return bundleGroup;
}

/**
 * Equips a C_ENGINE.createMonk() actor with the 3D Satgat hat, traveler back-bundle,
 * warm foot aura, and traditional Korean wanderer robe palette.
 */
function equipWandererActor(actor, palette, isSelf = false) {
  if (!actor || !actor.group) return;

  // Ensure standing/walking posture immediately
  actor.setMode('walk');
  actor.update(0, 0.016, 0);
  actor.group.updateWorldMatrix(true, true);

  const headBone = actor.group.getObjectByName('head');
  const chestBone = actor.group.getObjectByName('chest');

  if (headBone) {
    const oldHat = headBone.getObjectByName('WandererSatgatHat');
    if (oldHat) headBone.remove(oldHat);

    const satgat = createSatgatHatMesh(palette);
    // In monk.glb, headBone local head bounds are y in [-0.10, +0.45], z in [-0.27, +0.25].
    // Placing Satgat at y=0.30, z=0.02 with a slight backward tilt (-0.12 rad) seats it cleanly on the crown!
    satgat.position.set(0, 0.30, 0.02);
    satgat.rotation.x = -0.12;
    headBone.add(satgat);
    actor.satgatHat = satgat;
  }

  if (chestBone) {
    const oldBundle = chestBone.getObjectByName('WandererBackBundle');
    if (oldBundle) chestBone.remove(oldBundle);

    const backBundle = createTravelerBackBundleMesh(palette);
    chestBone.add(backBundle);
    actor.backBundle = backBundle;
  }

  // Ground aura ring under the wanderer's feet
  let footDisc = actor.group.getObjectByName('WandererFootAura');
  if (!footDisc) {
    footDisc = new THREE.Mesh(
      new THREE.RingGeometry(0.20, 0.32, 36),
      new THREE.MeshBasicMaterial({
        color: isSelf ? 0xffd27d : 0xa8d8b9,
        transparent: true,
        opacity: isSelf ? 0.45 : 0.22,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    footDisc.name = 'WandererFootAura';
    footDisc.rotation.x = -Math.PI / 2;
    footDisc.position.y = 0.025;
    actor.group.add(footDisc);
  }

  applyWandererPalette(actor, palette);
}

/**
 * Applies traditional Korean robe & bamboo hat colors to the rigged character
 */
function applyWandererPalette(actor, palette) {
  if (!actor || !actor.group || !palette) return;

  actor.group.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === 'WandererFootAura') return;

    if (!obj.userData.hasClonedMat) {
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((m) => m.clone());
      } else {
        obj.material = obj.material.clone();
      }
      obj.userData.hasClonedMat = true;
    }

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      const mName = (mat.name || '').toLowerCase();
      const oName = (obj.name || '').toLowerCase();

      if (mName.includes('saffron') || oName.includes('saffron')) {
        mat.color.setHex(palette.outerRobe);
        mat.roughness = 0.82;
      } else if (mName.includes('sage') || oName.includes('trousers') || oName.includes('robe')) {
        mat.color.setHex(palette.innerRobe);
        mat.roughness = 0.85;
      } else if (mName.includes('rice') || oName.includes('collar')) {
        mat.color.setHex(palette.collar);
      } else if (mName.includes('shoe') || oName.includes('shoe')) {
        mat.color.setHex(palette.shoes);
      }
    });
  });

  if (actor.satgatHat?.userData?.outerBambooMat) {
    const c = new THREE.Color(palette.bambooTint);
    actor.satgatHat.userData.outerBambooMat.color.copy(c);
    actor.satgatHat.userData.innerBambooMat.color.copy(c).multiplyScalar(0.68);
  }
  if (actor.backBundle?.userData?.clothMat) {
    actor.backBundle.userData.clothMat.color.setHex(palette.innerRobe);
  }
}

/**
 * Creates a speech/greeting floating 3D sprite above a wanderer's head
 */
function createWandererBubbleSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(18, 22, 20, 0.86)';
  ctx.strokeStyle = 'rgba(255, 214, 138, 0.78)';
  ctx.lineWidth = 3;

  const rx = 24, ry = 18, rw = 464, rh = 84, rad = 42;
  ctx.beginPath();
  ctx.moveTo(rx + rad, ry);
  ctx.lineTo(rx + rw - rad, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
  ctx.lineTo(rx + rw, ry + rh - rad);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
  ctx.lineTo(rx + rad, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
  ctx.lineTo(rx, ry + rad);
  ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 28px "Pretendard", "Noto Serif KR", sans-serif';
  ctx.fillStyle = '#fff5df';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, ry + rh / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.85, 0.46, 1);
  sprite.renderOrder = 25;
  return sprite;
}

class SansaWandererManager {
  constructor(world) {
    this.world = world;
    this.scene = world.scene;
    this.camera = world.camera;

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'SansaWanderersRoot';
    this.scene.add(this.rootGroup);

    this.profile = this.loadProfile();
    this.currentSpotId = 'courtyard_steps';
    this.posture = 'walk'; // 'walk' | 'kneel'

    // Player & NPC actors
    this.selfActor = null;
    this.npcWanderers = [];
    this.activeBubbles = [];
    this.greetingRipples = [];

    // sansatemple.com-style 3rd-Person Behind-the-Back Camera State
    this.yaw = 0.0;
    this.pitch = 0.02;
    this.distance = 3.65;
    this.followCamEnabled = true;
    this.camInitialized = false;
    this.camPos = new THREE.Vector3();
    this.camLook = new THREE.Vector3();

    this.isPointerDragging = false;
    this.pointerDownPos = { x: 0, y: 0 };
    this.pointerMovedDist = 0;

    // Movement & Click-to-Walk Journey State (identical to sansatemple.com + multi-waypoint support)
    this.moveSpeed = 2.05;
    this.velocity = new THREE.Vector3();
    this.keys = { w: false, a: false, s: false, d: false };
    this.waypoints = [];
    this.journeyFinalSpotId = null;
    this.pendingMeditationOnArrival = false;

    // Ground raycaster & destination point marker
    this.raycaster = new THREE.Raycaster();
    this.ndcPointer = new THREE.Vector2();
    this.destinationMarker = this.createDestinationMarker();
    this.rootGroup.add(this.destinationMarker);

    this.lastElapsed = 0;

    this.buildWanderersForSpace(this.getActiveSpace());
    this.bindUIAndControls();
    this.hookIntoWorldRenderLoop();
  }

  getActiveSpace() {
    return this.world?.spaceMode || (typeof currentSpace !== 'undefined' ? currentSpace : 'buseoksa');
  }

  loadProfile() {
    try {
      const saved = localStorage.getItem(WANDERER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.name === 'string' && typeof parsed.paletteIdx === 'number') {
          return {
            name: parsed.name,
            paletteIdx: Math.abs(parsed.paletteIdx) % WANDERER_PALETTES.length
          };
        }
      }
    } catch (e) {
      // ignore storage errors
    }
    const randomIdx = Math.floor(Math.random() * WANDERER_POETIC_NAMES.length);
    const randomPal = Math.floor(Math.random() * WANDERER_PALETTES.length);
    const initial = {
      name: WANDERER_POETIC_NAMES[randomIdx],
      paletteIdx: randomPal
    };
    try {
      localStorage.setItem(WANDERER_STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      // ignore
    }
    return initial;
  }

  saveProfile() {
    try {
      localStorage.setItem(WANDERER_STORAGE_KEY, JSON.stringify(this.profile));
    } catch (e) {
      // ignore
    }
  }

  get currentPalette() {
    return WANDERER_PALETTES[this.profile.paletteIdx % WANDERER_PALETTES.length];
  }

  /**
   * Creates the glowing Destination Point Marker (목적지 포인트 표시)
   * Combines sansatemple.com's golden ground ring with an expanding pulse wave & vertical light pin
   */
  createDestinationMarker() {
    const group = new THREE.Group();
    group.name = 'WandererDestinationMarker';
    group.visible = false;

    // 1. Primary golden ring (sansatemple.com style)
    const ringGeo = new THREE.RingGeometry(0.24, 0.33, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffd27d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.renderOrder = 18;
    group.add(ringMesh);

    // 2. Center glowing point dot
    const dotGeo = new THREE.CircleGeometry(0.095, 32);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xfff3d1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
      depthWrite: false
    });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    dotMesh.rotation.x = -Math.PI / 2;
    dotMesh.position.y = 0.005;
    dotMesh.renderOrder = 19;
    group.add(dotMesh);

    // 3. Expanding ripple wave ring
    const waveGeo = new THREE.RingGeometry(0.26, 0.31, 48);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xffd27d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.y = 0.003;
    waveMesh.renderOrder = 17;
    group.add(waveMesh);

    // 4. Vertical subtle light beacon (목적지 빛기둥 포인트)
    const beamGeo = new THREE.CylinderGeometry(0.018, 0.075, 0.85, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffe29e,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 0.425;
    beamMesh.renderOrder = 16;
    group.add(beamMesh);

    group.userData = {
      ringMesh,
      ringMat,
      dotMesh,
      dotMat,
      waveMesh,
      waveMat,
      beamMesh,
      beamMat
    };

    return group;
  }

  /**
   * Computes the exact walkable ground height (Y) at (x, z) matching expanded buildBuseoksaWorld
   * - Muryangsujeon Veranda (z >= 5.65): y = 0.20
   * - Muryangsujeon Steps (3.55 < z < 5.65): interpolates -0.78 -> 0.20
   * - Main Courtyard & Flagstone Path (-13.65 <= z <= 3.55): y = -0.78
   * - Anyangru Stone Steps (-15.55 < z < -13.65): interpolates -0.78 -> 0.08
   * - Anyangru Walkable Veranda & Meditation Cushion (z <= -15.55): y = 0.08 (0.14 on center cushion)
   */
  getGroundHeightAt(spaceId, x, z) {
    // 1. Muryangsujeon wooden veranda (우물마루, z >= 5.65)
    if (z >= 5.65) {
      return 0.20;
    }
    // 2. Central stone steps connecting Muryangsujeon veranda (z=5.65, y=0.20) to courtyard (z=3.55, y=-0.78)
    if (z > 3.55 && z < 5.65) {
      const t = (z - 3.55) / (5.65 - 3.55);
      return -0.78 + t * (0.20 - -0.78);
    }
    // 3. Anyangru wooden veranda & meditation cushion (안양루 툇마루, z <= -15.55)
    if (z <= -15.55) {
      const distToCushion = Math.hypot(x - 0.0, z - -19.5);
      if (distToCushion < 0.65) {
        return 0.14; // Sitting/standing on top of the silk meditation cushion
      }
      return 0.08;
    }
    // 4. Central stone steps leading up to Anyangru veranda (z=-13.65 y=-0.78 -> z=-15.55 y=0.08)
    if (z < -13.65 && z > -15.55) {
      const t = (-13.65 - z) / (-13.65 - -15.55);
      return -0.78 + t * (0.08 - -0.78);
    }
    // 5. Expanded main courtyard & flagstone path (박석길)
    return -0.78;
  }

  /**
   * Checks whether (x, z) is inside any pillar, tree, stone lantern, boulder, or wall obstacle
   */
  isPointBlocked(spaceId, x, z, extraMargin = 0) {
    const minX = -17.8;
    const maxX = 17.8;
    const minZ = -23.1;
    const maxZ = 10.6;

    if (x < minX || x > maxX || z < minZ || z > maxZ) return true;

    const obs = SPACE_OBSTACLES.buseoksa;
    for (const c of obs.circles) {
      const r = c.r + extraMargin;
      const dx = x - c.x;
      const dz = z - c.z;
      if (dx * dx + dz * dz < r * r) return true;
    }

    for (const b of obs.boxes) {
      if (
        x >= b.minX - extraMargin &&
        x <= b.maxX + extraMargin &&
        z >= b.minZ - extraMargin &&
        z <= b.maxZ + extraMargin
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks if the straight segment from (x0, z0) to (x1, z1) is completely clear of pillars, trees, and walls
   */
  hasLineOfSight(spaceId, x0, z0, x1, z1, extraMargin = 0.04) {
    const dist = Math.hypot(x1 - x0, z1 - z0);
    if (dist < 0.05) return true;
    const steps = Math.max(4, Math.ceil(dist / 0.24));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const sx = x0 + (x1 - x0) * t;
      const sz = z0 + (z1 - z0) * t;
      if (this.isPointBlocked(spaceId, sx, sz, extraMargin)) return false;
    }
    return true;
  }

  /**
   * Clamps (x, z) to safe walkable bounds AND resolves collisions against all pillars, trees,
   * boulders, the stone lantern, and foundation walls (with smooth tangential sliding).
   */
  clampWalkableXZ(spaceId, x, z, prevX = null, prevZ = null) {
    const minX = -17.5;
    const maxX = 17.5;
    const minZ = -22.9;
    const maxZ = 10.4;

    let cx = Math.max(minX, Math.min(maxX, x));
    let cz = Math.max(minZ, Math.min(maxZ, z));

    // If inside Anyangru veranda depth (z < -15.2), clamp x to Anyangru veranda width [-7.6, 7.6]
    if (cz < -15.2) {
      cx = Math.max(-7.6, Math.min(7.6, cx));
    }

    const obs = SPACE_OBSTACLES.buseoksa;

    for (let iter = 0; iter < 2; iter++) {
      for (const b of obs.boxes) {
        if (cx > b.minX && cx < b.maxX && cz > b.minZ && cz < b.maxZ) {
          const dLeft = cx - b.minX;
          const dRight = b.maxX - cx;
          const dBottom = cz - b.minZ;
          const dTop = b.maxZ - cz;
          const minPen = Math.min(dLeft, dRight, dBottom, dTop);

          if (minPen === dLeft) cx = b.minX - 0.01;
          else if (minPen === dRight) cx = b.maxX + 0.01;
          else if (minPen === dBottom) cz = b.minZ - 0.01;
          else cz = b.maxZ + 0.01;
        }
      }

      for (const c of obs.circles) {
        const dx = cx - c.x;
        const dz = cz - c.z;
        const distSq = dx * dx + dz * dz;
        if (distSq < c.r * c.r) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            cx = c.x + (dx / dist) * (c.r + 0.01);
            cz = c.z + (dz / dist) * (c.r + 0.01);
          } else if (prevX !== null && prevZ !== null) {
            const pdx = prevX - c.x;
            const pdz = prevZ - c.z;
            const pLen = Math.hypot(pdx, pdz) || 1;
            cx = c.x + (pdx / pLen) * (c.r + 0.02);
            cz = c.z + (pdz / pLen) * (c.r + 0.02);
          } else {
            cz = c.z - (c.r + 0.02);
          }
        }
      }

      cx = Math.max(minX, Math.min(maxX, cx));
      cz = Math.max(minZ, Math.min(maxZ, cz));
    }

    return { x: cx, z: cz };
  }

  /**
   * 2D Grid A* Pathfinding + Line-of-Sight String Pulling across the expanded courtyard & Anyangru
   */
  findObstacleFreePath(spaceId, startX, startZ, goalX, goalZ) {
    if (this.hasLineOfSight(spaceId, startX, startZ, goalX, goalZ, 0.05)) {
      return [{ x: goalX, z: goalZ }];
    }

    const step = 0.48;
    const minX = -17.5;
    const maxX = 17.5;
    const minZ = -22.9;
    const maxZ = 10.4;

    const cols = Math.round((maxX - minX) / step) + 1;
    const rows = Math.round((maxZ - minZ) / step) + 1;

    const toGrid = (wx, wz) => ({
      gx: Math.max(0, Math.min(cols - 1, Math.round((wx - minX) / step))),
      gz: Math.max(0, Math.min(rows - 1, Math.round((wz - minZ) / step)))
    });
    const toWorld = (gx, gz) => ({
      x: minX + gx * step,
      z: minZ + gz * step
    });

    const startNode = toGrid(startX, startZ);
    const goalNode = toGrid(goalX, goalZ);
    const keyOf = (gx, gz) => gz * cols + gx;

    const gScore = new Map();
    const cameFrom = new Map();
    const closed = new Set();
    const open = [];

    const startKey = keyOf(startNode.gx, startNode.gz);
    const goalKey = keyOf(goalNode.gx, goalNode.gz);
    gScore.set(startKey, 0);
    open.push({
      gx: startNode.gx,
      gz: startNode.gz,
      key: startKey,
      f: Math.hypot(goalNode.gx - startNode.gx, goalNode.gz - startNode.gz)
    });

    const dirs = [
      [1, 0, 1.0],
      [-1, 0, 1.0],
      [0, 1, 1.0],
      [0, -1, 1.0],
      [1, 1, 1.414],
      [-1, 1, 1.414],
      [1, -1, 1.414],
      [-1, -1, 1.414]
    ];

    let bestKey = startKey;
    let bestDistToGoal = Math.hypot(goalNode.gx - startNode.gx, goalNode.gz - startNode.gz);
    let iterations = 0;

    while (open.length > 0 && iterations < 4500) {
      iterations++;
      let bestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[bestIdx].f) bestIdx = i;
      }
      const current = open.splice(bestIdx, 1)[0];
      if (current.key === goalKey) {
        bestKey = goalKey;
        break;
      }
      if (closed.has(current.key)) continue;
      closed.add(current.key);

      const dGoal = Math.hypot(goalNode.gx - current.gx, goalNode.gz - current.gz);
      if (dGoal < bestDistToGoal) {
        bestDistToGoal = dGoal;
        bestKey = current.key;
      }

      const curG = gScore.get(current.key) ?? Infinity;

      for (const [dx, dz, cost] of dirs) {
        const nx = current.gx + dx;
        const nz = current.gz + dz;
        if (nx < 0 || nx >= cols || nz < 0 || nz >= rows) continue;
        const nKey = keyOf(nx, nz);
        if (closed.has(nKey)) continue;

        const wPos = toWorld(nx, nz);
        if (nKey !== goalKey && this.isPointBlocked(spaceId, wPos.x, wPos.z, 0.05)) {
          continue;
        }

        if (dx !== 0 && dz !== 0) {
          const sideA = toWorld(current.gx + dx, current.gz);
          const sideB = toWorld(current.gx, current.gz + dz);
          if (
            this.isPointBlocked(spaceId, sideA.x, sideA.z, 0.02) ||
            this.isPointBlocked(spaceId, sideB.x, sideB.z, 0.02)
          ) {
            continue;
          }
        }

        const tentativeG = curG + cost;
        if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
          cameFrom.set(nKey, current.key);
          gScore.set(nKey, tentativeG);
          const h = Math.hypot(goalNode.gx - nx, goalNode.gz - nz);
          open.push({ gx: nx, gz: nz, key: nKey, f: tentativeG + h });
        }
      }
    }

    const rawPts = [{ x: startX, z: startZ }];
    const chain = [];
    let curr = bestKey;
    while (curr !== undefined && curr !== startKey) {
      chain.push(curr);
      curr = cameFrom.get(curr);
    }
    chain.reverse();
    for (const k of chain) {
      const gz = Math.floor(k / cols);
      const gx = k % cols;
      rawPts.push(toWorld(gx, gz));
    }
    rawPts.push({ x: goalX, z: goalZ });

    const smoothed = [];
    let anchorIdx = 0;
    while (anchorIdx < rawPts.length - 1) {
      let furthestIdx = anchorIdx + 1;
      for (let testIdx = rawPts.length - 1; testIdx > anchorIdx + 1; testIdx--) {
        if (
          this.hasLineOfSight(
            spaceId,
            rawPts[anchorIdx].x,
            rawPts[anchorIdx].z,
            rawPts[testIdx].x,
            rawPts[testIdx].z,
            0.04
          )
        ) {
          furthestIdx = testIdx;
          break;
        }
      }
      smoothed.push(rawPts[furthestIdx]);
      anchorIdx = furthestIdx;
    }

    return smoothed;
  }

  /**
   * Builds a multi-waypoint obstacle-free path from startPos to endPos, automatically routing
   * through Muryangsujeon's central stone steps (z = 3.4..5.7) and Anyangru's central stone steps (z = -13.5..-15.7)
   */
  buildWalkPath(spaceId, startPos, endPos) {
    const clampedEnd = this.clampWalkableXZ(spaceId, endPos.x, endPos.z, startPos.x, startPos.z);

    const stageTargets = [];
    const startOnMuryang = startPos.z > 5.05;
    const endOnMuryang = clampedEnd.z > 5.05;
    const startOnAnyang = startPos.z < -15.15;
    const endOnAnyang = clampedEnd.z < -15.15;

    // Leaving Muryangsujeon veranda down to courtyard
    if (startOnMuryang && !endOnMuryang) {
      stageTargets.push({ x: 0.0, z: 5.75 });
      stageTargets.push({ x: 0.0, z: 3.4 });
    }
    // Leaving Anyangru veranda down to courtyard
    if (startOnAnyang && !endOnAnyang) {
      stageTargets.push({ x: 0.0, z: -15.75 });
      stageTargets.push({ x: 0.0, z: -13.45 });
    }
    // Entering Muryangsujeon veranda from courtyard
    if (!startOnMuryang && endOnMuryang) {
      stageTargets.push({ x: 0.0, z: 3.4 });
      stageTargets.push({ x: 0.0, z: 5.75 });
    }
    // Entering Anyangru veranda from courtyard
    if (!startOnAnyang && endOnAnyang) {
      stageTargets.push({ x: 0.0, z: -13.45 });
      stageTargets.push({ x: 0.0, z: -15.75 });
    }

    stageTargets.push({ x: clampedEnd.x, z: clampedEnd.z });

    const points = [];
    let curX = startPos.x;
    let curZ = startPos.z;

    for (const stage of stageTargets) {
      const subPath = this.findObstacleFreePath(spaceId, curX, curZ, stage.x, stage.z);
      for (const pt of subPath) {
        const y = this.getGroundHeightAt(spaceId, pt.x, pt.z);
        points.push(new THREE.Vector3(pt.x, y, pt.z));
      }
      curX = stage.x;
      curZ = stage.z;
    }

    return points;
  }

  /**
   * Spawns the player's 삿갓 쓴 산사 나그네 and fellow wanderer NPCs for Buseoksa
   */
  buildWanderersForSpace(spaceId) {
    if (this.selfActor?.group) {
      this.rootGroup.remove(this.selfActor.group);
    }
    this.npcWanderers.forEach((npc) => {
      if (npc.actor?.group) this.rootGroup.remove(npc.actor.group);
    });
    this.npcWanderers = [];
    this.waypoints = [];
    this.destinationMarker.visible = false;

    const spots = WANDERER_SPOTS.buseoksa;
    const initialSpot = spots[0];
    this.currentSpotId = initialSpot.id;
    this.posture = 'walk';

    // 1. Create Player Wanderer using SANSA_CORE's rigged monk + 3D Satgat Hat & Back Bundle
    const selfActor = C_ENGINE.createMonk();
    selfActor.group.name = 'PlayerSansaWanderer';
    const startY = this.getGroundHeightAt(spaceId, initialSpot.pos[0], initialSpot.pos[2]);
    selfActor.group.position.set(initialSpot.pos[0], startY, initialSpot.pos[2]);
    selfActor.group.rotation.y = initialSpot.facingYaw || 0;
    this.rootGroup.add(selfActor.group);
    this.selfActor = selfActor;

    // Align 3rd-person camera directly behind player
    this.yaw = initialSpot.facingYaw || 0;
    this.pitch = 0.02;
    this.distance = 3.65;
    this.followCamEnabled = true;
    this.camInitialized = false;

    selfActor.ready.then(() => {
      equipWandererActor(selfActor, this.currentPalette, true);
    });

    // 2. Create Fellow Wanderer NPCs (1 on mobile for thermal optimization, 2 on desktop)
    const maxNpcs = this.world?.isMobile ? 1 : 2;
    const presets = FELLOW_WANDERERS_PRESETS.buseoksa.slice(0, maxNpcs);
    presets.forEach((preset) => {
      const spot = spots[preset.spotIdx % spots.length] || spots[0];
      const homeX = spot.pos[0] + preset.offset[0];
      const homeZ = spot.pos[2] + preset.offset[2];
      const clamped = this.clampWalkableXZ(spaceId, homeX, homeZ);
      const homeY = this.getGroundHeightAt(spaceId, clamped.x, clamped.z);

      const npcActor = C_ENGINE.createMonk();
      npcActor.group.position.set(clamped.x, homeY, clamped.z);
      npcActor.group.rotation.y = spot.facingYaw || 0;
      this.rootGroup.add(npcActor.group);

      const palette = WANDERER_PALETTES[preset.paletteIdx % WANDERER_PALETTES.length];
      npcActor.ready.then(() => {
        equipWandererActor(npcActor, palette, false);
      });

      this.npcWanderers.push({
        name: preset.name,
        actor: npcActor,
        palette,
        homePos: new THREE.Vector3(clamped.x, homeY, clamped.z),
        targetPos: new THREE.Vector3(clamped.x, homeY, clamped.z),
        patrolRadius: preset.patrolRadius || 1.8,
        seed: preset.seed || 1.0,
        nextMoveTime: 2.5 + Math.random() * 4.0,
        speed: 0.95
      });
    });

    this.renderSpotButtons(spaceId);
    this.syncHUD();
  }

  /**
   * Starts an automatic walking journey to `targetVec`, displaying the Destination Point Marker
   * at the destination and smoothly walking the character there with 3rd-person camera follow.
   */
  startJourneyToPoint(targetVec, spotId = null, toastMessage = null, meditateOnArrival = false) {
    if (!this.selfActor) return;

    const spaceId = this.getActiveSpace();
    this.waypoints = this.buildWalkPath(spaceId, this.selfActor.group.position, targetVec);
    this.journeyFinalSpotId = spotId;
    this.pendingMeditationOnArrival = meditateOnArrival;
    this.followCamEnabled = true;

    if (this.posture !== 'walk') {
      this.posture = 'walk';
      this.selfActor.setMode('walk');
      toggleBreathingGuide(false);
    }
    this.syncHUD();

    const finalDest = this.waypoints[this.waypoints.length - 1];
    if (finalDest) {
      this.destinationMarker.position.set(finalDest.x, finalDest.y + 0.035, finalDest.z);
      this.destinationMarker.visible = true;

      const hex = this.currentPalette.markerHex || 0xffd27d;
      const { ringMat, waveMat } = this.destinationMarker.userData;
      if (ringMat) ringMat.color.setHex(hex);
      if (waveMat) waveMat.color.setHex(hex);
    }

    if (spotId) {
      this.currentSpotId = spotId;
      this.highlightActiveSpotChip(spotId);
    }

    if (toastMessage) {
      showToast(toastMessage);
    }
  }

  /**
   * Command the wanderer to walk to a named scenic spot
   */
  walkToSpot(spotId) {
    const spots = WANDERER_SPOTS.buseoksa;
    const spot = spots.find((s) => s.id === spotId);
    if (!spot) return;

    const dest = new THREE.Vector3(spot.pos[0], spot.pos[1], spot.pos[2]);
    const shouldMeditate = spot.id === 'anyangnu_cushion';
    this.startJourneyToPoint(
      dest,
      spot.id,
      `${spot.icon} '${spot.label}' 목적지에 포인트가 표시되며 나그네가 걸어갑니다.`,
      shouldMeditate
    );
  }

  /**
   * Raycasts a screen click onto the temple ground/veranda to set a walk destination
   */
  handleCanvasGroundClick(clientX, clientY) {
    const canvas = this.world?.renderer?.domElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    this.ndcPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.ndcPointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.ndcPointer, this.camera);

    // 1. Check if the click hit an interactive 3D wish lantern or the wind-bell first
    if (Array.isArray(this.world.interactiveTargets) && this.world.interactiveTargets.length > 0) {
      const hits = this.raycaster.intersectObjects(this.world.interactiveTargets, false);
      if (hits.length > 0 && hits[0].distance < 42) {
        return; // Let lantern / wind-bell click handler run
      }
    }

    // 2. Raycast against scene environment meshes
    const spaceId = this.getActiveSpace();
    const activeEnvGroup = this.world.buseoksaGroup;

    let hitPoint = null;
    if (activeEnvGroup) {
      const envHits = this.raycaster.intersectObject(activeEnvGroup, true);
      for (const hit of envHits) {
        if (hit.distance > 46) continue;
        if (hit.point.y <= 5.2 && hit.point.y >= -2.2) {
          if (hit.face) {
            const worldNormal = hit.face.normal
              .clone()
              .transformDirection(hit.object.matrixWorld);
            if (worldNormal.y < 0.45) continue;
          }
          hitPoint = hit.point.clone();
          break;
        }
      }
    }

    // 3. Fallback mathematical ground intersection if clicking between stone tiles
    if (!hitPoint && this.selfActor) {
      const refY = this.selfActor.group.position.y;
      const ray = this.raycaster.ray;
      if (Math.abs(ray.direction.y) > 0.001) {
        const t = (refY - ray.origin.y) / ray.direction.y;
        if (t > 0 && t < 50) {
          hitPoint = ray.origin.clone().addScaledVector(ray.direction, t);
        }
      }
    }

    if (!hitPoint) return;

    const clamped = this.clampWalkableXZ(spaceId, hitPoint.x, hitPoint.z);
    const groundY = this.getGroundHeightAt(spaceId, clamped.x, clamped.z);
    const finalTarget = new THREE.Vector3(clamped.x, groundY, clamped.z);

    this.startJourneyToPoint(finalTarget, null, null, false);
  }

  /**
   * Perform a warm palm-together greeting (합장 인사) & receive greetings back from nearby wanderers
   */
  triggerGreeting() {
    if (!this.selfActor) return;
    const now = this.lastElapsed || 0;

    if (this.posture === 'kneel') {
      this.selfActor.bow(now);
    } else {
      this.selfActor.greet(now);
    }

    this.spawnBubbleAbove(this.selfActor.group, '🙏 평안하신지요', 2.6);
    this.spawnGroundRipple(this.selfActor.group.position, this.currentPalette.markerHex || 0xffd27d);

    this.npcWanderers.forEach((npc, idx) => {
      setTimeout(() => {
        if (!npc.actor) return;
        npc.actor.greet((this.lastElapsed || 0) + 0.35);
        const replies = ['🙏 성불하십시오', '🎋 좋은 바람입니다', '🍵 평안한 산책 되소서'];
        this.spawnBubbleAbove(npc.actor.group, replies[idx % replies.length], 2.5);
        this.spawnGroundRipple(npc.actor.group.position, 0x98f5c4);
      }, 360 + idx * 280);
    });

    showToast(`🙏 '${this.profile.name}'님이 두 손을 모아 합장 인사를 건넵니다.`);
  }

  /**
   * Enter serene kneeling meditation on Anyangru's silk cushion facing Sobaeksan
   */
  enterAnyangruMeditation() {
    if (!this.selfActor) return;
    this.pendingMeditationOnArrival = false;
    this.waypoints = [];
    this.destinationMarker.visible = false;
    this.posture = 'kneel';
    this.selfActor.group.position.set(0.0, 0.14, -19.5);
    this.selfActor.group.rotation.y = 0.0; // Face -Z directly through Anyangru toward Sobaeksan
    this.yaw = 0.0;
    this.pitch = 0.04;
    this.selfActor.setMode('kneel');
    this.spawnBubbleAbove(this.selfActor.group, '🍵 소백산맥을 바라보며 명상합니다', 2.8);
    this.spawnGroundRipple(this.selfActor.group.position, this.currentPalette.markerHex || 0xffd27d);
    toggleBreathingGuide(true);
    this.syncHUD();
    showToast('🍵 안양루 명상 방석에 앉아 소백산맥 차경을 바라보며 호흡 명상에 듭니다.');
  }

  /**
   * Toggle between standing walk ('walk') and walking up to Anyangru's cushion to meditate ('kneel')
   */
  togglePosture() {
    if (!this.selfActor) return;

    if (this.posture === 'kneel' || this.pendingMeditationOnArrival) {
      this.pendingMeditationOnArrival = false;
      this.waypoints = [];
      this.destinationMarker.visible = false;
      this.posture = 'walk';
      this.selfActor.setMode('walk');
      toggleBreathingGuide(false);
      this.syncHUD();
      showToast('🎋 명상을 마치고 자리에서 일어나 산사 산책을 이어갑니다.');
      return;
    }

    // Check distance to Anyangru's meditation cushion at (0.0, 0.14, -19.5)
    const selfPos = this.selfActor.group.position;
    const distToCushion = Math.hypot(selfPos.x - 0.0, selfPos.z - -19.5);
    if (distToCushion <= 0.45) {
      this.enterAnyangruMeditation();
    } else {
      const cushionTarget = new THREE.Vector3(0.0, 0.14, -19.5);
      this.startJourneyToPoint(
        cushionTarget,
        'anyangnu_cushion',
        '🍵 안양루 누각 위로 올라가 방석 위에서 명상을 시작합니다.',
        true
      );
    }
  }

  /**
   * Cycle through the 4 traditional Korean robe & Satgat bamboo palettes
   */
  cyclePalette() {
    this.profile.paletteIdx = (this.profile.paletteIdx + 1) % WANDERER_PALETTES.length;
    this.saveProfile();

    if (this.selfActor) {
      applyWandererPalette(this.selfActor, this.currentPalette);
      this.spawnGroundRipple(this.selfActor.group.position, this.currentPalette.markerHex);
    }

    this.syncHUD();
    showToast(`🎋 '${this.currentPalette.fullName}' 차림으로 갈아입었습니다.`);
  }

  /**
   * Reroll cute wanderer nickname and attire palette
   */
  rerollIdentity() {
    const otherNames = WANDERER_POETIC_NAMES.filter((n) => n !== this.profile.name);
    this.profile.name = otherNames[Math.floor(Math.random() * otherNames.length)] || WANDERER_POETIC_NAMES[0];
    this.profile.paletteIdx = (this.profile.paletteIdx + 1) % WANDERER_PALETTES.length;
    this.saveProfile();

    if (this.selfActor) {
      applyWandererPalette(this.selfActor, this.currentPalette);
      this.spawnBubbleAbove(this.selfActor.group, `🐾 ${this.profile.name}`, 2.4);
    }

    this.syncHUD();
    showToast(`🎲 귀여운 새 닉네임 '${this.profile.name}'(${this.currentPalette.fullName})로 변경되었습니다!`);
  }

  spawnBubbleAbove(targetGroup, text, duration = 2.4) {
    if (!targetGroup) return;
    const sprite = createWandererBubbleSprite(text);
    sprite.position.set(0, 1.72, 0);
    targetGroup.add(sprite);
    this.activeBubbles.push({
      sprite,
      parent: targetGroup,
      age: 0,
      duration
    });
  }

  spawnGroundRipple(pos, colorHex = 0xffd27d) {
    const geo = new THREE.RingGeometry(0.18, 0.26, 40);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, pos.y + 0.04, pos.z);
    this.rootGroup.add(mesh);
    this.greetingRipples.push({ mesh, mat, age: 0, duration: 1.25 });
  }

  renderSpotButtons() {
    const container = document.getElementById('spirit-spots-row');
    if (!container) return;
    const spots = WANDERER_SPOTS.buseoksa;

    container.innerHTML = spots
      .map(
        (spot) => `
        <button
          type="button"
          class="spirit-spot-chip ${spot.id === this.currentSpotId ? 'active' : ''}"
          data-spot-id="${spot.id}"
          title="${spot.label} 목적지로 걸어가기"
        >
          <span>${spot.icon}</span>
          <span>${spot.label}</span>
        </button>
      `
      )
      .join('');

    container.querySelectorAll('.spirit-spot-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const spotId = btn.dataset.spotId;
        if (spotId) this.walkToSpot(spotId);
      });
    });
  }

  highlightActiveSpotChip(spotId) {
    const container = document.getElementById('spirit-spots-row');
    if (!container) return;
    container.querySelectorAll('.spirit-spot-chip').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.spotId === spotId);
    });
  }

  syncHUD() {
    const nameEl = document.getElementById('spirit-name-display');
    const dotEl = document.getElementById('spirit-color-dot');
    const visitorsEl = document.getElementById('spirit-visitors-count');
    const badgeEl = document.getElementById('pebble-stack-badge');
    const stackBtn = document.getElementById('spirit-stack-btn');

    if (nameEl) nameEl.textContent = this.profile.name;
    if (dotEl) {
      dotEl.textContent = '🐾';
      dotEl.style.background = `radial-gradient(circle at 35% 35%, ${this.currentPalette.orbHex}, rgba(20, 26, 22, 0.9))`;
      dotEl.style.boxShadow = `0 0 12px ${this.currentPalette.orbHex}66`;
    }
    if (visitorsEl) {
      visitorsEl.textContent = `${1 + this.npcWanderers.length}인 산책 중`;
    }
    if (badgeEl) {
      badgeEl.textContent = this.currentPalette.label;
    }
    if (stackBtn) {
      const isMeditatingOrHeading = this.posture === 'kneel' || this.pendingMeditationOnArrival;
      stackBtn.classList.toggle('active', isMeditatingOrHeading);
      const span = stackBtn.querySelector('span');
      if (span) {
        span.textContent = isMeditatingOrHeading ? '🎋 일어서기' : '🍵 명상하기';
      }
    }
  }

  bindUIAndControls() {
    const bowBtn = document.getElementById('spirit-bow-btn');
    const stackBtn = document.getElementById('spirit-stack-btn');
    const pebbleBtn = document.getElementById('spirit-pebble-btn');
    const rerollBtn = document.getElementById('spirit-reroll-btn');
    const colorDot = document.getElementById('spirit-color-dot');

    bowBtn?.addEventListener('click', () => this.triggerGreeting());
    stackBtn?.addEventListener('click', () => this.togglePosture());
    pebbleBtn?.addEventListener('click', () => this.cyclePalette());
    colorDot?.addEventListener('click', () => this.cyclePalette());
    rerollBtn?.addEventListener('click', () => this.rerollIdentity());

    // Pointer & Multi-Touch controls on canvas:
    // - 1-finger tap / mouse click on ground: set walk destination + spawn tap ripple
    // - 1-finger drag / mouse drag: orbit 3rd-person camera around wanderer
    // - 2-finger pinch / mouse wheel: zoom 3rd-person camera distance
    this.touchPointers = new Map();
    this.pinchStartDist = null;
    this.pinchStartCamDist = this.distance;
    this.hadMultiTouch = false;

    const canvas = this.world?.renderer?.domElement;
    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        this.touchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (this.touchPointers.size === 2) {
          const pts = [...this.touchPointers.values()];
          this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          this.pinchStartCamDist = this.distance;
          this.hadMultiTouch = true;
          this.isPointerDragging = false;
          return;
        }

        if (this.touchPointers.size === 1) {
          this.hadMultiTouch = false;
          this.isPointerDragging = true;
          this.pointerDownPos.x = e.clientX;
          this.pointerDownPos.y = e.clientY;
          this.pointerDownTime = performance.now();
          this.pointerMovedDist = 0;
        }
      });

      window.addEventListener('pointermove', (e) => {
        if (this.touchPointers.has(e.pointerId)) {
          this.touchPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }

        // 2-finger pinch zoom on mobile
        if (this.touchPointers.size === 2 && this.pinchStartDist) {
          const pts = [...this.touchPointers.values()];
          const curDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const delta = (this.pinchStartDist - curDist) * 0.012;
          this.followCamEnabled = true;
          this.distance = Math.max(2.1, Math.min(9.0, this.pinchStartCamDist + delta));
          return;
        }

        if (!this.isPointerDragging) return;
        const dx = e.clientX - this.pointerDownPos.x;
        const dy = e.clientY - this.pointerDownPos.y;
        this.pointerMovedDist += Math.hypot(dx, dy);
        this.pointerDownPos.x = e.clientX;
        this.pointerDownPos.y = e.clientY;

        const dragThreshold = e.pointerType === 'touch' ? 10 : 4;
        if (this.pointerMovedDist > dragThreshold) {
          this.followCamEnabled = true;
          const rotSpeed = e.pointerType === 'touch' ? 0.0068 : 0.0055;
          this.yaw -= dx * rotSpeed;
          this.pitch = Math.max(-0.22, Math.min(0.34, this.pitch + dy * 0.0038));
        }
      });

      const finishPointer = (e) => {
        this.touchPointers.delete(e.pointerId);
        if (this.touchPointers.size < 2) {
          this.pinchStartDist = null;
        }
        if (!this.isPointerDragging) return;
        this.isPointerDragging = false;

        // Generous tap tolerance on mobile touch (22px) so thumb taps always register cleanly
        const tapMaxMove = e.pointerType === 'touch' ? 22 : 8;
        const tapDuration = performance.now() - (this.pointerDownTime || 0);
        if (
          !this.hadMultiTouch &&
          this.pointerMovedDist < tapMaxMove &&
          tapDuration < 650 &&
          (e.target === canvas || canvas.contains(e.target))
        ) {
          this.spawnScreenTapRipple(e.clientX, e.clientY);
          this.handleCanvasGroundClick(e.clientX, e.clientY);
        }
      };

      window.addEventListener('pointerup', finishPointer);
      window.addEventListener('pointercancel', (e) => {
        this.touchPointers.delete(e.pointerId);
        this.pinchStartDist = null;
        this.isPointerDragging = false;
      });

      canvas.addEventListener(
        'wheel',
        (e) => {
          this.followCamEnabled = true;
          this.distance = Math.max(2.1, Math.min(9.5, this.distance + e.deltaY * 0.0028));
        },
        { passive: true }
      );
    }

    // Keyboard WASD / Arrow walking & hotkeys (B = bow/greet, C = kneel/stand, P = robe color)
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') {
        this.keys.w = true;
        this.cancelPointJourney();
      } else if (code === 'KeyS' || code === 'ArrowDown') {
        this.keys.s = true;
        this.cancelPointJourney();
      } else if (code === 'KeyA' || code === 'ArrowLeft') {
        this.keys.a = true;
        this.cancelPointJourney();
      } else if (code === 'KeyD' || code === 'ArrowRight') {
        this.keys.d = true;
        this.cancelPointJourney();
      } else if (code === 'KeyB' || code === 'KeyG') {
        e.preventDefault();
        this.triggerGreeting();
      } else if (code === 'KeyC') {
        e.preventDefault();
        this.togglePosture();
      } else if (code === 'KeyP') {
        e.preventDefault();
        this.cyclePalette();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.w = false;
      else if (code === 'KeyS' || code === 'ArrowDown') this.keys.s = false;
      else if (code === 'KeyA' || code === 'ArrowLeft') this.keys.a = false;
      else if (code === 'KeyD' || code === 'ArrowRight') this.keys.d = false;
    });
  }

  spawnScreenTapRipple(clientX, clientY) {
    const el = document.createElement('div');
    el.className = 'ground-tap-ripple';
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 580);
  }

  cancelPointJourney() {
    this.waypoints = [];
    this.pendingMeditationOnArrival = false;
    this.destinationMarker.visible = false;
    this.followCamEnabled = true;
    document.body.classList.remove('wanderer-walking');
    if (this.posture !== 'walk' && this.selfActor) {
      this.posture = 'walk';
      this.selfActor.setMode('walk');
      toggleBreathingGuide(false);
    }
    this.syncHUD();
  }

  /**
   * Hooks into Chakyeong3DWorld.renderer.render so our character movement & 3rd-person behind-the-back
   * camera update smoothly every frame right before WebGL renders.
   */
  hookIntoWorldRenderLoop() {
    const world = this.world;
    if (!world || !world.renderer) return;

    const origRender = world.renderer.render.bind(world.renderer);
    world.renderer.render = (scene, camera) => {
      const elapsed = performance.now() * 0.001;
      const dt = Math.min(0.05, Math.max(0.001, elapsed - (this.lastElapsed || elapsed)));
      this.lastElapsed = elapsed;

      this.updateFrame(elapsed, dt);
      return origRender(scene, camera);
    };
  }

  updateFrame(elapsed, dt) {
    if (!this.selfActor || !this.selfActor.group) return;

    const spaceId = this.getActiveSpace();
    const selfPos = this.selfActor.group.position;

    // 1. Compute Player Velocity from either WASD keys OR active Click-to-Walk Destination Waypoints
    let moveX = 0;
    let moveZ = 0;
    const forwardInput = (this.keys.w ? 1 : 0) - (this.keys.s ? 1 : 0);
    const strafeInput = (this.keys.d ? 1 : 0) - (this.keys.a ? 1 : 0);

    if (forwardInput !== 0 || strafeInput !== 0) {
      const fwdX = -Math.sin(this.yaw);
      const fwdZ = -Math.cos(this.yaw);
      const rightX = Math.cos(this.yaw);
      const rightZ = -Math.sin(this.yaw);

      moveX = fwdX * forwardInput + rightX * strafeInput;
      moveZ = fwdZ * forwardInput + rightZ * strafeInput;
      const len = Math.hypot(moveX, moveZ) || 1;
      moveX = (moveX / len) * this.moveSpeed;
      moveZ = (moveZ / len) * this.moveSpeed;
    } else if (this.waypoints.length > 0 && this.posture === 'walk') {
      const target = this.waypoints[0];
      const dx = target.x - selfPos.x;
      const dz = target.z - selfPos.z;
      const distSq = dx * dx + dz * dz;

      if (distSq <= 0.03) {
        selfPos.x = target.x;
        selfPos.z = target.z;
        selfPos.y = this.getGroundHeightAt(spaceId, selfPos.x, selfPos.z);
        this.waypoints.shift();

        if (this.waypoints.length === 0) {
          this.destinationMarker.visible = false;
          this.spawnGroundRipple(selfPos, this.currentPalette.markerHex || 0xffd27d);
          if (this.pendingMeditationOnArrival) {
            this.enterAnyangruMeditation();
            return;
          }
        }
      } else {
        const dist = Math.sqrt(distSq);
        const stepSpeed = Math.min(this.moveSpeed, Math.max(0.95, dist * 3.2));
        moveX = (dx / dist) * stepSpeed;
        moveZ = (dz / dist) * stepSpeed;
      }
    }

    // 2. Integrate position & orient character so their back is to the camera and they face the walk direction
    const damp = Math.exp(-dt * 10);
    this.velocity.x = this.velocity.x * damp + moveX * (1 - damp);
    this.velocity.z = this.velocity.z * damp + moveZ * (1 - damp);

    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    if (speed > 0.03 && this.posture === 'walk') {
      const prevX = selfPos.x;
      const prevZ = selfPos.z;
      const nextX = prevX + this.velocity.x * dt;
      const nextZ = prevZ + this.velocity.z * dt;
      const clamped = this.clampWalkableXZ(spaceId, nextX, nextZ, prevX, prevZ);
      selfPos.x = clamped.x;
      selfPos.z = clamped.z;

      const actualDx = clamped.x - prevX;
      const actualDz = clamped.z - prevZ;
      const actualMoveLen = Math.hypot(actualDx, actualDz);
      const rotDirX = actualMoveLen > 0.0005 ? actualDx : this.velocity.x;
      const rotDirZ = actualMoveLen > 0.0005 ? actualDz : this.velocity.z;

      // In monk.glb rig, -Z is forward, so facing (velX, velZ) requires rotation.y = atan2(-velX, -velZ)
      const targetRotY = Math.atan2(-rotDirX, -rotDirZ);
      const angleDiff = Math.atan2(
        Math.sin(targetRotY - this.selfActor.group.rotation.y),
        Math.cos(targetRotY - this.selfActor.group.rotation.y)
      );
      this.selfActor.group.rotation.y += angleDiff * (1 - Math.exp(-dt * 10));

      // Gently align camera yaw behind the walking character when not manually dragging the mouse
      if (!this.isPointerDragging) {
        const camAngleDiff = Math.atan2(
          Math.sin(this.selfActor.group.rotation.y - this.yaw),
          Math.cos(this.selfActor.group.rotation.y - this.yaw)
        );
        this.yaw += camAngleDiff * (1 - Math.exp(-dt * 2.6));
      }
    } else {
      this.velocity.set(0, 0, 0);
    }

    // Smooth vertical ground tracking
    const targetGroundY = this.getGroundHeightAt(spaceId, selfPos.x, selfPos.z);
    selfPos.y += (targetGroundY - selfPos.y) * (1 - Math.exp(-dt * 16));

    // Update player skeletal animation
    const normalizedSpeed = Math.min(1, speed / this.moveSpeed);
    this.selfActor.update(elapsed, dt, normalizedSpeed);

    const isMobileScreen =
      window.innerWidth <= 768 || (this.camera && this.camera.aspect < 0.88);
    const isActivelyWalking = speed > 0.06 || this.waypoints.length > 0;
    document.body.classList.toggle('wanderer-walking', isActivelyWalking);

    // 3. Animate the Destination Point Marker (scaled up 1.38x on mobile screens for clear visibility)
    if (this.destinationMarker.visible) {
      const { ringMesh, dotMesh, waveMesh, waveMat, beamMat } = this.destinationMarker.userData;
      const mobileScale = isMobileScreen ? 1.38 : 1.0;
      this.destinationMarker.scale.setScalar(mobileScale);

      const pulse = 1 + Math.sin(elapsed * 5.0) * 0.08;
      ringMesh.scale.setScalar(pulse);
      dotMesh.scale.setScalar(1 + Math.cos(elapsed * 5.0) * 0.14);

      const wavePhase = (elapsed * 0.95) % 1;
      waveMesh.scale.setScalar(1 + wavePhase * 1.5);
      waveMat.opacity = (1 - wavePhase) * 0.72;

      if (beamMat) {
        beamMat.opacity = 0.34 + Math.sin(elapsed * 4.0) * 0.14;
      }
    }

    // 4. Update Fellow Wanderer NPCs
    this.npcWanderers.forEach((npc) => {
      if (!npc.actor || !npc.actor.group) return;
      const nPos = npc.actor.group.position;

      if (elapsed > npc.nextMoveTime) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * npc.patrolRadius;
        const tx = npc.homePos.x + Math.cos(angle) * r;
        const tz = npc.homePos.z + Math.sin(angle) * r;
        const clamped = this.clampWalkableXZ(spaceId, tx, tz);
        npc.targetPos.set(clamped.x, this.getGroundHeightAt(spaceId, clamped.x, clamped.z), clamped.z);
        npc.nextMoveTime = elapsed + 6.0 + Math.random() * 6.5;
      }

      const dx = npc.targetPos.x - nPos.x;
      const dz = npc.targetPos.z - nPos.z;
      const dist = Math.hypot(dx, dz);

      let npcNormSpeed = 0;
      if (dist > 0.12) {
        const step = Math.min(dist, npc.speed * dt);
        const nextNpcX = nPos.x + (dx / dist) * step;
        const nextNpcZ = nPos.z + (dz / dist) * step;
        const clampedNpc = this.clampWalkableXZ(spaceId, nextNpcX, nextNpcZ, nPos.x, nPos.z);
        nPos.x = clampedNpc.x;
        nPos.z = clampedNpc.z;
        nPos.y = this.getGroundHeightAt(spaceId, nPos.x, nPos.z);

        const targetYaw = Math.atan2(-dx, -dz);
        const diff = Math.atan2(
          Math.sin(targetYaw - npc.actor.group.rotation.y),
          Math.cos(targetYaw - npc.actor.group.rotation.y)
        );
        npc.actor.group.rotation.y += diff * (1 - Math.exp(-dt * 8));
        npcNormSpeed = 0.55;
      }

      npc.actor.update(elapsed + npc.seed, dt, npcNormSpeed);
    });

    // 5. Update floating greeting bubbles & ground ripples
    for (let i = this.activeBubbles.length - 1; i >= 0; i--) {
      const b = this.activeBubbles[i];
      b.age += dt;
      b.sprite.position.y = 1.70 + b.age * 0.12;
      if (b.age > b.duration - 0.45) {
        b.sprite.material.opacity = Math.max(0, (b.duration - b.age) / 0.45);
      }
      if (b.age >= b.duration) {
        b.parent.remove(b.sprite);
        b.sprite.material.map?.dispose();
        b.sprite.material.dispose();
        this.activeBubbles.splice(i, 1);
      }
    }

    for (let i = this.greetingRipples.length - 1; i >= 0; i--) {
      const r = this.greetingRipples[i];
      r.age += dt;
      const t = r.age / r.duration;
      r.mesh.scale.setScalar(1 + t * 3.8);
      r.mat.opacity = Math.max(0, (1 - t) * 0.75);
      if (r.age >= r.duration) {
        this.rootGroup.remove(r.mesh);
        r.mesh.geometry.dispose();
        r.mat.dispose();
        this.greetingRipples.splice(i, 1);
      }
    }

    // 6. sansatemple.com-style 3rd-Person Behind-the-Back Camera Frame!
    if (this.followCamEnabled) {
      const sinYaw = Math.sin(this.yaw);
      const cosYaw = Math.cos(this.yaw);

      const effectiveDist = isMobileScreen ? this.distance * 0.86 : this.distance;
      const camHeightOffset = isMobileScreen
        ? (this.posture === 'walk' ? 1.62 : 1.32)
        : (this.posture === 'walk' ? 1.88 : 1.48);
      const lookHeightOffset = isMobileScreen
        ? (this.posture === 'walk' ? 0.54 : 0.68)
        : (this.posture === 'walk' ? 1.13 : 1.24);
      const extraZoomHeight = Math.max(0, effectiveDist - 3.3) * 0.22;

      let desiredCamX = selfPos.x + sinYaw * effectiveDist;
      let desiredCamY = selfPos.y + camHeightOffset + extraZoomHeight + this.pitch * 3.0;
      let desiredCamZ = selfPos.z + cosYaw * effectiveDist;

      // In Buseoksa, keep camera in front of Muryangsujeon's expanded rear lattice wall (z = 11.4)
      if (spaceId === 'buseoksa' && desiredCamZ > 10.95) {
        desiredCamZ = 10.95;
      }

      const lookTargetX = selfPos.x - sinYaw * 3.0;
      const lookTargetY = selfPos.y + lookHeightOffset - this.pitch * 1.7;
      const lookTargetZ = selfPos.z - cosYaw * 3.0;

      const camSmooth = this.camInitialized ? 1 - Math.exp(-dt * 12) : 1.0;
      this.camInitialized = true;

      this.camPos.x += (desiredCamX - this.camPos.x) * camSmooth;
      this.camPos.y += (desiredCamY - this.camPos.y) * camSmooth;
      this.camPos.z += (desiredCamZ - this.camPos.z) * camSmooth;

      this.camLook.x += (lookTargetX - this.camLook.x) * camSmooth;
      this.camLook.y += (lookTargetY - this.camLook.y) * camSmooth;
      this.camLook.z += (lookTargetZ - this.camLook.z) * camSmooth;

      this.camera.position.copy(this.camPos);
      this.camera.lookAt(this.camLook);

      if (this.world.camPos && this.world.targetCamPos) {
        this.world.camPos.copy(this.camPos);
        this.world.targetCamPos.copy(this.camPos);
        this.world.camLook.copy(this.camLook);
        this.world.targetCamLook.copy(this.camLook);
      }
    }
  }
}

// Initialize SansaWandererManager as soon as world3D is ready
window.addEventListener('DOMContentLoaded', () => {
  const initCheck = setInterval(() => {
    if (typeof world3D !== 'undefined' && world3D && world3D.scene && typeof C_ENGINE !== 'undefined') {
      clearInterval(initCheck);
      window.world3D = world3D;
      window.wandererManager = new SansaWandererManager(world3D);

      // Bind top-right camera preset buttons
      document.querySelectorAll('[data-cam-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!window.wandererManager) return;
          if (btn.dataset.camBtn === 'spirit') {
            window.wandererManager.followCamEnabled = true;
            window.wandererManager.camInitialized = false;
            showToast('🎋 산사 나그네 3인칭 후방 시점으로 전환했습니다.');
          } else {
            window.wandererManager.followCamEnabled = false;
            showToast('🎥 풍경 조망 시점으로 전환했습니다. (바닥을 클릭하거나 이동하면 나그네 3인칭 시점으로 돌아옵니다)');
          }
        });
      });
    }
  }, 40);
});
