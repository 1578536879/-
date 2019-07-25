const DB = require("../../db")
const sendMsg = require('../../common/send')
// const parser = require('ua-parser-js'); 

let switchEnvironment = async function(req, res){
    let info = req.query
    let logs = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(logs.length === 0){
        sendMsg.sendFail(res,101,'未找到此应用下的日志')
        return 
    }
    logs = logs.filter(ele => ele.environment === info.environment)
    if(logs.length === 0) {
        sendMsg.sendFail(res,102,'未找到此环境')
        return
    }
    logs = logs.filter(ele => ele.version === info.version)
    if(logs.length === 0){
        sendMsg.sendFail(res, 103, '此环境下没有这个版本')
        return 
    }
    sendMsg.sendSuccess(res, logs)
}

let modifyEnvironment = async function(req, res){
    let info = req.query
    let logs = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(logs.length === 0) {
        sendMsg.sendFail(res,101,'未找到此应用')
        return 
    }
    let result = await DB.getDB().collection('logs').updateMany({environment: info.oldName},{$set: {environment: info.newName}})
    if(result.modifiedCount !== 0){
        sendMsg.sendSuccess(res,{})
        return
    }else if(result.matchedCount === 0){
         sendMsg.sendFail(res, 102, '未找到此环境')
         return 
    } else {
        sendMsg.sendFail(res,103, '修改失败')
    }
}

let deleteEnvironment = async function(req, res){
    let info = req.query
    let app = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(app.length === 0){
        sendMsg.sendFail(res,101,'未找到此应用的日志')
        return
    }
    app = app.filter(ele=> ele.environment === info.environment)
    if(app.length === 0){
        sendMsg.sendFail(res, 101, '未找到此环境')
        return
    }
    let result = await DB.getDB().collection('logs').deleteMany({
        environment: info.environment
    })
    if(result.deletedCount === 0){
        sendMsg.sendSuccess(res,{})
    }else {
        result.sendFail(res, 102, '删除失败')
    }
}

let queryEnvironment = async function(req, res){
    let info = req.query
    let apps = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(apps.length === 0){
        sendMsg.sendFail(res,101, '未找到此应用下的日志')
        return
    }
    let list = []
    apps.forEach(ele => {
        let flag = true
        if(info.version){
            if(ele.version === info.version){
                list.forEach(Element=>{
                    if(Element === ele.environment) {
                        flag = false
                        return 
                    }
                })
                if(flag)
                    list.push(ele.environment)
            }
        }
        else {
            list.forEach(Element=>{
                if(Element === ele.environment) {
                    flag = false
                    return 
                }
            })
            if(flag)  list.push(ele.environment)
        }
    })
    if(list.length === 0) {
        sendMsg.sendFail(res,102,'未找到此版本')
        return
    }else {
        sendMsg.sendSuccess(res, {environment: list})

    }
}

module.exports = {
    switchEnvironment: switchEnvironment,
    modifyEnvironment: modifyEnvironment,
    deleteEnvironment: deleteEnvironment,
    queryEnvironment: queryEnvironment
}