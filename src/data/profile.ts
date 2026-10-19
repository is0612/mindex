/**
 * 站点基础信息 —— 改名只需要动这个文件。
 */
export interface SocialLink {
  label: string
  href: string
}

export const profile = {
  name: '沈砚',
  initial: '砚',
  tagline: '把灵感变成作品，也给每一份好奇留个位置。',
  eyebrow: 'PORTFOLIO · 2026',
  bio: '白天写代码，晚上写几句不成调的诗。相机常年放在包里，偶尔也能拍到一点好东西。',
  // 真实邮箱尚未填写时留空，导航和页脚会自动隐藏邮件入口。
  email: '',
  location: '杭州',
  socials: [
    { label: 'GitHub', href: 'https://github.com/is0612' },
  ] as SocialLink[],
}

export const navLinks = [
  { label: '项目', href: '#projects' },
  { label: '相册', href: '#gallery' },
  { label: '诗词', href: '#poetry' },
  { label: 'AI 陪练', href: '#ai' },
]
