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
    id: 'ai-desktop-pet',
    title: 'AI 桌宠 · 角色陪伴',
    subtitle: 'CHARACTER / AI',
    description: '围绕原创蓝白猫娘，探索桌面陪伴、角色状态与 AI 对话体验。',
    tags: ['AI', '角色设计', '桌面端'],
    stage: '原型探索',
    visual: 'cat',
  },
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
