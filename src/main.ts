import { createApp } from 'vue'
import App from './App.vue'
import { reveal } from './directives/reveal'
import './style.css'
import './moonlit-overrides.css'

createApp(App).directive('reveal', reveal).mount('#app')
