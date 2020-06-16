'usestrict'
const egg = require('egg')
const path = require('path')
const fs = require('fs')

// mock 目录
const mockRootDir = path.resolve(__dirname, '../../mock')
const apiSchemaDefineDir = path.resolve(mockRootDir, 'api-schema')
module.exports = class CreateMicroServerApiSchemaController extends egg.Controller {
    async create(ctx) {
        console.log('createbody:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            // 遍历微服务列表，请求各自的 select 选项
            let data = await this.requestCurrentMicroServerAllSelectOption(microServerName)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:create:error>> ', e)
            throw e
        }
    }

    // 请求当前微服务所有的 select option 选项
    requestCurrentMicroServerAllSelectOption(microServerName) {
        return new Promise(async (resolve, reject) => {
            try {
                let allSelectOptionData = await this.service.createMicroServer.getAllOptionData(microServerName)
                // console.log('\nrequestCurrentMicroServerAllSelectOption :>> ', allSelectOptionData, '\n')

                if (!allSelectOptionData || allSelectOptionData.length === 0) {
                    return resolve('没有该微服务数据')
                }

                // 存在该微服务数据，才创建相应的目录
                this.apiSchemaMicroServerDir = path.resolve(apiSchemaDefineDir, microServerName)
                if (!fs.existsSync(this.apiSchemaMicroServerDir)) {
                    console.log('create:apiSchemaMicroServerDir:>> ')
                    fs.mkdirSync(this.apiSchemaMicroServerDir, { recursive: true })
                }

                let microServerTotalApiSchema = {}
                for (let i = 0; i < allSelectOptionData.length; i++) {
                    const option = allSelectOptionData[i]
                    // option:
                    // {
                    //     "name": "测试-捷力宝",
                    //     "url": "/v2/api-docs?group=测试-捷力宝",
                    //     "swaggerVersion": "2.0",
                    //     "location": "/v2/api-docs?group=测试-捷力宝"
                    // }
                    let optionData = await this.requestOpitonApiSchema(option, microServerName)
                    microServerTotalApiSchema[option.name] = {
                        ...option,
                        optionData
                    }
                }

                resolve(microServerTotalApiSchema)
            } catch (e) {
                console.log('\nrequestCurrentMicroServerAllSelectOption>>>error: ', e, '\n')
                reject(e)
            }
        })
    }

    // 请求 option 类别下的 所有 api 列表信息
    // 并以 option 的 name 为文件名前缀的 json 文件存储起来
    requestOpitonApiSchema(option, microServerName) {
        return new Promise(async (resolve, reject) => {
            try {
                let name = option.name
                let url = option.url

                let optionApiSchemaData = await this.service.createMicroServer.getSingleOptionApiSchemaData(option, microServerName)
                // console.log('\nrequestOpitonApiSchema :>> ', optionApiSchemaData, '\n')

                let apiSchemaJsonDBUrl = path.resolve(this.apiSchemaMicroServerDir, `${name}-api-schema.json`)
                // 写入 api 的信息
                fs.writeFileSync(apiSchemaJsonDBUrl, JSON.stringify(optionApiSchemaData, null, 4), {
                    encoding: 'utf8'
                })

                // 更新记录文件路径的 json 文件
                await this.updateConfigFile(apiSchemaJsonDBUrl, name, microServerName)

                resolve(optionApiSchemaData)
            } catch (e) {
                console.log('\nrequestOpitonApiSchema:error:>>> ', e, '\n')
                reject(e)
            }
        })
    }

    // config.json 存储多个 api 信息的入口
    // 每次存储 api 信息后，我们需要把文件路径记录下来，方便后面引用
    updateConfigFile(apiSchemaJsonDBUrl, name) {
        return new Promise(async (resolve, reject) => {
            try {
                let configUrl = path.resolve(this.apiSchemaMicroServerDir, `config.json`)

                // 是否存在 config.json 文件
                if (!fs.existsSync(configUrl)) {
                    // 不存在，直接写入
                    let configData = {
                        [name]: apiSchemaJsonDBUrl
                    }
                    fs.writeFileSync(configUrl, JSON.stringify(configData), {
                        encoding: 'utf8'
                    })
                } else {
                    // 存在的话，读取，然后修改数据，再写入
                    let configData = fs.readFileSync(configUrl, {
                        encoding: 'utf8'
                    })
                    configData = JSON.parse(configData)
                    configData[name] = apiSchemaJsonDBUrl
                    fs.writeFileSync(configUrl, JSON.stringify(configData, null, 4), {
                        encoding: 'utf8'
                    })
                }
                resolve()
            } catch (e) {
                console.log('updateConfigFile:error:>>> ', e)
                reject(e)
            }
        })
    }
}
