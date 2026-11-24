import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// 같은 소스로 여러 디자인 버전을 만듭니다.
//   npm run build      → ../v2  (neutral 테마, 기본 화면)
//   npm run build:v3   → ../v3  (stone 테마, 큰 사진형 첫 화면)
// 이미지·센터 데이터는 기존 사이트의 assets/ 를 그대로 같이 씁니다.
const VARIANTS: Record<string, { out: string; theme: string }> = {
  production: { out: '../v2', theme: 'neutral' },
  v3: { out: '../v3', theme: 'stone' },
}

export default defineConfig(({ mode }) => {
  const v = VARIANTS[mode] ?? VARIANTS.production
  return {
    plugins: [react()],
    base: './',
    resolve: {
      alias: { 'site-theme': fileURLToPath(new URL(`./src/themes/${v.theme}.ts`, import.meta.url)) },
    },
    build: { outDir: v.out, emptyOutDir: true, chunkSizeWarningLimit: 2000 },
  }
})
