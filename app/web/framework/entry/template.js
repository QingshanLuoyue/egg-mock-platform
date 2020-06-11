import Layout from "component/layout/index";
import plugin from "framework/plugin";
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
export default function(Vue) {
    Vue.use(plugin);
    Vue.component(Layout.name, Layout);
}
