'usestrict'
const egg = require('egg')
module.exports = class CreateController extends egg.Controller {
    async create(ctx) {
        console.log('body:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            let data = await this.service.createMicroServer.init(microServerName)
            // this.service.createMicroServer.create(microServerName)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:create:error>> ', e)
            throw e
        }
    }
}
