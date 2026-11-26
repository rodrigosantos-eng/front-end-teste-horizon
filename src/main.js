import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './style.css';

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'horizon',
    themes: {
      horizon: {
        dark: false,
        colors: {
          primary: '#FBE509',
          secondary: '#141414',
          background: '#F7F7F7',
          surface: '#FFFFFF',
          onPrimary: '#000000',
        },
      },
    },
  },
});

createApp(App).use(router).use(vuetify).mount('#app');
