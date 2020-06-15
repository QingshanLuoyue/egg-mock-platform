'usestrict'
const egg = require('egg')
module.exports = class CreateController extends egg.Controller {
    async create(ctx) {
        console.log('createbody:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            let data = await this.service.createMicroServer.init(microServerName)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:create:error>> ', e)
            throw e
        }
    }
    async createMockTemplate(ctx) {
        console.log('createMockTemplate:body:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            let data = await this.service.createMicroServerMockTemplate.init(microServerName)
            // console.log('data :>> ', data)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:createMockTemplate:error>> ', e)
            throw e
        }
    }
}
