import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import axios from 'axios';

Vue.config.productionTip = false;

window.axios = axios.create();
Vue.prototype.$axios = window.axios;

window.axios.defaults.headers.common = {
    Accept: 'application/json'
};

new Vue({
    vuetify,
    render: h => h(App)
}).$mount('#app')
