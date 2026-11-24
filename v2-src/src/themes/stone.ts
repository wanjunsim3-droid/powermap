import { defineTheme } from '@astryxdesign/core/theme'
import { stoneTheme } from '@astryxdesign/theme-stone/built'
import '@astryxdesign/theme-stone/theme.css'
import '@astryxdesign/theme-stone/fonts.css'

// stone 테마 기반, 한국어 글꼴만 추가 (색은 stone 그대로)
const KR_BODY = '"Noto Sans KR", Figtree, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
const KR_HEAD = 'Montserrat, "Noto Sans KR", -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'

export const siteTheme = defineTheme({
  name: 'powermap-stone',
  extends: stoneTheme,
  tokens: {
    '--font-family-body': KR_BODY,
    '--font-family-heading': KR_HEAD,
  },
})
export const heroStyle = 'photo' as const
