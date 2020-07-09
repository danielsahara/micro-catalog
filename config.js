module.exports = {
    rest: {
        port: +(process.env.PORT || 3000),
        host: process.env.HOST,
        gracePeriodForClose: 5000, // 5 seconds
        openApiSpec: {
            setServersFromRequest: true,
        },
    },
    rabbitmq: {
        uri: process.env.RABBITMQ_URI,
        defaultHandlerError: process.env.RABBITMQ_HANDLER_ERROR
    }
};