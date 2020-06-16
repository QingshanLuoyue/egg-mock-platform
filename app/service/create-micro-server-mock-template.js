'use strict'
const egg = require('egg')

const path = require('path')
const fs = require('fs')

// 请求主机

const { apiSchemaDefineDir } = require('../utils/common-path.js')

module.exports = class CreateMicroServerServiceMockTemplate extends egg.Service {
    constructor(ctx) {
        super(ctx)
        this.ctx = ctx
        this.apiSchemaMicroServerDir = ''
    }
    // 获取微服务对应的定义文件
    getMicroServerApiSchema(microServerName) {
        let microServerApiSchemaDBUrl = path.resolve(apiSchemaDefineDir, `${microServerName}/config.json`)
        if (!fs.existsSync(microServerApiSchemaDBUrl)) {
            return resolve(`不存在与 ${microServerName} 对应的定义文件，无法生成 mock 文件`)
        }
        let configData = fs.readFileSync(microServerApiSchemaDBUrl)
        configData = JSON.parse(configData)
        return configData
    }

    // 生成 js 的 mock 数据文件
    productJavascriptMockFile(microServerMockTemplateDirUrl, mockFileName, mockTemplateContent) {
        let apiWriteUrl = `${microServerMockTemplateDirUrl}/${mockFileName}.js`
        fs.writeFileSync(apiWriteUrl, mockTemplateContent, {
            encoding: 'utf8'
        })
    }

    // 生成导出该微服务全部 mock 文件的 入口文件
    productExportAllMockFileEntry(microServerMockTemplateDirUrl, exportStr) {
        fs.writeFileSync(`${microServerMockTemplateDirUrl}/index.js`, exportStr)
    }
}
