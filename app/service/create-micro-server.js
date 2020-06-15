'use strict'
const egg = require('egg')

// 请求主机
const hostUrl = 'http://admin-dev.yxzq.com/'
const ApiRequest = require('../utils/http-request')
const httpRequest = new ApiRequest(hostUrl)

module.exports = class CreateMicroServerService extends egg.Service {
    constructor(ctx) {
        super(ctx)
        this.ctx = ctx
        this.apiSchemaMicroServerDir = ''
    }
    // 请求当前微服务所有的 select option 选项
    getAllOptionData(microServerName) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = (await httpRequest.get(`${microServerName}/doc/swagger-resources`)) || []
                resolve(data)
            } catch (e) {
                console.log('service:getAllOptionData:error:>> ', e)
                reject(e)
            }
        })
    }
    // 请求 option 类别下的 所有 api 列表信息
    getSingleOptionApiSchemaData(option, microServerName) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = (await httpRequest.get(encodeURI(`${microServerName}/doc${option.url}`))) || []
                resolve(data)
            } catch (e) {
                console.log('service:getSingleOptionApiSchemaData:error:>> ', e)
                reject(e)
            }
        })
    }
}
