/**
 * 站点基础信息 —— 改名只需要动这个文件。
 */
export interface SocialLink {
  label: string
  href: string
}

export const profile = {
  /** 站点标题 / 导航左上角的名字 */
  name: '沈砚',
  /** 名字中的一个字，用作头像与印章 */
  initial: '砚',
  /** Hero 大字下面的一句话 */
  tagline: '写一点诗，拍一些照，也和一个 AI 聊聊天。',
  /** 名字上方的一行小标签 */
  eyebrow: 'PORTFOLIO · 2026',
  /** 简介段落，两行左右最舒服 */
  bio: '白天写代码，晚上写几句不成调的诗。相机常年放在包里，偶尔也能拍到一点好东西。',
  email: 'hello@example.com',
  location: '杭州',
  socials: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: '豆瓣', href: 'https://www.douban.com/' },
    { label: '即刻', href: 'https://web.okjike.com/' },
  ] as SocialLink[],
}

export const navLinks = [
  { label: '相册', href: '#gallery' },
  { label: '诗词', href: '#poetry' },
  { label: 'AI 陪练', href: '#ai' },
]
