/**
 * 作品集展示数据。
 * 项目介绍是第一版草稿；正式公开前可在这里修改标题、标签、状态和链接。
 * 只有确认存在的公开地址才会显示“查看项目”按钮。
 */
export interface PortfolioProject {
  id: string
  title: string
  subtitle: string
  description: string
  tags: string[]
  stage: string
  visual: 'cat' | 'tavern' | 'web'
  href?: string
  linkLabel?: string
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
    id: 'mindex',
    title: '个人主页 · Mindex',
    subtitle: 'PERSONAL SPACE',
    description: '用 Vue 3、TypeScript 与 Vite 整理项目、相册、诗词和 AI 陪练，持续打磨个人数字空间。',
    tags: ['Vue 3', 'TypeScript', 'Vite'],
    stage: '在线迭代',
    visual: 'web',
    href: 'https://github.com/is0612/mindex',
    linkLabel: '查看 GitHub 源码',
  },
]
