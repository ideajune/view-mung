/**
 * 차경(借景) 3D — 한국 명승 산사 풍경 멍 (Powered by SANSA_CORE Three.js r180 Engine)
 * - sansatemple.com 100% 동일 3D 코어 엔진(PE Sanctuary + Garden + Pine Woodland + Lotus Pond + PBR + Woodland Panorama) 구동
 * - 공간 1 (영주 부석사 무량수전 앞마당) & 공간 2 (순천 선암사 승선교·연꽃 연못)
 * - 실시간 시간대 전환 (산사 아침 / 석양 노을 / 별 헤는 밤), 계절 꽃잎·단풍잎, 3D 소원 연등 & 합장, 3D 청동 풍경종, 모바일 핀치 줌 반응형
 */

const C_ENGINE = window.SANSA_CORE;

const STORAGE_KEY = 'chakyeong_3d_wishes_v2';
const HAPJANG_STORAGE_KEY = 'chakyeong_3d_hapjang_v2';

const SPACE_META = {
  buseoksa: {
    eyebrow: '차경(借景) 3D 제1경 · 경북 영주 봉황산',
    title: '부석사 무량수전 앞마당',
    caption: '배흘림기둥과 서까래 처마 밑, 석등과 소나무 숲 너머로 펼쳐지는 실사 산악 능선과 산사 마당',
    locationBadge: '무량수전 처마·마당',
    writeDesc: '전통 목조 법당 처마 밑과 산사 마당에 3D 연등을 매달아 산바람에 소원을 실어 보냅니다.',
    defaultBellMix: 80,
    defaultWaterMix: 20,
    defaultWindMix: 65
  },
  seonamsa: {
    eyebrow: '차경(借景) 3D 제2경 · 전남 순천 조계산',
    title: '순천 선암사 승선교·연못',
    caption: '무지개 돌다리(승선교)와 연꽃 연못의 수면 반영, 바람에 흩날리는 꽃잎·단풍잎의 여운',
    locationBadge: '승선교 연못 산책길',
    writeDesc: '승선교 돌다리와 연꽃 연못 산책길에 3D 연등을 걸어 고요한 수면 위에 마음을 비춥니다.',
    defaultBellMix: 45,
    defaultWaterMix: 85,
    defaultWindMix: 55
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
   REAL-TIME 3D WORLD ENGINE (100% Authentic sansatemple.com SANSA_CORE)
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

    // Camera spherical orbit state
    this.camTarget = new C_ENGINE.Vector3(0, 3.4, 8.0);
    this.desiredCamTarget = new C_ENGINE.Vector3(0, 3.4, 8.0);
    this.camPos = new C_ENGINE.Vector3(0, 2.35, 36.0);
    this.desiredCamPos = new C_ENGINE.Vector3(0, 2.35, 36.0);

    this.orbitYaw = 0;
    this.orbitPitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.zoomOffset = 0;

    this.isPointerDown = false;
    this.pointerStart = { x: 0, y: 0 };
    this.pointerMoved = false;
    this.pinchStartDist = null;
    this.pinchStartZoom = 0;
    this.mouseNDC = new C_ENGINE.Vector2(-99, -99);
    this.raycaster = new C_ENGINE.Raycaster();

    this.lastFrameTime = performance.now();
    this.elapsedTime = 0;
    this.lanternMeshes = [];
    this.interactiveTargets = [];
    this.hoveredObject = null;

    this.sonicRings = [];
    this.hapjangParticles = [];
    this.bellExcitation = 0;
    this.sanctuary = null;
    this.woodland = null;
    this.nightAmount = 0;
    this.targetNightAmount = 0;

    this.initRendererAndScene();
    this.initCustomTextures();
    this.initInteractiveWindBell();
    this.initFallingFoliage3D();
    this.loadSanctuaryAndGarden();
    this.initInteractionEvents();
    this.setCameraPreset('default');
    this.setTimeMode('dawn');

    window.addEventListener('resize', () => this.onResize());
  }

  getResponsiveFov() {
    const aspect = this.width / Math.max(1, this.height);
    if (aspect < 0.65) return 72;
    if (aspect < 0.85) return 66;
    return 60;
  }

  initRendererAndScene() {
    this.scene = new C_ENGINE.Scene();
    this.fallbackSky = new C_ENGINE.Color('#dce9df');
    this.scene.background = this.fallbackSky;
    this.scene.fog = new C_ENGINE.Fog(0xdce9df, 86, 220);

    this.camera = new C_ENGINE.PerspectiveCamera(
      this.getResponsiveFov(),
      this.width / Math.max(1, this.height),
      0.08,
      280
    );
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camTarget);

    this.renderer = new C_ENGINE.WebGLRenderer({
      antialias: true,
      powerPreference: 'default'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.width < 700 ? 1.6 : 1.75)
    );
    this.renderer.outputColorSpace = C_ENGINE.SRGBColorSpace;
    this.renderer.toneMapping = C_ENGINE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = C_ENGINE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Exact sansatemple.com Lighting (Hemisphere + Ambient + 3072 Shadow Directional + 2 Altar SpotLights)
    const skyLight = new C_ENGINE.HemisphereLight(0xe8f3f0, 0xa4b99b, 0.85);
    const ambientLight = new C_ENGINE.AmbientLight(0xfff1e6, 0.18);
    this.scene.add(skyLight, ambientLight);

    const sunLight = new C_ENGINE.DirectionalLight(0xfff4e3, 2.4);
    sunLight.position.set(-36, 34.5, 32);
    sunLight.target.position.set(0, 0, -4);
    sunLight.castShadow = true;

    const shadowSize = this.width < 700 ? 2048 : 3072;
    sunLight.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(sunLight.shadow.camera, {
      left: -48,
      right: 48,
      top: 52,
      bottom: -52,
      near: 1,
      far: 140
    });
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.075;
    sunLight.shadow.radius = 4;
    this.scene.add(sunLight, sunLight.target);

    const altarSpot = new C_ENGINE.SpotLight(0xffde91, 480 * 1.44, 34 * 1.2, 0.75, 0.9, 2);
    altarSpot.position.set(-4.5, 10.2, 1.5);
    altarSpot.target.position.set(-2.2, 5.1, -9.0);

    const fillSpot = new C_ENGINE.SpotLight(0xfff0b2, 250 * 1.44, 28 * 1.2, 0.8, 1.0, 2);
    fillSpot.position.set(5.5, 8.4, -1.2);
    fillSpot.target.position.set(3.3, 4.9, -9.1);
    this.scene.add(altarSpot, altarSpot.target, fillSpot, fillSpot.target);

    this.lighting = {
      sky: skyLight,
      ambient: ambientLight,
      sun: sunLight,
      altar: altarSpot,
      fill: fillSpot
    };

    // Load Poly Haven 360° Distant Woodland Panorama (identical to sansatemple.com)
    const texLoader = new C_ENGINE.TextureLoader();
    texLoader
      .loadAsync('assets/environment/woodland.jpg')
      .then((tex) => {
        tex.colorSpace = C_ENGINE.SRGBColorSpace;
        tex.mapping = C_ENGINE.EquirectangularReflectionMapping;
        this.woodland = tex;
        this.scene.background = tex;
        this.scene.backgroundBlurriness = 0.015;
        this.scene.backgroundRotation.y = 0.65;
        this.applyAtmosphereLighting();
      })
      .catch(() => {});

    // Support user dropping custom Buseoksa photo onto the screen
    window.applyCustomBuseoksaPhoto = (imageUrl) => {
      texLoader.load(imageUrl, (tex) => {
        tex.colorSpace = C_ENGINE.SRGBColorSpace;
        tex.mapping = C_ENGINE.EquirectangularReflectionMapping;
        this.woodland = tex;
        this.scene.background = tex;
        this.scene.backgroundBlurriness = 0.005;
        this.applyAtmosphereLighting();
      });
    };

    this.lanternsRoot = new C_ENGINE.Group();
    this.fxRoot = new C_ENGINE.Group();
    this.scene.add(this.lanternsRoot);
    this.scene.add(this.fxRoot);
  }

  async loadSanctuaryAndGarden() {
    try {
      const sanctuary = await C_ENGINE.buildSanctuary(this.scene, this.renderer, { support: false });
      this.sanctuary = sanctuary;
      sanctuary.setSpace('garden');

      // Generate RoomEnvironment PMREM reflections (identical to sansatemple.com)
      const roomEnv = new C_ENGINE.RoomEnvironment();
      const pmrem = new C_ENGINE.PMREMGenerator(this.renderer);
      this.reflections = pmrem.fromScene(roomEnv, 0.02);
      this.scene.environment = this.reflections.texture;
      roomEnv.dispose();
      pmrem.dispose();

      // Add Seungseongyo Semicircular Stone Arch Details to the Lotus Pond Bridge (-21.1, 0, 36)
      this.buildSeungseongyoPondArch(sanctuary.assets.stone);

      this.applyAtmosphereLighting();
      this.lighting.sun.shadow.needsUpdate = true;

      // Load complete garden (3D pine.glb + 4-view orthographic pine woodland + rock/ground PBR)
      await sanctuary.completeGarden();
      this.lighting.sun.shadow.needsUpdate = true;
      this.applyAtmosphereLighting();
    } catch (err) {
      console.error('Sanctuary build error:', err);
    }
  }

  buildSeungseongyoPondArch(stoneMat) {
    if (!stoneMat) return;
    // Create a clean MeshStandardMaterial sharing the PBR maps without custom lanternBounce shader attribute conflicts
    const cleanArchStoneMat = new C_ENGINE.MeshStandardMaterial({
      color: 0x9a978e,
      roughness: 0.86,
      metalness: 0.04,
      map: stoneMat.map || null,
      normalMap: stoneMat.normalMap || null,
      roughnessMap: stoneMat.roughnessMap || null
    });

    const archGroup = new C_ENGINE.Group();
    // Positioned at the Lotus Pond bridge (`es = { x: -21.1, z: 36 }`)
    archGroup.position.set(-21.1, -0.95, 36.0);

    const archRadius = 1.65;
    const bridgeWidth = 2.75;
    const voussoirCount = 16;

    for (let i = 0; i < voussoirCount; i++) {
      const angle = ((i + 0.5) / voussoirCount) * Math.PI;
      const geo = new C_ENGINE.RoundedBoxGeometry(0.32, 0.28, bridgeWidth, 2, 0.025);
      const mesh = new C_ENGINE.Mesh(geo, cleanArchStoneMat);
      mesh.position.set(0, Math.sin(angle) * archRadius * 0.65, Math.cos(angle) * archRadius);
      mesh.rotation.x = -(angle - Math.PI / 2);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      archGroup.add(mesh);
    }

    // Low traditional stone parapets along both sides of the bridge
    for (const sideX of [-1.25, 1.25]) {
      const railGeo = new C_ENGINE.RoundedBoxGeometry(0.22, 0.26, 3.3, 2, 0.03);
      const rail = new C_ENGINE.Mesh(railGeo, cleanArchStoneMat);
      rail.position.set(sideX, 1.22, 0);
      rail.castShadow = true;
      rail.receiveShadow = true;
      archGroup.add(rail);
    }

    this.scene.add(archGroup);
  }

  initCustomTextures() {
    // Glow sprite texture for wish lanterns & hapjang particles
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const gCtx = glowCanvas.getContext('2d');
    const grad = gCtx.createRadialGradient(128, 128, 4, 128, 128, 124);
    grad.addColorStop(0, 'rgba(255, 248, 220, 1)');
    grad.addColorStop(0.28, 'rgba(245, 158, 11, 0.45)');
    grad.addColorStop(0.65, 'rgba(245, 158, 11, 0.12)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    gCtx.fillStyle = grad;
    gCtx.fillRect(0, 0, 256, 256);
    this.glowTex = new C_ENGINE.CanvasTexture(glowCanvas);

    // Hanji wish lantern textures
    this.lanternTextures = {};
    Object.keys(LANTERN_COLORS).forEach((colorKey) => {
      const palette = LANTERN_COLORS[colorKey];
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
      this.lanternTextures[colorKey] = tex;
    });

    this.bronzeMat = new C_ENGINE.MeshStandardMaterial({
      color: 0xb39659,
      roughness: 0.42,
      metalness: 0.75
    });

    this.darkWoodCapMat = new C_ENGINE.MeshStandardMaterial({
      color: 0x3b281e,
      roughness: 0.8
    });
  }

  initInteractiveWindBell() {
    // Place interactive 3D Bronze Wind-Bell under the front-right eave outside the Hall facade (z = 23.2)
    this.windBellPivot = new C_ENGINE.Group();
    this.windBellPivot.position.set(12.6, 8.65, 24.6);

    const chainGeo = new C_ENGINE.CylinderGeometry(0.015, 0.015, 0.55, 8);
    const chainMesh = new C_ENGINE.Mesh(chainGeo, this.bronzeMat);
    chainMesh.position.y = -0.27;
    this.windBellPivot.add(chainMesh);

    const bellPts = [
      new C_ENGINE.Vector2(0.01, 0),
      new C_ENGINE.Vector2(0.22, -0.05),
      new C_ENGINE.Vector2(0.28, -0.28),
      new C_ENGINE.Vector2(0.35, -0.58),
      new C_ENGINE.Vector2(0.39, -0.66),
      new C_ENGINE.Vector2(0.32, -0.66)
    ];
    const bellGeo = new C_ENGINE.LatheGeometry(bellPts, 28);
    const bellMesh = new C_ENGINE.Mesh(bellGeo, this.bronzeMat);
    bellMesh.position.y = -0.52;
    bellMesh.castShadow = true;
    bellMesh.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windBellPivot.add(bellMesh);
    this.interactiveTargets.push(bellMesh);

    // Enlarged invisible hitbox for easy clicking/tapping
    const bellHitbox = new C_ENGINE.Mesh(
      new C_ENGINE.SphereGeometry(0.85, 8, 8),
      new C_ENGINE.MeshBasicMaterial({ visible: false })
    );
    bellHitbox.position.y = -0.85;
    bellHitbox.userData = { type: 'windbell', label: '🔔 처마 끝 풍경종 울리기' };
    this.windBellPivot.add(bellHitbox);
    this.interactiveTargets.push(bellHitbox);

    this.windFishPivot = new C_ENGINE.Group();
    this.windFishPivot.position.y = -1.18;

    const lowerCord = new C_ENGINE.Mesh(
      new C_ENGINE.CylinderGeometry(0.01, 0.01, 0.55, 6),
      this.bronzeMat
    );
    lowerCord.position.y = 0.2;
    this.windFishPivot.add(lowerCord);

    const fishShape = new C_ENGINE.Shape();
    fishShape.moveTo(0, 0.24);
    fishShape.quadraticCurveTo(0.28, 0.05, 0.16, -0.28);
    fishShape.lineTo(0.32, -0.48);
    fishShape.lineTo(0.04, -0.36);
    fishShape.lineTo(-0.04, -0.36);
    fishShape.lineTo(-0.32, -0.48);
    fishShape.lineTo(-0.16, -0.28);
    fishShape.quadraticCurveTo(-0.28, 0.05, 0, 0.24);

    const fishGeo = new C_ENGINE.ExtrudeGeometry(fishShape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01
    });
    const fishMat = new C_ENGINE.MeshStandardMaterial({
      color: 0xd9a760,
      roughness: 0.28,
      metalness: 0.85
    });
    const fishMesh = new C_ENGINE.Mesh(fishGeo, fishMat);
    fishMesh.position.set(0, -0.12, -0.015);
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

    const leafGeo = new C_ENGINE.PlaneGeometry(0.18, 0.14);
    this.leafInstancedMat = new C_ENGINE.MeshBasicMaterial({
      color: 0xe86a38,
      side: C_ENGINE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });

    this.leafInstancedMesh = new C_ENGINE.InstancedMesh(
      leafGeo,
      this.leafInstancedMat,
      this.leafCount
    );
    for (let i = 0; i < this.leafCount; i++) {
      this.leafData.push({
        ox: (Math.random() - 0.5) * 28,
        y: Math.random() * 9,
        oz: (Math.random() - 0.5) * 24,
        vx: 0.35 + Math.random() * 0.65,
        vy: -0.42 - Math.random() * 0.5,
        vz: (Math.random() - 0.5) * 0.35,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        spin: 0.8 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      });
    }
    this.fxRoot.add(this.leafInstancedMesh);
  }

  rebuild3DLanterns(wishesForSpace, activeWishId) {
    while (this.lanternsRoot.children.length > 0) {
      this.lanternsRoot.remove(this.lanternsRoot.children[0]);
    }
    this.lanternMeshes = [];
    this.interactiveTargets = this.interactiveTargets.filter(
      (obj) => obj.userData?.type === 'windbell'
    );

    const total = wishesForSpace.length;

    const lanternPts = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const y = (t - 0.5) * 0.62;
      const r = 0.09 + Math.sin(t * Math.PI) * 0.22;
      lanternPts.push(new C_ENGINE.Vector2(r, y));
    }
    const bodyGeo = new C_ENGINE.LatheGeometry(lanternPts, 24);
    const capGeo = new C_ENGINE.CylinderGeometry(0.14, 0.14, 0.045, 16);
    const tagGeo = new C_ENGINE.PlaneGeometry(0.12, 0.38);
    const haloGeo = new C_ENGINE.PlaneGeometry(1, 1);
    const hitSphereGeo = new C_ENGINE.SphereGeometry(0.55, 8, 8);
    const hitSphereMat = new C_ENGINE.MeshBasicMaterial({ visible: false });

    wishesForSpace.forEach((wish, idx) => {
      const pivot = new C_ENGINE.Group();
      const t = total <= 1 ? 0.5 : idx / (total - 1);

      let x, y, z;
      if (this.spaceMode === 'buseoksa') {
        // Hang gracefully along the front eave outside the Korean timber hall facade (`z = 23.2`)
        x = -10.5 + t * 21.0;
        const normX = x / 14.0;
        y = 8.45 + normX * normX * 0.28;
        z = 24.55 + (idx % 2) * 0.25;
      } else {
        // Hang along the Lotus Pond & Seungseongyo path (`x = -26..-17`, `z = 32..39`)
        const angle = 0.35 + t * 2.15;
        x = -28.0 + Math.cos(angle) * 7.4;
        z = 36.0 + Math.sin(angle) * 7.2;
        y = 2.65 + (idx % 2) * 0.18;
      }

      pivot.position.set(x, y, z);

      const cordLen = 0.45 + (idx % 3) * 0.14;
      const cordMesh = new C_ENGINE.Mesh(
        new C_ENGINE.CylinderGeometry(0.01, 0.01, cordLen, 6),
        this.bronzeMat
      );
      cordMesh.position.y = -cordLen * 0.5;
      pivot.add(cordMesh);

      const lanternCenterY = -cordLen - 0.31;
      const colorKey = wish.color || 'amber';
      const pal = LANTERN_COLORS[colorKey] || LANTERN_COLORS.amber;
      const isSelected = wish.id === activeWishId;

      const bodyMat = new C_ENGINE.MeshStandardMaterial({
        map: this.lanternTextures[colorKey] || this.lanternTextures.amber,
        emissive: new C_ENGINE.Color(pal.hex),
        emissiveMap: this.lanternTextures[colorKey] || this.lanternTextures.amber,
        emissiveIntensity: isSelected ? 1.65 : 1.05,
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

      const topCap = new C_ENGINE.Mesh(capGeo, this.darkWoodCapMat);
      topCap.position.y = lanternCenterY + 0.31;
      pivot.add(topCap);

      const botCap = new C_ENGINE.Mesh(capGeo, this.darkWoodCapMat);
      botCap.position.y = lanternCenterY - 0.31;
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
      const haloScale = isSelected ? 2.4 : 1.65;
      halo.scale.set(haloScale, haloScale, 1);
      halo.position.y = lanternCenterY;
      pivot.add(halo);

      const tagMat = new C_ENGINE.MeshBasicMaterial({
        color: 0xf5efe2,
        side: C_ENGINE.DoubleSide
      });
      const tagMesh = new C_ENGINE.Mesh(tagGeo, tagMat);
      tagMesh.position.y = lanternCenterY - 0.56;
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

    const ringGeo = new C_ENGINE.PlaneGeometry(0.6, 0.6);
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
    ringMesh.position.set(12.6, 7.85, 24.6);
    this.fxRoot.add(ringMesh);
    this.sonicRings.push({ mesh: ringMesh, mat: ringMat, scale: 1, alpha: 0.9 });
  }

  spawnHapjangParticles3D(wishId) {
    const targetLantern = this.lanternMeshes.find((l) => l.wishId === wishId);
    const origin = targetLantern
      ? targetLantern.bodyMesh.userData.worldPos.clone()
      : this.camTarget.clone();

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
      const s = 0.26 + Math.random() * 0.32;
      sprite.scale.set(s, s, 1);
      sprite.position.set(
        origin.x + (Math.random() - 0.5) * 0.8,
        origin.y + (Math.random() - 0.5) * 0.45,
        origin.z + (Math.random() - 0.5) * 0.8
      );
      sprite.lookAt(this.camera.position);
      this.fxRoot.add(sprite);

      this.hapjangParticles.push({
        sprite,
        mat: spriteMat,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0.75 + Math.random() * 1.15,
        vz: (Math.random() - 0.5) * 0.6,
        alpha: 0.98
      });
    }
  }

  /* ------------------------------------------------------------------------
     ATMOSPHERE, TIME OF DAY & SPACE TRANSITIONS
     ------------------------------------------------------------------------ */
  setSpace(space) {
    this.spaceMode = space;
    this.setCameraPreset(this.camPreset);
  }

  setTimeMode(timeKey) {
    this.timeMode = timeKey;
    if (timeKey === 'dawn') {
      this.targetNightAmount = 0.0;
    } else if (timeKey === 'sunset') {
      this.targetNightAmount = 0.42;
    } else {
      this.targetNightAmount = 1.0;
    }
    this.applyAtmosphereLighting();
  }

  applyAtmosphereLighting() {
    const e = this.nightAmount;
    const isSunset = this.timeMode === 'sunset';

    const dayFog = new C_ENGINE.Color(isSunset ? '#d8a88e' : '#dce9df');
    const nightFog = new C_ENGINE.Color('#343a50');
    const dayUpper = new C_ENGINE.Color(isSunset ? '#ffd4b2' : '#e8f3f0');
    const nightUpper = new C_ENGINE.Color('#adbcdb');
    const dayLower = new C_ENGINE.Color(isSunset ? '#8f7562' : '#a4b99b');
    const nightLower = new C_ENGINE.Color('#8f9b8c');
    const daySun = new C_ENGINE.Color(isSunset ? '#ff9e58' : '#fff4e3');
    const nightSun = new C_ENGINE.Color('#b2c0e5');

    this.fallbackSky.copy(dayFog).lerp(nightFog, e);
    this.scene.background = this.woodland ?? this.fallbackSky;
    this.scene.backgroundIntensity = isSunset
      ? 0.72 * (1 - e * 0.5)
      : 0.95 + (0.16 - 0.95) * e;

    if (this.scene.fog) {
      this.scene.fog.color.copy(dayFog).lerp(nightFog, e);
    }

    const { sky, ambient, sun, altar, fill } = this.lighting;
    sky.color.copy(dayUpper).lerp(nightUpper, e);
    sky.groundColor.copy(dayLower).lerp(nightLower, e);
    sky.intensity = 0.9 + (0.62 - 0.9) * e;

    ambient.color.set(isSunset ? '#ffd8be' : '#fff1e6').lerp(new C_ENGINE.Color('#efd2c4'), e);
    ambient.intensity = 0.22 + (0.42 - 0.22) * e;

    sun.color.copy(daySun).lerp(nightSun, e);
    sun.intensity = (isSunset ? 2.45 : 2.25) * (1 - e) + 0.48 * e;

    altar.intensity = (480 + 60 * e) * 1.44;
    fill.intensity = (250 + 40 * e) * 1.44;

    this.scene.environmentIntensity = 0.38 + (0.22 - 0.38) * e;

    if (this.sanctuary) {
      this.sanctuary.setNightAmount(e);
    }
  }

  setFoliageMode(foliageKey) {
    this.foliageMode = foliageKey;
    this.leafInstancedMat.color.set(foliageKey === 'autumn' ? 0xe86434 : 0xfbcfe8);
  }

  setCameraPreset(preset) {
    this.camPreset = preset;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.zoomOffset = 0;

    const aspect = this.width / Math.max(1, this.height);
    const portraitPullback = aspect < 0.85 ? (0.85 - aspect) * 6.5 : 0;

    if (this.spaceMode === 'buseoksa') {
      if (preset === 'closeup') {
        // Right outside the front Korean timber eaves looking at columns, brackets, plaque, lanterns & wind-bell
        this.desiredCamPos.set(5.2, 4.8, 29.2 + portraitPullback * 0.5);
        this.desiredCamTarget.set(2.5, 6.8, 23.0);
      } else if (preset === 'wide') {
        // Grand panoramic view from the mountain gate across the courtyard, temple hall, pine woodland & panorama
        this.desiredCamPos.set(0, 3.6, 48.0 + portraitPullback);
        this.desiredCamTarget.set(0, 4.8, 14.0);
      } else {
        // Default courtyard & eave borrowed-scenery framing (matching sansatemple.com garden framing)
        this.desiredCamPos.set(-4.5, 2.65, 36.5 + portraitPullback * 0.8);
        this.desiredCamTarget.set(0, 5.2, 20.0);
      }
    } else {
      // Space 2: Lotus Pond (`Bt = {-28, 36}`) & Seungseongyo Stone Bridge (`es = {-21.1, 36}`)
      if (preset === 'closeup') {
        this.desiredCamPos.set(-17.8, 1.55, 39.2 + portraitPullback * 0.45);
        this.desiredCamTarget.set(-26.5, 0.85, 35.8);
      } else if (preset === 'wide') {
        this.desiredCamPos.set(-11.5, 3.1, 46.5 + portraitPullback * 0.8);
        this.desiredCamTarget.set(-27.0, 1.4, 35.0);
      } else {
        this.desiredCamPos.set(-15.5, 2.05, 42.5 + portraitPullback * 0.65);
        this.desiredCamTarget.set(-27.5, 1.0, 35.5);
      }
    }
  }

  focusOnLantern(wishId) {
    const item = this.lanternMeshes.find((l) => l.wishId === wishId);
    if (!item) return;
    const wp = item.bodyMesh.userData.worldPos;
    const aspect = this.width / Math.max(1, this.height);
    const mobileOffset = aspect < 0.85 ? 1.4 : 0;

    if (this.spaceMode === 'buseoksa') {
      this.desiredCamPos.set(wp.x * 0.85, wp.y - 0.35, wp.z + 4.2 + mobileOffset);
      this.desiredCamTarget.set(wp.x, wp.y - 0.1, wp.z - 2.0);
    } else {
      this.desiredCamPos.set(wp.x + 3.6 + mobileOffset, wp.y + 0.4, wp.z + 3.6 + mobileOffset);
      this.desiredCamTarget.set(wp.x, wp.y - 0.1, wp.z);
    }
  }

  /* ------------------------------------------------------------------------
     RAYCASTER, MOUSE ORBIT & MOBILE PINCH-TO-ZOOM INTERACTION
     ------------------------------------------------------------------------ */
  initInteractionEvents() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.pointerMoved = false;
      this.pointerStart.x = e.clientX;
      this.pointerStart.y = e.clientY;
      this.mouseNDC.x = (e.clientX / this.width) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / this.height) * 2 + 1;
    });

    window.addEventListener('pointermove', (e) => {
      this.mouseNDC.x = (e.clientX / this.width) * 2 - 1;
      this.mouseNDC.y = -(e.clientY / this.height) * 2 + 1;

      if (this.isPointerDown && this.pinchStartDist === null) {
        const dx = e.clientX - this.pointerStart.x;
        const dy = e.clientY - this.pointerStart.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          this.pointerMoved = true;
        }
        const sensitivity = this.isMobile ? 0.0034 : 0.0024;
        this.targetYaw = Math.max(-1.35, Math.min(1.35, this.targetYaw - dx * sensitivity));
        this.targetPitch = Math.max(-0.42, Math.min(0.45, this.targetPitch - dy * (sensitivity * 0.8)));
        this.pointerStart.x = e.clientX;
        this.pointerStart.y = e.clientY;
        return;
      }

      if (!this.isMobile) {
        this.checkHoverIntersection(e.clientX, e.clientY);
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      if (!this.pointerMoved && e.target === el && this.pinchStartDist === null) {
        this.mouseNDC.x = (e.clientX / this.width) * 2 - 1;
        this.mouseNDC.y = -(e.clientY / this.height) * 2 + 1;
        this.handleSceneClick();
      }
    });

    el.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 2) {
          this.pointerMoved = true;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          this.pinchStartDist = Math.hypot(dx, dy);
          this.pinchStartZoom = this.zoomOffset;
        }
      },
      { passive: true }
    );

    el.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length === 2 && this.pinchStartDist !== null) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const delta = (this.pinchStartDist - dist) * 0.025;
          this.zoomOffset = Math.max(-6.0, Math.min(8.0, this.pinchStartZoom + delta));
        }
      },
      { passive: true }
    );

    el.addEventListener(
      'touchend',
      (e) => {
        if (e.touches.length < 2) {
          this.pinchStartDist = null;
        }
      },
      { passive: true }
    );

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomOffset = Math.max(-6.0, Math.min(8.0, this.zoomOffset + e.deltaY * 0.005));
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
      if (data.type === 'windbell') {
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
    this.isMobile = this.width < 768;
    this.camera.fov = this.getResponsiveFov();
    this.camera.aspect = this.width / Math.max(1, this.height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.width < 700 ? 1.6 : 1.75)
    );
    if (!activeWishId) {
      this.setCameraPreset(this.camPreset);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const dt = Math.min(Math.max((now - this.lastFrameTime) / 1000, 0.001), 0.05);
    this.lastFrameTime = now;
    this.elapsedTime += dt;
    const elapsed = this.elapsedTime;

    // Smoothly transition day/sunset/night lighting & sanctuary vertex GI
    if (Math.abs(this.nightAmount - this.targetNightAmount) > 0.001) {
      this.nightAmount += (this.targetNightAmount - this.nightAmount) * Math.min(1, dt * 3.5);
      this.applyAtmosphereLighting();
    }

    // Update SANSA_CORE sanctuary (wind sway on bamboo/pines, pond water ripples, butterflies, dust motes)
    if (this.sanctuary) {
      try {
        this.sanctuary.update(elapsed, dt, true);
      } catch (e) {
        // Guard against partial load state during first async frames
      }
    }

    // Smoothly interpolate camera position & spherical orbit
    this.orbitYaw += (this.targetYaw - this.orbitYaw) * 0.08;
    this.orbitPitch += (this.targetPitch - this.orbitPitch) * 0.08;

    const breathSwayX = Math.sin(elapsed * 0.35) * 0.05;
    const breathSwayY = Math.cos(elapsed * 0.28) * 0.035;

    this.camPos.lerp(this.desiredCamPos, 0.06);
    this.camTarget.lerp(this.desiredCamTarget, 0.06);

    const viewDir = new C_ENGINE.Vector3().subVectors(this.camTarget, this.camPos);
    const baseDist = Math.max(2.0, viewDir.length() + this.zoomOffset);
    const baseYaw = Math.atan2(viewDir.x, viewDir.z) + this.orbitYaw;
    const basePitch = Math.asin(Math.max(-0.85, Math.min(0.85, viewDir.y / Math.max(0.1, viewDir.length())))) + this.orbitPitch;

    this.camera.position.set(
      this.camPos.x + breathSwayX - Math.sin(this.orbitYaw) * 2.2,
      Math.max(0.6, this.camPos.y + breathSwayY - this.orbitPitch * 2.0),
      this.camPos.z - this.zoomOffset * 0.75
    );

    this.camera.lookAt(
      this.camera.position.x + Math.sin(baseYaw) * Math.cos(basePitch) * baseDist,
      this.camera.position.y + Math.sin(basePitch) * baseDist,
      this.camera.position.z + Math.cos(baseYaw) * Math.cos(basePitch) * baseDist
    );

    // Animate 3D Bronze Wind-Bell
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

    // Animate 3D Hanging Wish Lanterns
    for (const l of this.lanternMeshes) {
      l.pivot.rotation.z = Math.sin(elapsed * l.speed + l.phase) * 0.055;
      l.pivot.rotation.x = Math.cos(elapsed * (l.speed * 0.8) + l.phase) * 0.035;
      l.tagMesh.rotation.z = Math.sin(elapsed * 2.4 + l.phase) * 0.14;
      l.tagMesh.rotation.y = Math.cos(elapsed * 1.7 + l.phase) * 0.25;
      if (l.halo) {
        l.halo.lookAt(this.camera.position);
      }
    }

    // Animate 3D Falling Petals / Maple Leaves around active camera area
    const center = this.camTarget;
    for (let i = 0; i < this.leafCount; i++) {
      const d = this.leafData[i];
      d.ox += (d.vx + Math.sin(elapsed * 1.5 + d.phase) * 0.45) * dt;
      d.y += d.vy * dt;
      d.oz += d.vz * dt;
      d.rx += d.spin * dt;
      d.ry += d.spin * 0.8 * dt;

      if (d.y < -0.5 || d.ox > 15) {
        d.ox = -14 + Math.random() * 28;
        d.y = 6.5 + Math.random() * 4.5;
        d.oz = -12 + Math.random() * 24;
      }

      this.leafDummy.position.set(center.x + d.ox, d.y, center.z + d.oz);
      this.leafDummy.rotation.set(d.rx, d.ry, 0);
      this.leafDummy.scale.setScalar(1);
      this.leafDummy.updateMatrix();
      this.leafInstancedMesh.setMatrixAt(i, this.leafDummy.matrix);
    }
    this.leafInstancedMesh.instanceMatrix.needsUpdate = true;

    // Animate Sonic Rings & Hapjang Particles
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
    showToast('풍경멍 모드입니다. 드래그/터치로 3D 풍경을 둘러보세요 (Esc/Space로 복귀).');
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
