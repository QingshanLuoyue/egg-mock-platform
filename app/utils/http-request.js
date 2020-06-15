'use strict'
const axios = require('axios')
// axios.defaults.baseURL = 'http://127.0.0.1:7001';
axios.defaults.timeout = 15000
axios.defaults.xsrfHeaderName = 'x-csrf-token'
axios.defaults.xsrfCookieName = 'csrfToken'

class baseRequest {
    constructor(baseURL) {
        baseURL = baseURL || ''
        this.$http = axios.create({
            timeout: 30000,
            baseURL
        })
        this.$http.interceptors.request.use(async config => {
            return config
        })

        this.$http.interceptors.response.use(
            ({ data, status }) => {
                console.log('interceptors:status:>> ', status)
                console.log('interceptors:data:>> ', data)
                // 图片流
                if (typeof data === 'string') {
                    return data
                }
                if (status === 200) {
                    return data
                } else {
                    return Promise.reject({
                        code: status,
                        data: data,
                        msg: data.error
                    })
                }
            },
            e => {
                console.log('interceptors:response:error:>> ', e.response.statusText)
                return Promise.reject({
                    code: e.response.status,
                    msg: e.response.statusText || '网络开小差了,请稍后重试',
                    data: e.response.data
                })
            }
        )
    }
    post(url, params = {}, config = {}) {
        return this.$http.post(url, params, config)
    }
    get(url, params = {}, config = {}) {
        return this.$http.get(url, {
            params,
            ...config
        })
    }
    getForm(url, params = {}) {
        return this.$http({
            params,
            url,
            method: 'get',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {}
        })
    }
    del(url, params = {}) {
        return this.$http.delete(url, params)
    }
    put(url, params = {}, config = {}) {
        return this.$http.put(url, params, config)
    }
    postForm(url, params = {}) {
        return this.$http({
            url,
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: qs.stringify(params)
        })
    }
    postMul(url, params) {
        let formData = new FormData()
        Object.keys(params).forEach(key => {
            formData.append(key, params[key])
        })
        return this.$http({
            url,
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        })
    }
}

module.exports = baseRequest
