'usestrict'
const egg = require('egg')
module.exports = class CreateMockTemplateController extends egg.Controller {
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
