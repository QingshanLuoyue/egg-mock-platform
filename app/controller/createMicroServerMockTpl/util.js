// 请求成功之后的数据类型映射操作
const propTypeMap = {
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
            value: productPropTemplate(options)
        }
    },
    array: function(key, format, description, options) {
        return {
            key: `"${key}|1-3"`,
            value: '[' + productPropTemplate(options) + ']'
        }
    },
    number: function(key, format, description) {
        return { key: `"${key}|1-12345"`, value: 0 }
    },
    integer: function(key, format, description) {
        return { key: `"${key}|1-12345"`, value: 0 }
    }
}

const otherTypeMap = {
    integer: function() {
        return '1'
    },
    string: function() {
        return '1'
    },
    number: function() {
        return '1'
    },
    object: function() {
        return '{}'
    },
    array: function() {
        return '[]'
    },
    boolean: function() {
        return 'false'
    }
}
// 解析定义的 schema
const resolveSchema = function(ref) {
    if (!ref) return ''
    return ref.split('/')[2]
}
// 生成请求成功数据模板
// "type": "array",
// "description": "推荐股票标签",
// "items": {
//     "$ref": "#/definitions/YgRecommendLabelAppResponse"

/**
 * ref: '#/definitions/YgRecommendLabelAppResponse'
 * singleCategoryApiInfoJsonSchema: {
 *      swagger: ''
 *      info: {}
 *      host: ''
 *      basePath: ''
 *      tags: []
 *      paths: {}
 *      definitions: {}
 * }
 */
const productPropTemplate = function({ ref, singleCategoryApiInfoJsonSchema, usedSchema, itemsType }) {
    if (!ref) {
        console.log('productPropTemplate:itemsType:>> ', itemsType)
        console.log('productPropTemplate:usedSchema:>> ', usedSchema)
        return otherTypeMap[itemsType]()
        // return '{}'
    }

    let reqSuccessSchema = resolveSchema(ref)
    if (usedSchema.includes(reqSuccessSchema)) return '[]'
    usedSchema.push(reqSuccessSchema)

    // "properties": {
    //     "planId": {
    //         "type": "integer",
    //         "format": "int64",
    //         "example": 1,
    //         "description": "月供计划Id"
    //     },
    //     "status": {
    //         "type": "integer",
    //         "format": "int32",
    //         "example": 1,
    //         "description": "状态（0-进行中(恢复)，1-暂停，2-终止）"
    //     }
    // }
    let defineProp = singleCategoryApiInfoJsonSchema.definitions[reqSuccessSchema].properties

    // console.log('defineProp :>> ', defineProp)
    if (!defineProp) {
        return '{}'
    }
    let mockDataTemplate = {}
    // 生成键值对
    mockDataTemplate = productKeyAndValue(defineProp, singleCategoryApiInfoJsonSchema, usedSchema)
    return mockDataTemplate
}
// 生成键值对
/**
 * defineProp: {
    "planId": {
        "type": "integer", // string/number
        "format": "int64",
        "example": 1,
        "description": "月供计划Id"
    },
    "data": {
        "type": "array",
        "description": "返回体",
        "items": {
            "$ref": "#/definitions/YgAllotFailResponse"
        }
    },
    "data": {
        "type": "array",
        "description": "返回体",
        "items": {
            "type": "integer",
            "format": "int32"
        }
    },
    "data": {
        "description": "返回体",
        "$ref": "#/definitions/IsYgStockResponse"
    },
 * }
 */
const productKeyAndValue = function(defineProp, singleCategoryApiInfoJsonSchema, usedSchema) {
    let mockTemplate = '{'
    Object.keys(defineProp).forEach(key => {
        let propItem = defineProp[key]
        if (propItem.type || (!propItem.type && propItem.$ref)) {
            console.log('propItem :>> ', propItem)
            let action, ref, itemsType
            if (!propItem.type && propItem.$ref) {
                action = propTypeMap['objectRef']
                ref = propItem.$ref
            } else {
                action = propTypeMap[propItem.type]
                ref = (propItem.items && propItem.items['$ref']) || ''
                itemsType = (propItem.items && propItem.items['type']) || ''
            }
            // console.log('action :>> ', action, propItem, propItem.type)
            let actionValue = action(key, propItem.format, propItem.description, {
                ref,
                itemsType,
                singleCategoryApiInfoJsonSchema,
                usedSchema,
                propItem
            })
            mockTemplate += `${actionValue.key}: ${actionValue.value},// ${propItem.description}
            `
        }
    })
    mockTemplate = mockTemplate.slice(0, -1) + '}'
    return mockTemplate
}

module.exports = {
    propTypeMap,
    otherTypeMap,
    resolveSchema,
    productPropTemplate,
    productKeyAndValue
}
