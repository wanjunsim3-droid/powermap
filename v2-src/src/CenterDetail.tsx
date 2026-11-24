import { useState } from 'react'
import { TabList, Tab } from '@astryxdesign/core/TabList'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Badge } from '@astryxdesign/core/Badge'
import { Button } from '@astryxdesign/core/Button'
import { Card } from '@astryxdesign/core/Card'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { MetadataList, MetadataListItem } from '@astryxdesign/core/MetadataList'
import { Check, Phone } from 'lucide-react'
import type { Center } from './types'
import { asset, PHONE } from './types'
import InquiryForm from './InquiryForm'

export default function CenterDetail({ center }: { center: Center }) {
  const gallery = center.gallery?.length ? center.gallery : [{ tab: '사업지 이미지', image: center.image }]
  const [tab, setTab] = useState('0')
  const current = gallery[Number(tab)] ?? gallery[0]

  return (
    <div className="pm-detail-layout">
      <div className="pm-detail-main">
        <VStack gap={4}>
          <HStack gap={2} align="center" wrap="wrap">
            <Heading level={2}>{center.name}</Heading>
            <Badge label={center.status} variant="success" />
          </HStack>

          <TabList value={tab} onChange={setTab} hasDivider>
            {gallery.map((g, i) => <Tab key={g.tab} value={String(i)} label={g.tab} panelId="pm-gallery-panel" />)}
          </TabList>
          <div id="pm-gallery-panel" role="tabpanel" className="pm-gallery">
            <img src={asset(current.image)} alt={`${center.name} - ${current.tab}`} />
          </div>

          {center.specs && (
            <VStack gap={2}>
              <Heading level={3}>세부 사업 개요</Heading>
              <div className="pm-specs">
                <MetadataList label={{ position: 'start', width: 140 }}>
                  {Object.entries(center.specs).map(([k, v]) => (
                    <MetadataListItem key={k} label={k}>{v}</MetadataListItem>
                  ))}
                </MetadataList>
              </div>
            </VStack>
          )}
        </VStack>
      </div>

      <aside className="pm-detail-side">
        <VStack gap={3}>
          {center.features && (
            <Card padding={4}>
              <VStack gap={2}>
                <Heading level={4}>프리미엄 입지 & 강점</Heading>
                <ul className="pm-features">
                  {center.features.map(f => (
                    <li key={f}><Check size={16} aria-hidden className="pm-check" /><Text>{f}</Text></li>
                  ))}
                </ul>
              </VStack>
            </Card>
          )}

          <Card padding={4} variant="blue">
            <VStack gap={2}>
              <Heading level={4}>신속한 전화 문의</Heading>
              <Text color="secondary">도면, 분양가, 잔여 호실을 상담사가 바로 안내해 드립니다.</Text>
              <Button label={PHONE} variant="primary" size="lg" width="100%" href={`tel:${PHONE}`} icon={<Phone size={18} />} />
            </VStack>
          </Card>

          <Card padding={4}>
            <InquiryForm centerName={center.name} />
          </Card>
        </VStack>
      </aside>
    </div>
  )
}
