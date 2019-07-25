const DB = require("../../db")
const sendMsg = require('../../common/send')
const parser = require('ua-parser-js'); 

let stringToFormat = function(str){

    let buf = str.split('.')
    let format = "^"
    buf.forEach((ele,index)=>{
        if(index != 0) format +='.'
        if(ele === '*') {
            format += "([\\w]{1,100})"
        }
        else {
            format += `(${ele})`
        }
    })
    format += '$'
    return format
}


let getUserAgent = function(str){
    let info = {}
    let userAgent = info.userAgent
    userAgent = parser(userAgent)
    info.userAgent = {}
    info.userAgent.userAgent = userAgent
    info.userAgent.system = userAgent.os.name
    info.userAgent.systemVersion = userAgent.os.version
    info.userAgent.ersion = userAgent.browser.name
    info.userAgent.browserVersion = userAgent.browser.version
    return 
}

let insertLogs = async function(req, res){
    let info = req.body 
    // info.content = JSON.parse(info.content)

    let app = await DB.getDB().collection('apps').find({id: info.appId}).toArray()
    if(app.length === 0){
        sendMsg.sendFail(res,101,'未找到此应用')
    }
    else {
        // let r = DB.getDB().collections('logs').insertOne(info)
        if(app[0].domainNames.length === 0) {
            let result = DB.getDB().collection('logs').insertOne(info)
            sendMsg.sendSuccess(res,{})
        }
        else {
            let host = req.host
            let flag = false
            app[0].domainNames.forEach(ele => {
                if(ele.indexOf('*')!=-1){
                    let format = new RegExp(stringToFormat(ele))
                    // console.log(format,format.test(host))
                    if(format.test(host)){
                        flag = true
                        return 
                    }
                }
                if(ele === host) {
                    flag = true
                    return 
                }
            });
            if(!flag) {
                sendMsg.sendFail(res,102,'未配置此域名')
            }
            if(info.source.type === 'Browser'){
                info.userAgent = getUserAgent(info.source.content)
            }
            info.browserTime = new Date().getTime()
            DB.getDB().collection('logs').insertOne(info)
            sendMsg.sendSuccess(res,{})
        }
       
    }
}

let queryLogs = async function(req, res){
    let info = req.query
    let result = await DB.getDB().collection('logs').find({appId: info.appId}).toArray()
    if(result.length === 0){
        sendMsg.sendFail(res,101,'此应用没有日志')
        return 
    }
    let flag =  false
    if(info.environment) {
        result = result.filter(ele => ele.environment === info.environment)
        if(result.length === 0){
            if(info.version) flag = true
            else {
                sendMsg.sendFail(res,103,'未找到此环境')
            }
        }
    }
    if(info.version){
        result = result.filter(ele => ele.version === info.version)
        if(result.length === 0){
            if(flag) {
                sendMsg.sendFail(res, 104,'未找到此环境和此版本')
            }
            sendMsg.sendFail(res, 102, '未找到此版本')
            return
        }else{
            sendMsg.sendSuccess(res, result)
            return
        }
    }
    sendMsg.sendSuccess(res,result)
}



module.exports = {
    insertLogs: insertLogs,
    queryLogs: queryLogs,
}