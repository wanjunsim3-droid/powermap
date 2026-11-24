import { useEffect, useState } from 'react'
import { Theme } from '@astryxdesign/core/theme'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import koKR from '@astryxdesign/core/locales/ko-KR.json'
import { TopNav } from '@astryxdesign/core/TopNav'
import { Button } from '@astryxdesign/core/Button'
import { IconButton } from '@astryxdesign/core/IconButton'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Badge } from '@astryxdesign/core/Badge'
import { Grid } from '@astryxdesign/core/Grid'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Spinner } from '@astryxdesign/core/Spinner'
import { Phone, Moon, Sun, BarChart3, ArrowRight } from 'lucide-react'
import { siteTheme, heroStyle } from 'site-theme'
import type { Center } from './types'
import { asset, PHONE } from './types'
import CenterCard from './CenterCard'
import CenterDetail from './CenterDetail'

type Mode = 'light' | 'dark'

function initialMode(): Mode {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* 저장소 사용 불가 시 무시 */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const [centers, setCenters] = useState<Center[] | null>(null)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState<string>(() => new URLSearchParams(location.search).get('id') ?? '')
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    fetch(asset('assets/data/centers.json'))
      .then(r => { if (!r.ok) throw new Error('데이터를 불러오지 못했습니다.'); return r.json() })
      .then(d => setCenters(d.centers))
      .catch(e => setError(e.message))
  }, [])

  useEffect(() => {
    document.documentElement.style.colorScheme = mode
    document.documentElement.dataset.mode = mode
    try { localStorage.setItem('theme', mode) } catch { /* 무시 */ }
  }, [mode])

  useEffect(() => {
    const onPop = () => setActiveId(new URLSearchParams(location.search).get('id') ?? '')
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const select = (id: string) => {
    if (id !== activeId) history.pushState({ id }, '', `${location.pathname}?id=${id}`)
    setActiveId(id)
    requestAnimationFrame(() =>
      document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }

  const active = centers?.find(c => c.id === activeId)
  const newest = centers?.find(c => c.id === 'd18b')

  return (
    <InternationalizationProvider locale="ko-KR" messages={{ 'ko-KR': koKR }}>
    <Theme theme={siteTheme} mode={mode}>
      <div className="pm-page">
        <div className="pm-nav">
          <TopNav
            label="사이트 메뉴"
            heading={<a href="./" className="pm-brand">마곡산단 공식 분양 대행</a>}
            endContent={
              <HStack gap={1} align="center">
                <span className="pm-hide-mobile">
                  <Button label="센터 비교" variant="ghost" href="../compare.html" icon={<BarChart3 size={16} />} />
                </span>
                <Button label={`대표번호 ${PHONE}`} variant="primary" href={`tel:${PHONE}`} icon={<Phone size={16} />} />
                <IconButton
                  label={mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                  variant="ghost"
                  icon={mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                />
              </HStack>
            }
          />
        </div>

        {heroStyle === 'photo' ? (
          <header className="pm-hero-photo">
            <img className="pm-hero-img" src={asset('assets/images/garden_dusk.jpg')} alt="마곡 가든스퀘어 저녁 외관" />
            <div className="pm-hero-shade" />
            {/* 사진 위 글자는 어두운 모드 색으로 표시 */}
            <Theme theme={siteTheme} mode="dark">
              <div className="pm-container pm-hero-photo-inner">
                  <VStack gap={3} hAlign="start">
              <Badge label="마곡산업단지 R&D 지식산업센터" variant="orange" />
              <Heading level={1} type="display-2" textWrap="balance">
                마곡 지식산업센터 4곳,<br />분양·임대 정보를 한곳에서
              </Heading>
              <Text type="large" color="secondary" textWrap="pretty">
                아이파크 디어반 · 보타닉게이트 · 뉴브 클라우드힐스 · 마곡 가든스퀘어. 모두 준공 완료, 즉시 입주 가능합니다.
              </Text>
              <HStack gap={2} wrap="wrap">
                <Button label={`전화 상담 ${PHONE}`} variant="primary" size="lg" href={`tel:${PHONE}`} icon={<Phone size={18} />} />
                <Button label="4개 센터 한눈에 비교" size="lg" href="../compare.html" icon={<BarChart3 size={18} />} />
              </HStack>
            </VStack>
              </div>
            </Theme>
          </header>
        ) : (
          <header className="pm-hero">
          <div className="pm-container">
            <VStack gap={3} hAlign="start">
              <Badge label="마곡산업단지 R&D 지식산업센터" variant="orange" />
              <Heading level={1} type="display-2" textWrap="balance">
                마곡 지식산업센터 4곳,<br />분양·임대 정보를 한곳에서
              </Heading>
              <Text type="large" color="secondary" textWrap="pretty">
                아이파크 디어반 · 보타닉게이트 · 뉴브 클라우드힐스 · 마곡 가든스퀘어. 모두 준공 완료, 즉시 입주 가능합니다.
              </Text>
              <HStack gap={2} wrap="wrap">
                <Button label={`전화 상담 ${PHONE}`} variant="primary" size="lg" href={`tel:${PHONE}`} icon={<Phone size={18} />} />
                <Button label="4개 센터 한눈에 비교" size="lg" href="../compare.html" icon={<BarChart3 size={18} />} />
              </HStack>
            </VStack>
          </div>
          </header>
        )}

        {newest && (
          <div className="pm-container">
            <button type="button" className="pm-headline" onClick={() => select(newest.id)}>
              <Badge label="신규 준공 · 즉시입주" variant="orange" />
              <span className="pm-headline-text"><strong>{newest.name}</strong> – 2026년 준공, 대형 사옥 임대·분양 상세 보기</span>
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        )}

        <main className="pm-container pm-main">
          <VStack gap={4}>
            <VStack gap={1}>
              <Heading level={2}>마곡 지식산업센터 목록</Heading>
              <Text color="secondary">센터를 선택하면 아래에 사업 개요, 도면, 상담 신청이 열립니다.</Text>
            </VStack>

            {error && <Text color="secondary">오류: {error}</Text>}
            {!centers && !error && <HStack gap={2} align="center"><Spinner /><Text>센터 정보를 불러오는 중…</Text></HStack>}

            {centers && (
              <Grid columns={{ minWidth: 260, max: 4 }} gap={4}>
                {centers.map(c => (
                  <CenterCard key={c.id} center={c} isActive={c.id === activeId} onSelect={() => select(c.id)} />
                ))}
              </Grid>
            )}
          </VStack>

          <section id="detail" className="pm-detail">
            {active && <CenterDetail key={active.id} center={active} />}
          </section>
        </main>

        <footer className="pm-footer">
          <div className="pm-container">
            <Text color="secondary" type="supporting" display="block">© 2026 마곡산단 공식 분양 대행 | 대표번호: {PHONE}</Text>
            <Text color="secondary" type="supporting" display="block">개인정보책임자: 심완준 | 연락처: 010-2235-8245</Text>
          </div>
        </footer>

        <div className="pm-fab">
          <Button label={`대표번호 ${PHONE}`} variant="primary" size="lg" elevation="high" href={`tel:${PHONE}`} icon={<Phone size={18} />} />
        </div>
      </div>
    </Theme>
    </InternationalizationProvider>
  )
}
