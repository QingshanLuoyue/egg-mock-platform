'usestrict'
const egg = require('egg')

module.exports = class QueryMicroServerListController extends egg.Controller {
    async queryMicroServerList(ctx) {
        console.log('QueryMicroServerList:body:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            let data = await this.service.queryMicroServerList.getMicroServerList(microServerName)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:QueryMicroServerList:error>> ', e)
            throw e
        }
    }
}
