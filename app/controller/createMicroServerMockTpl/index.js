'usestrict'
const egg = require('egg')
const path = require('path')
const fs = require('fs')

// mock 目录
const { mockTemplateDir } = require('../../utils/common-path.js')

const { productPropTemplate } = require('./util.js')

module.exports = class CreateMockTemplateController extends egg.Controller {
    async createMockTemplate(ctx) {
        console.log('createMockTemplate:body:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            let data = await this.getMicroServerApiSchemaAndProductMockTpl(microServerName)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:createMockTemplate:error>> ', e)
            throw e
        }
    }

    getMicroServerApiSchemaAndProductMockTpl(microServerName) {
        return new Promise(async (resolve, reject) => {
            try {
                let configData = this.service.createMicroServerMockTemplate.getMicroServerApiSchema(microServerName)
                // 微服务对应的 mock 文件目录路径
                let microServerMockTemplateDirUrl = path.resolve(mockTemplateDir, `${microServerName}`)
                // 不存在，则创建目录
                if (!fs.existsSync(microServerMockTemplateDirUrl)) {
                    fs.mkdirSync(microServerMockTemplateDirUrl, { recursive: true })
                }

                let apiSchemaData = {}
                let apiPaths = {}
                // 循环读取单个微服务下的 `全部` Api 信息文件，创建相应的 mock 文件
                for (const category in configData) {
                    console.log('category :>> ', category)

                    const singleCategoryApiInfoFileUrl = configData[category]

                    // 根据读取路径，读取 `单个` 文件中的 api schema 信息
                    let singleCategoryApiInfoJsonSchema = fs.readFileSync(singleCategoryApiInfoFileUrl, {
                        encoding: 'utf8'
                    })
                    // 读取出来的是字符串，需要转对象处理
                    singleCategoryApiInfoJsonSchema = JSON.parse(singleCategoryApiInfoJsonSchema)

                    apiSchemaData[category] = singleCategoryApiInfoJsonSchema
                    apiPaths = {
                        ...apiPaths,
                        ...singleCategoryApiInfoJsonSchema.paths
                    }

                    // 生成 mock 文件
                    this.productMockFile(singleCategoryApiInfoJsonSchema, category, microServerName, microServerMockTemplateDirUrl)
                }

                // 生成导出文件
                this.productImportIndex(apiPaths, microServerName, microServerMockTemplateDirUrl)

                resolve(apiSchemaData)
            } catch (e) {
                console.log('\ngetMicroServerApiSchemaAndProductMockTpl>>>error: ', e, '\n')
                reject(e)
            }
        })
    }

    // 生成 mock 文件 js
    productMockFile(singleCategoryApiInfoJsonSchema, category, microServerName, microServerMockTemplateDirUrl) {
        let apiPaths = singleCategoryApiInfoJsonSchema.paths

        for (const apiPath in apiPaths) {
            // apiPath: /stock-order-server/admin-api/admin-marginUpgrade-flowRetryList/v1
            // 当前 api 路径对应的 定义信息
            const apiDefineInfo = apiPaths[apiPath]

            // 获取当前 api 对应的 post 或者 get 方法(一般这里只有一种请求方法)
            let reqMethods = Object.keys(apiDefineInfo)

            // 拿到对应请求方法的定义信息
            let reqMethodsDefineInfo = apiDefineInfo[reqMethods[0]]

            // 拿到成功的数据定义指向链接
            // console.log('apiPath :>> ', apiPath)
            let reqSuccessSchema = reqMethodsDefineInfo.responses['200'].schema && reqMethodsDefineInfo.responses['200'].schema['$ref']

            let mockDataTemplate = '{}'
            if (reqSuccessSchema) {
                // 存储使用过的 schema，若后续再次使用到，则忽略，防止死循环
                let usedSchema = []

                // 生成请求成功数据模板
                mockDataTemplate = productPropTemplate({ ref: reqSuccessSchema, singleCategoryApiInfoJsonSchema, usedSchema })
            }
            // 生成整个 mock 文件模板
            let mockTemplateContent = this.mockFileTemplate(mockDataTemplate, category, reqMethodsDefineInfo, apiPath, reqMethods)

            // 当前 api 对应的生成 mock 数据的执行文件名
            let mockFileName = apiPath
                .replace(microServerName, '')
                .slice(2)
                .replace(/\//g, '-')

            // mock 生成数据文件的路径
            this.service.createMicroServerMockTemplate.productJavascriptMockFile(microServerMockTemplateDirUrl, mockFileName, mockTemplateContent)
        }
    }

    // 生成整个 mock 文件模板
    mockFileTemplate(mockDataTemplate, category, reqMethodsDefineInfo, apiPath, reqMethods) {
        let mockTemplate = `import { host } from '../../utils/host'
import { formatMockData } from '../../utils/util'
import Mock from 'mockjs'
// const formatData = formatMockData(mockDataTemplate)

// 由于字符串类型 string 表示的数据格式过多
// 这里只能统一处理成 @word(1, 10) , 即随机生成 1 - 10个英文字符
// 下面提供 string 相关的一些 mock 类型生成方式，方便手动快速替换
// name: /170\\d{10}/ // '1705237332101' --- 生成 170 开头，后面衔接 10 位数字的字符串
// name: '@cword(2, 6)' // '价亲三身千然' --- 随机生成 2-6 个中文字符串
// name: '@word(1, 10)' // 'yyuj' --- 随机生成 1- 10 个英文字符
// name: '@url(http)' //  "http://djldfusj.in/ccnknb" --- 生成一个 url
// 'name|1': ['AMD', 'CMD', 'UMD'] // 随机出现数组中的元素, 比如 'AMD'

// mock 模板数据
const formatData = ${mockDataTemplate}

// ${category}/${(reqMethodsDefineInfo.tags && reqMethodsDefineInfo.tags[0]) || ''}/${reqMethodsDefineInfo.summary}
// let url = host + '${apiPath}'
let url = '${apiPath}'
let method = '${reqMethods[0]}'
export default [
    url,
    method,
    function(options) {
        console.log('options:>>>', options)
        return Mock.mock(formatData)
    },
    {
        url,
        method,
        formatData
    }
]
`
        return mockTemplate
    }

    // 生成单位微服务接口导出文件 index.js
    productImportIndex(apiPaths, microServerName, microServerMockTemplateDirUrl) {
        let importStr = ''
        let exportNameStr = ''
        let apiList = Object.keys(apiPaths)
        // console.log('apiList :>> ', apiList)
        apiList.forEach(list => {
            // list： /stock-order-server/admin-api/admin-delete-bank/v1
            // importUrlName： './admin-api-admin-delete-bank-v1'
            console.log('list :>> ', list)
            let importUrlName = list
                .replace(`/${microServerName}/`, '')
                .replace(/{([^}.]+)}/g, '$1')
                .replace(/\//g, '-')

            // importName： adminApiAdminDeleteBankV1
            let importName = list.replace(`/${microServerName}/`, '').replace(/{([^}.]+)}/g, '$1')
            importName = importName
                .split(/[-/]/)
                .map((splitName, index) => {
                    // console.log('splitName :>> ', splitName)
                    if (index !== 0) {
                        return splitName && splitName[0].toUpperCase() + splitName.slice(1)
                    }
                    return splitName
                })
                .join('')
            exportNameStr += `\n    ${importName},`
            importStr += `import ${importName} from './${importUrlName}'\n`
        })
        let exportStr = `${importStr}
export default {${exportNameStr.slice(0, -1)}
}
`
        this.service.createMicroServerMockTemplate.productExportAllMockFileEntry(microServerMockTemplateDirUrl, exportStr)
    }
}
