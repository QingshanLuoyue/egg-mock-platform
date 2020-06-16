const productMockTpl = function({ mockDataTemplate, category, reqMethodsDefineInfo, apiPath, reqMethods }) {
    const mockTpl = `import { host } from '../../utils/host'
import { formatMockData } from '../../utils/util'
import Mock from 'mockjs'
// const formatData = formatMockData(mockDataTemplate)

// 由于字符串类型 string 表示的数据格式过多
// 这里只能统一处理成 @word(1, 10) , 即随机生成 1 - 10个英文字符
// 下面提供 string 相关的一些 mock 类型生成方式，方便手动快速替换
// name: /170\\d{10}/               // '1705237332101' --- 生成 170 开头，后面衔接 10 位数字的字符串
// name: '@cword(2, 6)'             // '价亲三身千然' --- 随机生成 2-6 个中文字符串
// name: '@word(1, 10)'             // 'yyuj' --- 随机生成 1- 10 个英文字符
// name: '@url(http)'               // "http://djldfusj.in/ccnknb" --- 生成一个 url
// 'name|1': ['AMD', 'CMD', 'UMD']  // 随机出现数组中的元素, 比如 'AMD'

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
    return mockTpl
}
module.exports = {
    productMockTpl
}
