import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 빌드 결과는 powermap 저장소의 v2/ 폴더로 들어갑니다.
// 이미지·센터 데이터는 기존 사이트의 assets/ 를 그대로 같이 씁니다.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: '../v2',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
})
