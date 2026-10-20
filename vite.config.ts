import { promises as fs } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

const POEMS_FILE = fileURLToPath(new URL('./src/data/poems.json', import.meta.url))

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: import('node:http').ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

/** 开发期的诗词读写接口：GET 读、PUT 写 src/data/poems.json，仅 dev 生效 */
function poemsFileApi(): Plugin {
  return {
    name: 'poems-file-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/poems', async (req, res) => {
        try {
          if (req.method === 'GET') {
            const text = await fs.readFile(POEMS_FILE, 'utf8')
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.setHeader('Cache-Control', 'no-store')
            res.end(text)
            return
          }

          if (req.method === 'PUT' || req.method === 'POST') {
            const data: unknown = JSON.parse(await readBody(req))
            if (!Array.isArray(data)) throw new Error('请求体必须是诗词数组')
            const valid = data.every(
              (p) =>
                p &&
                typeof p === 'object' &&
                typeof (p as { title?: unknown }).title === 'string' &&
                Array.isArray((p as { body?: unknown }).body),
            )
            if (!valid) throw new Error('诗词数据缺少 title 或 body')

            await fs.writeFile(POEMS_FILE, `${JSON.stringify(data)}\n`, 'utf8')

            // 这个文件被 watch 忽略，手动失效模块缓存
            const mods = server.moduleGraph.getModulesByFile(POEMS_FILE)
            mods?.forEach((mod) => server.moduleGraph.invalidateModule(mod))

            sendJson(res, 200, { ok: true, count: data.length })
            return
          }

          sendJson(res, 405, { ok: false, error: '只支持 GET / PUT' })
        } catch (error) {
          sendJson(res, 500, { ok: false, error: (error as Error).message })
        }
      })
    },
  }
}

export default defineConfig({
  // 用相对路径，dist 放到根目录、子目录（如 GitHub Pages 的 /仓库名/）都能跑
  base: './',
  plugins: [vue(), poemsFileApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Sass 源映射：浏览器里能直接定位到 .scss 行号
  css: {
    devSourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
    // 诗词后台自己写这个文件，别让 HMR 每次保存都整页刷新；
    // 编辑器/工具写入时的临时目录也跳过，否则 Windows 上 watcher 会 EBUSY 退出
    watch: {
      ignored: ['**/src/data/poems.json', '**/*.tmpdir/**', '**/*.tmp'],
    },
  },
})
