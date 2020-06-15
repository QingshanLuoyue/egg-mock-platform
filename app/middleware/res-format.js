let response_formatter = async ctx => {
    //如果有返回数据，将返回数据添加到data中
    if (ctx.body) {
        ctx.body = {
            code: 0,
            msg: ctx.body.msg,
            data: ctx.body
        }
    } else {
        ctx.body = {
            code: 404,
            msg: '没有信息'
        }
    }
}
module.exports = pattern => {
    return async (ctx, next) => {
        let reg = new RegExp(pattern)
        try {
            //先去执行路由
            await next()

            //通过正则的url进行格式化处理
            if (reg.test(ctx.originalUrl)) {
                response_formatter(ctx)
            }
        } catch (e) {
            console.log('response_formatter:error:>>>', e)
            ctx.body = e
        }
    }
}
