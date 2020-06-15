const http = require('http')
const path = require('path')
const fs = require('fs')

let prefixDir = 'micro-server'
// 微服务数组列表
let microServerNameArr = ['stock-order-server', 'user-admin-server']

init()

// 遍历微服务列表，请求各自的 select 选项
async function init() {
    for (let i = 0; i < microServerNameArr.length; i++) {
        const microServerName = microServerNameArr[i]
        // 微服务目录路径
        let microDirUrl = path.resolve(__dirname, `./${prefixDir}/${microServerName}`)
        // 创建多层目录
        mkdirsSync(microDirUrl)

        // 请求当前微服务所有的 select option 选项
        let selectArr = await requestCurrentMicroServerAllSelectOption(microServerName)
        console.log('selectArr :>> ', selectArr)
        // 使用 option 数据作为参数，请求相关的 api 信息
        await resolveSelectArr(selectArr, microServerName)
    }
}

// 递归创建多层目录
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname)
            return true
        }
    }
}

// 请求当前微服务所有的 select option 选项
function requestCurrentMicroServerAllSelectOption(microServerName) {
    return new Promise(resolve => {
        http.get(`http://admin-dev.yxzq.com/${microServerName}/doc/swagger-resources`, res => {
            let data = ''
            res.on('data', chunk => {
                data += chunk
            })
            res.on('end', async () => {
                data = JSON.parse(data)
                resolve(data)
            })
        })
    })
}
// 解析 select 数据
// 使用 option 数据作为参数，请求相关的 api 信息
async function resolveSelectArr(selectArr, microServerName) {
    for (let i = 0; i < selectArr.length; i++) {
        const option = selectArr[i]
        // option:
        // {
        //     "name": "测试-捷力宝",
        //     "url": "/v2/api-docs?group=测试-捷力宝",
        //     "swaggerVersion": "2.0",
        //     "location": "/v2/api-docs?group=测试-捷力宝"
        // }
        await requestOpitonApiInfoList(option, microServerName)
    }
}

// 请求 option 类别下的 所有 api 列表信息
// 并以 option 的 name 为文件名前缀的 json 文件存储起来
async function requestOpitonApiInfoList(option, microServerName) {
    return new Promise(resolve => {
        let name = option.name
        let url = option.url
        http.get(encodeURI(`http://admin-dev.yxzq.com/${microServerName}/doc${url}`), res => {
            let data = ''
            res.on('data', chunk => {
                data += chunk
            })
            res.on('end', async () => {
                let storageUrl = path.resolve(__dirname, `${prefixDir}/${microServerName}/${name}-api-info.json`)
                data = JSON.parse(data)
                // 写入 api 的信息
                fs.writeFileSync(storageUrl, JSON.stringify(data, null, 4), {
                    encoding: 'utf8'
                })

                // 更新记录文件路径的 json 文件
                await updateConfigFile(storageUrl, name, microServerName)

                resolve(data)
            })
        })
    })
}

// config.json 存储多个 api 信息的入口
// 每次存储 api 信息后，我们需要把文件路径记录下来，方便后面引用
async function updateConfigFile(storageUrl, name, microServerName) {
    return new Promise(resolve => {
        let configUrl = path.resolve(__dirname, `${prefixDir}/${microServerName}/config.json`)

        // 是否存在 config.json 文件
        if (!fs.existsSync(configUrl)) {
            // 不存在，直接写入
            let configData = {
                [name]: storageUrl
            }
            fs.writeFileSync(configUrl, JSON.stringify(configData), {
                encoding: 'utf8'
            })
        } else {
            // 存在的话，读取，然后修改数据，再写入
            let readData = fs.readFileSync(configUrl, {
                encoding: 'utf8'
            })
            readData = JSON.parse(readData)
            readData[name] = storageUrl
            fs.writeFileSync(configUrl, JSON.stringify(readData, null, 4), {
                encoding: 'utf8'
            })
        }
        resolve()
    })
}

// 获取单个微服务在 swagger 上
// 左上角选择栏的所有 option 类型

// 可以手动执行该文件，进行 api 信息的更新

// 请求单个微服务所有的分类api，得到分类数组

// 请求单个分类数组，得到该数组下所有的api信息，存储起来 optionname-api-info.js
// 分类数组有一个入口文件 json
// 该 json 内容动态生成，存储 单个分类信息的 import url
// json
// {
//     optionname1: {}
//     optionname2: {}
//     optionname3: {}
// }
// 总入口文件 import 这个 json，遍历 url 去导出合并 单个分类文件的 api 信息

// 以后启动mock，浏览器发起 api 请求，根据 微服务 前缀，查询 该微服务下的 index.js 中是否有匹配的 url 信息

// 有的话就构造 mock 返回
