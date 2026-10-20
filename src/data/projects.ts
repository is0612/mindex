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
    description: '以角色陪伴为核心的 AI 聊天空间。蓝白猫娘桌宠是子夜酒馆角色体验的延伸，连接日常陪伴、角色状态与 AI 对话，而不是独立项目。',
    tags: ['产品设计', 'AI 对话', '角色陪伴', '桌宠体验'],
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
