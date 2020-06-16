'usestrict'
const egg = require('egg')

module.exports = class QueryMicroServerMockApiListController extends egg.Controller {
    async queryApiList(ctx) {
        console.log('queryApiList:body:>> ', ctx.request.body)
        let { microServerName } = ctx.request.body
        try {
            let data = await this.service.queryMicroServerMockApiList.getApiList(microServerName)
            this.ctx.body = data
        } catch (e) {
            console.log('controller:queryApiList:error>> ', e)
            throw e
        }
    }
}
