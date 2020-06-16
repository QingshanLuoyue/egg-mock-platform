'use strict'
const egg = require('egg')

const path = require('path')
const fs = require('fs')

// 请求主机

const { mockTemplateDir } = require('../utils/common-path.js')

module.exports = class QueryMicroServerList extends egg.Service {
    constructor(ctx) {
        super(ctx)
        this.ctx = ctx
    }
    // 获取微服务列表
    getMicroServerList() {
        if (!fs.existsSync(mockTemplateDir)) {
            throw `不存在微服务父级目录，需要去创建至少一项微服务`
        }

        let microServerList = []
        let mockTemplateFiles = fs.readdirSync(mockTemplateDir)
        mockTemplateFiles.forEach(fileName => {
            if (fs.statSync(path.resolve(mockTemplateDir, fileName)).isDirectory()) {
                microServerList.push(fileName)
            }
        })
        console.log('mockTemplateFiles :>> ', mockTemplateFiles)
        console.log('microServerList :>> ', microServerList)

        return microServerList
    }
}
