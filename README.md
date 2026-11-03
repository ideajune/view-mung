# 🏮 차경(借景) 3D — 한국 명승 산사 '풍경 멍' 힐링 웹사이트

한국 전통 산사 건축의 미학인 **차경(借景, 자연 풍경을 건축의 창과 기둥을 통해 빌려와 감상하는 기법)**을 테마로 구현한 실시간 3D WebGL 힐링 웹 프로토타입입니다.
별도의 빌드 도구나 무거운 외부 에셋 설치 없이 브라우저에서 즉시 실행됩니다.

---

## 🌐 배포 및 저장소 주소

- **Vercel 프로덕션 (대표 주소)**: https://view-mung.vercel.app
- **Vercel Git 브랜치 도메인**: https://view-mung-git-main-ideajune-2390s-projects.vercel.app
- **GitHub Pages 주소**: https://ideajune.github.io/view-mung/
- **GitHub 저장소**: https://github.com/ideajune/view-mung

---

## 📋 2026-11-03 작업 및 대화 요약 (Context Handoff)

- **3차 전면 업그레이드 (`SANSA_CORE` Three.js `r180` 실사 3D 엔진 이식)**:
  - `sansatemple.com`과 100% 동일한 Three.js `r180` + `PE` (`buildSanctuary`) 사찰·정원·연꽃연못·소나무숲 빌더 엔진을 `sansa-core.js`로 통합
  - 원본 실사 에셋 전체(`assets/environment/woodland.jpg` 360° 파노라마, `assets/models/` 삼존불·소나무 `.glb`, `assets/materials/` 7종 실사 PBR `color`/`normal`/`roughness` 텍스처) 로컬 내장
  - **공간 1 (영주 부석사 무량수전 앞마당)** & **공간 2 (순천 선암사 승선교·연꽃 연못)** 카메라 시점, 시간대별(`새벽 안개` / `노을 차경` / `산사 밤하늘`) 조명·안개 전환, 3D 소원 연등·합장 파티클(빌보드 메쉬), 3D 청동 풍경종 및 Web Audio 사운드 엔진 연동
  - 사용자 촬영 부석사 원경 사진 화면 드래그 앤 드롭 즉시 반영 기능(`window.applyCustomBuseoksaPhoto`) 및 모바일 핀치 줌·세로 화면 자동 화각 보정 반응형 UI 구현
  - 전체 대화 및 개발 기록 문서: [`오늘_대화내용_2026-11-03.doc`](./오늘_대화내용_2026-11-03.doc)

---

## 📋 2026-11-02 작업 및 대화 요약 (Context Handoff)

### 1. 기획 요구사항
- **공간 1 (영주 부석사 무량수전 앞마당)**: 배흘림기둥과 처마 밑에서 안양루·석등 너머로 겹겹이 펼쳐지는 소백산맥 능선과 시간대별 하늘(`새벽 운해`, `석양 노을`, `별 헤는 밤`), 바람에 흔들리는 처마 끝 풍경종 소리
- **공간 2 (순천 선암사 승선교)**: 반원형 무지개 아치 돌다리(승선교)와 흐르는 계곡물, 바람에 흩날리는 꽃잎/단풍잎과 물소리, 강선루 조망
- **핵심 인터랙션**:
  - 처마 밑 / 돌담길에 **소원 연등 적어 달기** (치자빛, 연분홍, 옥빛, 달빛 한지 색상 선택)
  - 다른 사람의 3D 연등 클릭하여 소원 읽고 **🙏 합장(마음 보태기)** 누르기 (금빛 불티 파티클 & 종소리 공명)
  - **👁️ 풍경멍 모드** (UI 숨기기, 단축키 `Space` / `Esc`) 및 **🌬️ 숨 고르기** (4-2-4 호흡 가이드)
  - 별도 설치 없이 바로 열 수 있는 가벼운 구성 (전체 소스 약 122KB)

### 2. 구현 발전 과정
- **1차 프로토타입**: 2D SVG 패럴랙스 + Canvas 파티클 기반으로 구현했으나 배경과 입체감이 평면적이라는 피드백 반영
- **2차 전면 리뉴얼 (현재 버전)**:
  - **Three.js (`r128`) 실시간 3D WebGL 월드 + 커스텀 GLSL 셰이더**로 전면 재구축
  - 마우스 드래그 시선 회전(Orbit), 마우스 휠 원근 줌, 3가지 카메라 시점 프리셋(`기본 차경`, `처마·다리 가까이`, `파노라마`), 연등 클릭 시 카메라 포커스 이동 구현
  - 외부 이미지·오디오 파일 없이 모든 3D 텍스처(고목 나뭇결, 단청 연화문 마구리, 화강암과 이끼, 한지 연등, 운해)와 사운드(청동 풍경종 배음 공명, 계곡 물소리, 산바람 소리)를 코드로 실시간 생성(Procedural Synthesis)

---

## 🏗️ 파일 및 코드 아키텍처

| 파일 | 역할 및 주요 클래스/함수 |
| :--- | :--- |
| `index.html` | Three.js CDN 로드, `#webgl-container` 3D 뷰포트, 상단 시간대/계절/시점 컨트롤 바, 하단 네비게이션 독, 한지 소원 카드 및 연등 작성 모달 |
| `styles.css` | 다크 옵시디언 글래스모피즘 HUD, 전통 한지(`#F5F0E6`) 소원 카드 질감, 풍경멍 모드(`body.zen-mode`) 트랜지션, 반응형 레이아웃 |
| `app.js` | **`SanSaAudioEngine`**: Web Audio API 기반 청동 풍경종(인하모닉 금속 배음 합성), 계곡 물소리(Brown/Pink 노이즈 + LFO 필터), 산바람 실시간 합성<br>**`TextureFactory`**: Canvas 2D 기반 나뭇결, 단청 마구리, 이끼 낀 화강암, 한지 연등, 운해 구름 텍스처 실시간 생성<br>**`Chakyeong3DWorld`**:<br>- 커스텀 GLSL 대기 산란 스카이 돔 + 1,600개 3D 별자리 + 달 헤일로<br>- `buildBuseoksaWorld()`: 3D 배흘림기둥(`LatheGeometry`), 34개 서까래와 단청, 3D 석등(`PointLight` 불빛), 3D 안양루 팔작지붕, 6겹 3D 소백산맥 능선과 38개 운해 레이어, 3D 청동 풍경종과 물고기 풍경편<br>- `buildSeonamsaWorld()`: 26개 홍예석 블록으로 쌓은 3D 승선교 아치와 용두석, 수면 아치 반영, 커스텀 GLSL 물결/윤슬 셰이더, 3D 강선루와 계절별 단풍/벚나무 숲<br>- `rebuild3DLanterns()`: 3D 한지 연등 메쉬 생성 및 `Raycaster` 클릭/호버 감지 |

---

## 💻 다른 PC (사무실 PC 등)에서 이어서 작업하는 방법

### 1. 처음 가져올 때 (최초 1회)
```bash
git clone https://github.com/ideajune/view-mung.git
cd view-mung
```
- 별도 `npm install` 없이 `index.html`을 브라우저로 바로 열거나 로컬 서버로 확인할 수 있습니다.
- Antigravity에서 새 대화를 시작할 때 **"README.md 읽고 현재 프로젝트 맥락 파악해줘"**라고 입력하면 오늘 작업 내용을 즉시 이어받습니다.

### 2. 작업 후 저장 및 자동 배포
```bash
git add .
git commit -m "작업 내용 요약"
git push
```
- `main` 브랜치에 `git push`를 실행하면 **Vercel (`https://view-mung.vercel.app`)** 및 **GitHub Pages**에 자동으로 새 버전이 배포됩니다.

### 3. 집 PC와 사무실 PC를 오갈 때
- 작업을 시작하기 전에 항상 `git pull`을 먼저 실행해 최신 코드를 맞춘 뒤 작업합니다.
