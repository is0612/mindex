/**
 * 作品集展示数据。
 * 顺序即页面上的展示顺序：子夜酒馆 → 角色卡分享平台 → 个人主页。
 * 只有确认存在的公开地址才会显示链接按钮。
 */
export interface ProjectLink {
  label: string
  href: string
}

export interface PortfolioProject {
  id: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  stage: string
  visual: 'tavern' | 'cards' | 'web'
  links?: ProjectLink[]
}

export const projects: PortfolioProject[] = [
  {
    id: 'nocturne-tavern',
    title: '子夜酒馆',
    subtitle: 'NOCTURNE TAVERN',
    description: '从夜色氛围出发，把角色互动、故事感和个性视觉融入聊天空间。',
    tags: ['产品设计', 'AI 对话', '视觉系统'],
    stage: '设计中',
    visual: 'tavern',
  },
  {
    id: 'open-character-cards',
    title: '角色卡分享平台',
    subtitle: 'CHARACTER CARDS',
    description: '开源的角色卡分享站点，用来发布、浏览与整理原创角色设定，支持标签检索与链接分享。',
    tags: ['开源', '角色卡', 'Web'],
    stage: '在线运行',
    visual: 'cards',
    links: [
      { label: '访问站点', href: 'https://is0612.github.io/open-character-cards/' },
      { label: 'GitHub', href: 'https://github.com/is0612/open-character-cards' },
    ],
  },
  {
    id: 'mindex',
    title: '个人主页 · Mindex',
    subtitle: 'PERSONAL SPACE',
    description: '用 Vue 3、TypeScript 与 Vite 整理项目、诗词和 AI 陪练，持续打磨个人数字空间。',
    tags: ['Vue 3', 'TypeScript', 'Vite'],
    stage: '在线迭代',
    visual: 'web',
    links: [{ label: '查看 GitHub 源码', href: 'https://github.com/is0612/mindex' }],
  },
]
