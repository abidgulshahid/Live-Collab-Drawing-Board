import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'

// Import required components
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Card from 'primevue/card'

// Import PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css' // or your preferred theme
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

const app = createApp(App)
app.use(PrimeVue)

// Register PrimeVue components
app.component('Button', Button)
app.component('Dialog', Dialog)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Card', Card)

app.mount('#app') 