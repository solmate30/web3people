/**
 * Cloudinary URL 변환 유틸리티
 *
 * 사용 예시:
 *   cldUrl(media.url, 'w_800,h_1067,c_fill,f_webp')   // 카드용
 *   cldUrl(media.url, 'w_1440,h_810,c_fill,f_webp')   // 히어로용
 *   cldUrl(media.url, 'w_400,h_400,c_fill,f_webp')    // 프로필용
 */
export function cldUrl(
  url: string | null | undefined,
  transforms: string,
): string {
  if (!url) return ''
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/${transforms}/`)
}

export const transforms = {
  card: 'w_600,h_800,c_fill,f_webp,q_auto',
  hero: 'w_1440,h_900,c_fill,f_webp,q_auto',
  profile: 'w_400,h_400,c_fill,f_webp,q_auto',
  thumbnail: 'w_200,h_200,c_fill,f_webp,q_auto',
  articleImage: 'w_1200,f_webp,q_auto',
} as const
