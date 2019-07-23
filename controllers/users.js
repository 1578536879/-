const DB = require("../db")
const sendMessage = require('../common/send')
const uuidv1 = require('uuid/v1')

let register = function(req, res){
    let info = req.query
    info.id = uuidv1()
    DB.getDB().collection('users').insertOne(info)
    sendMessage.sendSuccess(res,{userId: info.uuid})
}

let login = async function(req,res){
    let info = req.query
    let users = await db.collection('users').find().toArray()
    users.forEach(element => {
        if(element.username === info.username && element.password === info.password){
            sendMessage.sendSuccess(res,{userId: element.id})

            let sessionid = uuidv1()
            let time = new Date()
            res.cookie('sessionId',sessionid)
            DB.getDB().collection('sessionIDs').insertOne({sessionID:sessionid,time:time.getTime()})
            return
        }
        else if(element.username === info.username && element.password !== info.password){
            // message = '密码错误'
            // code = 101
            sendMessage.sendFail(res,101,'密码错误')
        }
    }); 
    if(code === 0) sendMessage.sendFail(res,102,'此用户未注册')
}

let loginOut = function(req, res){
    let sessionId = req.cookies.sessionId
    DB.getDB().collection("sessionIDs").deleteOne({sessionID:sessionId})
}

let modifyPassword = async function(req,res){
    let info = req.query
    let user = await DB.getDB().collection('users').find({id:info.userId}).toArray()
    // let code = 0
    // let message = ''
    if(user.length === 0){
        // code = 102
        // message = '未找到此用户'
        
        sendMessage.sendFail(res,102,'未找到此用户')
    }
    else if(user[0].password === info.oldPassword) {
        let x = await DB.getDB().collection('users').updateOne({id:user[0].id},{$set:{password:info.newPassword}})
        sendMessage.sendSuccess(res)
    }
    else if(user[0].password !== info.oldPassword) {
        // code = 101 
        // message = '密码错误'
        sendMessage.sendFail(res,101,'密码错误')

    }
}

exports.register = register
exports.login = login
exports.loginOut = loginOut
exports.modifyPassword = modifyPassword