<template>
    <layout>
        <el-container>
            <el-main>
                <!-- 创建 -->
                <el-form :inline="true" :model="formCreate" class="demo-form-inline">
                    <el-form-item label="微服务名" label-width="110px">
                        <el-input v-model="formCreate.microServerName" placeholder="微服务名，例如：user-server"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleCreateMicroServer">创建</el-button>
                    </el-form-item>
                </el-form>
                <!-- 创建 Mock Template -->
                <el-form :inline="true" :model="formCreateMockTemplate" class="demo-form-inline">
                    <el-form-item label="微服务 Mock" label-width="110px">
                        <el-input v-model="formCreateMockTemplate.microServerName" placeholder="微服务名，例如：user-server"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleCreateMicroServerMockTemplate">创建</el-button>
                    </el-form-item>
                </el-form>
                <!-- 查询已存在的微服务 Mock -->
                <el-form :inline="true" class="demo-form-inline">
                    <el-button type="primary" @click="handleQueryMicroServerList">查询已存在微服务</el-button>
                    <el-form-item v-if="microServerList.length !== 0" label="已存在微服务:">
                        <div class="box">
                            <div v-for="serverName in microServerList" :key="serverName">{{ serverName }}</div>
                        </div>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="microServerList = []">清空查询数据</el-button>
                    </el-form-item>
                </el-form>
                <!-- 查询指定微服务下的 Mock api 列表 -->
                <el-form :inline="true" :model="formExistMicroServerApiList" class="demo-form-inline">
                    <el-form-item label="微服务下的 Mock api 列表">
                        <el-select v-model="formExistMicroServerApiList.microServerName" placeholder="请选择">
                            <el-option v-for="serverName in microServerList" :key="serverName" :label="serverName" :value="serverName"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleQueryMicroServerMockApiList">查询</el-button>
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
// import '../../../mock'
export default {
    components: {},
    data() {
        return {
            formCreate: {
                microServerName: 'stock-order-server'
            },
            formCreateMockTemplate: {
                microServerName: 'stock-order-server'
            },
            formExistMicroServerApiList: {
                microServerName: ''
            },
            microServerList: [],

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
    methods: {
        // 创建
        handleCreateMicroServer() {
            this.$request.post(`/create-micro-server`, this.formCreate).then(res => {
                console.log('res', res)
                this.jsonData.data = res.data
            })
        },
        // 创建 Mock Template
        handleCreateMicroServerMockTemplate() {
            this.$request.post(`/create-micro-server-mock-template`, this.formCreateMockTemplate).then(res => {
                console.log('res', res)
                this.jsonData.data = res.data
            })
        },
        // 查询已存在的微服务 Mock 列表
        handleQueryMicroServerList() {
            this.$request.post(`/query-micro-server-list`).then(res => {
                console.log('res', res)
                this.jsonData.data = res.data
                this.microServerList = res.data.data
            })
        },
        // 查询指定微服务下的 Mock api 列表
        handleQueryMicroServerMockApiList() {
            this.$request.post(`/query-micro-server-mock-api-list`, this.formExistMicroServerApiList).then(res => {
                console.log('res', res)
                this.jsonData.data = res.data
            })
        },

        onSubmit() {
            console.log('submit!')
        }
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
.box {
    overflow: auto;
    width: 180px;
    height: 50px;
    padding: 5px 10px;
    border: 1px solid rgba($color: #000000, $alpha: 0.5);
    line-height: 1.2;
}
</style>
