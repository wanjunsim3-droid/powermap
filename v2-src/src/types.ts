export type GalleryItem = { tab: string; image: string }
export type Center = {
  id: string
  name: string
  status: string
  available: number
  image: string
  features?: string[]
  specs?: Record<string, string>
  gallery?: GalleryItem[]
}
// 기존 사이트의 assets/ 를 그대로 사용 (v2/ 기준 한 단계 위)
export const asset = (p: string) => `../${p}`
export const PHONE = '1666-5984'
