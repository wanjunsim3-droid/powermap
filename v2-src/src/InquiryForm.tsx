import { useState, type FormEvent } from 'react'
import { TextInput } from '@astryxdesign/core/TextInput'
import { TextArea } from '@astryxdesign/core/TextArea'
import { Selector } from '@astryxdesign/core/Selector'
import { Button } from '@astryxdesign/core/Button'
import { Banner } from '@astryxdesign/core/Banner'
import { Heading } from '@astryxdesign/core/Heading'
import { VStack } from '@astryxdesign/core/VStack'

const SIZES = [
  { value: 'small', label: '10평 이하 (소형 오피스)' },
  { value: 'medium', label: '10평 ~ 30평 (중형 사무실)' },
  { value: 'large', label: '30평 ~ 50평 (대형 연구소/공장)' },
  { value: 'huge', label: '50평 이상 (사옥급 일괄 임차/분양)' },
]

// 기존 사이트와 동일하게 브라우저(localStorage)에만 기록합니다.
// 실제 접수(이메일 등)로 보내려면 이 함수만 바꾸면 됩니다.
async function submitInquiry(data: Record<string, string>) {
  const list = JSON.parse(localStorage.getItem('inquiries') || '[]')
  list.push({ ...data, timestamp: new Date().toISOString() })
  localStorage.setItem('inquiries', JSON.stringify(list))
  await new Promise(r => setTimeout(r, 800))
}

export default function InquiryForm({ centerName }: { centerName: string }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [size, setSize] = useState<string | undefined>(undefined)
  const [message, setMessage] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (!/^[0-9]{9,12}$/.test(phone.replace(/[-\s]/g, ''))) {
      setPhoneError('올바른 연락처를 입력해 주세요. (예: 010-1234-5678)')
      return
    }
    setPhoneError('')
    setSending(true)
    try {
      await submitInquiry({ center: centerName, name, phone, size: size ?? '', message })
      setDone(true)
      setName(''); setPhone(''); setSize(undefined); setMessage('')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <VStack gap={3}>
        <Heading level={4}>전문가 분양 상담 신청</Heading>
        {done && (
          <Banner
            status="success"
            title="상담 예약이 접수되었습니다"
            description={`${centerName} 상담사가 영업일 기준 24시간 이내에 연락드리겠습니다.`}
            isDismissable
            onDismiss={() => setDone(false)}
            collapsible={false}
          />
        )}
        <TextInput label="성함" isRequired value={name} onChange={setName} placeholder="성함을 입력해 주세요" autoComplete="name" width="100%" />
        <TextInput
          label="연락처" type="tel" isRequired value={phone} onChange={setPhone}
          placeholder="010-0000-0000" inputMode="tel" autoComplete="tel" width="100%"
          status={phoneError ? { type: 'error', message: phoneError } : undefined}
        />
        <Selector label="희망 평형대" isOptional options={SIZES} value={size} onChange={setSize} placeholder="선택해 주세요" width="100%" presentation="adaptive" />
        <TextArea label="상담 문의 내용" isOptional value={message} onChange={setMessage} rows={4} placeholder="희망 조건을 남겨주시면 더 빠르게 안내해 드립니다." width="100%" />
        <Button label={sending ? '접수 중…' : '상담 예약 신청하기'} type="submit" variant="primary" size="lg" width="100%" isLoading={sending} isDisabled={!name.trim() || !phone.trim()} />
      </VStack>
    </form>
  )
}
