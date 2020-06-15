<template>
    <layout>
        <el-container>
            <el-main>
                <!-- 创建 -->
                <el-form :inline="true" :model="formCreate" class="demo-form-inline">
                    <el-form-item label="微服务名" label-width="80px">
                        <el-input v-model="formCreate.microServerName" placeholder="微服务名，例如：user-server"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleCreateMicroServer">创建</el-button>
                    </el-form-item>
                </el-form>
                <!-- 查询 -->
                <el-form :inline="true" :model="formInline" class="demo-form-inline">
                    <el-form-item label="审批人" label-width="80px">
                        <el-input v-model="formInline.user" placeholder="审批人"></el-input>
                    </el-form-item>
                    <el-form-item label="活动区域">
                        <el-select v-model="formInline.region" placeholder="活动区域">
                            <el-option label="区域一" value="shanghai"></el-option>
                            <el-option label="区域二" value="beijing"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">查询</el-button>
                    </el-form-item>
                </el-form>
                <!-- 更新 -->
                <el-form :inline="true" :model="formInline" class="demo-form-inline">
                    <el-form-item label="审批人" label-width="80px">
                        <el-input v-model="formInline.user" placeholder="审批人"></el-input>
                    </el-form-item>
                    <el-form-item label="活动区域">
                        <el-select v-model="formInline.region" placeholder="活动区域">
                            <el-option label="区域一" value="shanghai"></el-option>
                            <el-option label="区域二" value="beijing"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onSubmit">更新</el-button>
                    </el-form-item>
                </el-form>
                <json-viewer :value="jsonData" :expand-depth="5" copyable boxed sort></json-viewer>
            </el-main>
        </el-container>
    </layout>
</template>
<script>
import Vue from 'vue'
import JsonViewer from 'vue-json-viewer'
Vue.use(JsonViewer)
export default {
    components: {},
    data() {
        return {
            isFinish: false,
            isLoading: false,
            pageIndex: 1,
            pageSize: 10,

            formInline: {
                user: '',
                region: ''
            },
            formCreate: {
                microServerName: ''
            },
            jsonData: {
                total: 25,
                limit: 10,
                skip: 0,
                links: {
                    previous: undefined,
                    next: function() {}
                },
                data: []
            }
        }
    },
    computed: {
        lists() {
            return this.list
        }
    },
    methods: {
        handleCreateMicroServer() {
            this.$request.post(`/create-micro-server`, this.formCreate).then(res => {
                console.log('res', res)
                if (res.data.list && res.data.list.length) {
                    this.total = res.data.total
                    this.list = this.list.concat(res.data.list)
                } else {
                    this.isFinish = true
                }
                this.isLoading = false
            })
        },

        onSubmit() {
            console.log('submit!')
        },
        fetch() {
            this.$request.get(`/list?pageIndex=${this.pageIndex}&pageSize=${this.pageSize}`).then(res => {
                console.log('res', res)
                if (res.data.list && res.data.list.length) {
                    this.total = res.data.total
                    this.list = this.list.concat(res.data.list)
                } else {
                    this.isFinish = true
                }
                this.isLoading = false
            })
        },
        loadPage() {
            if (!this.isFinish && !this.isLoading) {
                this.isLoading = true
                this.pageIndex++
                setTimeout(() => {
                    this.fetch()
                }, 1500)
            }
        }
    },
    mounted() {
        window.addEventListener(
            'scroll',
            () => {
                this.loadPage()
            },
            false
        )
    }
}
</script>

<style lang="scss">
.el-container {
    padding: 20px;
    .el-input__inner {
        width: 300px;
    }
}
</style>
