import { defineTheme } from '@astryxdesign/core/theme'
import { neutralTheme } from '@astryxdesign/theme-neutral/built'

// neutral 테마를 기반으로 한국어 글꼴과 기존 사이트의 파란 계열 강조색만 바꿉니다.
const KR = '"Noto Sans KR", Figtree, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'

export const powermapTheme = defineTheme({
  name: 'powermap',
  extends: neutralTheme,
  tokens: {
    '--font-family-body': KR,
    '--font-family-heading': KR,
    '--color-accent': ['#1d4ed8', '#60a5fa'],
  },
})
