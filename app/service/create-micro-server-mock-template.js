'use strict'
const egg = require('egg')

const path = require('path')
const fs = require('fs')

// 请求主机

// mock 目录
const mockRootDir = path.resolve(__dirname, '../mock')
const apiSchemaDefineDir = path.resolve(mockRootDir, 'api-schema')
const mockTemplateDir = path.resolve(mockRootDir, 'mock-template')

// 请求成功之后的数据类型映射操作
let propTypeMap = {
    boolean: function(key, format, description) {
        return { key: `"${key}|1"`, value: true }
    },
    string: function(key, format, description) {
        if (format === 'date-time') {
            return { key: `"${key}"`, value: 'Mock.Random.datetime()' }
        }
        return {
            key: `"${key}"`,
            value: '"@word(1, 10)"'
        }
    },
    object: function(key, format, description, options) {
        if (!options.propItem || !options.propItem.properties) {
            return {
                key: `"${key}"`,
                value: '{}'
            }
        }
        return {
            key: `"${key}"`,
            value: '{' + productKeyAndValue(options.defineProp, options.singleCategoryApiInfoJsonSchema, options.usedSchema) + '}'
        }
    },
    objectRef: function(key, format, description, options) {
        return {
            key: `"${key}"`,
            value: productPropTemplate(options.ref, options.singleCategoryApiInfoJsonSchema, options.usedSchema)
        }
    },
    array: function(key, format, description, options) {
        return {
            key: `"${key}|1-3"`,
            value: '[' + productPropTemplate(options.ref, options.singleCategoryApiInfoJsonSchema, options.usedSchema) + ']'
        }
    },
    number: function(key, format, description) {
        return { key: `"${key}|1-12345"`, value: 0 }
    },
    integer: function(key, format, description) {
        return { key: `"${key}|1-12345"`, value: 0 }
    }
}

module.exports = class CreateMicroServerServiceMockTemplate extends egg.Service {
    constructor(ctx) {
        super(ctx)
        this.ctx = ctx
        this.apiSchemaMicroServerDir = ''
    }
    init(microServerName) {
        return this.getMicroServerApiSchemaAndProductMockTpl(microServerName)
    }

    getMicroServerApiSchemaAndProductMockTpl(microServerName) {
        return new Promise(async (resolve, reject) => {
            try {
                let microServerApiSchemaDBUrl = path.resolve(apiSchemaDefineDir, `${microServerName}/config.json`)
                if (!fs.existsSync(microServerApiSchemaDBUrl)) {
                    return resolve(`不存在与 ${microServerName} 对应的定义文件，无法生成 mock 文件`)
                }
                let configData = fs.readFileSync(microServerApiSchemaDBUrl)
                configData = JSON.parse(configData)

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
                    // if (category === '股票订单中心-孖展相关') {
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
                    // }
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
        // console.log('apiPaths :>> ', apiPaths)
        let debugList = [
            '/stock-order-server/admin-api/admin-delete-bank/v1',
            '/stock-order-server/admin-api/admin-marginUpgrade-notHkdBatchCcass-list/v1',
            '/stock-order-server/admin-api/admin-marginUpgrade-selectHkdBatchCcassPage/v1',
            '/stock-order-server/admin-api/admin-marginUpgrade-flowRetryList/v1'
        ]
        for (const apiPath in apiPaths) {
            // apiPath: /stock-order-server/admin-api/admin-marginUpgrade-flowRetryList/v1
            // if (debugList.includes(apiPath)) {
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
                // console.log('reqSuccessSchema :>> ', reqSuccessSchema
                // 存储使用过的 schema，若后续再次使用到，则忽略，防止死循环
                let usedSchema = []

                // 生成请求成功数据模板
                mockDataTemplate = productPropTemplate(reqSuccessSchema, singleCategoryApiInfoJsonSchema, usedSchema)
            }
            // 生成整个 mock 文件模板
            let mockTemplate = this.mockFileTemplate(mockDataTemplate, category, reqMethodsDefineInfo, apiPath, reqMethods)

            // 当前 api 对应的生成 mock 数据的执行文件名
            let mockFileName = apiPath
                .replace(microServerName, '')
                .slice(2)
                .replace(/\//g, '-')

            // mock 生成数据文件的路径
            let apiWriteUrl = `${microServerMockTemplateDirUrl}/${mockFileName}.js`
            fs.writeFileSync(apiWriteUrl, mockTemplate, {
                encoding: 'utf8'
            })
            // }
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
        fs.writeFileSync(`${microServerMockTemplateDirUrl}/index.js`, exportStr)
    }
}
// 解析定义的 schema
function resolveSchema(ref) {
    if (!ref) return ''
    return ref.split('/')[2]
}
// 生成请求成功数据模板
function productPropTemplate(ref, singleCategoryApiInfoJsonSchema, usedSchema) {
    if (!ref) return {}

    let reqSuccessSchema = resolveSchema(ref)
    if (usedSchema.includes(reqSuccessSchema)) return []
    usedSchema.push(reqSuccessSchema)

    let defineProp = singleCategoryApiInfoJsonSchema.definitions[reqSuccessSchema].properties

    // console.log('defineProp :>> ', defineProp)
    if (!defineProp) {
        return '{}'
    }
    let mockDataTemplate = {}
    // 生成键值对
    mockDataTemplate = productKeyAndValue(defineProp, singleCategoryApiInfoJsonSchema, usedSchema)
    // console.log('productPropTemplate :>> ', mockDataTemplate)
    return mockDataTemplate
}
// 生成键值对
function productKeyAndValue(defineProp, singleCategoryApiInfoJsonSchema, usedSchema) {
    let mockTemplate = '{'
    Object.keys(defineProp).forEach(key => {
        let propItem = defineProp[key]
        if (propItem.type || (!propItem.type && propItem.$ref)) {
            let action, ref
            if (!propItem.type && propItem.$ref) {
                action = propTypeMap['objectRef']
                ref = propItem.$ref
            } else {
                action = propTypeMap[propItem.type]
                ref = (propItem.items && propItem.items['$ref']) || ''
            }
            // console.log('action :>> ', action, propItem, propItem.type)
            let actionValue = action(key, propItem.format, propItem.description, {
                ref,
                singleCategoryApiInfoJsonSchema,
                usedSchema,
                propItem
            })
            mockTemplate += `${actionValue.key}: ${actionValue.value},// ${propItem.description}
            `
        }
    })
    mockTemplate = mockTemplate.slice(0, -1) + '}'
    // console.log('productKeyAndValue :>> ', mockTemplate, '\n')
    return mockTemplate
}
