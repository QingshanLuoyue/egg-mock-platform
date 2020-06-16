'use strict'
const egg = require('egg')

const path = require('path')
const fs = require('fs')

// 请求主机

const { apiSchemaDefineDir, mockTemplateDir } = require('../utils/common-path.js')
const { resolve } = require('path')

module.exports = class QueryMicroServerList extends egg.Service {
    constructor(ctx) {
        super(ctx)
        this.ctx = ctx
    }
    // 获取指定微服务对应的 mock 文件
    getApiList(microServerName) {
        if (!fs.existsSync(mockTemplateDir)) {
            throw `不存在微服务父级目录，需要去创建至少一项微服务`
        }

        if (!microServerName) {
            throw '微服务名为空！！！'
        }

        let apiList = []
        let mockTemplateFiles = fs.readdirSync(path.resolve(mockTemplateDir, microServerName))
        mockTemplateFiles.forEach(fileName => {
            if (fileName !== 'index.js') {
                apiList.push(fileName)
            }
        })
        console.log('mockTemplateFiles :>> ', mockTemplateFiles)
        console.log('apiList :>> ', apiList)

        return apiList
    }
}
