import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useLoadingStore } from './stores/loading'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// monkey patch fetch to use loading store
const loadingStore = useLoadingStore(pinia)
const originalFetch = window.fetch.bind(window)

// @ts-expect-error: unmatched function signature
window.fetch = async function fetchWithRetry(resource: RequestInfo, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = 5000, ...rest } = options

  async function tryFetch(): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      return await originalFetch(resource, { ...rest, signal: controller.signal })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  loadingStore.start()

  try {
    return await tryFetch()
  } finally {
    loadingStore.isFirstLoadCompleted = true
    loadingStore.stop()
  }
}

app.mount('#app')
