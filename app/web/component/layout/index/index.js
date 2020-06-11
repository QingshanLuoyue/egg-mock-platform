import Vue from "vue";
import MainLayout from "./main.vue";
import "../../../asset/css/bootstrap.css";
import "../../../asset/css/blog.css";
import createLayout from "../layout";

let tpl = `
<div id="app" data-server-rendered="true">
    <slot></slot>
</div>`;
export default createLayout("Layout", { MainLayout }, tpl);
