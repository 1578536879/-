const DB = require("../../db")
const sendMsg = require('../../common/send')

let switchVersion = async function(req, res){
    let info = req.query
    let logs = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(logs.length === 0) {
        sendMsg.sendFail(res, 101, '未找到此应用下的日志')
        return
    }
    logs = logs.filter(ele => ele.environment === info.environment)
    if(logs.length === 0){
        sendMsg.sendFail(res, 103, '未找到此环境') 
        return 
    }
    logs = logs.filter(ele => ele.version === info.version)
    if(logs.length === 0){
        sendMsg.sendFail(res, 102, '未找到此环境的此版本')
        return
    }
    else {
        sendMsg.sendSuccess(res, logs)
    }
}

let queryVersion = async function(req, res){
    let info = req.query
    let apps = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(apps.length === 0){
        sendMsg.sendFail(res,101, '未找到此应用下的日志')
        return
    }
    let list = []
    apps.forEach(ele => {
        let flag = true
        if(info.environment){
            if(ele.environment === info.environment){
                list.forEach(Element=>{
                    if(Element === ele.version) {
                        flag = false
                        return 
                    }
                })
                if(flag)
                    list.push(ele.version)
            }
        }else {
            list.forEach(Element=>{
                if(Element === ele.version) {
                    flag = false
                    return 
                }
            })
            if(flag)
                list.push(ele.version)
        }
       
    })
    if(list.length === 0) {
        sendMsg.sendFail(res,102,'未找到此版本')
        return
    }else {
        sendMsg.sendSuccess(res, {version: list})

    }
}

let deleteVersion = async function(req, res){
    let info = req.query
    let logs = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(logs.length === 0){
        sendMsg.sendFail(res, 101, '未找到此应用的日志')
        return
    }else{
        logs = logs.filter(ele => ele.environment === info.environment) 
        if(logs.length === 0){
            sendMsg.sendFail(res, 102, '未找到此环境')
            return 
        }else{
            logs = logs.filter(ele => ele.version === info.version)
            if(logs.length === 0) {
                sendMsg.sendFail(res, 103, '未找到此版本')
                return
            }else {
                let result = await DB.getDB().collection('logs').deleteMany({
                    appId: info.appId,
                    environment: info.environment,
                    version: info.version
                })
                if(result.deletedCount === 0){
                    sendMsg.sendFail(res, 104, '删除失败')
                }else {
                    sendMsg.sendSuccess(res,{})
                }
            }
        }
    }
}

let modifyVersion = async function(req, res){
    let info = req.query
    let logs = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(logs.length === 0){
        sendMsg.sendFail(res,101, '未找到此应用的日志')
        return 
    }else {
        logs = logs.filter(ele => ele.environment === info.environment)
        if(logs.length === 0) {
            sendMsg.sendFail(res, 102, '未找到此环境')
            return
        }else{
            logs = logs.filter(ele => ele.version === info.oldVersion)
            if(logs.length === 0){
                sendMsg.sendFail(res, 103, '未找到此环境下的此版本')
                return
            }else {
                let result = await DB.getDB().collection('logs').updateMany({
                    appId: info.appId, 
                    environment: info.environment, 
                    version: info.oldVersion
                }, {$set:{
                    version: info.newVersion
                }})
                if(result.modifiedCount !== 0){
                    sendMsg.sendSuccess(res,{})
                    return 
                } else {
                    sendMsg.sendFail(res,103, '修改失败')
                }
            }
        }
    }
}

module.exports = {
    queryVersion: queryVersion,
    switchVersion: switchVersion,
    deleteVersion: deleteVersion,
    modifyVersion: modifyVersion
}