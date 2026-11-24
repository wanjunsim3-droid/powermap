import { ClickableCard } from '@astryxdesign/core/ClickableCard'
import { AspectRatio } from '@astryxdesign/core/AspectRatio'
import { Badge } from '@astryxdesign/core/Badge'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { VStack } from '@astryxdesign/core/VStack'
import { HStack } from '@astryxdesign/core/HStack'
import { Divider } from '@astryxdesign/core/Divider'
import type { Center } from './types'
import { asset } from './types'

type Props = { center: Center; isActive: boolean; onSelect: () => void }

export default function CenterCard({ center, isActive, onSelect }: Props) {
  return (
    <div className={`pm-card${isActive ? ' is-active' : ''}`}>
      <ClickableCard label={`${center.name} 상세보기`} onClick={onSelect} padding={0} elevation={isActive ? 'med' : 'low'} height="100%">
        <AspectRatio ratio={4 / 3} fit="cover">
          <img src={asset(center.image)} alt={center.name} loading="lazy" />
        </AspectRatio>
        <div className="pm-card-body">
          <VStack gap={2}>
            <HStack gap={1} align="center" wrap="wrap">
              <Badge label={center.status} variant={center.status.includes('예정') ? 'warning' : 'success'} />
              {center.id === 'd18b' && <Badge label="신규 준공" variant="orange" />}
            </HStack>
            <Heading level={3}>{center.name}</Heading>
            {center.features && (
              <ul className="pm-card-features">
                {center.features.slice(0, 2).map(f => <li key={f}><Text type="supporting" color="secondary">{f}</Text></li>)}
              </ul>
            )}
            <Divider />
            <HStack justify="between">
              <Text type="supporting" color="secondary">잔여 호실</Text>
              <Text weight="bold" hasTabularNumbers>{center.available}개 호실</Text>
            </HStack>
            <HStack justify="between">
              <Text type="supporting" color="secondary">분양가</Text>
              <Text weight="semibold" color="accent">유선 상담 안내</Text>
            </HStack>
          </VStack>
        </div>
      </ClickableCard>
    </div>
  )
}
