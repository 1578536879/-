const express = require('express')
const app = express()
const uuidv1 = require('uuid/v1')
const mongo = require('mongodb')
const mongoClient = mongo.MongoClient
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
let db 
const userController = require("./controllers/users")
const applicationController = require('./controllers/applications')

require("./db").init().then(_ => {
    app.post('/register',userController.register)
    app.post('/login', userController.login)
    app.post('/loginOut',userController.loginOut)
    app.post('/modifyPassword',userController.modifyPassword)
    
    app.post('/createApp',applicationController.createApp)
    app.delete('/deleteApp', applicationController.deleteApp)
    app.post('/modifyAppName', applicationController.modifyAppName)
    app.get('/queryAppList', applicationController.queryAppList)
    app.post('/modifyDomainNames', applicationController.modifyDomainNames)
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









