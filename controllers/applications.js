const DB = require("../db")
const sendMessage = require('../common/send')
const uuidv1 = require('uuid/v1')

let createApp = async function(req,res){
    let info = req.query
    info.id = uuidv1()
    let user = await DB.getDB().collection('users').find({id: info.userId}).toArray()
    if(user.length === 0) {
        sendMessage.sendFail(res,101,'未找到此用户')
    }
    else {
        sendMessage.sendSuccess(res, {appId: info.id})
        DB.getDB().collection('apps').insertOne(info)
    }
}

let deleteApp = async function(req,res){
    let info = req.query
    let app = await DB.getDB().collection('apps').find({id: info.appId}).toArray()
    if(app.length === 0){
        // code = 101
        // message = '未找到此应用'
        sendMessage.sendFail(res,101,'未找到此应用')
    }else {
        DB.getDB().collection('apps').deleteOne({
            name: app[0].name,
            domainNames: app[0].domainNames,
            userId: app[0].userId,
            id: app[0].id
        })
        code = 100
        message = 'success'
        sendMessage.sendSuccess(res,{})
    }
}

let modifyAppName = async function(req,res){
    let info = req.query
    let app = await DB.getDB().collection('apps').find({id: info.appId}).toArray()
    if(app.length === 0) {
        sendMessage.sendFail(res,101,'未找到此应用')
    } else {
        DB.getDB().collection('apps').updateOne({id: info.appId},{$set:{name: info.newName}})
        sendMessage.sendSuccess(res,{})
    }
}

let queryAppList = async function(req, res){
    let info = req.query
    let apps = await DB.getDB().collection('apps').find({userId: info.userId}).toArray()
    if(apps.length === 0){
        sendMessage.sendFail(res,101,'此用户未创建应用')
    }else{
        sendMessage.sendSuccess(res,apps)
    }
}

let modifyDomainNames = async function(req, res){
    let info = req.query
    let result = await DB.getDB().collection('apps').updateOne({id: info.appId}, {$set: {domainNames: info.domainNames}})
    if(result.matchedCount === 0){
        sendMessage.sendFail(res,101,'未找到此应用')
    }else {
        sendMessage.sendSuccess(res,{})
    }
}

module.exports = {
    createApp: createApp,
    deleteApp: deleteApp,
    modifyAppName: modifyAppName,
    queryAppList: queryAppList,
    modifyDomainNames: modifyDomainNames
}