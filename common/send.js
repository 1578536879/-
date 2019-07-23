let sendFail = function(res, code, message){
    res.send({
        code: code,
        message: message,
        data:{}
    })
}

let sendSuccess = function(res, data){
    res.send({
        code: 100,
        message: 'success',
        data:data
    })
}

module.exports = {
    sendFail: sendFail,
    sendSuccess: sendSuccess,
}