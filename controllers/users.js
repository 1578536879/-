const DB = require("../db")
const sendMessage = require('../common/send')
const uuidv1 = require('uuid/v1')
const session = require('../common/session')

let register = function(req, res){
    let info = req.query
    info.id = uuidv1()
    DB.getDB().collection('users').insertOne(info)
    sendMessage.sendSuccess(res,{userId: info.uuid})
}

let login = async function(req,res){
    let info = req.query
    let users = await DB.getDB().collection('users').find().toArray()
    let flag = 0 
    let userId 
    let sessionid = uuidv1()
    users.forEach(element => {
        if(element.username === info.username && element.password === info.password){
            flag = 1
            let time = new Date()
            userId = element.id
            DB.getDB().collection('sessionIDs').insertOne({sessionID:sessionid,time:time.getTime()})
            return
        }
        else if(element.username === info.username && element.password !== info.password){
            // message = '密码错误'
            // code = 101
            flag = 2
            return 
        }
    }); 
    if(flag === 1){
        res.cookie('sessionId',sessionid)
        sendMessage.sendSuccess(res,{userId: userId})
    }
    else if(flag === 2){
        sendMessage.sendFail(res,101,'密码错误')
    } 
    else sendMessage.sendFail(res,102,'此用户未注册')
}

let loginOut = function(req, res){
    let sessionId = req.cookies.sessionId
    DB.getDB().collection("sessionIDs").deleteOne({sessionID:sessionId})
    res.clearCookie('sessionId')
    sendMessage.sendSuccess(res, {})
}

let modifyPassword = async function(req,res){
    let flag = await session.online(req.cookies.sessionId)
    if(!flag) {
         sendMessage.sendFail(res, 103, '修改失败')
        return 
    }else{
        session.updateTime(req.cookies.sessionId)
    }
    let info = req.query
    let user = await DB.getDB().collection('users').find({id:info.userId}).toArray()
    if(user.length === 0){
        sendMessage.sendFail(res,102,'未找到此用户')
    }
    else if(user[0].password === info.oldPassword) {
        let x = await DB.getDB().collection('users').updateOne({id:user[0].id},{$set:{password:info.newPassword}})
        sendMessage.sendSuccess(res,{})
    }
    else if(user[0].password !== info.oldPassword) {
        sendMessage.sendFail(res,101,'密码错误')
    }
}

exports.register = register
exports.login = login
exports.loginOut = loginOut
exports.modifyPassword = modifyPassword