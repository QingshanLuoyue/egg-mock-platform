let response_formatter = async ctx => {
    //如果有返回数据，将返回数据添加到data中
    if (ctx.body) {
        ctx.body = {
            code: 0,
            message: 'success',
            data: ctx.body
        }
    } else {
        ctx.body = {
            code: 404,
            message: '没有信息'
        }
    }
}
module.exports = () => {
    return async (ctx, next) => {
        try {
            //先去执行路由
            await next()

            response_formatter(ctx)
        } catch (error) {
            console.log('response_formatter:error:>>>', error)
            ctx.status = 200
            ctx.body = {
                code: error.code,
                message: error.message
            }
        }
    }
}
