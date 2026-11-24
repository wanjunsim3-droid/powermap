# powermap v2 (Astryx 디자인 시스템)

메인 페이지(index.html)를 Meta Astryx(React) 컴포넌트로 다시 만든 버전입니다.
빌드 결과는 저장소의 `v2/` 폴더에 들어가며, 이미지와 센터 정보는 기존 `assets/` (특히 `assets/data/centers.json`)를 그대로 씁니다.
그래서 센터 정보 수정은 `centers.json` 한 곳만 고치면 기존 페이지와 v2에 함께 반영됩니다.

## 수정 후 다시 빌드
```bash
cd v2-src
npm install
npm run build   # → ../v2 에 결과 생성
```

## 디자인 버전
- `npm run build` → `v2/` (neutral 테마, 기본 첫 화면)
- `npm run build:v3` → `v3/` (stone 테마, 큰 사진형 첫 화면)

테마 설정은 `src/themes/` 에 있습니다.
