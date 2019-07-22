const express = require('express')
const app = express()
const uuidv1 = require('uuid/v1')
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
let db 

let url = "mongodb://127.0.0.1:27017"
mongoClient.connect(url,{useNewUrlParser: true},function(err,res){
    if(err){
        console.log(err)
        return 
    }
    db = res.db('loggingSystem')
})

app.listen(8080,()=>{
    console.log('Listening on port 8080')
})


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next();
});
app.use(cookieParser())
// app.set('trust proxy',1)
// app.use(session({
//     secret:'keyboard cat',
//     resave:false,
//     saveUninitialized:true,
//     cookie:{secure:true}
// }))

setInterval(async function(){
    let nowTime = new Date()
    nowTime = nowTime.getTime()
    let intervalTime = 30 * 60 * 1000
    if(db){
        let sessionIds =await db.collection('sessionIDs').find().toArray()
        
        sessionIds.forEach(ele=>{
            if(nowTime - ele.time > intervalTime) {
                db.collection('sessionIDs').deleteOne(ele)
            }
        })
    }
}, 60000)

app.post('/register',function(req,res){
    let info = req.query

    info.id = uuidv1()
    db.collection('users').insertOne(info)
    res.send({
       code:100,
       message:'success',
       data:{
           userId: info.uuid
       } 
    })
})

app.post('/login',async function(req,res){
    let info = req.query
    let userId = ''
    let message = ''
    let code = 0
    let users = await db.collection('users').find().toArray()
    users.forEach(element => {
        if(element.username === info.username && element.password === info.password){
            userId = element.id
            message = 'success'
            code = 100
            return
        }
        else if(element.username === info.username && element.password !== info.password){
            message = '密码错误'
            code = 101
        }
    }); 
    if(code === 0) message = '没有此用户'
    if(userId) {
        let sessionid = uuidv1()
        let time = new Date()
        res.cookie('sessionId',sessionid)
        db.collection('sessionIDs').insertOne({sessionID:sessionid,time:time.getTime()})
        // res.send(req.cookie)
    }
    res.send({
        code:code,
        message:message,
        data:{
            userId: userId,
            sessionId:req.sessionID
        }
    })
})

app.post('/loginOut',function(req,res){
      console.log(123)
      let sessionId = req.cookies.sessionId
      db.collection("sessionIDs").deleteOne({sessionID:sessionId})
})

app.post('/modifyPassword',async function(req,res){
    let info = req.query
    let user = await db.collection('users').find({id:info.userId}).toArray()
    let code = 0
    let message = ''
    if(user.length === 0){
        code = 102
        message = '未找到此用户'
    }
    else if(user[0].password === info.oldPassword) {
        code = 100
        message = 'success'
        db.collection('users').updateOne({id:user[0].id},{$set:{password:info.newPassword}})
    }
    else if(user[0].password !== info.oldPassword) {
        code = 101 
        message = '密码错误'
    }
    res.send({
        code: code,
        message: message,
        data: {}
    })
})

app.post('/createApp',async function(req,res){
    let info = req.query
    info.id = uuidv1()
    let user = await db.collection('users').find({id: info.userId}).toArray()
    let code = 0
    let message = ''
    let data = {}
    if(user.length === 0) {
        code = 101
        message = '未找到此用户'
    }
    else {
        db.collection('apps').insertOne(info)
        code = 100
        message = 'success'
        data.appId = info.id
    }
    res.send({
        code: code,
        message: message,
        data:data
    })
})

app.post('/deleteApp',async function(req,res){
    let info = req.query
    let app = await db.collection('apps').find({id: info.appId}).toArray()
    let code = 0
    let message = ''
    if(app.length === 0){
        code = 101
        message = '未找到此应用'
    }else {
        db.collection('apps').deleteOne({
            name: app[0].name,
            domainNames: app[0].domainNames,
            userId: app[0].userId,
            id: app[0].id
        })
        code = 100
        message = 'success'
    }
    res.send({
        code: code,
        message: message,
        data:{}
    })
})

app.post('/modifyAppName',async function(req,res){
    let info = req.query
    let app = await db.collection('apps').find({id: info.appId}).toArray()
    let code = 0
    let message = ''
    if(app.length === 0) {
        code = 101
        message = '未找到此应用'
    } else {
        db.collection('apps').updateOne({id: info.appId},{$set:{name: info.newName}})
        code = 100
        message = 'success'
    }
    res.send({
        code: code,
        message: message,
        data:{}
    })
})