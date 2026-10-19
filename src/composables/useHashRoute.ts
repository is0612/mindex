import { onBeforeUnmount, onMounted, ref } from 'vue'

/** 首页与诗词后台两个视图，用 hash 区分，不引入路由库 */
export type RouteName = 'home' | 'poems'

function parse(): RouteName {
  const hash = window.location.hash.replace(/^#\/?/, '')
  return hash.startsWith('poems') ? 'poems' : 'home'
}

export function useHashRoute() {
  const route = ref<RouteName>(parse())

  const sync = () => {
    route.value = parse()
  }

  onMounted(() => window.addEventListener('hashchange', sync))
  onBeforeUnmount(() => window.removeEventListener('hashchange', sync))

  return { route }
}
